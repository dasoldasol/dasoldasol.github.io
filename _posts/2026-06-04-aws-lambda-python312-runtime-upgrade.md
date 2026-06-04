---
title: "[AWS] Lambda Python 3.10 → 3.12 런타임 일괄 업그레이드 — 레이어 재빌드 중심"
excerpt: "python3.10 Lambda 런타임 업그레이드 기록. 커스텀 레이어 3종(psycopg2/pandas/konlpy) py312 재빌드, KMS EncryptionContext 때문에 클론에 환경변수 복사가 안 되는 이유"
toc: true
toc_sticky: true
categories:
- AWS
- Lambda
date: 2026-06-04 09:00:00 +0900
---

## 배경: python3.10 함수 19개

Lambda의 python3.10 런타임 지원 종료가 다가오면서, 계정에 남아 있던 python3.10 함수 19개를 정리해야 했다.

전수 조사 결과는 이렇게 나눠졌다.

- **업그레이드 대상 14개**
  - psycopg2 계열(6): DB 모니터링/알림, 스케줄 on/off, 통계 전처리 함수들
  - pandas 계열(5): S3 Excel 읽어서 Aurora에 적재하는 배치 함수들
  - konlpy 계열(3): 한국어 형태소 분석 기반 키워드 추출 함수들
- **폐기 삭제 5개**: 더 이상 사용하지 않는 구버전 배치 함수들

스코프 밖: 레이어 없는 함수들은 이미 3.12였고, AWS 관리형 함수 2개는 3.13이라 손댈 게 없었다.

겉보기엔 "런타임 설정 한 줄 바꾸기 × 14"지만, 실제 리스크는 전부 **레이어**에 있었다.

- numpy 1.x → 2.x, pandas 1.x → 2.x **메이저 버전 점프** (API 파괴 가능)
- python3.10 = Amazon Linux 2(glibc 2.26) → python3.12 = **AL2023(glibc 2.34)** 베이스 OS 변경 — C 확장(psycopg2, lxml, JPype)이 전부 재빌드 대상
- konlpy는 JVM이 필요한데, 레이어가 아니라 **런타임에 S3에서 JDK zip을 받아 /tmp에 풀고 JAVA_HOME을 지정**하는 구조 — 이 JDK가 AL2023에서 뜨는지가 관건

그래서 작업 순서를 "레이어 재빌드 → 백업 → 일괄 적용 → 전수 실증"으로 잡았다.

---

## 1단계: 레이어 py312 재빌드

python3.10용 커스텀 레이어 3종을 python3.12 빌드로 새로 만들었다. 빌드는 Lambda와 동일한 베이스의 SAM 빌드 이미지를 썼다.

```bash
# AL2023 기반 python3.12 환경에서 휠 설치
docker run --rm --platform linux/x86_64 \
  -v "$PWD/layer:/var/task" \
  public.ecr.aws/sam/build-python3.12 \
  pip install -r requirements.txt -t /var/task/python

cd layer && zip -r ../pandas-layer-py312.zip python

aws lambda publish-layer-version \
  --layer-name pandas-layer-py312 \
  --zip-file fileb://pandas-layer-py312.zip \
  --compatible-runtimes python3.12
```

이때 한 가지 구조 개선을 같이 했다. 원래 일부 함수가 [psycopg 레이어 + pandas 레이어] 2개를 달고 있었는데, **psycopg2를 세 레이어 모두에 번들**해서 함수당 레이어 1개로 통합했다.

| 신규 레이어 | 포함 패키지 |
|---|---|
| pandas-layer-py312:1 | pandas 2.2.3, numpy 2.1.3, openpyxl, **psycopg2 2.9.10**, dateutil 등 |
| postgresql-psycopg-py312:1 | psycopg2 2.9.10 |
| konlpy-py312:1 | konlpy 0.6.0, JPype1 1.5.0, lxml, numpy 2.1.2, pandas, **psycopg2** |

> psycopg2 같은 C 확장(.so)은 빌드한 머신의 Python ABI와 시스템 라이브러리에 묶인다. py310(AL2)용 레이어를 py312(AL2023) 함수에 그대로 달면 우선 .so의 ABI 태그(cpython-310)가 달라 import부터 실패하고, 그걸 넘어도 AL2023은 OpenSSL이 3.x로 교체돼 `libssl.so.1.1: cannot open shared object file`로 터진다. 반대로 새 OS에서 빌드한 걸 옛 런타임에 달면 `GLIBC_2.xx not found`(glibc는 하위 호환만 됨)를 만난다. 어느 방향이든, 베이스 OS가 바뀌는 런타임 업그레이드에서 C 확장 레이어는 무조건 실행될 Lambda 런타임과 동일한 베이스의 빌드 이미지(python3.12라면 `public.ecr.aws/sam/build-python3.12`)에서 재빌드.

---

## 2단계: 백업 — 롤백 가능 상태 만들기

일괄 변경 전에 원상복구 경로부터 확보했다.

```bash
# 1) 원본 코드 zip 백업
for fn in $(cat target-functions.txt); do
  url=$(aws lambda get-function --function-name "$fn" \
    --query 'Code.Location' --output text)
  curl -s "$url" -o "audit/${fn}.zip"
done

# 2) 업그레이드 전 런타임/레이어 상태 스냅샷
for fn in $(cat target-functions.txt); do
  aws lambda get-function-configuration --function-name "$fn" \
    --query '{Runtime:Runtime,Layers:Layers[].Arn,Handler:Handler}' \
    > "${fn}-rollback-snapshot.json"
done
```

폐기 대상 5개는 코드+설정을 백업한 뒤 바로 삭제했다. 업그레이드할 필요가 없는 함수는 업그레이드하지 않고 지우는 게 정답이다.

---

## 3단계: 런타임 + 레이어 일괄 적용

함수별로 런타임을 올리면서 대응하는 py312 레이어로 교체.

```bash
aws lambda update-function-configuration \
  --function-name <fn> \
  --runtime python3.12 \
  --layers arn:aws:lambda:ap-northeast-2:<ACCOUNT_ID>:layer:pandas-layer-py312:1
```

다만 **전부를 같은 날 올리진 않았다.** DB 모니터링/알림처럼 장애 시 영향이 큰 함수들은 별도 정책(클론 테스트 + 롤백 확보 후 적용)을 두고 있어서, 일반 배치 함수 12개를 먼저 올리고 하루 지켜본 뒤 다음날 적용했다.

이 시점에서 설정상으로는 14개 전부 python3.12가 됐다. 하지만 "설정이 3.12다"와 "코드가 3.12에서 돈다"는 다른 얘기다.

---

## 4단계: 스테이징 클론으로 전수 실증

스케줄이 한 달에 한 번인 배치 함수는 가만히 두면 다음 실행 때까지 깨졌는지 알 수 없다. 그래서 **함수별 스테이징 클론**을 만들어 실제로 실행해봤다.

클론 패턴은 이렇다.

1. 원 함수 코드/설정 그대로 `<fn>-stgtest` 생성
2. 환경변수의 DB 접속 정보를 스테이징 Aurora 값으로 교체
3. VPC를 스테이징 Lambda 서브넷 + 스테이징 SG로 배치 (스테이징 클러스터 SG가 이 SG의 5432 인바운드를 허용)
4. 실행 → CloudWatch Logs 확인 → 삭제

### KMS EncryptionContext 함정

여기서 한 번 걸렸다. 환경변수를 KMS CMK로 암호화하는 함수는 클론에 암호문을 그대로 복사하면 **복호화가 실패한다**. Lambda가 환경변수를 암호화할 때 `EncryptionContext={'LambdaFunctionName': 함수명}`을 쓰기 때문에, 함수 이름이 다르면 같은 키라도 복호화가 거부된다.

```bash
# 원 함수 컨텍스트로 복호화 → 클론 함수 컨텍스트로 재암호화
aws kms decrypt \
  --ciphertext-blob fileb://secret.bin \
  --encryption-context LambdaFunctionName=<원래-함수명> \
  --query Plaintext --output text | base64 -d > plain.txt

aws kms encrypt \
  --key-id <KMS_KEY_ID> \
  --plaintext fileb://plain.txt \
  --encryption-context LambdaFunctionName=<클론-함수명>
```

이 컨텍스트 바인딩은 보안상 올바른 설계지만, 클론 기반 테스트를 하려면 반드시 거쳐야 하는 단계다. (작업 후 로컬에 남은 평문 파일은 즉시 삭제.)

### konlpy: JVM 기동 검증

konlpy 계열은 DB 쓰기 없는 일회용 smoke 함수를 따로 만들어 확인했다. 핸들러에서 S3의 JDK zip을 /tmp에 풀고 JVM을 띄우는 부분만 실행:

```python
import platform
import konlpy, jpype

def lambda_handler(event, context):
    setup_jvm()   # S3에서 JDK zip → /tmp 압축해제 → JAVA_HOME 지정
    from konlpy.tag import Okt
    okt = Okt()
    return {
        "python": platform.python_version(),   # 3.12.13
        "jvm_started": jpype.isJVMStarted(),   # True
        "morphs": okt.morphs("형태소 분석이 정상 동작합니다"),
    }
```

python 3.12.13(AL2023)에서 JVM 기동 + Okt 형태소 분석까지 정상. 가장 걱정했던 항목이 가장 싱겁게 끝났다.

### 검증 결과

| 계열 | 검증 방법 | 결과 |
|---|---|---|
| psycopg2 | 상시 실행 함수는 라이브 트래픽, 저빈도 함수는 클론 | 라이브 3일간 860여 회 에러 0, 클론 connect+UPDATE+commit 완주 |
| pandas | 스테이징 클론 실행 | S3 Excel 읽기 + Aurora INSERT/UPDATE 완주 |
| konlpy | smoke 함수 + (아래 사고로) prod 실완주 | JVM 기동, 형태소 분석, 결과 적재 정상 |

한 함수는 스테이징 DB에 참조 데이터(FK 대상 행)가 없어 INSERT 단계에서 멈췄는데, 이는 데이터 결손이지 런타임 문제가 아니라서 통과 처리했다. 스테이징 검증은 "런타임/라이브러리 경로가 끝까지 도는가"를 보는 것이지, 스테이징 데이터 완비까지 책임지는 게 아니다.

---

## 5단계: 사고 — 클론이 prod 함수를 깨웠다

이번 작업의 하이라이트(라고 쓰고 사고라고 읽는다).

통계 전처리 함수의 클론을 스테이징에서 실행했는데, 알고 보니 이 함수는 단순 배치가 아니라 **오케스트레이터**였다. INSERT를 마친 뒤 후속 키워드 분석 함수 3개를 비동기로 깨우는 코드가 핸들러 끝에 있었다.

```python
# 핸들러 마지막 부분 — 이걸 사전에 못 봤다
for fn in DOWNSTREAM_FUNCTIONS:
    lambda_client.invoke(
        FunctionName=fn,              # prod 함수명 하드코딩
        InvocationType="Event",       # 비동기 fire-and-forget
    )
```

함수명이 하드코딩이라, 스테이징 클론이 실행됐는데 **깨어난 건 prod 함수 3개**였다. 결과: prod 통계 테이블에 이번 달 분석 결과가 한 벌 더 들어가서 **중복 125행** 생성. 월초 정기 스케줄이 이미 적재한 위에 얹힌 것이다.

### 진단과 복구

다행히 복구는 깔끔하게 됐다. `created_at` 분포로 정기 실행분과 사고분이 날짜 단위로 정확히 갈렸다.

```sql
-- 진단: 동일 period 내 created_at 분포 확인
SELECT created_at::date, count(*)
FROM stat_keyword_analysis
WHERE period_id = <이번달>
GROUP BY 1 ORDER BY 1;
-- 정기 실행일 125행 / 사고 당일 125행 → 정확히 한 벌 중복

-- 복구: 사고 당일 생성분만 삭제
DELETE FROM stat_keyword_analysis
WHERE period_id = <이번달> AND created_at >= '2026-06-04';
```

삭제 후 재집계로 surplus 0 확인. 부수 소득도 있었다 — 이 사고 덕에 konlpy 함수 3개가 **prod 환경의 3.12에서 실제로 완주**한다는 게 본의 아니게 입증됐다.

### 교훈: 클론 실행 전 부작용 grep

클론은 "환경변수만 스테이징으로 바꾸면 안전하다"가 아니다. 코드 안에 환경변수를 안 타는 부작용이 있을 수 있다.

```bash
# 클론 실행 전 반드시 확인할 것들
grep -rnE '\.invoke\(|\.publish\(|put_object\(|send_email\(|requests\.(post|put)' src/
```

이 사고 이후 S3에 쓰는 클론은 출력 키를 `stgtest/` 프리픽스로 돌리고, SNS 발송 함수는 no-op으로 막은 뒤 실행하는 걸 규칙으로 삼았다.

---

## 6단계: 클린업

검증이 끝나면 흔적을 남기지 않는다.

- 검증용 클론 전부 삭제 — 계정에 `*-stgtest` 잔존 0
- 구 py310 레이어 3종, 참조 함수 0개 확인 후 삭제

```bash
# 레이어 삭제 전 참조 확인 — 결과가 비어 있어야 삭제
for layer_arn in <py310-layer-arns>; do
  aws lambda list-functions \
    --query "Functions[?Layers[?Arn=='$layer_arn']].FunctionName" \
    --output text
done

aws lambda delete-layer-version --layer-name pandas-layer --version-number 1
```

- 로컬에 남은 평문 자격증명 파일 삭제

최종 상태: **python3.10 함수 0개.** 14개 전부 python3.12 + py312 레이어로 실행 실증 완료, 폐기 5개는 백업 후 삭제.

---

## 회고

**런타임 업그레이드의 본체는 레이어다.** `update-function-configuration --runtime python3.12`는 1초면 끝난다. 진짜 작업은 (1) C 확장 레이어를 새 베이스 OS(AL2→AL2023)로 재빌드하고, (2) numpy/pandas 메이저 점프에서 코드가 깨지지 않는지 실증하는 것. 설정만 바꾸고 "업그레이드 완료"라고 하면 다음 정기 실행 때 터진다.

**저빈도 배치는 클론 실증이 답이다.** 월 1회 함수는 다음 실행까지 한 달간 깨진 채로 잠복한다. 스테이징 클론으로 실제 핸들러를 끝까지 돌려보는 비용이, 월초 새벽에 배치 실패 알림 받고 수습하는 비용보다 싸다.

**클론 실행 전 부작용 코드부터 grep.** 환경변수를 스테이징으로 바꿔도 코드에 하드코딩된 `lambda.invoke()`, `sns.publish()`, S3 put은 그대로 prod를 때린다. 이번 사고의 원인이자 이 글에서 가장 비싸게 배운 교훈.

**KMS EncryptionContext는 함수명에 묶인다.** 암호화된 환경변수는 클론에 복사가 안 된다. decrypt(원 함수 컨텍스트) → encrypt(클론 컨텍스트) 재암호화가 필요하고, 중간 평문은 반드시 지울 것.

**중요 함수는 단계를 나눠라.** 14개를 하루에 다 올리지 않고, 영향도 낮은 배치부터 올려 하루 지켜본 뒤 모니터링/알림 함수를 올렸다. 일괄 작업에서 "전부 한 방에"는 효율이 아니라 도박이다.

**폐기가 최고의 업그레이드다.** 19개 중 5개는 업그레이드 대신 삭제로 끝냈다. 마이그레이션 작업은 안 쓰는 자원을 찾아내는 좋은 핑계이기도 하다.

---

## 작업 체크리스트 (재사용용)

```
[ ] 대상 전수 조사: 런타임별 함수 목록 + 레이어 의존성 매핑
[ ] 폐기 가능 함수 선별 → 백업 후 삭제
[ ] C 확장 레이어 신규 런타임 베이스로 재빌드 (docker, sam build 이미지)
[ ] 원본 코드 zip + 설정 스냅샷 백업 (롤백 경로 확보)
[ ] 영향도 낮은 함수부터 단계 적용, 중요 함수는 별도 일정
[ ] 저빈도 함수는 스테이징 클론으로 실행 실증
    [ ] KMS env 재암호화 (EncryptionContext = 함수명)
    [ ] 클론 실행 전 부작용 grep (invoke/publish/put_object/HTTP)
    [ ] S3 출력 프리픽스 격리, 알림 no-op 처리
[ ] 검증 후 클론/임시 자원/평문 파일 전부 삭제
[ ] 구 레이어 참조 0 확인 후 삭제
```

---

## 마무리

python3.10 함수 19개를 "업그레이드 14 + 폐기 5"로 정리했다. 핵심은 세 가지. (1) 런타임 업그레이드는 베이스 OS 변경이므로 C 확장 레이어는 전부 재빌드, (2) 저빈도 배치는 스테이징 클론으로 실제 실행까지 실증, (3) 클론을 실행하기 전에 코드 안의 부작용(`invoke`/`publish`/S3 put)부터 grep. 세 번째를 안 지켜서 prod에 중복 데이터 125행을 만들었고, `created_at` 기준으로 복구했다. 다음 런타임 업그레이드(3.12 → 3.14쯤?) 때는 이 체크리스트 그대로 다시 쓸 예정.
