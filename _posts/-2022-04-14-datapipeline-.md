---
title: "EC2와 kafka로 twitter 데이터 수집하기"
excerpt: "AWS를 이용한 데이터파이프라인 구축 : EC2, kafka로 twitter 데이터 수집하는 producer, consumer 만들기"
toc: true
toc_sticky: true
categories:
- Data Engineering
- AWS를 이용한 데이터파이프라인 구축
- data pipeline
- AWS
modified_date: 2022-04-14 17:03:28 +0900
---
# 개념 : kafka 
- [스트리밍형 데이터 수집](https://dasoldasol.github.io/data%20engineering/de-bigdata_art/#%EC%8A%A4%ED%8A%B8%EB%A6%AC%EB%B0%8D%ED%98%95-%EB%8D%B0%EC%9D%B4%ED%84%B0-%EC%88%98%EC%A7%91)
- 메시지 큐이고, 분산환경에 특화되어 설계되어 있다는 특징을 가짐으로써, RabbitMQ와 같은 다른 메시지큐보다 훨씬 빠르게 처리한다. 
- LinkedIn에서 개발된 분산 메시징 처리 시스템
- 파일시스템을 사용하므로 데이터 영속성 보장 
- **대용량의 실시간 로그 처리**에 특화. 기존 메시징 시스템 대비 TPS(초당 트랜잭션 수)가 우수.
- **producer** : 메시지를 생산하는 주체 
- **consumer** : 소비자로써 메시지를 소비하는 주체    
  ![image](https://user-images.githubusercontent.com/29423260/163351425-d61789d1-65d6-4769-8d03-245a6431a7a3.png)

# 데이터 파이프라인 구성도
![image](https://user-images.githubusercontent.com/29423260/163506894-1f3cd4f4-2bcb-41a0-a6c7-c4bdd66f3535.png)

