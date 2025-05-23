---
title: "[AWS] 비용 최적화 프로젝트_(1)현황 파악 및 해결안 모색"
excerpt: "graviton타입으로 바꾸면 얼마나 아낄까? 스테이징 서버를 안쓰는 시간에 끄면 얼마나 아낄까?"
toc: true
toc_sticky: true
categories:
  - AWS
  - Cloud Cost Optimization
modified_date: 2025-03-09 09:36:28 +0900
---

## 배경 
- 신규 출퇴근 QR 서비스를 개발 시작하려고 보니 Memory DB가 너무 쓰고 싶다 .. 
- Memory DB 비싼데? 와씨 너무 비싸네. 지금 나가는 거에서 줄여보자에서 시작한 비용 최적화 방법 및 금액 서치

## 방법1. EC2 인스턴스에 딸린 EBS 타입을 gp3로 바꾸기 
- gp2보다 gp3가 GB당 비용이 20% 저렴하다. 
- 다만 너무 부지런했던 나머지.. 이건 이미 gp3로 설정되어 있었다. 패스 

## 방법2. RDS 인스턴스 타입을 graviton으로 바꾸기. 
- Graviton 기반 인스턴스
  - AWS가 자체 설계한 Arm 기반 프로세서(AWS Graviton2 및 Graviton3)를 사용하는 Amazon RDS 인스턴스 타입
  - 기존 x86 기반 인스턴스(Intel, AMD)보다 성능이 뛰어나고, 비용이 저렴한 것이 장점.
- 동일한 성능 기준으로 Intel/AMD 기반 인스턴스보다 최대 35% 저렴함.
- 처리량 대비 가격이 낮아 TCO(총 소유 비용) 절감 가능

### DB 타입 변경 시뮬레이션
* Cost Calculator에서 비교 가능하다. (이전 현황은 월별 청구서를 봐도 되지만 비교하기 편하라고 둘다 찍어봤다) 
* 리소스 현황 : 운영 2대, 스테이징 2대 (db.r5.large \* 2 , db.t3.large \* 2)
* 이전 : 월 1,054.12 USD (약 153만원)
    (db.r5.large \* 2 , db.t3.large \* 2)
      
  ![image](https://github.com/user-attachments/assets/a6ea1f01-2197-428c-85ae-abe468beb2b8)

  
* 이후 : 월 966.52 USD (약 140만원)
    (db.r6g.large \* 2 , db.t4g.large \* 2)
      
    ![image](https://github.com/user-attachments/assets/3f4837f6-57eb-46c0-9c1b-06a5f593aba3)

* **월 13만원 절약**

## 방법3. 퇴근 후/주말에 스테이징 EC2 기동 중지
- 운영 서버는 기동 중지가 불가능하지만, 테스트용으로 올려놓은 스테이징 서버는 근무시간에만 사용하므로 기동 중지가 가능하다.

### EC2 스테이징 기동 정지 스케줄링 시뮬레이션

* 리소스 현황 : 총 8대 (t3.medium \* 5, t3.small \* 2, t3.micro \* 1)
* 이전 : 월 237.25 USD (약 34만원)
* 이후 : 월 90 USD (약 24만원)
  * 월 예상비용의 산정 시간은 730 (24*365/12) 시간을 가정 
* 주말과 주중 오후 9시\~오전6시 절체시 월 90 USD (약 14만원) -> **월 20만원 절약**

## 어떻게 했느냐
- DB 타입 변경 : 은 인스턴스 타입 변경만 하면 되니 간단하다.
    - 다만, 배치 프로그램 시간 등을 고려하여 작업시간 설정.
    - 라이터/리더 인스턴스 사용하는 경우 : 자동 재해복구 기능 적용으로, 라이터가 shutdown시 자동으로 리더가 라이터로 활성화된다. 만약 기존의 라이터 인스턴스 ID를 그대로 사용하기 원한다면, 절체작업으로 뒤바뀐 리더와 라이터를 원래의 역할로 재배치한다.
- [EC2 기동정지 스케줄링](https://dasoldasol.github.io/aws/cloud%20cost%20optimization/aws_cost_optimization_2/)

