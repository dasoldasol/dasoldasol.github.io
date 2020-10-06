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
### 실시간 추천 시스템 개발
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

### 실시간 흡연 탐지 시스템 개발 
**기간** : 2020.03 ~ 2020.09    
**목적** : 실시간 차량 공기질 데이터 분석을 통한 흡연 탐지     
**대상 데이터** : 월평균 10만건 렌트카 차량 공기질 데이터    
**역할** :
- ETL 인터페이스 및 탐지 룰 일배치 API 개발 (python, NGrinder)
- 실시간 흡연 탐지 이벤트 쿼리 개발(logpresso based on Splunk)
- 대시보드 임베딩 API 개발(Tableau, Spring boot, java)
- 실시간 흡연 탐지 룰 개발 및 백서 작성(sklearn)

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