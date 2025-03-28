---
title: "[AWS]비용 최적화 프로젝트_(1)현황 파악 및 해결안 모색"
excerpt: "graviton타입으로 바꾸면 얼마나 줄어들까? 스테이징 서버를 안쓰는 시간에 끄면 얼마나 줄어들까?"
toc: true
toc_sticky: true
categories:
  - AWS
  - Cloud Cost Optimization
modified_date: 2025-03-09 09:36:28 +0900
---

# 배경 
- 신규 출퇴근 QR 서비스를 개발 시작하려고 보니 Memory DB가 너무 쓰고 싶다 .. 
- Memory DB 비싼데? 와씨 너무 비싸네. 지금 나가는 거에서 줄여보자에서 시작한 비용 최적화 방법 및 금액 서치

# 방법1. EC2 인스턴스에 딸린 EBS 타입을 gp3로 바꾸기 
- gp2보다 gp3가 GB당 비용이 20% 저렴하다. 
- 다만 너무 부지런했던 나머지.. 이건 이미 gp3로 설정되어 있었다. 패스 

# 방법2. RDS 인스턴스 타입을 graviton으로 바꾸기. 
- Graviton 기반 인스턴스
  - AWS가 자체 설계한 Arm 기반 프로세서(AWS Graviton2 및 Graviton3)를 사용하는 Amazon RDS 인스턴스 타입
  - 기존 x86 기반 인스턴스(Intel, AMD)보다 성능이 뛰어나고, 비용이 저렴한 것이 장점.
- 동일한 성능 기준으로 Intel/AMD 기반 인스턴스보다 최대 35% 저렴함.
- 처리량 대비 가격이 낮아 TCO(총 소유 비용) 절감 가능
## DB 타입 변경 시뮬레이션 : 월 13만원 절약
* 리소스 현황 : 운영 2대, 스테이징 2대 (db.r5.large \* 2 , db.t3.large \* 2)
* 이전 : 월 1,054.12 USD (약 153만원)
    (db.r5.large \* 2 , db.t3.large \* 2)
  ![image](https://github.com/user-attachments/assets/a6ea1f01-2197-428c-85ae-abe468beb2b8)

  
* 이후 : 월 966.52 USD (약 140만원)
    (db.r6g.large \* 2 , db.t4g.large \* 2)
    ![image](https://github.com/user-attachments/assets/3f4837f6-57eb-46c0-9c1b-06a5f593aba3)

* **월 13만원 절약**
