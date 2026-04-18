---
title: "[AWS] Aurora PostgreSQL 마이너 엔진 업그레이드 실전 기록 — 14.15 → 14.22"
excerpt: "Aurora PostgreSQL 14.15 Deprecation 대응을 위한 마이너 업그레이드 작업 — 파라미터 변경, Staging 선행 검증, Production 실행, 그리고 pg_stat_statements + auto_explain 세팅까지"
toc: true
toc_sticky: true
categories:
- AWS
- RDS
- PostgreSQL
date: 2026-04-18 09:00:00 +0900
---

## 배경: 왜 업그레이드가 필요했나

운영 중인 Aurora PostgreSQL 클러스터가 **14.15 버전 Deprecation** 대상이 되었다. AWS가 강제 적용일을 설정하기 전에 계획된 다운타임으로 미리 처리하는 편이 안전하다.

목표는 세 가지였다.

1. **14.15 → 14.22 마이너 업그레이드**: Deprecation 대응
2. **`pg_stat_statements` extension 추가**: Top SQL / 병목 쿼리 모니터링 활성화 (Staging은 신규)
3. **`auto_explain` 추가**: 3초 이상 걸리는 쿼리의 실행 계획을 자동으로 로그에 남김 (Prd/Stg 신규)

마이너 업그레이드라 파라미터 그룹 패밀리(`aurora-postgresql14`)는 그대로 유지되지만, 엔진 업그레이드 시 리부트가 발생하므로 `shared_preload_libraries` 같은 static 파라미터 변경도 이때 함께 반영하기로 했다.

### 파라미터 변경은 왜 함께 했나 — 엔진 업그레이드 필수 사항이 아님

엄밀히 말하면 `pg_stat_statements` / `auto_explain` 추가는 **엔진 업그레이드와 무관한 독립 작업**이다. 14.15 → 14.22 업그레이드 자체는 파라미터 그룹을 손대지 않아도 성립한다. 그럼에도 굳이 묶은 이유는:

1. **`shared_preload_libraries`가 static 파라미터라 별도 리부트가 필요하다.**
   어차피 이 파라미터를 반영하려면 DB 리부트를 한 번 잡아야 한다. 별도 시점에 리부트를 따로 잡으면 개발팀 공지 → 다운타임 조율을 **두 번** 해야 한다.

2. **엔진 업그레이드가 유발하는 리부트에 묻어 보낼 수 있다.**
   `ApplyMethod=pending-reboot`으로 걸어두면, 엔진 업그레이드 시점에 파라미터 변경이 자동으로 함께 반영된다. 리부트 1회에 두 개의 변경이 한꺼번에 적용되는 셈이다.

3. **모니터링 공백을 계속 방치할 이유가 없었다.**
   Staging은 `pg_stat_statements` 자체가 없었고, Prd/Stg 모두 `auto_explain` 없이 운영 중이었다. 3초 이상 걸리는 쿼리의 실행 계획을 로그에서 바로 확인하지 못하는 상태라 언젠가는 반영해야 할 작업이었다.

즉 이번 업그레이드의 **필수 변경**은 `engine-version 14.15 → 14.22` 한 줄이고, 파라미터 그룹 수정은 **리부트 기회를 재활용한 번들 작업**이다. 엔진 업그레이드가 없었다면 별도 다운타임을 잡아 따로 처리했을 항목들이다.

---

## 작업 개요

| 항목 | 내용 |
|---|---|
| **업그레이드** | Aurora PostgreSQL 14.15 → 14.22 |
| **예상 다운타임** | 클러스터당 약 5~15분 (실제: 1분 41초) |
| **대상** | Production + Staging 클러스터 각 1개 (각 Writer/Reader 2 인스턴스 구성) |
| **사유** | 14.15 Deprecation 대응 + 모니터링 extension 활성화 |

### 작업 전략

- **Staging 선행**: D-2에 Staging 클러스터를 먼저 업그레이드하고 2일간 검증
- **파라미터 선변경**: 엔진 업그레이드 전날까지 파라미터 그룹 변경을 완료 (pending-reboot 상태로 대기)
- **엔진 업그레이드 시 자동 반영**: 엔진 업그레이드가 유발하는 리부트에 `shared_preload_libraries` 변경도 함께 실려 한 번에 반영
- **온라인 진행**: 애플리케이션 접속 차단 없이 온라인으로 진행. Aurora가 자체적으로 failover/리부트 처리

---

## 전체 타임라인

```
D-2 (4/13)
  ├─ 파라미터 그룹 변경 (Prd/Stg 모두)
  ├─ Staging 클러스터 엔진 업그레이드 실행
  ├─ Staging에서 pg_stat_statements extension 생성
  └─ Staging 검증 (2일간 관찰)

D-Day (4/15)
  11:30  사전 점검
  12:01  수동 스냅샷 생성 (RPO 지점)
  12:04  스냅샷 available (3분 4초)
  12:06  Production 엔진 업그레이드 실행
  12:07  클러스터 available, 엔진 14.22 (1분 41초)
  12:08  pg_stat_statements extension 생성
  12:09  Writer/Reader 엔드포인트 정상 확인
  12:30~ 사후 모니터링
```

실제 DB 다운타임은 **1분 41초**로 예상(5~15분)보다 훨씬 짧게 끝났다.

---

## 1단계: 사전 확인 (D-2)

### 체크리스트

- [x] 현재 엔진 버전 확인 (`14.15`)
- [x] 타겟 버전의 업그레이드 경로 존재 확인 (`14.22`)
- [x] 파라미터 그룹 호환성 확인 — 동일 패밀리 `aurora-postgresql14`, **변경 불필요**
- [x] Pending Maintenance 확인 — 강제 적용일 미설정
- [x] PostgreSQL extension 호환성 — `plpgsql 1.0`만 사용 중 (기본 내장, 이슈 없음)

### Pending Maintenance 동시 반영

엔진 업그레이드(14.22) 실행 시 아래 대기 중인 패치도 함께 반영되는 것을 확인했다.

- `system-update`: Aurora PostgreSQL 14.15.7 패치
- `os-upgrade`: OS 패치

---

## 2단계: 파라미터 그룹 변경 (D-2)

핵심은 **정적 파라미터를 pending-reboot 상태로 걸어두고, 엔진 업그레이드가 유발하는 리부트에 묻어서 반영**하는 것이다.

### Staging — `pg_stat_statements` + `auto_explain` 추가

```bash
aws rds modify-db-cluster-parameter-group \
  --db-cluster-parameter-group-name <stg-cluster-param-group> \
  --parameters \
    "ParameterName=shared_preload_libraries,ParameterValue='pg_cron,pg_stat_statements,auto_explain',ApplyMethod=pending-reboot" \
    "ParameterName=pg_stat_statements.max,ParameterValue=5000,ApplyMethod=pending-reboot" \
    "ParameterName=pg_stat_statements.track,ParameterValue=ALL,ApplyMethod=immediate" \
    "ParameterName=auto_explain.log_min_duration,ParameterValue=3000,ApplyMethod=immediate" \
    "ParameterName=auto_explain.log_analyze,ParameterValue=1,ApplyMethod=immediate" \
    "ParameterName=auto_explain.log_buffers,ParameterValue=1,ApplyMethod=immediate" \
    "ParameterName=auto_explain.log_timing,ParameterValue=1,ApplyMethod=immediate" \
    "ParameterName=auto_explain.log_format,ParameterValue=json,ApplyMethod=immediate" \
    "ParameterName=auto_explain.log_verbose,ParameterValue=1,ApplyMethod=immediate" \
    "ParameterName=auto_explain.log_nested_statements,ParameterValue=1,ApplyMethod=immediate"
```

### Production — `auto_explain`만 추가 (`pg_stat_statements`는 기존에 이미 활성화)

```bash
aws rds modify-db-cluster-parameter-group \
  --db-cluster-parameter-group-name <prd-cluster-param-group> \
  --parameters \
    "ParameterName=shared_preload_libraries,ParameterValue='pg_cron,pg_stat_statements,auto_explain',ApplyMethod=pending-reboot" \
    "ParameterName=auto_explain.log_min_duration,ParameterValue=3000,ApplyMethod=immediate" \
    "ParameterName=auto_explain.log_analyze,ParameterValue=1,ApplyMethod=immediate" \
    "ParameterName=auto_explain.log_buffers,ParameterValue=1,ApplyMethod=immediate" \
    "ParameterName=auto_explain.log_timing,ParameterValue=1,ApplyMethod=immediate" \
    "ParameterName=auto_explain.log_format,ParameterValue=json,ApplyMethod=immediate" \
    "ParameterName=auto_explain.log_verbose,ParameterValue=1,ApplyMethod=immediate" \
    "ParameterName=auto_explain.log_nested_statements,ParameterValue=1,ApplyMethod=immediate"
```

### auto_explain 설정 의도

| 파라미터 | 값 | 이유 |
|---|---|---|
| `log_min_duration` | 3000 (ms) | 3초 이상만 기록해 성능 영향 최소화 |
| `log_analyze` | on | 실제 실행 통계(row count, time) 포함 |
| `log_buffers` | on | 버퍼 사용량 포함 |
| `log_timing` | on | 노드별 실행 시간 포함 |
| `log_format` | json | CloudWatch Logs Insights에서 파싱 용이 |
| `log_verbose` | on | 스키마·컬럼 상세 포함 |
| `log_nested_statements` | on | 함수 내부 쿼리도 기록 |

### 파라미터 변경 확인

```bash
aws rds describe-db-cluster-parameters \
  --db-cluster-parameter-group-name <cluster-param-group> \
  --query "Parameters[?Source=='user'].{Name:ParameterName,Value:ParameterValue,ApplyType:ApplyType}" \
  --output table
```

---

## 3단계: Staging 선행 업그레이드 (D-2)

> Production 작업 전 반드시 Staging에서 먼저 검증한다. 여기서 예상 못 한 문제가 나오면 D-Day 일정을 재조정한다.

### 엔진 업그레이드 실행

```bash
aws rds modify-db-cluster \
  --db-cluster-identifier <stg-cluster-id> \
  --engine-version 14.22 \
  --apply-immediately
```

### 상태 모니터링

```bash
watch -n 10 "aws rds describe-db-clusters \
  --db-cluster-identifier <stg-cluster-id> \
  --query 'DBClusters[0].{Status:Status,Version:EngineVersion}' \
  --output table"
```

### 업그레이드 완료 후: extension 생성

`pg_stat_statements`는 `shared_preload_libraries`에 추가만으로는 부족하고, **CREATE EXTENSION**을 명시적으로 실행해야 DB에서 사용할 수 있다.

```bash
psql -h <stg-writer-endpoint> \
  -p 5432 -U <db-admin> -d <db-name> \
  -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"

# 확인
psql ... -c "SELECT extname, extversion FROM pg_extension ORDER BY extname;"
psql ... -c "SHOW shared_preload_libraries;"
psql ... -c "SELECT count(*) FROM pg_stat_statements;"
```

> **주의**: `auto_explain`은 extension이 아니라 `shared_preload_libraries`로 로드되는 라이브러리이기 때문에 `CREATE EXTENSION`이 필요 없다. `SHOW shared_preload_libraries`로 로드 여부만 확인하면 된다.

### Staging 검증 체크리스트

- [x] 엔진 버전 14.22 변경 확인
- [x] Writer/Reader endpoint 접속 정상
- [x] 주요 쿼리 정상 실행
- [x] 애플리케이션 정상 동작 (API, WAS, Batch)
- [x] `pg_stat_statements` 동작 확인 (v1.9, 데이터 수집 시작)
- [x] `auto_explain` 로드 확인
- [x] 3초 이상 쿼리 실행 → `pg_sleep(4)` 테스트로 JSON Plan 로그 기록 확인
- [x] **Staging 검증 통과 → Production Go 판단**

---

## 4단계: Production 사전 점검 + 스냅샷 (D-Day 11:30)

### 클러스터 상태 확인

```bash
# 클러스터 상태
aws rds describe-db-clusters \
  --db-cluster-identifier <prd-cluster-id> \
  --query "DBClusters[0].{Status:Status,Version:EngineVersion}" \
  --output table

# 인스턴스 상태
aws rds describe-db-instances \
  --filters Name=db-cluster-id,Values=<prd-cluster-id> \
  --query "DBInstances[].{Instance:DBInstanceIdentifier,Status:DBInstanceStatus}" \
  --output table
```

### 장시간 실행 쿼리 확인

```sql
SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
  AND state != 'idle'
ORDER BY duration DESC;
```

### 수동 스냅샷 생성 (롤백 대비)

```bash
aws rds create-db-cluster-snapshot \
  --db-cluster-identifier <prd-cluster-id> \
  --db-cluster-snapshot-identifier <prd-cluster-id>-pre-upgrade-YYYYMMDD

# 완료 대기
aws rds wait db-cluster-snapshot-available \
  --db-cluster-snapshot-identifier <prd-cluster-id>-pre-upgrade-YYYYMMDD
```

**스냅샷 완료 시각 = 복구 지점(RPO)**이다. 실전에서는 스냅샷 생성에 3분 4초가 걸렸다.

---

## 5단계: Production 엔진 업그레이드 실행 (D-Day 12:06)

### 메인 명령어

```bash
aws rds modify-db-cluster \
  --db-cluster-identifier <prd-cluster-id> \
  --engine-version 14.22 \
  --apply-immediately
```

단 한 줄이다. 클러스터 레벨에서 실행하면 Writer/Reader 인스턴스 모두 자동으로 처리된다.

### 이중 터미널 모니터링

**터미널 1 — 클러스터/인스턴스 상태**
```bash
watch -n 10 "aws rds describe-db-clusters \
  --db-cluster-identifier <prd-cluster-id> \
  --query 'DBClusters[0].{Status:Status,Version:EngineVersion}' \
  --output table && echo '---' && \
  aws rds describe-db-instances \
  --filters Name=db-cluster-id,Values=<prd-cluster-id> \
  --query 'DBInstances[].{Instance:DBInstanceIdentifier,Status:DBInstanceStatus,Version:EngineVersion}' \
  --output table"
```

**터미널 2 — RDS 이벤트 스트림**
```bash
watch -n 30 "aws rds describe-events \
  --source-identifier <prd-cluster-id> \
  --source-type db-cluster \
  --duration 60 \
  --query 'Events[].{Time:Date,Message:Message}' \
  --output table"
```

### 실제 진행 상태 전이

```
upgrading → available
  └─ 엔진 14.15 → 14.22
  └─ Writer/Reader 모두 자동 전환
  └─ 소요: 1분 41초
```

---

## 6단계: Extension 생성 + 검증 (D-Day 12:08)

### pg_stat_statements extension 생성

자격 증명을 Secrets Manager에서 바로 가져와 libpq 경로로 접속한다.

```bash
PGPASSWORD=$(aws secretsmanager get-secret-value \
  --secret-id "<secret-id>" \
  --query "SecretString" --output text \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['password'])") \
/opt/homebrew/Cellar/libpq/17.2/bin/psql \
  -h <prd-writer-endpoint> \
  -p 5432 -U <db-admin> -d <db-name> \
  -c "CREATE EXTENSION IF NOT EXISTS pg_stat_statements;"
```

### 검증 쿼리

```sql
-- extension 생성 확인
SELECT extname, extversion FROM pg_extension ORDER BY extname;

-- shared_preload_libraries 로드 확인
SHOW shared_preload_libraries;
-- 예상 결과:
-- rdsutils, rds_casts, pg_cron, pg_stat_statements, auto_explain,
-- writeforward, aws_s3_native, rds_blue_green

-- pg_stat_statements 데이터 수집 확인
SELECT count(*) FROM pg_stat_statements;

-- auto_explain 설정 확인
SHOW auto_explain.log_min_duration;  -- 3s
SHOW auto_explain.log_format;        -- json

-- Writer/Reader 판별
SELECT pg_is_in_recovery();
-- Writer: f / Reader: t
```

실전 검증 결과 `pg_stat_statements` v1.9 활성화, 수 분 내 4,892건의 쿼리 통계 수집이 시작되는 것을 확인했다.

---

## 7단계: 사후 검증 (D-Day 12:30~)

### CloudWatch 주요 메트릭

- `CPUUtilization`
- `DatabaseConnections`
- `ReadLatency` / `WriteLatency`
- `FreeableMemory`
- `AuroraReplicaLag` — Reader 지연 정상 범위

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBClusterIdentifier,Value=<prd-cluster-id> \
  --start-time $(date -u -v-30M +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60 \
  --statistics Average \
  --output table
```

### PostgreSQL 로그 확인

```bash
aws rds describe-db-log-files \
  --db-instance-identifier <prd-instance-id> \
  --output table

aws rds download-db-log-file-portion \
  --db-instance-identifier <prd-instance-id> \
  --log-file-name <최신로그파일명> \
  --output text | tail -50
```

### 통계 정보 갱신 (권장)

업그레이드 후 옵티마이저 통계가 휘발될 수 있으므로 `ANALYZE`를 한 번 돌려준다.

```sql
ANALYZE VERBOSE;
```

---

## 롤백 계획

> Aurora 마이너 버전 업그레이드는 **자동 롤백이 불가능**하다. 문제 발생 시 사전 생성한 스냅샷에서 새 클러스터를 복원해야 한다.

### 스냅샷 복원 절차

```bash
# 1) 스냅샷에서 새 클러스터 복원
aws rds restore-db-cluster-from-snapshot \
  --db-cluster-identifier <prd-cluster-id>-restored \
  --snapshot-identifier <prd-cluster-id>-pre-upgrade-YYYYMMDD \
  --engine aurora-postgresql \
  --engine-version 14.15 \
  --db-cluster-parameter-group-name <prd-cluster-param-group>

# 2) 복원된 클러스터에 인스턴스 2개 생성
aws rds create-db-instance \
  --db-instance-identifier <prd-cluster-id>-restored-01 \
  --db-cluster-identifier <prd-cluster-id>-restored \
  --db-instance-class db.r6g.large \
  --engine aurora-postgresql

aws rds create-db-instance \
  --db-instance-identifier <prd-cluster-id>-restored-02 \
  --db-cluster-identifier <prd-cluster-id>-restored \
  --db-instance-class db.r6g.large \
  --engine aurora-postgresql

# 3) 인스턴스 available 대기
aws rds wait db-instance-available \
  --db-instance-identifier <prd-cluster-id>-restored-01

# 4) 엔드포인트를 애플리케이션 설정 또는 Route53 CNAME에서 변경
```

### 롤백 판단 기준

| 상황 | 판단 | 조치 |
|---|---|---|
| 업그레이드 20분 이상 진행 상태 변화 없음 | 대기 | AWS Support 케이스 오픈 |
| 업그레이드 완료 후 접속 불가 | 롤백 | 스냅샷 복원 진행 |
| 업그레이드 완료, 특정 쿼리 오류 | 원인 분석 | 쿼리 수정 또는 롤백 |
| 업그레이드 완료, 성능 심각 저하 | 롤백 | 스냅샷 복원 진행 |
| 업그레이드 완료, 경미한 이슈 | 모니터링 | 패치/설정 변경으로 대응 |

### 롤백 예상 소요

- 스냅샷 복원 + 인스턴스 생성: 약 15~30분
- 엔드포인트 전환: 약 5분
- 애플리케이션 재연결: 약 5~10분
- **총 롤백 소요: 약 30~45분**

---

## 회고: 배운 점

### 1. 정적 파라미터 변경은 엔진 업그레이드에 묻어서 반영하는 게 깔끔하다

`shared_preload_libraries`는 static 파라미터라 별도 리부트가 필요하다. 엔진 업그레이드를 앞두고 있다면 미리 `ApplyMethod=pending-reboot`으로 걸어두고 한 번의 다운타임에 묶어 처리하는 편이 운영 리스크가 낮다.

### 2. `pg_stat_statements`는 CREATE EXTENSION을 잊지 말자

`shared_preload_libraries`에 추가하고 리부트까지 끝나도, 실제 사용하려면 DB에서 `CREATE EXTENSION IF NOT EXISTS pg_stat_statements`를 명시적으로 실행해야 한다. 반면 `auto_explain`은 라이브러리 로드만으로 동작한다 — 구조가 다르다.

### 3. Staging 선행 검증은 **일정에 포함**되어야 한다

"Staging에서 같은 작업을 먼저 해보자"는 당연해 보이지만, 일정 압박을 받으면 생략되기 쉽다. 이번엔 D-2에 Staging을 먼저 올리고 2일간 관찰한 덕분에 Production 당일은 "이미 검증된 절차를 반복 수행"하는 성격이 됐고, 그래서 단 1분 41초에 끝났다.

### 4. 실제 다운타임은 예상보다 짧을 수 있다

예상 5~15분 → 실제 1분 41초. Aurora 마이너 업그레이드는 생각보다 훨씬 빠르다. 그렇다고 버퍼 없이 일정을 잡으면 안 되지만, 알림 메시지나 개발팀 공지의 **최악 가정**을 너무 과하게 잡아 버리면 불필요한 사전 차단/동결을 유발할 수 있다는 점은 기억해둘만 하다.

---

## 체크리스트 요약

**D-2**
- [ ] 현재 엔진/타겟 경로 확인
- [ ] 파라미터 그룹 호환성 확인
- [ ] Extension 호환성 확인
- [ ] 파라미터 그룹 변경 (pending-reboot)
- [ ] Staging 엔진 업그레이드
- [ ] Staging extension 생성 + 검증
- [ ] 개발팀 다운타임 공지

**D-Day**
- [ ] 사전 점검 (클러스터/인스턴스 상태, 장시간 쿼리)
- [ ] 수동 스냅샷 생성 (RPO 기준점)
- [ ] Production 엔진 업그레이드 실행
- [ ] 이중 터미널 모니터링
- [ ] `CREATE EXTENSION pg_stat_statements`
- [ ] `SHOW shared_preload_libraries` 로 `auto_explain` 확인
- [ ] Writer/Reader 엔진 버전 14.22 확인
- [ ] 애플리케이션 커넥션 풀 재연결 확인 (개발팀)

**사후**
- [ ] CloudWatch 메트릭 이상 없음
- [ ] PostgreSQL 에러 로그 이상 없음
- [ ] `ANALYZE VERBOSE`
- [ ] Slow query 발생 여부 모니터링
- [ ] AuroraReplicaLag 정상 범위
