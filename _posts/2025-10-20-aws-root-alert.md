---
title: "[보안] Root 계정 사용 탐지 및 Dooray 실시간 알림 구축 가이드"
excerpt: "CloudWatch 보안 경보(root-alert)를 SNS→Lambda→Dooray 웹훅으로 전달하여 Root 보안 사고를 실시간으로 감지하는 가이드"
toc: true
toc_sticky: true
categories:
  - AWS
  - 보안
modified_date: 2025-10-20 14:30:00 +0900
---

# 목적

AWS Root 계정은 절대적으로 사용이 제한되어야 하는 최고 권한 계정이다.  
Root 계정 사용은 보안 사고 가능성이 매우 높으며, 로그인 또는 API 호출이 감지되는 순간 즉시 알림이 필요하다.

본 문서는 다음 목표를 가진다.

- Root 계정 사용 이벤트(root-alert)를 실시간 채팅 알림(Dooray)으로 전달한다.
- CloudWatch → SNS → Lambda → Dooray 웹훅 구조를 통해 보안 알림 파이프라인을 구성한다.
- Root 계정 사용 시, 운영자가 곧바로 대응할 수 있는 알림 체계를 구축한다.

아키텍처 흐름은 다음과 같다.

<img width="1021" height="223" alt="image" src="https://github.com/user-attachments/assets/2ed79d9e-05e0-4a17-94a1-34c96f48377e" />


CloudTrail → CloudWatch 메트릭 → CloudWatch Alarm (root-alert)  
→ SNS 토픽 (root-alert) → Lambda (secu-alert-dooray) → Dooray 웹훅

---

# 1. Root 계정 보안 사고의 위험성

AWS Root 계정이 사용되면 다음과 같은 보안 위협이 발생한다.

- 모든 리소스 삭제 가능 (EC2, RDS, IAM 등)
- IAM 사용자 및 역할 삭제, 권한 임의 변경
- 결제 정보 및 계정 설정 변경
- Organizations, SCP 등 상위 거버넌스 정책 변경

따라서 Root 계정 사용은 항상 보안 사고 후보로 간주해야 하며,  
사용이 감지되는 즉시 알림을 받아 후속 조치를 취해야 한다.

---

# 2. CloudTrail → CloudWatch Metrics 설정

AWS에서는 CloudTrail의 관리 이벤트를 기반으로 CloudWatch 메트릭을 생성할 수 있다.  
Root 계정 사용 감지를 위해 대표적으로 사용하는 메트릭은 다음과 같다.
- 패턴 필터링 : `{ $.userIdentity.type = "Root" && $.userIdentity.invokedBy NOT EXISTS && $.eventType != "AwsServiceEvent" }`
- 메트릭 네임스페이스: CloudTrailMetrics
- 메트릭 이름: RootAccountUsageCount

이 값이 1 이상이면 Root 계정이 사용된 것으로 보고 경보를 발생하게 할 수 있다.

---

# 3. CloudWatch Alarm: root-alert 구성

1. CloudWatch 콘솔 → 경보 → 경보 생성  
2. 메트릭 선택:
   - 네임스페이스: CloudTrailMetrics
   - 메트릭: RootAccountUsageCount
3. 조건 설정:
   - 임계값 유형: 정적
   - 조건: >= 1
   - 평가 기간: 예) 1개, 기간 300초
4. 알람 이름:
   - root-alert
5. 알람 상태에서 수행할 작업:
   - SNS 토픽: root-alert (아래에서 생성)
   - Lambda 작업은 사용하지 않음 (SNS 경유 구조로 단순화)

---

# 4. SNS 토픽 구성 (root-alert)

Root 계정 사용 알림을 모두 모으는 SNS 토픽을 하나 만든다.

1. SNS 콘솔 → 토픽 → 생성  
2. 토픽 이름: root-alert  
3. 유형: 표준

CloudWatch 경보 root-alert는 ALARM 상태가 되면  
이 SNS 토픽으로 Notification을 발송하게 된다.

---

# 5. Lambda 구성 (Python 3.12)

## 5-1. Lambda 함수 생성

- 이름: secu-alert-dooray  
- 런타임: Python 3.12  
- 핸들러: lambda_function.lambda_handler  
- VPC: 미연결 권장  
  (필요 시 VPC 연결 + NAT 게이트웨이로 외부 인터넷 통신 가능하도록 해야 함)

## 5-2. 실행 역할(IAM Role)

CloudWatch Logs에 로그를 남기기 위한 최소 권한만 부여한다.

예: 인라인 또는 관리형 정책에 다음과 같은 내용 포함

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "logs:CreateLogGroup",
      "Resource": "arn:aws:logs:*:{AWS_ACCOUNT_ID}:*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:{AWS_ACCOUNT_ID}:log-group:/aws/lambda/secu-alert-dooray:*"
    }
  ]
}
```

## 5-3. Lambda 환경변수

Lambda 구성의 환경 변수를 다음과 같이 설정한다.

- DOORAY_HOOK_URL  
- DEFAULT_BOT_NAME  
- DEFAULT_BOT_ICON (선택)

---

# 6. Lambda 코드 (Root 사용 SNS 알림 처리)

아래 코드는 SNS 이벤트를 입력으로 받아, Root 관련 경보일 때 Dooray 웹훅으로 메시지를 전송한다.

```python
# 파일: lambda_function.py
import os
import json
import time
from urllib import request, error

RETRYABLE = {408, 429, 500, 502, 503, 504}

# 경보명 → 주제명 매핑
SUBJECT_MAP = {
    "root-alert": "root 계정",
}


def _post(url, payload, timeout=5.0):
    data = json.dumps(payload).encode("utf-8")
    req = request.Request(
        url,
        data=data,
        headers={"content-type": "application/json"},
        method="POST",
    )
    return request.urlopen(req, timeout=timeout)


def _post_with_retry(url, payload, max_attempts=3, base_delay=0.8):
    last = None
    for i in range(max_attempts):
        try:
            resp = _post(url, payload)
            code = resp.getcode()
            body = resp.read().decode("utf-8", "ignore")
            # 재시도 대상이 아니면 그대로 반환
            if code < 400 or code not in RETRYABLE:
                return code, body
        except error.HTTPError as e:
            code = e.code
            body = e.read().decode("utf-8", "ignore")
            if code not in RETRYABLE:
                return code, body
            last = e
        except Exception as e:
            last = e
        time.sleep(base_delay * (2 ** i))
    raise last or RuntimeError("webhook failed")


def _subject_from_alarm_name(name: str) -> str:
    return SUBJECT_MAP.get(name, name or "알 수 없는 주제")


def _handle_sns_alarm(event: dict):
    """
    CloudWatch Alarm → SNS → Lambda 패턴 처리
    """
    records = event.get("Records")
    if not records:
        return None

    rec = records[0]
    if rec.get("EventSource") != "aws:sns":
        return None

    sns = rec.get("Sns", {}) or {}
    msg = sns.get("Message", "")
    alarm_name = None
    new_state = None

    # CloudWatch → SNS 표준 메시지는 JSON 문자열인 경우가 많음
    try:
        obj = json.loads(msg)
        alarm_name = obj.get("AlarmName") or obj.get("alarmName")
        new_state = obj.get("NewStateValue") or obj.get("state", {}).get("value")
    except Exception:
        # JSON 파싱 실패 시에는 Subject 활용
        pass

    # ALARM 상태가 아닐 경우 무시
    if new_state and new_state != "ALARM":
        return None

    if not alarm_name:
        alarm_name = sns.get("Subject") or "unknown"

    subject = _subject_from_alarm_name(alarm_name)
    return f"{subject} 경보 발생하였습니다"


def lambda_handler(event, context):
    hook = os.getenv("DOORAY_HOOK_URL")
    if not hook:
        print("환경변수 DOORAY_HOOK_URL 미설정")
        return {"statusCode": 500, "body": "DOORAY_HOOK_URL not set"}

    text = _handle_sns_alarm(event)

    if text is None:
        print("ignored event:", json.dumps(event)[:1000])
        return {"statusCode": 200, "body": "ignored"}

    payload = {
        "text": text,
        "botName": os.getenv("DEFAULT_BOT_NAME", "AlarmBot"),
    }
    icon = os.getenv("DEFAULT_BOT_ICON")
    if icon:
        payload["botIconImage"] = icon

    try:
        code, body = _post_with_retry(hook, payload)
        print("Dooray webhook response:", code, body[:200])
        return {"statusCode": code, "body": body}
    except Exception as e:
        print("Dooray webhook error:", repr(e))
        return {"statusCode": 502, "body": f"webhook error: {e}"}
```

---

# 7. SNS → Lambda 권한 및 구독 설정

## 7-1. SNS가 Lambda를 호출할 수 있도록 허용

```bash
aws lambda add-permission   --region ap-northeast-2   --function-name secu-alert-dooray   --statement-id sns-root-alert   --action lambda:InvokeFunction   --principal sns.amazonaws.com   --source-arn arn:aws:sns:ap-northeast-2:{AWS_ACCOUNT_ID}:root-alert
```

## 7-2. SNS 토픽에 Lambda 구독 추가

```bash
aws sns subscribe   --region ap-northeast-2   --topic-arn arn:aws:sns:ap-northeast-2:{AWS_ACCOUNT_ID}:root-alert   --protocol lambda   --notification-endpoint arn:aws:lambda:ap-northeast-2:{AWS_ACCOUNT_ID}:function:secu-alert-dooray
```

SNS 토픽에 정상적으로 구독이 추가되었는지 확인한다.

```bash
aws sns list-subscriptions-by-topic   --region ap-northeast-2   --topic-arn arn:aws:sns:ap-northeast-2:{AWS_ACCOUNT_ID}:root-alert
```

---

# 8. 테스트

## 8-1. Lambda 콘솔에서 SNS 이벤트로 테스트

다음 JSON을 테스트 이벤트로 넣으면 Dooray 채팅방에  
root 계정 경보 발생하였습니다 메시지가 도착해야 한다.

```json
{
  "Records": [
    {
      "EventSource": "aws:sns",
      "EventVersion": "1.0",
      "Sns": {
        "Type": "Notification",
        "Subject": "ALARM: root-alert",
        "Message": "{\"AlarmName\":\"root-alert\",\"NewStateValue\":\"ALARM\",\"NewStateReason\":\"manual test\"}"
      }
    }
  ]
}
```

## 8-2. CloudWatch 강제 상태 전환

실제 Root 계정 사용을 만들지 않고도 경보를 테스트할 수 있다.

```bash
aws cloudwatch set-alarm-state   --region ap-northeast-2   --alarm-name "root-alert"   --state-value OK   --state-reason "reset before test"

aws cloudwatch set-alarm-state   --region ap-northeast-2   --alarm-name "root-alert"   --state-value ALARM   --state-reason "manual test for root alert"
```

CloudWatch 경보의 작업 실행 기록, SNS 전송, Lambda 로그, Dooray 메시지를 순서대로 확인한다.

---

# 9. 운영 보안 체크리스트

- Root 계정에는 반드시 MFA를 적용한다.
- Root 계정으로 콘솔 로그인, 액세스 키 사용은 모두 차단 정책을 수립한다.
- CloudTrail이 항상 활성화되어 있는지, 로그 저장이 안전하게 되어 있는지 점검한다.
- root-alert 경보가 동작하지 않을 경우를 대비해 정기적으로 테스트한다.
- Dooray 웹훅 URL이 변경되면 Lambda 환경변수 DOORAY_HOOK_URL 을 즉시 갱신한다.
- Lambda가 VPC에 연결되어 있다면 반드시 NAT 게이트웨이 등 외부 통신 경로를 보장한다.

---

