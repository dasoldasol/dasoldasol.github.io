---
title: "프로젝트 경력"
excerpt: "보유기술 및 프로젝트 경력 기술"
toc: true
toc_sticky: true
permalink: /project/
---
## 보유기술
**Language** : python, R, Java    
**Framework/Library** : sklearn, tensorflow, Spring 4, Spring boot     
**DB** : MySql, mongoDB, oracle    
**Tool** : Tableau, ELK Stack, Docker container, gradle, splunk    
**Environment** : AWS, Linux, Windows     

## 프로젝트
### AWS 기반의 데이터 인프라 구축
**기간** : 2021.01~
- 빌딩 에너지 시스템(BEMS) 데이터 파이프라인 구축 (AWS VPC, Lambda, EC2, RDS, S3)
- 아파트 단지 센서 데이터 ETL 기능 개발 (serverless, AWS Lambda, Kinesis, S3, RDS)
- 사내 수주매출 대시보드 도출을 위한 ERP시스템 데이터 파이프라인 구축 (AWS Athena, MSSQL, Tableau)
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
- 홈페이지 백엔드 API 개발 (spring boot)  
    
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



## 문제 해결 경험 
### 실시간 추천 시스템 성능 개선
- 문제 : 분석 소스의 <span style="color:navy">**일배치작업에서의 성능 저하 이슈**</span>
- 원인 : 로그데이터가 일평균 1억 8천만건의 대용량인데, 분석소스가 R로 개발되었기 때문에 싱글 쓰레드 기반의 R에서는 배치 작업이 오래 걸림
- 조치 : 분석 소스 내부에 프로세서에서 코어갯수를 받아서 코어를 쪼개는 <span style="color:navy">**분산처리 작업**</span>을 진행
- 결과 : 성능이 분산처리 전에는 돌다가 멈췄는데 <span style="color:navy">**10코어일때 50분, 26코어일때 20분정도로 개선**</span>됨 

### 실시간 흡연 탐지 시스템 모델 적용 자동화
- 문제 : 추천 시스템 개발 당시에는 실시간 이벤트 탐지하던 솔루션을 사용하면 <span style="color:navy">**모델 결과를 수동으로 적용**</span>해야하는 불편함이 있었음
- 원인 : 솔루션이 R을 지원하지 않았음 
- 조치 : 같은 솔루션을 쓰는 실시간 흡연 탐지 시스템에서는 <span style="color:navy">**python**</span>으로 모델을 개발하고, 모델의 피클 파일에서 룰을 읽어오는 <span style="color:navy">**api**</span>를 개발
- 결과 : <span style="color:navy">**룰 적용이 자동화**</span>되어 룰이 변경될때마다 수정 작업을 거치지 않아도 됨