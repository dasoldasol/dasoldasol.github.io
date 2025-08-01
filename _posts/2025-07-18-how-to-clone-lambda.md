---
title: "[AWS] Lambda 함수 복제 가이드 (CloudShell 기준)"
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
#!/bin/bash
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "사용법: $0 <기존함수이름> <새함수이름>"
  echo "예: $0 insite-account-autosave insite-account-autosave-multibuilding"
  exit 1
fi

SOURCE_FUNCTION="$1"
TARGET_FUNCTION="$2"
ZIP_FILE="lambda-code.zip"

echo "[1] 기존 Lambda 설정 가져오는 중..."
CONFIG=$(aws lambda get-function-configuration --function-name "$SOURCE_FUNCTION")

ROLE=$(echo "$CONFIG" | jq -r '.Role')
HANDLER=$(echo "$CONFIG" | jq -r '.Handler')
RUNTIME=$(echo "$CONFIG" | jq -r '.Runtime')
TIMEOUT=$(echo "$CONFIG" | jq -r '.Timeout')
MEMORY=$(echo "$CONFIG" | jq -r '.MemorySize')
ENV=$(echo "$CONFIG" | jq -c '.Environment // {}')
LAYERS=$(echo "$CONFIG" | jq -c '[.Layers[].Arn] // []')
VPC_CONFIG=$(echo "$CONFIG" | jq -c '{SubnetIds: (.VpcConfig.SubnetIds // []), SecurityGroupIds: (.VpcConfig.SecurityGroupIds // [])}')
DESCRIPTION=$(echo "$CONFIG" | jq -r '.Description // ""')

echo "[2] 함수 코드 다운로드 중..."
CODE_URL=$(aws lambda get-function --function-name "$SOURCE_FUNCTION" --query 'Code.Location' --output text)
if command -v wget >/dev/null 2>&1; then
  wget "$CODE_URL" -O "$ZIP_FILE"
elif command -v curl >/dev/null 2>&1; then
  curl -L "$CODE_URL" -o "$ZIP_FILE"
else
  echo "wget 또는 curl이 필요합니다."
  exit 1
fi

echo "[3] 새 Lambda 함수 생성 중..."
aws lambda create-function \
  --function-name "$TARGET_FUNCTION" \
  --runtime "$RUNTIME" \
  --role "$ROLE" \
  --handler "$HANDLER" \
  --zip-file fileb://"$ZIP_FILE" \
  --timeout "$TIMEOUT" \
  --memory-size "$MEMORY" \
  --environment "$ENV" \
  --layers "$LAYERS" \
  --vpc-config "$VPC_CONFIG" \
  --description "$DESCRIPTION"

echo "[완료] 새 Lambda 함수 '$TARGET_FUNCTION' 생성
```

> ⚠`jq` CLI가 필요. CloudShell에서는 기본 설치되어 있음

### 실행 방법

```bash
chmod +x clone_lambda.sh
./clone_lambda.sh insite-account-autosave insite-account-autosave-multibuilding
```

---
