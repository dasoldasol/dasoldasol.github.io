---
title: "[AWS] Lambda 함수 복제 가이드 (CloudShell 기준)(2025-11-19 보안사항 수정)"
excerpt: "기존 Lambda 함수의 VPC 설정, role, 환경변수를 통으로 가져오자  "
toc: true
toc_sticky: true
categories:
- AWS
- Infra
modified_date: 2025-07-18 09:36:28 +0900
---

## 목표

- 기존 함수: `insite-account-autosave`
- 복제 대상 함수: `insite-account-autosave-multibuilding`
- 복제 항목: 코드, 환경변수, 레이어, IAM 역할, VPC 설정 등
- (2025-11-19 수정 사항) 1모듈 1역할의 보안정책을 위해, 역할은 재사용하지않고 복제하여 새로 만드는 것으로 변경

---

## 1. 기존 함수 정보 확인

### 환경변수, 레이어, VPC 등 확인

```bash
aws lambda get-function-configuration \
  --function-name insite-account-autosave \
  --query '{Runtime:Runtime,Role:Role,Handler:Handler,Timeout:Timeout,MemorySize:MemorySize,Environment:Environment,Layers:Layers,VpcConfig:VpcConfig,Description:Description}'
```

---

## 2. 기존 함수 코드 다운로드

```bash
aws lambda get-function \
  --function-name insite-account-autosave \
  --query 'Code.Location' \
  --output text
```

- 출력된 **S3 presigned URL**을 브라우저로 다운로드
- 예: `https://awslambda-ap-northeast-2.s3.amazonaws.com/......`
- 다운로드 받은 파일을 `lambda-code.zip` 으로 이름 변경

또는 `wget` 으로 CloudShell에서 직접 다운로드:

```bash
wget "https://...signed_url..." -O lambda-code.zip
```

---

## 3. 복제 함수 생성

```bash
aws lambda create-function \
  --function-name insite-account-autosave-multibuilding \
  --runtime python3.10 \
  --role arn:aws:iam::0217XXXXXXXX:role/service-role/insite-account-autosave-role-vdujyfi1 \
  --handler lambda_function.lambda_handler \
  --zip-file fileb://lambda-code.zip \
  --timeout 30 \
  --memory-size 128 \
  --environment '{
    "Variables": {
      "SNS_TOPIC_ARN": "arn:aws:sns:ap-northeast-2:0217XXXXXXXX:error-alert",
      "DB_PORT": "5432",
      "DB_USER": "db_user",
      "DB_NAME": "db_name",
      "DB_HOST": "hdcl-xxxx-rds-aurora-cluster.cluster-xxxxxxxxx.ap-northeast-2.rds.amazonaws.com",
      "BUCKET_NAME": "bucket_name",
      "DB_PASSWORD": "db_password"
    }
  }' \
  --layers arn:aws:lambda:ap-northeast-2:0217XXXXXXXX:layer:pandas-layer:1 \
  --vpc-config '{
    "SubnetIds": ["subnet-0bca5bf4127exxxxx", "subnet-0bca5bf4127exxxxx"],
    "SecurityGroupIds": ["sg-0bca5bf4127exxxxx"]
  }' \
  --description "복제함수 from insite-account-autosave"
```

> ❗주의  
> `--zip-file fileb://lambda-code.zip` 에서 `fileb://`는 **바이너리 파일 업로드 시 필수**  
> `--environment` 전체는 작은 따옴표 `'`로 감싸야 CLI 파싱 오류가 없음

---

## 4. 트리거 설정 (필요시)

예: EventBridge, CloudWatch, S3, API Gateway 등 기존 함수 트리거가 있다면 별도로 복제 필요

```bash
aws lambda add-permission ...
```

---

## 5. 테스트

- AWS Console → Lambda → `insite-account-autosave-multibuilding`  
- 수동 테스트 or 기존 이벤트 샘플로 실행
- 이제 `insite-account-autosave` 함수와 동일한 설정을 가진  `insite-account-autosave-multibuilding` 함수가 생성되었다.


---

## 자동화 스크립트 (Shell Script)

복제 작업을 자동화하는 스크립트를 사용하면 편리하다. 아래는 전체 복제 과정을 자동화한 스크립트.

### clone_lambda.sh

```bash
#!/usr/bin/env bash
# clone_lambda_with_new_role.sh
# 사용법: ./clone_lambda_with_new_role.sh <기존함수이름> <새함수이름>
# 예시 : ./clone_lambda_with_new_role.sh insite-account-autosave insite-account-autosave-multibuilding

set -euo pipefail

fail() { printf '오류: %s\n' "$*" >&2; exit 1; }
log()  { printf '%s\n' "$*" >&2; }

if [ $# -ne 2 ]; then
  echo "사용법: $0 <기존함수이름> <새함수이름>"
  echo "예: $0 insite-account-autosave insite-account-autosave-multibuilding"
  exit 1
fi

SOURCE_FUNCTION="$1"
TARGET_FUNCTION="$2"
ZIP_FILE="lambda-code.zip"
AWS_REGION="$(aws configure get region 2>/dev/null || echo ap-northeast-2)"

command -v aws >/dev/null 2>&1 || fail "AWS CLI가 필요합니다."
command -v jq >/dev/null 2>&1 || fail "jq가 필요합니다."
command -v curl >/dev/null 2>&1 || command -v wget >/dev/null 2>&1 || fail "curl 또는 wget이 필요합니다."

echo "[1] 기존 Lambda 설정 가져오는 중..."
CONFIG="$(aws lambda get-function-configuration --function-name "$SOURCE_FUNCTION" --region "$AWS_REGION" --output json)"
[ -z "$CONFIG" ] && fail "기존 함수 설정을 가져오지 못했습니다: $SOURCE_FUNCTION"

ROLE_ARN="$(echo "$CONFIG" | jq -r '.Role')"
SRC_ROLE_NAME="${ROLE_ARN##*/}"  # arn 마지막 세그먼트가 역할명
HANDLER="$(echo "$CONFIG" | jq -r '.Handler')"
RUNTIME="$(echo "$CONFIG" | jq -r '.Runtime')"
TIMEOUT="$(echo "$CONFIG" | jq -r '.Timeout')"
MEMORY="$(echo "$CONFIG" | jq -r '.MemorySize')"
ENV="$(echo "$CONFIG" | jq -c '.Environment // {}')"
LAYERS="$(echo "$CONFIG" | jq -c '[.Layers[].Arn] // []')"
VPC_CONFIG="$(echo "$CONFIG" | jq -c '{SubnetIds: (.VpcConfig.SubnetIds // []), SecurityGroupIds: (.VpcConfig.SecurityGroupIds // [])}')"
DESCRIPTION="$(echo "$CONFIG" | jq -r '.Description // ""')"
PKG_TYPE="$(echo "$CONFIG" | jq -r '.PackageType // "Zip"')"

echo "[2] 함수 코드 다운로드 또는 ImageUri 확인 중..."
IMAGE_URI=""
if [ "$PKG_TYPE" = "Image" ]; then
  IMAGE_URI="$(aws lambda get-function --function-name "$SOURCE_FUNCTION" --region "$AWS_REGION" --query 'Code.ImageUri' --output text)"
  [ -z "$IMAGE_URI" ] && fail "Image 타입 함수이나 ImageUri를 확인하지 못했습니다."
else
  CODE_URL="$(aws lambda get-function --function-name "$SOURCE_FUNCTION" --region "$AWS_REGION" --query 'Code.Location' --output text)"
  if command -v curl >/dev/null 2>&1; then
    curl -L "$CODE_URL" -o "$ZIP_FILE"
  else
    wget "$CODE_URL" -O "$ZIP_FILE"
  fi
  [ ! -s "$ZIP_FILE" ] && fail "코드 ZIP 다운로드 실패"
fi

echo "[3] 원본 역할 기반으로 새 역할 생성 준비..."
# 원본 역할 정보 조회
SRC_ROLE_JSON="$(aws iam get-role --role-name "$SRC_ROLE_NAME" --output json 2>/dev/null || true)"
[ -z "$SRC_ROLE_JSON" ] && fail "원본 역할을 찾을 수 없습니다: $SRC_ROLE_NAME"

# 신뢰정책, 경계정책 추출
echo "$SRC_ROLE_JSON" | jq -c '.Role.AssumeRolePolicyDocument' > trust.json
PB_ARN="$(echo "$SRC_ROLE_JSON" | jq -r '.Role.PermissionsBoundary.PermissionsBoundaryArn // empty')"

DST_ROLE="${TARGET_FUNCTION}-role"
# 대상 역할이 이미 있으면 안전하게 삭제(잔여 정책/경계 제거)
if aws iam get-role --role-name "$DST_ROLE" >/dev/null 2>&1; then
  echo "[3-1] 기존 대상 역할 정리/삭제: $DST_ROLE"
  for ARN in $(aws iam list-attached-role-policies --role-name "$DST_ROLE" --query 'AttachedPolicies[].PolicyArn' --output text 2>/dev/null); do
    aws iam detach-role-policy --role-name "$DST_ROLE" --policy-arn "$ARN" || true
  done
  for NAME in $(aws iam list-role-policies --role-name "$DST_ROLE" --query 'PolicyNames[]' --output text 2>/dev/null); do
    aws iam delete-role-policy --role-name "$DST_ROLE" --policy-name "$NAME" || true
  done
  if aws iam get-role --role-name "$DST_ROLE" --query 'Role.PermissionsBoundary.PermissionsBoundaryArn' --output text 2>/dev/null | grep -q '^arn:'; then
    aws iam delete-role-permissions-boundary --role-name "$DST_ROLE" || true
  fi
  aws iam delete-role --role-name "$DST_ROLE"
fi

echo "[3-2] 새 역할 생성: $DST_ROLE"
aws iam create-role \
  --role-name "$DST_ROLE" \
  --assume-role-policy-document file://trust.json \
  --output json >/dev/null

# Lambda 표준 신뢰정책으로 보강(안전)
cat > trust-lambda.json <<'JSON'
{
  "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Principal": { "Service": "lambda.amazonaws.com" }, "Action": "sts:AssumeRole" }
  ]
}
JSON
aws iam update-assume-role-policy --role-name "$DST_ROLE" --policy-document file://trust-lambda.json

# Permissions Boundary 복원(있으면)
if [ -n "$PB_ARN" ] && [ "$PB_ARN" != "null" ]; then
  aws iam put-role-permissions-boundary --role-name "$DST_ROLE" --permissions-boundary "$PB_ARN"
fi

echo "[3-3] 원본 역할의 Managed/Inline 정책 복제"
aws iam list-attached-role-policies --role-name "$SRC_ROLE_NAME" --output json > _src_attached.json
for PARN in $(jq -r '.AttachedPolicies[].PolicyArn // empty' _src_attached.json); do
  aws iam attach-role-policy --role-name "$DST_ROLE" --policy-arn "$PARN"
done

aws iam list-role-policies --role-name "$SRC_ROLE_NAME" --output json > _src_inline_names.json
for PNAME in $(jq -r '.PolicyNames[]? // empty' _src_inline_names.json); do
  aws iam get-role-policy --role-name "$SRC_ROLE_NAME" --policy-name "$PNAME" --output json > "_inline_${PNAME}.json"
  jq -c '.PolicyDocument' "_inline_${PNAME}.json" > "_inline_${PNAME}.doc.json"
  aws iam put-role-policy --role-name "$DST_ROLE" --policy-name "$PNAME" --policy-document file://"_inline_${PNAME}.doc.json"
done

# 기본 실행권한 보강(로그)
aws iam attach-role-policy --role-name "$DST_ROLE" \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole || true

# 함수가 VPC 사용 중이면 VPC 실행 역할 권장 권한 추가
if [ "$(echo "$VPC_CONFIG" | jq -r '.SubnetIds|length')" != "0" ]; then
  aws iam attach-role-policy --role-name "$DST_ROLE" \
    --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole || true
fi

DST_ROLE_ARN="$(aws iam get-role --role-name "$DST_ROLE" --query 'Role.Arn' --output text)"

echo "[4] 새 Lambda 함수 생성 중..."
# IAM 전파 지연 대비: create-function 재시도 루프
TRIES=0
DELAY=3
while :; do
  if [ "$PKG_TYPE" = "Image" ]; then
    if aws lambda create-function \
      --function-name "$TARGET_FUNCTION" \
      --package-type Image \
      --code "ImageUri=${IMAGE_URI}" \
      --role "$DST_ROLE_ARN" \
      --timeout "$TIMEOUT" \
      --memory-size "$MEMORY" \
      --environment "$ENV" \
      --layers "$LAYERS" \
      --vpc-config "$VPC_CONFIG" \
      --description "$DESCRIPTION" \
      --region "$AWS_REGION" >/dev/null 2>_create.err; then
      break
    fi
  else
    if aws lambda create-function \
      --function-name "$TARGET_FUNCTION" \
      --runtime "$RUNTIME" \
      --role "$DST_ROLE_ARN" \
      --handler "$HANDLER" \
      --zip-file "fileb://${ZIP_FILE}" \
      --timeout "$TIMEOUT" \
      --memory-size "$MEMORY" \
      --environment "$ENV" \
      --layers "$LAYERS" \
      --vpc-config "$VPC_CONFIG" \
      --description "$DESCRIPTION" \
      --region "$AWS_REGION" >/dev/null 2>_create.err; then
      break
    fi
  fi
  TRIES=$((TRIES+1))
  if [ $TRIES -ge 8 ]; then
    echo "함수 생성 실패. 상세 오류:"
    cat _create.err >&2 || true
    exit 1
  fi
  echo "전파 대기 후 재시도 ${TRIES}회... ${DELAY}초 대기"
  sleep "$DELAY"
  DELAY=$((DELAY*2))
done

echo "[완료] 새 Lambda 함수 '$TARGET_FUNCTION' 생성 및 새 역할 '$DST_ROLE' 연결 완료"
```

> ⚠`jq` CLI가 필요. CloudShell에서는 기본 설치되어 있음

### 실행 방법

```bash
chmod +x clone_lambda.sh
./clone_lambda.sh insite-account-autosave insite-account-autosave-multibuilding
```

---
