---
title: "[AWS] 비용 최적화 프로젝트_(3) 예약 인스턴스로 EC2 비용 절감하기"
excerpt: "EC2를 예약 인스턴스로 바꾸면 얼마나 절감할 수 있을까?"
toc: true
toc_sticky: true
categories:
  - AWS
  - Cloud Cost Optimization
modified_date: 2025-06-04 09:36:28 +0900
---

## 이 글의 목적

이 글은 **운영 및 스테이징 EC2 인스턴스**의 온디맨드(OD) 요금제 대신 **예약 인스턴스(RI)** 를 적용함으로써 **비용 절감이 얼마나 가능한지**, 그리고 **그 과정에서 어떤 요소를 고려해야 하는지**를 공유하기 위해 작성되었음.

앞선 비용 최적화 글에서 다룬 내용이 스케줄링을 통한 EC2 기동/정지였다면, 이번에는 **항상 켜져 있어야 하는 운영 인스턴스**에 대해 **RI 구매로 장기 절감**하는 전략을 다룬다.

---

## 예약 인스턴스란?

> EC2 인스턴스를 일정 기간(1년 또는 3년) 예약하여 사용하는 약정 요금제

- 장기 사용 시 최대 70%까지 절감 가능
- No Upfront (선불 없음), Partial Upfront, All Upfront 등 다양한 결제 방식 제공
- 항상 켜져 있어야 하는 운영 서버에 적합

---

## 운영 인스턴스 기준 요약

| 항목 | 값 |
| --- | --- |
| 인스턴스 타입 | `m6i.large` |
| 인스턴스 수량 | 8대 |
| 운영 시간 | 24시간 × 30.4일 = **730시간/월** |
| 요금 기준 | 서울 리전, Linux, 2025년 5월 기준 |
| RI 옵션 | **1년, No Upfront**, Standard Reserved Instance |

### 월간 비용 비교

| 항목 | 온디맨드 | 예약 인스턴스 (RI) | 절감 |
| --- | --- | --- | --- |
| 시간당 요금 | $0.118 | $0.077 | 약 34.5% 절감 |
| 월간 (730시간 기준) | $86.14 × 8 = $689.12 | $56.21 × 8 = $449.68 | **$239.44/월 절감** |
| 연간 (8,760시간 기준) | $8269.44 | $5396.16 | **$2873.28/년 절감** |

---

## 스테이징 인스턴스: RI 적용 가능할까?

스테이징은 평일 06:00~21:00, 주말 전체 종료 전략을 사용 중.

- 월간 운영 시간: 약 325.5시간
- 평일만 기동, 주말은 종료

### 요금 비교 (t3.medium 기준)

| 구분 | 운영 시간 | 시간당 요금 | 월간 비용 | OD 풀타임 대비 절감 |
| --- | --------- | ------------ | --------- | ---------------- |
| **온디맨드 (상시 운영)** | 730시간 | $0.0520 | $189.80 | — |
| **온디맨드 (기동/정지)** | 325.5시간 | $0.0520 | $84.63 | $105.17 절감 |
| **RI (1년 No Upfront)** | 730시간 | $0.0314 | $114.61 | $75.19 절감 |

> 스테이징 서버는 항상 켜져 있지 않기 때문에 RI가 최적의 전략은 아님. **RI는 항상 켜져 있어야 더 큰 절감 효과를 볼 수 있음**에 유의하여야 한다.

---

## 실제 적용 시 체크리스트

| 항목 | 설명 | 체크 |
| --- | --- | --- |
| **Tenancy** | 반드시 `default`여야 RI 적용 가능 | V |
| **인스턴스 조건 일치** | 리전/타입/OS 정확히 일치해야 RI 적용됨 | V |
| **가동률** | RI는 항상 요금 발생 → 항상 운영되는 서버에만 적용 | V |

---

## 적용 방법 요약

1. **운영 인스턴스 목록 확인**
2. **OS, 리전, Tenancy 확인**
3. **예약 인스턴스 구매** (AWS 콘솔 → EC2 → 예약 인스턴스)

### Tenancy 확인

```bash
aws ec2 describe-instances \
  --query "Reservations[*].Instances[?Placement.Tenancy!='default'].[InstanceId, Placement.Tenancy]" \
  --output table
```

### OS 확인

```bash
aws ec2 describe-instances \
  --query "Reservations[*].Instances[*].[Tags[?Key=='Name']|[0].Value, PlatformDetails]" \
  --output table
```

---

## 마무리

이번 글에서는 **항상 켜져 있는 EC2 인스턴스**에 대해 **예약 인스턴스를 적용하여 비용을 줄이는 방법**을 소개하였다. 

- RI는 단순히 저렴한 것이 아니라, **운영 서버처럼 항상 켜져 있어야만 이점이 있는 전략**.
- 스테이징 서버처럼 스케줄링 기동/정지가 가능하다면, RI보다 **기동/정지 자동화 전략**이 더 효과적이다.
