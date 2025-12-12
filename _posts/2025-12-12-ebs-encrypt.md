---
title: "[보안] EC2 EBS 볼륨 암호화 가이드"
excerpt : "운영 중인 EC2 인스턴스의 비암호화 EBS 루트 볼륨을 다운타임 최소화 방식으로 암호화된 볼륨으로 교체하는 방법"
toc: true
toc_sticky: true
categories:
  - AWS
  - 보안
modified_date: 2025-12-10 12:00:00 +0900
---

# 목적
- 이미 운영 중인 EC2 인스턴스의 **비암호화 EBS 볼륨을 암호화된 EBS 볼륨으로 교체**하여 보안을 강화한다.
- AWS는 EBS 볼륨 암호화를 기본적으로 권장하지만, 기존 비암호화 볼륨은 **직접 암호화할 수 없고**, 스냅샷 기반의 볼륨 재생성이 필요하다.
- 본 가이드는 **다운타임을 최소화하면서 안전하게 볼륨을 교체하고**,  
  **AWS Backup이 새로 생성하는 스냅샷이 자동으로 암호화되도록 구조를 전환하는 절차**를 설명한다.
- 대량 인스턴스를 운영 중인 환경에서도 표준화된 스크립트 기반으로 자동화 가능하다.

---

# 전체 흐름 요약
1. 비암호화 루트 볼륨 → 스냅샷 생성  
2. 스냅샷을 암호화된 스냅샷으로 복사  
3. 암호화된 스냅샷으로 새 암호화 볼륨 생성  
4. 인스턴스 중지  
5. 기존 루트 볼륨 Detach  
6. 새 암호화 볼륨 Attach  
7. 인스턴스 Start 및 정상 여부 점검  

---

# Name 규칙

| 단계 | 규칙 | 예시 |
|------|------|------|
| Step1 스냅샷 | `<INSTANCE_NAME>-YYMMDD` | hdcl-csp-stg-ec2-mq-a-251210 |
| Step2 암호화 스냅샷 | `<INSTANCE_NAME>-encrypted` | hdcl-csp-stg-ec2-mq-a-encrypted |
| Step3 새 볼륨 | `<INSTANCE_NAME>`에서 `-ec2-` -> `-ebs-` + `-encrypted` | hdcl-csp-stg-ebs-mq-a-encrypted |

---

# STEP 1~3 자동화 스크립트  
(스냅샷 생성 → 암호화 스냅샷 복사 → 암호화 볼륨 생성)

## encrypt_ebs_step1_3_safe.sh

```bash
#!/bin/bash
set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <EC2_INSTANCE_NAME_TAG>"
  exit 1
fi

INSTANCE_NAME="$1"
REGION="ap-northeast-2"

aws sts get-caller-identity >/dev/null 2>&1 || true

DATE_SHORT=$(date +"%y%m%d")
STEP1_SNAPSHOT_NAME="${INSTANCE_NAME}-${DATE_SHORT}"
STEP2_SNAPSHOT_NAME="${INSTANCE_NAME}-encrypted"
BASE_VOLUME_NAME=$(echo "${INSTANCE_NAME}" | sed 's/-ec2-/-ebs-/')
STEP3_VOLUME_NAME="${BASE_VOLUME_NAME}-encrypted"

wait_snapshot_completed() {
  local snapshot_id="$1"
  aws ec2 wait snapshot-completed --region "${REGION}" --snapshot-ids "${snapshot_id}"
}

wait_volume_available() {
  local volume_id="$1"
  aws ec2 wait volume-available --region "${REGION}" --volume-ids "${volume_id}"
}

INSTANCE_ID=$(aws ec2 describe-instances \
  --region "${REGION}" \
  --filters "Name=tag:Name,Values=${INSTANCE_NAME}" \
  --query "Reservations[0].Instances[0].InstanceId" \
  --output text)

ROOT_VOLUME_ID=$(aws ec2 describe-instances \
  --region "${REGION}" \
  --instance-ids "${INSTANCE_ID}" \
  --query "Reservations[0].Instances[0].BlockDeviceMappings[0].Ebs.VolumeId" \
  --output text)

VOLUME_AZ=$(aws ec2 describe-volumes --region "${REGION}" --volume-ids "${ROOT_VOLUME_ID}" --query "Volumes[0].AvailabilityZone" --output text)
VOLUME_TYPE=$(aws ec2 describe-volumes --region "${REGION}" --volume-ids "${ROOT_VOLUME_ID}" --query "Volumes[0].VolumeType" --output text)
VOLUME_SIZE=$(aws ec2 describe-volumes --region "${REGION}" --volume-ids "${ROOT_VOLUME_ID}" --query "Volumes[0].Size" --output text)
IOPS=$(aws ec2 describe-volumes --region "${REGION}" --volume-ids "${ROOT_VOLUME_ID}" --query "Volumes[0].Iops" --output text)
THROUGHPUT=$(aws ec2 describe-volumes --region "${REGION}" --volume-ids "${ROOT_VOLUME_ID}" --query "Volumes[0].Throughput" --output text)

SNAPSHOT_ID=$(aws ec2 create-snapshot --region "${REGION}" --volume-id "${ROOT_VOLUME_ID}" --description "before-encryption" --query "SnapshotId" --output text)
aws ec2 create-tags --region "${REGION}" --resources "${SNAPSHOT_ID}" --tags "Key=Name,Value=${STEP1_SNAPSHOT_NAME}"
wait_snapshot_completed "${SNAPSHOT_ID}"

ENC_SNAPSHOT_ID=$(aws ec2 copy-snapshot --region "${REGION}" --source-region "${REGION}" --source-snapshot-id "${SNAPSHOT_ID}" --encrypted --description "encrypted-copy" --query "SnapshotId" --output text)
aws ec2 create-tags --region "${REGION}" --resources "${ENC_SNAPSHOT_ID}" --tags "Key=Name,Value=${STEP2_SNAPSHOT_NAME}"
wait_snapshot_completed "${ENC_SNAPSHOT_ID}"

NEW_VOLUME_ID=$(aws ec2 create-volume --region "${REGION}" --availability-zone "${VOLUME_AZ}" --snapshot-id "${ENC_SNAPSHOT_ID}" --volume-type "${VOLUME_TYPE}" --size "${VOLUME_SIZE}" --query "VolumeId" --output text)
aws ec2 create-tags --region "${REGION}" --resources "${NEW_VOLUME_ID}" --tags "Key=Name,Value=${STEP3_VOLUME_NAME}"
wait_volume_available "${NEW_VOLUME_ID}"

echo "[DONE] Step1~3 Completed"
echo "Snapshot: ${SNAPSHOT_ID}"
echo "Encrypted Snapshot: ${ENC_SNAPSHOT_ID}"
echo "New Volume: ${NEW_VOLUME_ID}"
```

---

# STEP 4~7 자동화 스크립트  
(EC2 Stop → 루트 볼륨 Detach/Attach → Start)

## encrypt_ebs_step4_7_safe.sh

```bash
#!/bin/bash
set -euo pipefail

if [ $# -ne 2 ]; then
  echo "Usage: $0 <EC2_INSTANCE_NAME_TAG> <NEW_VOLUME_NAME_TAG>"
  exit 1
fi

INSTANCE_NAME="$1"
NEW_VOLUME_NAME="$2"
REGION="ap-northeast-2"

aws sts get-caller-identity >/dev/null 2>&1 || true

INSTANCE_ID=$(aws ec2 describe-instances \
  --region "${REGION}" \
  --filters "Name=tag:Name,Values=${INSTANCE_NAME}" \
  --query "Reservations[0].Instances[0].InstanceId" \
  --output text)

ROOT_VOLUME_ID=$(aws ec2 describe-instances --region "${REGION}" --instance-ids "${INSTANCE_ID}" \
  --query "Reservations[0].Instances[0].BlockDeviceMappings[0].Ebs.VolumeId" --output text)

NEW_VOLUME_ID=$(aws ec2 describe-volumes --region "${REGION}" \
  --filters "Name=tag:Name,Values=${NEW_VOLUME_NAME}" --query "Volumes[0].VolumeId" --output text)

INSTANCE_STATE=$(aws ec2 describe-instances --region "${REGION}" --instance-ids "${INSTANCE_ID}" \
  --query "Reservations[0].Instances[0].State.Name" --output text)

if [ "${INSTANCE_STATE}" = "running" ]; then
  aws ec2 stop-instances --region "${REGION}" --instance-ids "${INSTANCE_ID}"
  aws ec2 wait instance-stopped --region "${REGION}" --instance-ids "${INSTANCE_ID}"
fi

aws ec2 detach-volume --region "${REGION}" --volume-id "${ROOT_VOLUME_ID}"
aws ec2 wait volume-available --region "${REGION}" --volume-ids "${ROOT_VOLUME_ID}"

aws ec2 attach-volume --region "${REGION}" --instance-id "${INSTANCE_ID}" \
  --volume-id "${NEW_VOLUME_ID}" --device "/dev/xvda"

aws ec2 wait volume-in-use --region "${REGION}" --volume-ids "${NEW_VOLUME_ID}"

aws ec2 start-instances --region "${REGION}" --instance-ids "${INSTANCE_ID}"

aws ec2 wait instance-running --region "${REGION}" --instance-ids "${INSTANCE_ID}" || true
aws ec2 wait instance-status-ok --region "${REGION}" --instance-ids "${INSTANCE_ID}" || true

echo "[DONE] Step4~7 Completed"
echo "New Root Volume: ${NEW_VOLUME_ID}"
```

---

# AWS Backup 스냅샷 관련 참고 사항

- 암호화된 볼륨을 새 루트 볼륨으로 교체하면, **그 시점부터 AWS Backup이 자동으로 생성하는 스냅샷은 모두 암호화됨**.
- 과거 비암호화 스냅샷은 삭제해도 Backup Plan 정책과 충돌하지 않음.
- 단, 다음 경우에는 EC2에서 삭제 불가:
  - 해당 스냅샷이 **AMI에서 참조 중**  
  - 해당 스냅샷이 **AWS Backup의 Recovery Point**로 관리 중  
- 이때는:
  - AMI → Deregister 후 스냅샷 삭제 가능  
  - AWS Backup → Vault에서 Recovery Point 삭제 가능  

---

# 결론

이 문서는 운영 환경에서 안전하게 EBS 암호화를 적용하기 위한 표준 절차와  
자동화 스크립트를 제공한다.  

이를 통해:

- 보안 취약점 해소  
- 운영 중단 최소화  
- AWS Backup과의 구조적 정합성 확보  

등의 효과를 얻을 수 있다.
