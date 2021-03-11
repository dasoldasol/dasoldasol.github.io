---
title: "보안된 내부망 rds DB클라이언트 접속"
excerpt: "private 망에 위치한 RDS를 putty가 아닌 DB 클라이언트에서 접속"
toc: true
toc_sticky: true
categories:
- AWS
- DB 
modified_date: 2020-11-01 10:36:28 +0900
---

## 과제
- private 망에 위치한 RDS를 putty가 아닌 DB 클라이언트에서 접속

##  선행사항
- EC2에 대한 pem 파일
- DataGrip(옵션)

## 방법
다음 1~3 방법을 거쳐 클라이언트 접속한다.    
1. create new - > data source에서 Amazon Aurora MySQL 선택    
2. General
- Host : RDS 엔드포인트 url
- Database : RDS 데이터 베이스 이름    
  ![image.png](https://dasoldasol.github.io/assets/images/image/2020-11-01-image1.png)    
3. SSH/SSL 
- SSH tunnel 사용 : [...] 클릭해서 SSH Configuration 이동
- Host : EC2 Bastion 퍼블릭 IP
- Autehntication type : Key pair 선택 후 pem 파일 등록    
  ![image.png](https://dasoldasol.github.io/assets/images/image/2020-11-01-image2.png)