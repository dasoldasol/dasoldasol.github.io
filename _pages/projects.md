---
title: "프로젝트 경력"
excerpt: "보유기술 및 프로젝트 경력 기술"
toc: true
toc_sticky: true
permalink: /project/
---
## 보유기술
**Language** : python, R, Java    
**Framework/Library** : pyspark, keras, sklearn, tensorflow, Spring 4, Spring boot, pytorch, Airflow    
**DB&SQL** : MySql, mongoDB, oracle, MSSQL, AWS RDS, HiveQL  
**Tool** : Tableau, ELK Stack, Docker, gradle, splunk    
**Environment** : AWS, Linux, Windows     


## 프로젝트
### FiFM : Feature Importance Ranking과 Factorization Machines 결합 이중 네트워크 구조 추천시스템 알고리즘 연구
**기간** : 2021.08~    
**목적** : 추천 시스템에서의 추천 항목 중요도 학습 및 도출을 통한, 추천의 설명성 증대   
**대상 데이터** : Avazu 클릭 로그 벤치마크 데이터, Adult 연봉 정보 벤치마크 데이터    
**내용**:    
- 추천 시스템에서 어떤 feature가 주요 작용을 했는지 feature importance를 학습하고 도출하는 알고리즘
- FM Net(Factorization Machines)과 Selector Net(Feature Importance Ranking)이 교대 학습하는 듀얼넷 구조
    - FM Net : feature interaction(피쳐 상호작용 : 추천 항목간 관계성) 학습
    - Selector Net : FM Net의 성능을 피드백 받아, Feature Importance Ranking(추천 항목 중요도)을 통해 FM Net에 최적의 마스크 서브셋 제공    
![image](https://dasoldasol.github.io/assets/images/image/dual-net-architecture.png)     

**주요성과**: 성균관대학교 데이터사이언스융합학과 우수작 선정, 성균관대학원 논문경진대회 "제 2회 리서치 매터스" 우수작 수상


### 빌딩 에너지 시스템(BEMS) 최적 스케줄 추천 시스템 개발
**기간** : 2021.01~    
**목적** : 설비 에너지 사용 로그 분석을 통한 에너지 수요 예측, 최적 가동 스케줄 추천    
**대상 데이터** : HVAC 설비 5분단위 로그 데이터(슬라이딩 윈도우 60분)    
**역할** :    
- 빌딩 에너지 시스템(BEMS) 데이터 파이프라인 구축 및 데이터베이스 운영 (AWS VPC, Lambda, EC2, RDS, S3, SageMaker, Glue)        
- 아파트 단지 센서 데이터 ETL 기능 개발 (serverless, AWS Lambda, Kinesis, S3, RDS)
**주요 성과**: 에너지 절감 알고리즘 특허 출원 

### 아파트 단지 서버 통합 클라우드 파이프라인 구축 
**기간** : 2021.09 ~ 2021.12    
**목적** : 약 140단지의 아파트 iot 데이터 통합 관제 데이터파이프라인 구축     
**대상 데이터** : 약 140단지의 아파트 데이터 (배치형 : 일에너지사용량 등 /스트리밍형 : 월패드 조작, 출입, 주차 등)    
**역할** :     
- 클라우드 기반의 아파트 데이터 파이프라인 구축 및 데이터베이스 운영 (AWS)
- Airflow를 활용한 ETL 스케줄링

**주요 성과** : 약 140단지 아파트 서버 데이터 통합 관리


### 실시간 추천 시스템 모델링 및 개발 
**기간** : 2018.01 ~ 2019.09    
**목적** : 실시간 로그 분석을 통한 상품 선택 망설 고객 도출 및 추천 캠페인 수행    
**대상 데이터** : 일평균 12만 고객의 1억 8천만건 행동 로그 데이터    

<span style="color:navy">**실시간 추천 모델 개발(2018.01~2018.12)**</span>
- 고객 분류 임계값 룰 도출을 위한 프로세스 마이닝 및 분석 모델 개발(R, MySql)
- 실시간 고객 탐지 이벤트 쿼리 개발(logpresso based on Splunk)
- 일배치 로그 ETL 인터페이스 개발(python, centOS, sh)    

<span style="color:navy">**추천 시스템 성과분석 대시보드 개발(2019.01~2019.09)**</span>
- 성과분석 지표 및 일배치 성과분석 모델 개발 (python, ElasticSearch, Logstash)
- 성과분석 대시보드 개발(Kibana)
    
**주요 성과** : IPTV 구매 성과 20% 향상, 일평균 1.8억건 실시간 로그 시스템 개발


### 실시간 흡연 탐지 시스템 모델링 및 개발
**기간** : 2020.03 ~ 2020.09    
**목적** : 실시간 차량 공기질 데이터 분석을 통한 흡연 탐지     
**대상 데이터** : 월평균 10만건 렌트카 차량 공기질 데이터    
**역할** :
- ETL 인터페이스 및 탐지 룰 API 개발 (python Flask)
- 실시간 흡연 탐지 이벤트 쿼리 개발(logpresso based on Splunk)
- 대시보드 임베딩 API 개발(Tableau, Spring boot, java)
- 실시간 흡연 탐지 룰 개발 및 백서 작성(sklearn)    
    
**주요 성과** : 탐지정확도 98%, 분석모델 적용 자동화 API 개발


### 실시간 미세먼지 iot 데이터 분석 시스템 모델링 및 개발
**기간** : 2019.10 ~ 2020.03    
**목적** : 실시간 환풍기 iot 데이터 분석을 통한 환풍기 원격 제어 시스템 구축    
**대상 데이터** : 경희대, 인하대, 서울시 내의 유치원 환풍기 데이터   
**역할** :
- ETL 인터페이스 개발 (AWS firehose, Lambda, python)
- 실시간 파싱 이벤트 쿼리 개발 (logpresso based on Splunk)
- 홈페이지 백엔드 API 개발 (spring boot, lombok)  
    
**주요 성과** : 대시보드 서비스 홈페이지 구축


### 시니어 유튜버 해시태그 추천 시스템 ETL 및 API 개발
**기간** : 2020.09 ~ 2020.11   
**목적** : 시니어 유튜버들을 위한 저작 도구에서 데이터 분석을 통한 해시태그 추천    
**대상 데이터** : 네이버 뉴스 API, 다음까페 API, 네이버밴드 API, SKT 통화이력 API    
**역할** :
-  데이터 Crawling 모듈 개발 (AWS Lambda, python, serverless framework)
-  데이터 ETL 및 전처리 (AWS Lambda, python, serverless framework, sh)
-  홈페이지 백엔드 API 개발 (spring boot, Java, Docker, Tableau Server)   
    
**주요 성과** : Docker를 기반으로 한 non-stop 배포 환경 구축


### 주차장 수요 예측 ETL 모듈 개발
**기간** : 2020.01 ~ 2020.03   
**목적** : 주차장 가격 변동에 따른 수요 예측을 위한 데이터 전처리 및 통계 프로시저 개발   
**대상 데이터** : 네이버 뉴스 API, 다음까페 API, 네이버밴드 API, SKT 통화이력 API    
**역할** :
-  데이터 ETL 및 전처리 (AWS Lambda, python, serverless framework)
-  주차장 통계 프로시저 개발 (MySQL 프로시저)

**주요 성과** : MySQL 프로시저를 통한 주차장 통합 통계 베이스 구축
