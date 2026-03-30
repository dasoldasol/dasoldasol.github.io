---
title: "[AWS] EC2 모니터링 시스템 구축 — CloudFormation + Lambda + Dooray 연동"
excerpt: "CloudFormation 5개 스택으로 EC2 사용량·보안 위협·데이터 전송량을 Dooray로 알림하는 모니터링 시스템을 구축한 과정"
toc: true
toc_sticky: true
classes: wide
categories:
- AWS
- CloudFormation
- Monitoring
date: 2026-03-30 09:00:00 +0900
---

## 배경: 왜 만들었나

플랫폼 운영팀으로서, 새로운 AWS 계정을 운영하기 시작하면서 세 가지가 필요했다.

1. **보안 위협 감지**: root 계정 사용, 보안그룹 변경, MFA 없는 로그인 같은 이상 징후를 즉시 알고 싶었다.
2. **EC2 사용량 파악**: 인스턴스가 실제로 얼마나 쓰이고 있는지, 오버스펙인지 언더스펙인지 매일 확인하고 싶었다.
3. **데이터 전송량 비용 추적**: NetworkOut 요금은 예상치 못하게 청구되는 경우가 많아, 피크 이상과 누적 금액을 추적하고 싶었다.

알림 채널은 사내 협업툴인 **Dooray Webhook**으로 고정했다. 인프라는 CloudFormation으로 코드화해서 재현 가능하게 만들었다.

---

## 전체 아키텍처

모니터링은 세 가지 동작 방식으로 나뉜다. 트리거가 각각 다르다.

```
A. 보안 위협 탐지 (이벤트 기반 — 즉시)
   CloudTrail → CW Logs → Metric Filter(×12) → CW Alarm
                                                      ↓
                               SNS Topic → Lambda(security_alert) → Dooray

B. EC2 사용량 리포트 (스케줄 — 매일 07:00 KST)
   EventBridge cron → Lambda(ec2_monitor) → CloudWatch 지표 조회 → Dooray

C. 데이터 전송량 피크 알람 (이벤트 기반 — 즉시)
   CW Alarm(NetworkOut Maximum/5min) → SNS → Lambda(security_alert) → Dooray
```

Lambda는 2개다. `security_alert`는 SNS 트리거로 보안 이벤트와 전송량 알람 모두 처리하고, `ec2_monitor`는 스케줄 트리거로 일일 리포트를 담당한다. SNS Topic은 1개를 공유하며, Lambda가 알람 이름의 prefix(`DataTransfer-Warning-`, `DataTransfer-Critical-`)로 알람 종류를 구분한다.

---

## CloudFormation 스택 구성

```
01-prerequisites.yaml        # KMS, SNS, S3 (CloudTrail 로그 + Lambda 아티팩트)
02-cloudtrail.yaml           # CloudTrail + CloudWatch Logs 연동
03-security-alerts.yaml      # 12개 Metric Filter + Alarm + security_alert Lambda
04-ec2-monitoring.yaml       # ec2_monitor Lambda + EventBridge 스케줄 룰
05-data-transfer-alarms.yaml # 인스턴스별 NetworkOut 알람 (반복 배포)
```

각 스택은 독립적인 라이프사이클을 가진다. 인스턴스가 추가될 때는 05번 스택만 해당 인스턴스 ID로 별도 배포하면 된다.

---

## A. 보안 위협 탐지 — 이벤트 발생 시 즉시

### 동작 흐름

```
① AWS API 호출 발생
② CloudTrail 이벤트 기록 (멀티 리전 + 글로벌 서비스 포함)
③ CloudWatch Logs 수집 (약 5~15분 지연)
④ Metric Filter 패턴 매칭 → 카운터 증가
⑤ CloudWatch Alarm 평가 (1분 주기, 임계값 1)
⑥ SNS Topic publish
⑦ Lambda(security_alert) 호출
⑧ Dooray Webhook POST
```

실제 이벤트 발생부터 Dooray 수신까지 **수 분 이내** 완료된다. CloudTrail의 로그 전달 지연이 병목이다.

### 12가지 탐지 항목

| # | 항목 | 탐지 조건 |
|---|------|-----------|
| 1 | Root 계정 사용 | `userIdentity.type = Root` |
| 2 | IAM 정책 변경 | `DeleteGroupPolicy`, `PutGroupPolicy` 등 |
| 3 | CloudTrail 변경 | `StopLogging`, `DeleteTrail` 등 |
| 4 | 콘솔 로그인 실패 | `ConsoleLogin` + `errorMessage` |
| 5 | MFA 없는 로그인 | `ConsoleLogin` + `MFAUsed = No` |
| 6 | S3 버킷 정책 변경 | `PutBucketPolicy`, `DeleteBucketPolicy` |
| 7 | 무단 API 호출 | `AccessDenied` / `UnauthorizedOperation` |
| 8 | 보안그룹 변경 | `AuthorizeSecurityGroup*`, `RevokeSecurityGroup*` |
| 9 | NACL 변경 | `CreateNetworkAcl*`, `DeleteNetworkAcl*` |
| 10 | 게이트웨이 변경 | `CreateCustomerGateway`, `DeleteInternetGateway` 등 |
| 11 | VPC 라우팅 변경 | `CreateRoute`, `ReplaceRouteTableAssociation` 등 |
| 12 | AWS Config 변경 | `StopConfigurationRecorder`, `DeleteConfigRule` 등 |

### Lambda 구현 포인트

Metric Filter → Alarm → SNS 경로로 전달된 이벤트는 SNS Message body 안에 CloudWatch Alarm 정보가 들어온다. Lambda는 알람 이름을 기준으로 메시지 포맷을 분기한다.

```python
alarm_name = alarm_data.get("AlarmName", "")
if alarm_name.startswith("DataTransfer-Critical-"):
    # 데이터 전송량 위험
elif alarm_name.startswith("DataTransfer-Warning-"):
    # 데이터 전송량 경고
else:
    # 보안 이벤트
```

---

## B. EC2 사용량 리포트 — 매일 오전 7시

### 동작 흐름

```
EventBridge 규칙: cron(0 22 * * ? *)
    = UTC 22:00 = KST 다음날 07:00

→ Lambda(ec2_monitor) 실행
→ 계정 내 running 상태 EC2 인스턴스 자동 탐색
→ 인스턴스별 7가지 지표 24시간 최대값 조회
→ Dooray 리포트 전송 (임계값 여부 관계없이 항상 전송)
```

임계값을 넘지 않아도 **항상 발송**한다. 이상 없음 확인도 모니터링의 목적이기 때문이다.

### 수집 지표 (7가지)

| 지표 | 네임스페이스 | 통계 | 설명 |
|------|------------|------|------|
| CPU 최대 | AWS/EC2 | Maximum | 24시간 최고 사용률 |
| CPU 크레딧 최소 | AWS/EC2 | Minimum | t-series만, 잔액 최저점 → 소진율(%) 환산 |
| 메모리 최대 | GDX/EC2 | Maximum | CloudWatch Agent 필요 |
| 디스크 최대 | GDX/EC2 | Maximum | CloudWatch Agent 필요, 파티션 자동 탐지 |
| 디스크 I/O | GDX/EC2 | Sum | 읽기/쓰기 바이트 합산 |
| 일일 전송량 | AWS/EC2 | Sum | 당일 0시~현재 누적 + 추정 비용 |
| 월간 전송량 | AWS/EC2 | Sum | 월 1일~현재 누적 + 추정 비용 |

### CPU 크레딧 소진율 계산

t-series 인스턴스는 기본 CPU 성능 이상을 쓸 때 크레딧을 소모한다. **현재 잔액이 얼마냐**보다 **하루 중 가장 많이 소모한 순간이 얼마나 심각했느냐**가 의미있다.

```python
# 소진율 = (최대 크레딧 - 잔액 최저점) / 최대 크레딧 × 100
consumption_pct = (max_credit - min_balance) / max_credit * 100
```

인스턴스 타입별 최대 크레딧은 AWS 문서 기준값을 하드코딩했다 (t3.micro=144, t3.small=576, t3.large=864 등).

### CloudWatch Agent: 메모리·디스크 수집

기본 EC2 메트릭에는 메모리와 디스크 사용률이 없다. CloudWatch Agent를 설치하고 커스텀 네임스페이스 `GDX/EC2`로 전송하도록 구성해야 한다.

```json
{
  "metrics": {
    "namespace": "GDX/EC2",
    "metrics_collected": {
      "mem": { "measurement": ["mem_used_percent"] },
      "disk": {
        "measurement": ["disk_used_percent"],
        "resources": ["/"]
      },
      "diskio": {
        "measurement": ["read_bytes", "write_bytes"],
        "resources": ["*"]
      }
    }
  }
}
```

Lambda는 메트릭을 조회할 때 `nvme0n1p1 → xvda1 → sda1` 순으로 디바이스를 시도해 자동으로 파티션을 탐지한다.

### 데이터 전송량 비용 추정

ap-northeast-2(서울) 리전 인터넷 아웃바운드 요금 구간:

| 구간 | 단가 |
|------|------|
| 0 ~ 10 TB/월 | $0.126/GB |
| 10 ~ 50 TB/월 | $0.122/GB |
| 50 ~ 150 TB/월 | $0.117/GB |
| 150 TB 초과 | $0.108/GB |

일일 비용은 당일 NetworkOut 누적량에 첫 번째 구간 단가를 곱해 즉시 표시하고, 월간 비용은 구간별 티어 계산을 적용한다.

### 리포트 예시

```
[GDX EC2 일일 사용량 리포트]
기준: 2026-03-30 07:00 KST (최근 24시간 최대값)

▪ image-server (i-0123456789abcdef0) | t3.large [과소 사용]
  CPU 최대      : 10.8% △ (과소)
  CPU 크레딧 최소: 소진율 12.4% (잔액 244.3 / 최대 288)
  메모리 최대   : 34.2%
  디스크 최대   : 8.1%
  디스크 I/O    : R 1.2 GB / W 0.4 GB
  일일 전송량   : Out 2.3 GB / In 0.5 GB (추정 $0.29)
  월간 전송량   : Out 18.4 GB / In 4.1 GB (추정 $2.32)
```

CPU가 15% 미만이면 `[과소 사용]`, 85% 초과면 `[과다 사용]` 태그를 헤더에 붙인다. CPU 값 옆에도 `△ (과소)` / `⚠ (과다)` 기호를 표시한다.

---

## C. 데이터 전송량 피크 알람 — 초과 즉시

### 동작 흐름

```
CloudWatch Alarm 설정:
  메트릭: AWS/EC2 NetworkOut
  통계: Maximum (피크값)
  평가 주기: 5분

Warning  > 1 GB/5min  (~3.4 MB/s 지속)
Critical > 5 GB/5min  (~17 MB/s 지속)

→ SNS Topic → Lambda(security_alert) → Dooray
```

`Sum`이 아닌 `Maximum`을 사용하는 이유는, 5분 평균이 아니라 **순간 피크**를 잡기 위해서다. 대용량 파일 전송이나 데이터 유출은 짧은 시간에 집중된다.

### 인스턴스별 독립 배포

05-data-transfer-alarms.yaml은 인스턴스 1개당 1번 배포한다.

```bash
# 인스턴스 추가 시
aws cloudformation deploy \
    --template-file 05-data-transfer-alarms.yaml \
    --stack-name gdx-monitoring-transfer-image-server \
    --parameter-overrides \
        InstanceId=i-0123456789abcdef0 \
        InstanceName=image-server \
        WarningThresholdBytes=1073741824 \
        CriticalThresholdBytes=5368709120
```

---

## 보안: KMS 기반 Webhook URL 암호화

Dooray Webhook URL을 환경 변수에 평문으로 저장하면 Lambda 콘솔에서 노출된다. KMS로 암호화해서 저장한다.

```
배포 시:
  KMS Encrypt(URL, EncryptionContext={LambdaFunctionName: "..."})
  → CiphertextBlob → CloudFormation 파라미터 → Lambda 환경 변수 (암호문)

실행 시:
  Lambda 시작 → KMS Decrypt → 복호화된 URL 메모리에만 유지
```

`EncryptionContext`에 Lambda 함수 이름을 넣는 이유는 **키 용도를 특정 함수로 제한**하기 위해서다. `security_alert`용으로 암호화한 CiphertextBlob은 `ec2_monitor`에서 복호화할 수 없다. Lambda 2개가 동일한 KMS 키를 쓰더라도 context가 다르면 각각 별도로 암호화해야 한다.

```python
# Lambda 시작 시 한 번만 복호화 (모듈 레벨)
kms = boto3.client("kms")
DOORAY_URL = kms.decrypt(
    CiphertextBlob=base64.b64decode(os.environ["DOORAY_HOOK_URL"]),
    EncryptionContext={"LambdaFunctionName": os.environ["AWS_LAMBDA_FUNCTION_NAME"]},
)["Plaintext"].decode()
```

---

## 트러블슈팅

### CloudTrail 멀티 리전 설정 오류

`IsMultiRegionTrail: true`로 설정했는데 배포가 실패했다.

```
Multi-Region trail must include global service events.
```

`IncludeGlobalServiceEvents: true`를 같이 설정하지 않으면 멀티 리전 트레일을 생성할 수 없다. CloudFormation이 기본값을 false로 처리해서 발생한 문제였다. 실패한 스택을 삭제하고 두 옵션을 모두 명시해서 재배포했다.

### KMS Encrypt CLI 인코딩 오류

```
InvalidCiphertextException: Invalid base64
```

`--plaintext` 파라미터에 URL 문자열을 직접 전달하면 AWS CLI가 base64로 인코딩을 시도하면서 실패한다. 파일로 전달해야 한다.

```bash
echo -n "$DOORAY_WEBHOOK_URL" > /tmp/webhook_url
aws kms encrypt \
    --key-id "$KMS_KEY_ID" \
    --plaintext fileb:///tmp/webhook_url \
    --encryption-context "LambdaFunctionName=${FN_NAME}" \
    --query CiphertextBlob --output text
```

### Lambda Invoke 인코딩 오류

```bash
# 실패
aws lambda invoke --payload '{}'

# 성공
aws lambda invoke --cli-binary-format raw-in-base64-out --payload '{}'
```

AWS CLI v2에서 `--payload`는 기본적으로 base64 인코딩된 값을 기대한다. `raw-in-base64-out` 옵션으로 평문 JSON을 그대로 전달한다.

### CloudWatch Agent 설치 (SSM vs SSH)

처음에는 SSM Run Command로 설치하려 했지만, Ubuntu 22.04에는 SSM Agent가 기본 설치되어 있지 않았다. SSM 콘솔에서 인스턴스가 보이지 않았다.

PEM 키로 SSH 직접 접속해서 설치했다.

```bash
# CloudWatch Agent 설치
wget https://amazoncloudwatch-agent.s3.amazonaws.com/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i amazon-cloudwatch-agent.deb

# 설정 파일 배포 및 시작
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config -m ec2 -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json -s
```

---

## 배포

```bash
cd aws-infra/monitoring

# params.env 설정
cp params.env.example params.env
vi params.env

# 전체 배포 (스택 5개 순차 배포)
./deploy.sh
```

`deploy.sh`가 하는 일:
1. 01-prerequisites 배포 → KMS Key ARN, SNS Topic ARN 획득
2. Dooray URL을 KMS로 암호화 (Lambda별 각각)
3. Lambda 코드를 zip으로 패키징 → S3 업로드
4. 02~04 스택 순차 배포
5. `MONITORED_INSTANCES` 목록의 인스턴스별로 05 스택 배포
6. 전체 스택 상태 최종 확인

---

## 활용: 오버스펙 검증

이 모니터링 시스템은 단순한 알림 이상의 역할을 한다. 인스턴스 타입, 메모리, 디스크가 각각 **독립적인 리소스 축**임을 이해하면, 매일 쌓이는 리포트가 오버스펙 증거가 된다.

| 리소스 | 결정 요소 | 리포트 지표 |
|--------|----------|------------|
| CPU / RAM | 인스턴스 타입 (e.g. t3.large → 2vCPU, 8GB) | CPU 최대, CPU 크레딧 소진율 |
| 스토리지 | EBS 볼륨 크기 (e.g. 500GB) | 디스크 최대 사용률 |
| 네트워크 | 실제 트래픽 | 일일/월간 전송량 |

CPU가 매일 15% 미만이고, 메모리가 30% 수준이고, 500GB EBS 중 8%만 사용 중이라면 — 리포트 숫자가 그 자체로 다운사이징의 근거가 된다.
