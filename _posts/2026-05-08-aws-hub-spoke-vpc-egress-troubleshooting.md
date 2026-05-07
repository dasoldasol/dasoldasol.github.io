---
title: "[AWS] Hub-and-Spoke Landing Zone에서 EC2 외부 호출이 안 될 때 — 인바운드는 되는데 아웃바운드는 별개라는 이야기"
excerpt: "Control Tower Hub-and-Spoke 구조의 신규 워크로드에서 외부 SMS/SMTP API 호출이 전부 timeout. 보안그룹부터 의심하다가 라우트 테이블 default route 부재로 결론, GTM 기반 SaaS의 IP 화이트리스트 한계까지 부딪힌 진단 기록"
toc: true
toc_sticky: true
categories:
- AWS
- VPC
- Networking
date: 2026-05-08 08:00:00 +0900
---

## 배경: 갑자기 외부 API가 안 된다

신규 오픈한 사내 서비스(Private Subnet의 EC2 2대 + Internal ALB + RDS)에서 운영 중 갑자기 개발팀 보고가 들어왔다.

- **NHN Cloud SMS API** `POST https://api-sms.cloud.toast.com/sms/v3.0/...` — 동작 안 함
- **NHN Cloud 알림톡 API** `POST https://api-alimtalk.cloud.toast.com/alimtalk/v2.0/...` — 동작 안 함
- **Dooray SMTP** `smtp.dooray.com:465` — 동작 안 함

서비스 자체는 외부에서 잘 들어오고 있고(`https://visit.example.com` 정상), DB도 멀쩡한데 EC2가 외부로 나가는 호출만 다 막힌다.

> "외부에서 잘 들어오는데 EC2가 외부로 나가는 건 안 된다."

이 한 문장이 이 글의 핵심이다. **Hub-and-Spoke Landing Zone에서 인바운드와 아웃바운드는 완전히 다른 길을 쓴다**는 점을 놓치면 한참을 헤매게 된다.

---

## 1단계: 첫 의심 — 보안그룹?

가장 먼저 떠오른 건 보안그룹이다. 외부 호출이 막히면 십중팔구 SG outbound다.

확인해보니 `visitor-app-sg`의 outbound는 **전체 허용(0.0.0.0/0 모든 포트)**. 신규 구축 시 컨트롤타워 측에 이미 그렇게 요청해서 등록된 상태였다.

→ SG 문제 아님. **다음 의심으로 넘어가야 한다.**

---

## 2단계: 진단 — 어디서 끊어지는가

EC2에서 SSM run-command로 직접 끊어봤다.

```bash
# 1) DNS 해석
getent hosts api-sms.cloud.toast.com

# 2) TCP 443 도달성
timeout 5 bash -c "</dev/tcp/api-sms.cloud.toast.com/443" \
  && echo TCP_OK || echo TCP_FAIL

# 3) HTTPS HEAD
curl -sS -o /dev/null \
  -w "http=%{http_code} ip=%{remote_ip} time=%{time_total}\n" \
  --connect-timeout 5 -m 10 \
  https://api-sms.cloud.toast.com/

# 4) 대조: 임의 외부
curl -sS -o /dev/null \
  -w "http=%{http_code} ip=%{remote_ip} time=%{time_total}\n" \
  --connect-timeout 5 -m 10 \
  https://www.google.com/

# 5) 우리 egress IP 확인
curl -sS -m 10 https://checkip.amazonaws.com/
```

결과:

```
=== DNS ===
117.52.122.43   sms.gtm.toastoven.net api-sms.cloud.toast.com
=== TCP 443 toast ===
TCP_FAIL
=== HTTPS toast ===
http=000 ip= time=5.001998
curl_exit=28
=== control: google ===
http=000 ip= time=5.001029
curl_exit=28
=== outbound public IP ===
CHECKIP_FAIL
```

**중요한 단서 두 가지**:

1. **DNS는 정상** — toast IP가 잘 해석됨. 즉 Resolver는 살아있다 (Hub의 Route 53 Resolver가 정상 작동 중)
2. **TCP 443은 모두 timeout** — toast 뿐 아니라 `google.com`, `checkip.amazonaws.com`까지 전부 막힘

→ 특정 도메인 차단이 아니다. **외부 인터넷 egress 자체가 닫혀있다.**

---

## 3단계: 라우트 테이블 점검

SG도 아니고 DNS도 살아있다면 다음 의심은 **라우팅**이다.

```bash
aws ec2 describe-route-tables \
  --route-table-ids <rtb-id> \
  --query 'RouteTables[0].Routes[].[
    DestinationCidrBlock,
    DestinationPrefixListId,
    GatewayId,
    TransitGatewayId,
    State]' \
  --output table
```

```
| 10.40.0.0/20 | None             | local                | None    | active |
| None         | <hub-alb-cidr-pl>| None                 | <tgw-id>| active |
| None         | <s3-prefix-list> | <s3-vpc-endpoint-id> | None    | active |
```

라우트가 **세 개뿐**이다.

| 목적지 | 다음 홉 | 의미 |
|---|---|---|
| `10.40.0.0/20` | local | VPC 내부 통신 |
| `<hub-alb-cidr-pl>` (prefix list) | TGW | Hub Public ALB CIDR (인바운드용) |
| `<s3-prefix-list>` | S3 VPC Endpoint | S3 게이트웨이 |

**`0.0.0.0/0` default route가 없다.**

이게 뭘 의미하는가? VPC가 패킷을 보낼 때 라우트 테이블을 위에서부터 확인하는데, 매칭되는 라우트가 없으면 **그냥 버려진다(blackhole)**. toast IP `117.52.122.43`는 위 세 라우트 중 어디에도 매칭되지 않으니, EC2에서 패킷이 나가는 순간 사라진다.

SG가 아무리 다 열려있어도 **갈 길이 없으면 못 간다.**

---

## 4단계: 인바운드와 아웃바운드는 다른 길을 쓴다

여기서 한 번 멈춰야 했다. 외부에서 `visit.example.com`으로 들어오는 건 잘 되는데 EC2가 외부로 나가는 건 막힌다. 같은 EC2인데 왜 한 방향은 되고 한 방향은 안 되지?

둘이 다른 인프라를 쓰기 때문이다.

### 인바운드 경로

```
[외부 사용자]
   ↓ visit.example.com
[Route 53 Public]
   ↓
[Hub Public ALB]            ← Hub 계정 public subnet
   ↓ TGW
[Workload Internal ALB]
   ↓ 8087
[EC2 (Private Subnet)]
```

Hub 계정의 Public ALB가 외부 인입을 받아서 TGW를 통해 Workload 안쪽 Internal ALB로 보내고, 거기서 EC2:8087로 forward. EC2 자체는 public IP가 없다. EC2 입장에선 그냥 VPC 내부에서 들어오는 패킷이라 외부 egress 인프라가 일절 필요 없다.

### 아웃바운드 경로

```
[EC2 (Private Subnet)]
   ↓ ① SG outbound 체크         ← 통과 (전체 허용)
   ↓ ② VPC 라우팅                ← 0.0.0.0/0 없음 → drop ❌
   ↓
[NAT GW / Hub egress]
   ↓
[외부 API]
```

EC2가 클라이언트가 되어 외부에 능동적으로 패킷을 던진다. 이걸 인터넷으로 보내줄 길(NAT GW + 그걸 가리키는 라우트)이 필요한데 그게 없는 상태였다.

### 표준 Hub-and-Spoke 컨벤션

- Workload 계정은 Private Subnet만 운영
- 인바운드는 Hub Public ALB가 받아서 spoke로 forward
- 아웃바운드는 Hub VPC의 NAT GW를 통해 인터넷으로

NAT GW를 워크로드마다 두면 비용도 누적되고 통제도 분산되니까, Hub에 한 개만 두고 모든 워크로드가 공용한다. 그래서 보통 Workload RT엔 `0.0.0.0/0 → TGW`만 있고 실제 NAT GW는 Hub에 있다.

이번에 빠져있던 게 정확히 이 한 줄.

---

## 5단계: 첫 회신은 prefix list 방식

컨트롤타워팀에 티켓을 올렸다. 회신은 이랬다.

> "0.0.0.0/0 default route보다 도메인 단위 화이트리스트로 좁히는 게 보안 정책에 맞다."

least privilege 관점에서 합리적인 요구라 일단 그 방향으로 진행됐다. 대상 도메인 IP를 customer-managed prefix list에 등록하고, 그 prefix list만 TGW로 보내는 라우트가 추가됐다.

```
prefix list `visit-api-20260507`:
  180.210.67.74/32  smtp.dooray.com
  180.210.71.204/32 api-sms.cloud.toast.com
  180.210.71.199/32 api-alimtalk.cloud.toast.com
```

검증해보니 결과가 EC2별로 달랐다.

| 통신 | visit-a | visit-c |
|---|---|---|
| smtp.dooray.com:465 | ✅ TCP OK | ✅ TCP OK |
| api-sms.cloud.toast.com:443 | ❌ timeout | ✅ HTTP 200 |
| api-alimtalk.cloud.toast.com:443 | ❌ timeout | ❌ timeout |

같은 VPC, 같은 RT, 같은 resolver를 쓰는 두 EC2의 결과가 다르다. 추적해보니 NHN Cloud Toast가 GTM (Global Traffic Manager) 을 쓰는 게 원인이었다.

```bash
$ dig api-sms.cloud.toast.com

api-sms.cloud.toast.com. 82  IN  CNAME  sms.gtm.toastoven.net.
sms.gtm.toastoven.net.   30  IN  A      180.210.71.204
```

CNAME이 `*.gtm.toastoven.net`을 가리키고, GTM이 resolver/시점에 따라 다른 IP를 응답한다. TTL은 30초.

5번 연속 dig를 돌려본 결과:

| 도메인 | visit-a 응답 | visit-c 응답 | prefix list 등록 |
|---|---|---|---|
| api-sms.cloud.toast.com | **117.52.122.43** | **180.210.71.203** | 180.210.71.**204** |
| api-alimtalk.cloud.toast.com | **117.52.122.11** | 180.210.71.199 | 180.210.71.**199** |
| smtp.dooray.com | 180.210.67.74 | 180.210.67.74 | 180.210.67.74 |

5회 모두 일관된 응답이라 round-robin이 아니라, EC2별로 GTM이 다른 IP를 안내하는 형태였다. 같은 VPC resolver를 쓰는데 왜 EC2별로 답이 다른지는 명확히 추적 못 했지만 (EDNS Client Subnet 처리 차이로 추정), 어쨌든 결과적으로 prefix list에 등록한 고정 IP와 EC2가 받는 IP가 어긋나는 시점이 자주 발생한다.

WHOIS로 NHN 보유 대역 자체는 좁힐 수 있었다.

```
180.210.64.0/22  NHNCLOUD-NET-KR  (Dooray SMTP 영역)
180.210.68.0/22  NHNCLOUD-NET-KR  (toast SMS/알림톡 영역)
117.52.0.0/16    KIDC (LG DACOM IDC 광역)  ← NHN이 임차해 쓰는 대역
```

`180.210.64.0/21`은 NHN 자체 보유라 prefix list에 등록 가능. 그런데 `117.52.x.x`는 KIDC 광역 대역이라 그대로 등록하면 NHN 외 다른 입주사 IP까지 같이 열어주는 셈이 된다. 좁히려면 NHN 측 공식 안내가 필요하다.

여기까지 와서 prefix list 방식의 한계가 명확해졌다.

- GTM 기반 SaaS는 응답 IP가 운영 중 바뀐다 (TTL 30초, 멀티 IP/멀티리전)
- WHOIS로 좁히기 어려운 임차 IDC 대역도 섞여있다
- IP 추가/변경마다 인프라 티켓 반복
- 다른 외부 SaaS(결제, OAuth 등) 추가될 때마다 또 반복

이 데이터를 들고 컨트롤타워팀과 다시 협의했다. 도메인 단위 통제가 정 필요하면 Hub의 L7 방화벽에서 하는 게 맞고, 거기서 처리할 수 없으면 default route로 풀고 Hub의 정책으로 통제하자 — 이쪽으로 합의됐다.

---

## 6단계: default route 한 줄로 정리

라우트 테이블에 `0.0.0.0/0 → TGW` 한 줄을 추가했다.

```
| 10.40.0.0/20  | local                | (VPC 내부)
| 0.0.0.0/0     | <tgw-id>             | ← 추가
| <hub-alb-pl>  | <tgw-id>             | (인바운드용 — 그대로)
| <api-pl>      | <tgw-id>             | (이전 시도 잔존 — 무해)
| <s3-pl>       | <s3-vpc-endpoint-id> | (S3 게이트웨이)
```

`0.0.0.0/0`은 longest-prefix-match에서 마지막에 평가되니까, 위의 구체적 라우트에 매칭되지 않는 모든 트래픽이 자동으로 TGW로 흐른다 → Hub VPC NAT GW → 인터넷.

검증.

```
visit-a / visit-c 동일하게:
  api-sms.cloud.toast.com:443       → HTTP 200
  api-alimtalk.cloud.toast.com:443  → HTTP 404 (서버 응답함, 통신 OK)
  smtp.dooray.com:465               → TCP OK
  google.com:443                    → HTTP 200 (대조군)
  egress_ip                         → 15.165.114.x  (Hub NAT GW의 EIP)
```

GTM이 어떤 IP를 응답하든 default route라 통과한다. 양쪽 EC2 동일.

### prefix list 방식 vs default route 방식

| | prefix list | default route |
|---|---|---|
| GTM IP 변동 | 매번 등록 갱신 필요 | 영향 없음 |
| 새 외부 SaaS 추가 | 매번 IP 등록 | 자동 통과 |
| 임차 IDC 대역 | 좁히기 어려움 | 무관 |
| 보안 통제 위치 | Workload RT (분산) | Hub 방화벽 (중앙) |
| 운영 부담 | 누적 | 한 번 |

Hub-and-Spoke 컨벤션의 본질이 "보안 통제는 Hub에 집중"이라는 걸 생각하면, 통제 위치가 Hub 방화벽으로 모이는 후자가 컨벤션과 자연스럽게 맞는다. 운영 가시성도 한 곳에 모인다.

---

## 7단계: 외부에서 본 우리 egress IP

`checkip.amazonaws.com`으로 확인한 우리 egress public IP는 양쪽 EC2 모두 동일했다. Hub VPC NAT Gateway의 EIP다.

```
visit-a egress_ip = 15.165.114.x
visit-c egress_ip = 15.165.114.x
```

기록해두면 좋은 정보:

- 외부 서비스가 발신 IP 등록을 요구할 때 (예: 파트너사 API의 inbound 화이트리스트) 이 IP를 알려주면 된다
- Hub의 NAT GW EIP가 바뀌지 않는 한 안정적이다
- 같은 Hub를 쓰는 다른 Workload 계정의 EC2도 모두 같은 egress IP로 나간다

---

## 회고

이번에 정리하면서 새삼 느낀 것들.

**인바운드 점검만 하고 아웃바운드를 빠뜨린다.** 신규 워크로드를 합류시킬 때 흔한 실수 같다. 외부에서 잘 들어오면 일단 안도하고 넘어가는데, 아웃바운드는 완전히 별도 점검 항목이다. Landing Zone 표준이 "Workload는 Private Subnet만"이라 외부 노출 자동으로 막힌 것까지는 컨벤션이 챙겨주지만, 그 EC2가 외부로 나가는 길은 별도로 깔아줘야 한다.

**진단 순서는 SG → DNS → TCP → RT → 방화벽.** 이 순서대로 끊으면 보통 30초~1분이면 어디서 끊기는지 나온다. 핵심은 임의의 다른 외부 도메인(google.com 등)을 대조군으로 같이 던져보는 것. 특정 도메인 문제인지 egress 자체 문제인지 한 번에 분리된다.

**GTM 기반 SaaS는 IP 화이트리스트가 깨진다.** NHN Cloud Toast가 그렇고, 사실 요즘 큰 SaaS는 거의 다 비슷하다 (Cloudflare 뒤에 있거나 자체 GTM/Anycast). IP 단위로 통제하려면 공식 IP 대역 안내를 받아야 하고, 그것도 운영 중 변경 공지를 받아야 한다. L7 방화벽이 가능한 환경이라면 도메인 단위가 맞고, 아니면 default route + Hub 통제가 현실적이다.

**보안 통제의 "위치"가 운영 비용을 결정한다.** Workload RT에서 통제하면 새 도메인 추가할 때마다 N개 워크로드 RT를 다 만져야 한다. Hub 방화벽에서 통제하면 한 곳만 수정하면 된다. Landing Zone 컨벤션이 "Hub 중심 통제"인 건 디자인 취향이 아니라 운영 부담 누적을 막는 구조적 선택이다.

**컨트롤타워의 "도메인 단위 좁혀라" 요구도 합리적이긴 하다.** 보안팀 입장에선 least privilege가 기본이고, "필요한 만큼만 열고 싶다"는 정당한 요구다. 다만 GTM 기반 SaaS의 특성을 알면 그게 운영 중 깨진다는 근거를 들어 설득할 수 있다. 데이터 들고 가서 협상하는 게 핵심. 이번 케이스에선 5회 dig 결과 + EC2별 응답 차이가 결정적인 근거였다.

---

## 진단 명령어 모음

이번에 자주 썼던 것들. 다음에 비슷한 일 생기면 바로 쓰려고 정리해둔다.

### EC2에서 외부 도달성 진단

```bash
# DNS
getent hosts <domain>
dig +short A <domain>
dig +noall +answer A <domain>   # CNAME 체인까지 보기

# TCP 포트 도달성
timeout 5 bash -c "</dev/tcp/<host>/<port>" \
  && echo TCP_OK || echo TCP_FAIL
nc -vz <host> <port>

# HTTPS 응답
curl -sS -o /dev/null \
  -w "http=%{http_code} ip=%{remote_ip} time=%{time_total}\n" \
  --connect-timeout 5 -m 10 https://<host>/

# 우리 egress IP 확인
curl -sS https://checkip.amazonaws.com/

# 등록 IP로 직접 SNI 테스트 (DNS 우회)
curl -sS -o /dev/null -k \
  -w "http=%{http_code} time=%{time_total}\n" \
  --resolve <host>:443:<ip> https://<host>/

# DNS 캐시 플러시
sudo resolvectl flush-caches
```

### 라우트 테이블 / Prefix list 조회

```bash
# RT 조회
aws ec2 describe-route-tables \
  --route-table-ids <rtb-id> \
  --query 'RouteTables[0].Routes' --output table

# 서브넷 → RT 역추적
aws ec2 describe-route-tables \
  --filters "Name=association.subnet-id,Values=<subnet-id>" \
  --query 'RouteTables[0].RouteTableId' --output text

# 관리형 prefix list 조회
aws ec2 describe-managed-prefix-lists --prefix-list-ids <pl-id>
aws ec2 get-managed-prefix-list-entries --prefix-list-id <pl-id>
```

### TGW 조회 (Hub 측 권한 필요)

```bash
# TGW attachment 목록
aws ec2 describe-transit-gateway-attachments \
  --filters Name=transit-gateway-id,Values=<tgw-id> \
  --query 'TransitGatewayAttachments[].[
    TransitGatewayAttachmentId,
    ResourceType,ResourceId,
    Association.TransitGatewayRouteTableId,State]' \
  --output table

# TGW route table 조회
aws ec2 search-transit-gateway-routes \
  --transit-gateway-route-table-id <tgw-rtb-id> \
  --filters Name=type,Values=static,propagated
```

### IP 대역 조사 (방화벽 등록용)

```bash
# WHOIS로 IP 소유 대역 확인
whois <ip> | grep -iE \
  "^(inetnum|netname|cidr|netrange|descr|orgname|country)"

# 한국 IP는 KRNIC WHOIS도 함께
whois -h whois.kisa.or.kr <ip>
```

---

## 마무리

Hub-and-Spoke Landing Zone에서 인바운드와 아웃바운드는 별개의 길이다. 인바운드는 Hub Public ALB가, 아웃바운드는 Hub egress(NAT GW)가 담당한다. 신규 워크로드 합류 후 외부 호출이 안 되면 SG → DNS → TCP → RT 순서로 끊어보고, 라우트 테이블에 `0.0.0.0/0`이 있는지 본다. GTM 기반 SaaS의 IP 화이트리스트는 한계가 있고, default route + Hub 방화벽 조합이 운영상 더 안정적이다.
