---
title: "[보안] CloudTrail 기반 이상행위 탐지 확장 가이드 (root-alert 연장)"
excerpt: "root-alert 이후, AWS 서비스 호출은 배제하고 사람의 이상행위만 탐지하도록 보안 알람 체계를 확장한다"
toc: true
toc_sticky: true
categories:
  - AWS
  - 보안
modified_date: 2026-01-08 00:10:00 +0900
---

## 0. 이 글은 왜 쓰였는가 (root-alert의 연장선)

이 글은 이전에 작성한 **[CloudTrail 기반 root 계정 사용 탐지(root-alert)](https://dasoldasol.github.io/aws/%EB%B3%B4%EC%95%88/aws-root-alert/)** 글의 자연스러운 확장판이다.

root-alert에서는 다음 질문에 답했다.

- “root 계정이 실제로 사용되었는가?”

하지만 운영을 하다 보면 곧 다음 단계의 질문에 도달하게 된다.

- “root 말고도, **사람이 하면 위험한 행동**은 무엇인가?”
- “AWS 내부 서비스가 자동으로 호출하는 이벤트와 **사람의 행위**를 어떻게 구분할 것인가?”
- “알람이 울렸을 때, **바로 판단 가능한 정보**를 같이 받을 수는 없을까?”

이 문서는 그 질문들에 대한 실제 구축 경험을 바탕으로 정리한 가이드이다.

---

## 1. 전체 구조 요약

구조는 root-alert 때와 동일하다.

CloudTrail → CloudWatch Logs → Metric Filter → Alarm → SNS → Lambda → Dooray

차이점은 **Metric Filter의 설계 철학과 Lambda의 역할**이다.

---

## 2. 설계 철학

### 2-1. AWS 서비스 호출은 사고가 아니다

CloudTrail에는 다음과 같은 이벤트가 매우 많이 쌓인다.

- AWS Config, Resource Explorer, Cost Explorer
- EC2 Instance Profile 기반 주기적 API 호출
- 내부 점검/수집용 AWS Service Role

이 이벤트들은 대부분 `AccessDenied`나 `UnauthorizedOperation`을 동반한다.
하지만 이는 **보안 사고가 아니라 정상 동작**이다.

따라서 본 구성에서는 다음을 원칙으로 삼는다.

- `userIdentity.type = AWSService` 제외
- `AWSServiceRoleFor*` 제외
- Cost Explorer(`ce.amazonaws.com`) 제외
- Instance Profile 기반 역할 제외

### 2-2. 사람의 행동만 남긴다

최종적으로 우리가 보고 싶은 것은 다음뿐이다.

- 사람이 콘솔에서 로그인 실패
- 사람이 MFA 없이 로그인
- 사람이 정책/네트워크 설정 변경
- 사람이 권한 없는 API 호출


---

## 3. 사전 준비 (AWS 기본 설정)

### 3-1. CloudTrail

- Management Events (Read/Write) 활성화
- Multi-Region Trail 권장
- CloudWatch Logs 전송 활성화

CloudWatch Logs에서 **JSON 원문이 보이는지** 반드시 확인한다.

### 3-2. 로그 그룹

본 문서 기준 주요 로그 그룹은 다음과 같다.

- aws-cloudtrail-monitoring-logs
- aws-cloudtrail-logs-xxxx-iam-policy-monitoring

---

## 4. 지표 필터 구성 예시

아래 패턴들은 **실제 콘솔에 그대로 붙여넣어 사용한 예시**이다.

### 4-1. Unauthorized API Call (사람만)

```text
{ ( ($.errorCode = "*UnauthorizedOperation") || ($.errorCode = "AccessDenied*") )
  && ($.userIdentity.type != "AWSService")
  && ($.userIdentity.arn != "*AWSServiceRoleForConfig*")
  && ($.userIdentity.arn != "*AWSServiceRoleForResourceExplorer*")
  && ($.userIdentity.arn != "*AWSReservedSSO_HDCLabs_AdminAccess*")
  && ($.userIdentity.arn != "*AWSReservedSSO_HDCLabs_Super_AdminAccess*")
  && ($.eventSource != "ce.amazonaws.com")
}
```

### 4-2. root-alert (기존)

```text
{ $.userIdentity.type = "Root"
  && $.userIdentity.invokedBy NOT EXISTS
  && $.eventType != "AwsServiceEvent"
}
```

### 4-3. Security Group 변경

```text
{ ( ($.eventName = "AuthorizeSecurityGroupIngress")
    || ($.eventName = "AuthorizeSecurityGroupEgress")
    || ($.eventName = "RevokeSecurityGroupIngress")
    || ($.eventName = "RevokeSecurityGroupEgress")
    || ($.eventName = "CreateSecurityGroup")
    || ($.eventName = "DeleteSecurityGroup") )
}
```

---

## 5. CloudWatch Alarm 설정 원칙

- Statistic: Sum
- Period: 1~5분
- Threshold: 1 이상
- AlarmName = MetricName = SNS Subject 동일하게 유지

이렇게 하면 Lambda에서 별도 매핑 없이 처리 가능하다.

---

## 6. Dooray 알림 예시 (실제 사용 문구 기준)

실제 Dooray로 전달되는 메시지는 다음 형태를 가진다.

```
권한 없는 API 호출 경보 발생하였습니다
발생시각: 2026-01-07 13:31:05 KST
알람명: UnauthorizedAPICall
로그그룹: aws-cloudtrail-monitoring-logs

관련 로그(요약):
- time=2026-01-07T04:31:05Z
  event=ce.amazonaws.com/GetCostAndUsage
  user=arn:aws:sts::.../mzc_msp_1
  ip=59.10.xxx.xxx
  err=AccessDenied
```

이 수준의 정보가 있으면 **알림 하나만 보고도**

- 사람이 한 행동인지
- 어떤 서비스/리전에 대한 것인지
- 즉시 조치가 필요한지

를 판단할 수 있다.

---

## 7. Lambda 설정 
### 7-1. Lambda 역할 정리

Lambda는 다음 일을 수행한다.

1. CloudWatch Alarm 수신 (SNS / 직접 / EventBridge)
2. AlarmName 기준으로 로그 그룹과 패턴 선택
3. 알람 발생 시각 기준 로그 재조회
4. 핵심 필드만 추출
5. Dooray Webhook으로 전송

### 7-2. Lambda 실행 권한 (IAM Role) 

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:FilterLogEvents",
        "logs:StartQuery",
        "logs:GetQueryResults"
      ],
      "Resource": "*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents"
      ],
      "Resource": "arn:aws:logs:*:*:*"
    },
    {
      "Effect": "Allow",
      "Action": "kms:Decrypt",
      "Resource": "*"
    }
  ]
}
```

### 7-3. Lambda 전체 코드 전문 

아래 코드는 실제 운영에서 사용하는 구조를 정리 없이 그대로 포함한 것이다.

```python
import os
import json
import time
from urllib import request, error
from base64 import b64decode
from datetime import datetime, timezone, timedelta

import boto3
from botocore.exceptions import ClientError


# =========================
# KMS decrypt (Dooray Hook URL)
# =========================
_kms_client = boto3.client("kms")


def decrypt_env(var_name: str) -> str:
    encrypted = os.environ.get(var_name)
    if not encrypted:
        raise RuntimeError(f"Missing env var: {var_name}")

    resp = _kms_client.decrypt(
        CiphertextBlob=b64decode(encrypted),
        EncryptionContext={"LambdaFunctionName": os.environ.get("AWS_LAMBDA_FUNCTION_NAME", "")},
    )
    return resp["Plaintext"].decode("utf-8")


# ===== 환경 변수 설정 =====
DOORAY_HOOK_URL = decrypt_env("DOORAY_HOOK_URL")

# 재시도 대상 HTTP 상태 코드
RETRYABLE = {408, 429, 500, 502, 503, 504}

# 경보명(SNS Subject) → 주제명 매핑
SUBJECT_MAP = {
    "root-alert": "root 계정",
    "IAMPolicyChanged": "IAM 정책 변경",
    "CloudTrailChangesEvent": "CloudTrail 구성 변경",
    "ConsoleSignInFailure": "AWS 콘솔 로그인 실패",
    "ConsoleSignInWithoutMfa": "MFA 없는 로그인 발생",
    "S3BucketPolicyChange": "S3 버킷 정책 변경",
    "UnauthorizedAPICall": "권한 없는 API 호출",
    "SecurityGroupChange": "보안 그룹 변경",
    "NetworkAclChange": "네트워크 ACL 변경",
    "GatewayChange": "네트워크 게이트웨이 변경",
    "VpcRouteTableChange": "네트워크 라우팅 테이블 변경",
    "AWSConfigChange": "AWS Config 변경",
    # 필요 시 추가
}

# =========================
# CloudWatch Logs 조회 설정
# =========================
LOG_LOOKBACK_SEC = int(os.environ.get("LOG_LOOKBACK_SEC", "300"))   # 기본 5분 전
LOG_LOOKAHEAD_SEC = int(os.environ.get("LOG_LOOKAHEAD_SEC", "60"))  # 기본 1분 후
LOG_MAX_EVENTS = int(os.environ.get("LOG_MAX_EVENTS", "5"))         # 최대 N건

_logs_client = boto3.client("logs")

# 알람명(SNS Subject) -> 로그그룹/패턴 매핑
# - 대부분은 monitoring 로그그룹(aws-cloudtrail-monitoring-logs)
# - root-alert, IAMPolicyChanged는 별도 로그그룹/패턴 적용
ALARM_LOG_QUERY_MAP = {
    # 기본(기존 고정 로그 그룹)
    "ConsoleSignInFailure": {
        "log_group": "aws-cloudtrail-monitoring-logs",
        "pattern": '{ ( ($.eventName = "ConsoleLogin") && ($.errorMessage = "Failed authentication") ) && ($.userIdentity.arn != "*assumed-role/AWSReservedSSO_HDCLabs_AdminAccess*") }',
    },
    "ConsoleSignInWithoutMfa": {
        "log_group": "aws-cloudtrail-monitoring-logs",
        "pattern": '{ ($.eventName = "ConsoleLogin") && ($.responseElements.ConsoleLogin = "Success") && ($.additionalEventData.MFAUsed = "No") && ($.userIdentity.arn != "*AWSReservedSSO_*") }',
    },
    "UnauthorizedAPICall": {
        "log_group": "aws-cloudtrail-monitoring-logs",
        "pattern": '{ ( ($.errorCode = "*UnauthorizedOperation") || ($.errorCode = "AccessDenied*") ) && ($.userIdentity.type != "AWSService") && ($.userIdentity.arn != "*AWSServiceRoleForConfig*") && ($.userIdentity.arn != "*AWSServiceRoleForResourceExplorer*") && ($.userIdentity.arn != "*AWSReservedSSO_HDCLabs_AdminAccess*") && ($.userIdentity.arn != "*AWSReservedSSO_HDCLabs_Super_AdminAccess*") && ($.eventSource != "ce.amazonaws.com") && ($.userIdentity.arn != "arn:aws:iam::021701867122:user/mzc_msp-api") && ($.userIdentity.arn != "*assumed-role/hdcl-csp-iam-ec2role/*") && ($.userIdentity.arn != "*assumed-role/*/mzc_msp_2") }',
    },
    "CloudTrailChangesEvent": {
        "log_group": "aws-cloudtrail-monitoring-logs",
        "pattern": '{ ( ($.eventName = "CreateTrail") || ($.eventName = "UpdateTrail") || ($.eventName = "DeleteTrail") || ($.eventName = "StartLogging") || ($.eventName = "StopLogging") ) && ($.userIdentity.arn != "*assumed-role/AWSReservedSSO_HDCLabs_AdminAccess*") }',
    },
    "S3BucketPolicyChange": {
        "log_group": "aws-cloudtrail-monitoring-logs",
        "pattern": '{ ( ($.eventSource = "s3.amazonaws.com") && ( ($.eventName = "PutBucketAcl") || ($.eventName = "PutBucketPolicy") || ($.eventName = "PutBucketCors") || ($.eventName = "PutBucketLifecycle") || ($.eventName = "PutBucketReplication") || ($.eventName = "DeleteBucketPolicy") || ($.eventName = "DeleteBucketCors") || ($.eventName = "DeleteBucketLifecycle") || ($.eventName = "DeleteBucketReplication") ) ) && ($.userIdentity.arn != "*assumed-role/AWSReservedSSO_HDCLabs_AdminAccess*") }',
    },
    "AWSConfigChange": {
        "log_group": "aws-cloudtrail-monitoring-logs",
        "pattern": '{ ( ($.eventSource = "config.amazonaws.com") && ( ($.eventName = "StopConfigurationRecorder") || ($.eventName = "DeleteDeliveryChannel") || ($.eventName = "PutDeliveryChannel") || ($.eventName = "PutConfigurationRecorder") ) ) && ($.userIdentity.arn != "*assumed-role/AWSReservedSSO_HDCLabs_AdminAccess*") }',
    },
    "SecurityGroupChange": {
        "log_group": "aws-cloudtrail-monitoring-logs",
        "pattern": '{ ( ($.eventName = "AuthorizeSecurityGroupIngress") || ($.eventName = "AuthorizeSecurityGroupEgress") || ($.eventName = "RevokeSecurityGroupIngress") || ($.eventName = "RevokeSecurityGroupEgress") || ($.eventName = "CreateSecurityGroup") || ($.eventName = "DeleteSecurityGroup") ) && ($.userIdentity.arn != "*assumed-role/AWSReservedSSO_HDCLabs_AdminAccess*") }',
    },
    "NetworkAclChange": {
        "log_group": "aws-cloudtrail-monitoring-logs",
        "pattern": '{ ($.eventName = "CreateNetworkAcl") || ($.eventName = "CreateNetworkAclEntry") || ($.eventName = "DeleteNetworkAcl") || ($.eventName = "DeleteNetworkAclEntry") || ($.eventName = "ReplaceNetworkAclEntry") || ($.eventName = "ReplaceNetworkAclAssociation") }',
    },
    "GatewayChange": {
        "log_group": "aws-cloudtrail-monitoring-logs",
        "pattern": '{ ($.eventName = "CreateCustomerGateway") || ($.eventName = "DeleteCustomerGateway") || ($.eventName = "AttachInternetGateway") || ($.eventName = "CreateInternetGateway") || ($.eventName = "DeleteInternetGateway") || ($.eventName = "DetachInternetGateway") }',
    },
    "VpcRouteTableChange": {
        "log_group": "aws-cloudtrail-monitoring-logs",
        "pattern": '{ ($.eventName = "CreateRoute") || ($.eventName = "CreateRouteTable") || ($.eventName = "ReplaceRoute") || ($.eventName = "ReplaceRouteTableAssociation") || ($.eventName = "DeleteRouteTable") || ($.eventName = "DeleteRoute") || ($.eventName = "DisassociateRouteTable") }',
    },

    # 사용자 제공: 별도 로그그룹/패턴
    "root-alert": {
        "log_group": "aws-cloudtrail-logs-021701867122-4eb590fe",
        "pattern": '{ $.userIdentity.type = "Root" && $.userIdentity.invokedBy NOT EXISTS && $.eventType != "AwsServiceEvent" }',
    },
    "IAMPolicyChanged": {
        "log_group": "aws-cloudtrail-logs-021701867122-0020d45e-iam-policy-monitoring",
        "pattern": '{ ( ($.eventName = "DeleteGroupPolicy") || ($.eventName = "DeleteRolePolicy") || ($.eventName = "DeleteUserPolicy") || ($.eventName = "PutGroupPolicy") || ($.eventName = "PutRolePolicy") || ($.eventName = "PutUserPolicy") || ($.eventName = "CreatePolicy") || ($.eventName = "DeletePolicy") || ($.eventName = "CreatePolicyVersion") || ($.eventName = "DeletePolicyVersion") || ($.eventName = "AttachRolePolicy") || ($.eventName = "DetachRolePolicy") || ($.eventName = "AttachUserPolicy") || ($.eventName = "DetachUserPolicy") || ($.eventName = "AttachGroupPolicy") || ($.eventName = "DetachGroupPolicy") ) && ($.userIdentity.type != "AWSService") }',
    },
}


# =========================
# HTTP to Dooray (Retry)
# =========================
def _post(url: str, payload: dict, timeout: float = 5.0):
    data = json.dumps(payload).encode("utf-8")
    req = request.Request(
        url,
        data=data,
        headers={"content-type": "application/json"},
        method="POST",
    )
    return request.urlopen(req, timeout=timeout)


def _post_with_retry(url: str, payload: dict, max_attempts: int = 3, base_delay: float = 0.8):
    last = None
    for i in range(max_attempts):
        try:
            resp = _post(url, payload)
            code = resp.getcode()
            body = resp.read().decode("utf-8", "ignore")
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


# =========================
# Time helpers
# =========================
def _parse_iso8601(s: str):
    if not s:
        return None
    try:
        return datetime.fromisoformat(s.replace("Z", "+00:00"))
    except Exception:
        return None


def _fmt_kst(dt: datetime) -> str:
    if not dt:
        return "n/a"
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt.astimezone(timezone(timedelta(hours=9))).strftime("%Y-%m-%d %H:%M:%S KST")


# =========================
# Alarm subject helpers
# =========================
def _subject_from_alarm_name(name: str) -> str:
    return SUBJECT_MAP.get(name, name or "알 수 없는 주제")


# =========================
# Logs fetcher
# =========================
def _fetch_related_logs(alarm_name: str, alarm_dt: datetime):
    q = ALARM_LOG_QUERY_MAP.get(alarm_name)
    if not q or not alarm_dt:
        return []

    log_group = q["log_group"]
    pattern = q["pattern"]

    if alarm_dt.tzinfo is None:
        alarm_dt = alarm_dt.replace(tzinfo=timezone.utc)

    start_ms = int((alarm_dt.timestamp() - LOG_LOOKBACK_SEC) * 1000)
    end_ms = int((alarm_dt.timestamp() + LOG_LOOKAHEAD_SEC) * 1000)

    resp = _logs_client.filter_log_events(
        logGroupName=log_group,
        startTime=start_ms,
        endTime=end_ms,
        filterPattern=pattern,
        limit=LOG_MAX_EVENTS,
    )

    items = []
    for ev in resp.get("events", [])[:LOG_MAX_EVENTS]:
        msg = ev.get("message", "")
        try:
            obj = json.loads(msg)
            items.append({
                "eventTime": obj.get("eventTime"),
                "eventSource": obj.get("eventSource"),
                "eventName": obj.get("eventName"),
                "userArn": (obj.get("userIdentity") or {}).get("arn") or (obj.get("userIdentity") or {}).get("principalId"),
                "sourceIp": obj.get("sourceIPAddress"),
                "errorCode": obj.get("errorCode"),
                "eventId": obj.get("eventID"),
            })
        except Exception:
            items.append({"raw": msg[:500]})
    return items


# =========================
# Event handlers
# =========================
def _handle_sns_alarm(event: dict):
    """
    SNS → Lambda 포맷 처리
    - 알람명은 SNS Subject 기준
    - ALARM 상태일 때만 처리
    - StateChangeTime 있으면 사용
    """
    records = event.get("Records")
    if not records:
        return None

    rec = records[0]
    if rec.get("EventSource") != "aws:sns":
        return None

    sns = rec.get("Sns", {}) or {}
    alarm_name = sns.get("Subject") or "unknown"
    msg = sns.get("Message", "")

    new_state = None
    alarm_dt = None

    try:
        obj = json.loads(msg)
        new_state = obj.get("NewStateValue") or obj.get("state", {}).get("value")
        alarm_dt = _parse_iso8601(obj.get("StateChangeTime") or obj.get("stateChangeTime") or "")
    except Exception:
        pass

    if new_state and new_state != "ALARM":
        return None

    subject = _subject_from_alarm_name(alarm_name)
    base_text = f"{subject} 경보 발생하였습니다"
    return alarm_name, alarm_dt, base_text


def _handle_direct_alarm_action(event: dict):
    """
    CloudWatch 알람이 Lambda 작업으로 직접 호출할 때의 포맷
    - 이 경로는 SNS Subject가 없으므로 AlarmName 기준
    """
    alarm_name = event.get("AlarmName")
    new_state = event.get("NewStateValue")
    if not alarm_name or new_state != "ALARM":
        return None

    alarm_dt = _parse_iso8601(event.get("StateChangeTime") or "")
    subject = _subject_from_alarm_name(alarm_name)
    base_text = f"{subject} 경보 발생하였습니다"
    return alarm_name, alarm_dt, base_text


def _handle_eventbridge_alarm(event: dict):
    """
    EventBridge를 통해 들어오는 CloudWatch Alarm State Change
    """
    if event.get("source") != "aws.cloudwatch":
        return None
    if event.get("detail-type") != "CloudWatch Alarm State Change":
        return None

    detail = event.get("detail") or {}
    alarm_name = detail.get("alarmName")
    state = (detail.get("state") or {}).get("value")
    if state != "ALARM":
        return None

    # 이벤트 상단 time 또는 detail.state.timestamp 유사 필드 fallback
    alarm_dt = _parse_iso8601(event.get("time") or "") or _parse_iso8601((detail.get("state") or {}).get("timestamp") or "")

    subject = _subject_from_alarm_name(alarm_name)
    base_text = f"{subject} 경보 발생하였습니다"
    return alarm_name, alarm_dt, base_text


# =========================
# Lambda entry
# =========================
def lambda_handler(event, context):
    hook = DOORAY_HOOK_URL
    if not hook:
        print("환경변수 DOORAY_HOOK_URL 미설정")
        return {"statusCode": 500, "body": "DOORAY_HOOK_URL not set"}

    # 0) SNS 경로 우선
    result = _handle_sns_alarm(event)

    # 1) 직접 호출 포맷
    if result is None:
        result = _handle_direct_alarm_action(event)

    # 2) EventBridge 포맷
    if result is None:
        result = _handle_eventbridge_alarm(event)

    if result is None:
        print("ignored event:", json.dumps(event)[:1000])
        return {"statusCode": 200, "body": "ignored"}

    alarm_name, alarm_dt, base_text = result

    # 알람 시각이 없으면 수신 시각으로 대체
    if alarm_dt is None:
        alarm_dt = datetime.now(timezone.utc)

    when_kst = _fmt_kst(alarm_dt)

    q = ALARM_LOG_QUERY_MAP.get(alarm_name)
    related_logs = _fetch_related_logs(alarm_name, alarm_dt) if q else []

    lines = []
    lines.append(base_text)
    lines.append(f"발생시각: {when_kst}")
    lines.append(f"알람명: {alarm_name}")

    if q:
        lines.append(f"로그그룹: {q['log_group']}")
    else:
        lines.append("로그그룹: 매핑 없음")

    if related_logs:
        lines.append("")
        lines.append("관련 로그(요약):")
        for i, it in enumerate(related_logs, start=1):
            if "raw" in it:
                lines.append(f"- {i}. {it['raw']}")
            else:
                lines.append(
                    f"- {i}. time={it.get('eventTime')} event={it.get('eventSource')}/{it.get('eventName')} "
                    f"user={it.get('userArn')} ip={it.get('sourceIp')} err={it.get('errorCode')} id={it.get('eventId')}"
                )
    else:
        lines.append("")
        lines.append("관련 로그: 조회 결과 없음")

    payload = {
        "text": "\n".join(lines),
        "botName": "AlarmBot",
    }

    try:
        code, body = _post_with_retry(hook, payload)
        print("Dooray webhook response:", code, body[:200])
        return {"statusCode": code, "body": body}
    except Exception as e:
        print("Dooray webhook error:", repr(e))
        return {"statusCode": 502, "body": f"webhook error: {e}"}

```
## 8. 운영 중 튜닝 사례

### 8-1. UnauthorizedAPICall 튜닝

초기에는 알람이 매우 많이 울린다.
대부분은 다음과 같은 원인이다.

- Cost Explorer 권한 부족
- EC2 Role의 Describe 권한 누락
- 내부 점검용 Lambda

대응 방법은 단순하다.

- “이게 사람이 했는가?”
- “운영상 의미 있는가?”

아니라면 **ARN 단위로 제외**한다.

### 8-2. SSO 사용자 제외

운영 계정의 SSO Admin이 반복적으로 알람을 발생시키는 경우,
다음과 같이 제외했다.

```text
&& ($.userIdentity.arn != "*AWSReservedSSO_HDCLabs_AdminAccess*")
```

### 8-3. 튜닝의 끝 기준

- 알람이 울리면 “이건 뭐지?”가 아니라
- 알람이 울리면 “아, 이건 봐야 한다”가 되는 상태

그 지점이 튜닝의 끝이다.

---

## 9. 마무리

이 구성은 다음을 목표로 한다.

- AWS 기본 기능만 사용
- 외부 보안 솔루션 없이도 운영 가능
- 알람 하나로 즉시 판단 가능

root-alert에서 시작해 여기까지 왔다면,
이미 **실전 운영 가능한 보안 감시 체계**를 구축한 것이다.
