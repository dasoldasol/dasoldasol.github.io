---
title: "[AWS] ElastiCache Reserved Node 갱신 — EC2와 달리 미리 예약(Queue) 구매가 안 된다는 이야기"
excerpt: "1년 약정 ElastiCache(Valkey) RI 만료 D-day. EC2의 Queue Purchase 같은 사전 예약 구매가 ElastiCache엔 없어서 만료 당일 수동 구매로 갈아끼운 진단·실행 기록. 갭 시간 최소화를 위한 스크립트와 검증 절차까지."
toc: true
toc_sticky: true
categories:
- AWS
- Cost
- ElastiCache
date: 2026-05-15 09:00:00 +0900
---

## 배경: 1년 전 산 ElastiCache RI 만료

2025-05-13에 산 ElastiCache Valkey 1년 RI가 정확히 1년 뒤인 2026-05-13에 만료됐다.

- **노드 타입**: `cache.m7g.large` × 4
- **엔진**: Valkey (Redis 호환)
- **리전**: ap-northeast-2 (서울)
- **약정**: 1년 No Upfront, 시간당 $0.105/노드
- **만료일시**: 2026-05-13 04:38:46 UTC (KST 13:38)

만료 일정은 알고 있었다. 한 달쯤 전 RI 인벤토리를 정리할 때 만료일을 잡아놨고, EC2/RDS 갱신과 같이 처리할 계획이었다.

문제는 **갱신 방식**이었다. EC2처럼 사전에 예약해두면 자동으로 발효되는 거 아닌가 했는데, ElastiCache는 그게 안 됐다.

> "EC2는 미리 사두면 알아서 시작되는데, ElastiCache는 만료일 당일에 수동으로 사야 한다."

이 한 줄이 이 글의 핵심이다.

---

## 1단계: EC2 RI 갱신 패턴과 비교

EC2 RI는 콘솔에서 **Queue Purchase**(예약 구매) 가 가능하다.

```
EC2 Console → Reserved Instances → Purchase Reserved Instances
  → 검색 결과에서 인스턴스 선택
  → [Queue purchase] 옵션에 미래 날짜 입력 (최대 ~3년 후)
  → 그 시각이 되면 자동 결제 + 자동 발효
```

만료일 다음날 새벽으로 큐를 걸어두면 만료-시작 사이의 OD 비용 갭을 최소화할 수 있다.

CLI에도 동일한 옵션이 있다.

```bash
aws ec2 purchase-reserved-instances-offering \
  --reserved-instances-offering-id <offering-id> \
  --instance-count 1 \
  --purchase-time "2026-05-23T14:00:00Z"   # ← 미래 시각
```

RDS는 EC2만큼 깔끔한 큐 옵션은 없지만, `purchase-reserved-db-instances-offering`을 같은 family 인스턴스로 미리 사두면 size flexibility 가 적용되어 만료-시작 갭이 자연스럽게 메워진다.

ElastiCache는 어떨까?

---

## 2단계: ElastiCache에는 큐가 없다

콘솔부터 확인했다.

```
ElastiCache Console
  → Reserved nodes (왼쪽 메뉴 하단)
  → [Purchase reserved node]
  → 노드 타입 / 엔진 / 약정 / 결제 옵션 선택
  → [Purchase]
```

날짜를 미래로 지정하는 옵션이 **없다**. 클릭하는 순간 즉시 결제·발효된다.

CLI도 확인.

```bash
aws elasticache purchase-reserved-cache-nodes-offering help
```

```
SYNOPSIS
    purchase-reserved-cache-nodes-offering
      --reserved-cache-nodes-offering-id <value>
      [--reserved-cache-node-id <value>]
      [--cache-node-count <value>]
      [--tags <value>]
      ...
```

`--purchase-time` 같은 파라미터가 없다. EC2 `purchase-reserved-instances-offering`이랑 비교하면 확실히 차이가 있다.

| 서비스 | 사전 예약 구매 | 비고 |
|---|---|---|
| EC2 | 가능 | 콘솔 Queue purchase 또는 CLI `--purchase-time` |
| RDS | 직접 큐는 없음 | family 내 size flexibility 로 미리 사두면 자연스럽게 흡수 |
| **ElastiCache** | **불가** | 클릭/CLI 호출 = 즉시 발효 |

→ ElastiCache는 **만료 시점에 사람이 직접 발사**해야 한다. 그것도 갭 최소화하려면 만료 직후에.

---

## 3단계: 갭 시간 최소화 전략

ElastiCache OD 단가는 cache.m7g.large 기준 ~$0.171/h. RI 단가는 $0.105/h. 4개 노드 기준 시간당 차이는

```
(0.171 - 0.105) × 4 = $0.264/h
```

작아 보이지만 만료-구매 사이의 시간이 5시간이면 $1.32, 24시간이면 $6.34. 운영 입장에선 "있어도 그만 없어도 그만"이지만 깔끔하지 않다. 만료 직후 5분 안에 새 RI를 발효시키는 게 목표.

전략은 두 가지를 같이 갔다.

1. **D-1 알람**: 만료 24시간 전 슬랙/두레이 알림 (CloudWatch + EventBridge)
2. **스크립트 사전 준비**: offering ID/카운트까지 박힌 CLI 스크립트를 미리 작성해두고, 만료 시각에 콘솔/터미널에서 한 줄 실행

ElastiCache RI 만료 알람을 CloudWatch 메트릭으로 잡으려면 자체 메트릭이 없어서 Lambda + EventBridge 조합이 필요한데, 이번엔 단발성이라 캘린더 알람으로 끝냈다. 다음번엔 자동화 검토 예정.

---

## 4단계: Offering 검색

만료 일주일 전쯤, 사용 가능한 offering을 미리 조회해서 ID를 박아뒀다.

```bash
# 1) 현재 보유 RI 상태 확인
aws elasticache describe-reserved-cache-nodes \
  --query 'ReservedCacheNodes[].[
    ReservedCacheNodeId,
    CacheNodeType,
    ProductDescription,
    OfferingType,
    StartTime,
    State,
    CacheNodeCount]' \
  --output table
```

```
| ri-2025-05-13-04-38-32-334 | cache.m7g.large | valkey | No Upfront | 2025-05-13T04:38:46Z | active  | 4 |
```

이 RI가 2026-05-13 04:38:46 UTC에 retire 된다. **활성 상태에서 만료일까지 보여주진 않으니까** start time + 1년으로 계산.

```bash
# 2) 동일 조건 offering 조회
aws elasticache describe-reserved-cache-nodes-offerings \
  --cache-node-type cache.m7g.large \
  --product-description valkey \
  --duration 31536000 \
  --offering-type "No Upfront" \
  --query 'ReservedCacheNodesOfferings[].[
    ReservedCacheNodesOfferingId,
    Duration,
    FixedPrice,
    RecurringCharges[0].RecurringChargeAmount,
    OfferingType]' \
  --output table
```

```
| 94544d30-2194-4e2c-85b3-5a209f3eb0f5 | 31536000 | 0.0 | 0.105 | No Upfront |
```

- `FixedPrice`: 0.0 → 선납 없음 (No Upfront)
- `RecurringChargeAmount`: 0.105 → 시간당 $0.105
- `Duration`: 31536000초 = 365일

Offering ID `94544d30-2194-4e2c-85b3-5a209f3eb0f5` 박아두기. (참고: offering ID는 AWS가 주기적으로 새 ID로 갈아끼울 수 있으니 만료 직전에 한 번 더 확인하는 게 안전)

---

## 5단계: 만료 시각에 한 줄 발사

만료 1분 전 SSM 세션이 켜진 상태에서, 만료 알림이 뜨자마자 실행.

```bash
# 3) 신규 RI 구매 (--reserved-cache-node-id 는 식별용 별칭)
aws elasticache purchase-reserved-cache-nodes-offering \
  --reserved-cache-nodes-offering-id 94544d30-2194-4e2c-85b3-5a209f3eb0f5 \
  --reserved-cache-node-id "ri-auto-$(date -u +%Y%m%d-%H%M%S)" \
  --cache-node-count 4
```

응답.

```json
{
  "ReservedCacheNode": {
    "ReservedCacheNodeId": "ri-auto-20260513-050041",
    "ReservedCacheNodesOfferingId": "94544d30-2194-4e2c-85b3-5a209f3eb0f5",
    "CacheNodeType": "cache.m7g.large",
    "StartTime": "2026-05-13T05:00:53.935000+00:00",
    "Duration": 31536000,
    "FixedPrice": 0.0,
    "CacheNodeCount": 4,
    "ProductDescription": "valkey",
    "OfferingType": "No Upfront",
    "State": "payment-pending",
    "RecurringCharges": [
      { "RecurringChargeAmount": 0.105, "RecurringChargeFrequency": "Hourly" }
    ]
  }
}
```

`payment-pending` 상태로 시작. 몇 분 안에 `active`로 바뀐다.

> `--reserved-cache-node-id`는 식별용 별칭일 뿐, ARN과 별개. 안 주면 AWS가 `ri-YYYY-MM-DD-...` 형식으로 자동 부여한다. 자동화 시 운영 트래킹 용도로 `ri-auto-<timestamp>` 패턴 박아두면 retire된 과거 RI랑 구분 쉬움.

---

## 6단계: 검증

```bash
# 4) 신규 RI active 확인
aws elasticache describe-reserved-cache-nodes \
  --reserved-cache-node-id ri-auto-20260513-050041 \
  --query 'ReservedCacheNodes[0].[
    ReservedCacheNodeId,State,StartTime,CacheNodeCount]' \
  --output table

# 5) 만료된 과거 RI 상태 확인
aws elasticache describe-reserved-cache-nodes \
  --reserved-cache-node-id ri-2025-05-13-04-38-32-334 \
  --query 'ReservedCacheNodes[0].[
    ReservedCacheNodeId,State,StartTime]' \
  --output table
```

```
| ri-auto-20260513-050041     | active  | 2026-05-13T05:00:53.935000+00:00 | 4 |
| ri-2025-05-13-04-38-32-334  | retired | 2025-05-13T04:38:46.814000+00:00 |   |
```

신규 active, 과거 retired. 정상.

```bash
# 6) 실제 매칭되는 캐시 클러스터 인벤토리 (RI는 노드 속성으로 자동 매칭)
aws elasticache describe-cache-clusters \
  --query 'CacheClusters[].[
    CacheClusterId,CacheNodeType,Engine,CacheClusterStatus]' \
  --output table
```

```
| svc-elasticache-redis-cluster-001     | cache.m7g.large | valkey | available |
| svc-elasticache-redis-cluster-002     | cache.m7g.large | valkey | available |
| svc-elasticache-redis-cluster-003     | cache.m7g.large | valkey | available |
| svc-stg-elasticache-redis-cluster-001 | cache.m7g.large | valkey | available |
```

4개 노드, 신규 RI 4 카운트, 노드 타입·엔진·리전 일치 → 자동으로 매칭된다. RI는 EC2처럼 특정 인스턴스에 묶이는 게 아니라 "동일 조건 노드에 자동 적용"이라 별도 할당 작업 없음.

---

## 7단계: 갭 시간 결산

| 시점 | 이벤트 |
|---|---|
| 2025-05-13 04:38:46 UTC | 기존 RI 시작 |
| 2026-05-13 04:38:46 UTC | 기존 RI 만료 → 4개 노드 OD 과금 시작 |
| 2026-05-13 05:00:53 UTC | 신규 RI active |
| **OD 청구 구간** | **약 22분** |

22분 갭 동안의 OD 추가 비용:

```
(0.171 - 0.105) × 4 × (22/60) ≈ $0.097 = 약 145원
```

라테 한 잔 안 되는 금액이지만, 갭을 0에 가깝게 만들지 못한 게 께름칙. EC2 Queue Purchase 같은 옵션이 있었으면 만료 1초 후로 예약했을 일.

다음 갱신(2027-05-13) 때는 **만료 5분 전 EventBridge 트리거 → Lambda에서 자동 발사** 방식으로 갈 예정. 코드 골격은 이렇게 될 것 같다.

```python
# Lambda: ElastiCache RI auto-renewal
import boto3, os
from datetime import datetime, timezone

ec = boto3.client("elasticache", region_name="ap-northeast-2")

OFFERING_FILTER = {
    "CacheNodeType":      os.environ["NODE_TYPE"],       # cache.m7g.large
    "ProductDescription": os.environ["ENGINE"],          # valkey
    "Duration":           int(os.environ["DURATION"]),   # 31536000
    "OfferingType":       os.environ["OFFERING_TYPE"],   # No Upfront
}
COUNT = int(os.environ["NODE_COUNT"])                    # 4

def lambda_handler(event, context):
    # 1) 매번 최신 offering ID 조회 (AWS가 갱신할 수 있음)
    res = ec.describe_reserved_cache_nodes_offerings(**OFFERING_FILTER)
    offerings = res["ReservedCacheNodesOfferings"]
    if not offerings:
        raise RuntimeError(f"No offering found: {OFFERING_FILTER}")

    offering_id = offerings[0]["ReservedCacheNodesOfferingId"]
    ri_id = f"ri-auto-{datetime.now(timezone.utc):%Y%m%d-%H%M%S}"

    # 2) 구매
    out = ec.purchase_reserved_cache_nodes_offering(
        ReservedCacheNodesOfferingId=offering_id,
        ReservedCacheNodeId=ri_id,
        CacheNodeCount=COUNT,
    )
    return {
        "ri_id":   out["ReservedCacheNode"]["ReservedCacheNodeId"],
        "state":   out["ReservedCacheNode"]["State"],
        "started": out["ReservedCacheNode"]["StartTime"].isoformat(),
    }
```

EventBridge 스케줄러는 cron으로 만료 5분 전 시각을 KST로 박는다.

```
# 2027-05-13 04:38:46 UTC 만료 → 5분 전 트리거
cron(33 04 13 05 ? 2027)
```

권한은 최소권한으로.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "elasticache:DescribeReservedCacheNodesOfferings",
        "elasticache:PurchaseReservedCacheNodesOffering",
        "elasticache:DescribeReservedCacheNodes"
      ],
      "Resource": "*"
    }
  ]
}
```

> 주의: 자동 구매는 비용이 자동으로 발생하니까 운영 룰 합의는 필수. 다중 알람(D-7, D-1, D-day, 발사 직후 결과) 같이 박아두는 게 안전.

---

## 회고

**EC2와 ElastiCache는 RI 운영 UX가 다르다.** EC2/RDS만 경험하다 ElastiCache 만나면 "왜 미리 못 사지?"에서 한 번 막힌다. AWS 입장에선 ElastiCache RI 수요가 적어 큐 기능 우선순위가 낮은 것으로 보임. 어쨌든 운영자가 외워야 할 차이.

**갭 시간은 자동화가 답이다.** 22분 갭은 큰돈이 아니지만 매년 반복하면 누적이고, 사람이 직접 발사하는 운영은 휴가/장애/시차 변수에 약하다. 다음 갱신부터 Lambda + EventBridge로 무인화 예정.

**Offering ID는 만료 직전에 한 번 더 확인.** AWS가 새 offering으로 갈아끼우면 박아둔 ID가 deprecated 될 수 있다. 자동화 코드도 매번 describe로 조회 후 구매하는 패턴이 안전.

**RI는 노드별 묶임이 아니라 속성 매칭이다.** EC2 RI는 region/AZ/family 옵션에 따라 매칭이 갈리는데, ElastiCache는 인스턴스 식별자 없이 "조건 일치하는 노드 N개"에 자동 적용된다. 그래서 RI 구매 후 "어느 노드에 붙일까" 고민할 필요가 없고, 노드를 stop/start 해도 RI 매칭은 유지된다.

**1년 No Upfront vs 3년 All Upfront.** 이번에도 1년 No Upfront로 갱신했는데, 본 환경(ElastiCache cache.m7g.large × 4 Valkey)을 3년 약정으로 가면 월 ~$215 추가 절감(분석 자료 기준). 다만 Valkey/Redis는 엔진 전환이나 cluster mode 변경 시 RI 매칭 깨질 가능성이 있어서, 엔진 변동 가능성이 있으면 1년이 안전. 본 환경은 Valkey 고정이 확실해진 시점에 3년 전환 검토 예정.

---

## 진단 / 운영 명령어 모음

```bash
# 보유 RI 목록 (만료/활성 모두)
aws elasticache describe-reserved-cache-nodes \
  --query 'ReservedCacheNodes[].[
    ReservedCacheNodeId,CacheNodeType,ProductDescription,
    OfferingType,StartTime,State,CacheNodeCount]' \
  --output table

# 활성 RI만
aws elasticache describe-reserved-cache-nodes \
  --query "ReservedCacheNodes[?State=='active']"

# 특정 RI 상세
aws elasticache describe-reserved-cache-nodes \
  --reserved-cache-node-id <ri-id>

# Offering 조회 (구매 전 가격/ID 확인)
aws elasticache describe-reserved-cache-nodes-offerings \
  --cache-node-type cache.m7g.large \
  --product-description valkey \
  --duration 31536000 \
  --offering-type "No Upfront" \
  --query 'ReservedCacheNodesOfferings[].[
    ReservedCacheNodesOfferingId,FixedPrice,
    RecurringCharges[0].RecurringChargeAmount,OfferingType]' \
  --output table

# 구매
aws elasticache purchase-reserved-cache-nodes-offering \
  --reserved-cache-nodes-offering-id <offering-id> \
  --reserved-cache-node-id "ri-auto-$(date -u +%Y%m%d-%H%M%S)" \
  --cache-node-count <N>

# 매칭 대상 클러스터 인벤토리
aws elasticache describe-cache-clusters \
  --query 'CacheClusters[].[
    CacheClusterId,CacheNodeType,Engine,CacheClusterStatus]' \
  --output table

# 만료일 계산 (StartTime + Duration)
aws elasticache describe-reserved-cache-nodes \
  --query 'ReservedCacheNodes[?State==`active`].[
    ReservedCacheNodeId,StartTime,Duration]' \
  --output text \
| while read id start dur; do
    end=$(date -u -d "$start +$dur seconds" +"%Y-%m-%dT%H:%M:%SZ" 2>/dev/null \
       || python3 -c "
from datetime import datetime,timedelta,timezone
s=datetime.fromisoformat('$start'.replace('Z','+00:00'))
print((s+timedelta(seconds=$dur)).isoformat())")
    echo "$id  expires=$end"
  done
```

---

## 마무리

ElastiCache RI 갱신은 EC2/RDS와 달리 사전 예약 구매(Queue Purchase) 옵션이 없다. 만료 시각에 사람이 직접 발사하거나, EventBridge + Lambda로 자동화해야 갭을 최소화할 수 있다. 이번 갱신은 22분 갭으로 마무리됐고, 다음 회차(2027-05-13)부터는 Lambda 자동 구매 + 다중 알람 구성으로 무인화할 예정. 핵심은 (1) offering ID는 매번 describe로 조회, (2) RI는 속성 매칭이라 노드 매핑 신경 안 써도 됨, (3) 자동화 코드에 알람/감사 로그를 같이 박을 것.
