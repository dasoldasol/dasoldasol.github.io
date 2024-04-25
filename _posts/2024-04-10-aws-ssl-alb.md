---
title: "[보안] 타사 인증서 AWS ALB SSL 적용"
excerpt: "타사 인증서를 AWS ACM에 등록하고 ALB에 적용해보자"
toc: true
toc_sticky: true
categories:
- 보안
- SSL
- AWS
modified_date: 2024-04-10 09:36:28 +0900
---

## 현황 
- HTTPS로의 전환이 필요하여 SSL 인증서 발급받았다.
- 계약팀의 사정(?)으로 AWS ACM에서 직접 발급받지 않고 타사인 가비아에서 인증서를 발급받아, AWS에 등록하고 이 인증서를 적용해야함
- 현재 WAS, WEB 등 모든 서버가 ALB를 통해 서로 통신하는 상태
- Route53에 도메인 등록은 마친상태 

## 방법 개요 
- 가비아(타사 인증서) 발급 (pem파일 형태)
- ACM 인증서 등록
- ALB 리스너 추가 및 편집
- application properties 수정


## ACM 인증서 등록

### 인증서 및 키 변환 
- 사전완료사항) 가비아 홈페이지에서 pem파일 다운로드 완료 
- 키 변환 시 ACM 허용 암호화 알고리즘 확인
  - 인증서 프라이빗 키 
  ```
  openssl rsa -in domain_com.key -out domain_com.pem
  ```
  
  - 인증서 본문 
  ```
  openssl x509 -in domain_com_cert.crt -out domain_com_cert.pem
  ```

  - 인증서 체인
  ```
  openssl x509 -in domain_com_chain_cert.crt -out domain_com_chain_cert.pem
  ```
  ```
  openssl x509 -in domain_com_root_cert.crt -out domain_com_root_cert.pem
  ```

### ACM 인증서 및 키 등록 
- cat xxx.pem 후 copy
- AWS 콘솔 - AWS Certificate Manager(ACM) 진입 - 인증서 가져오기 클릭
- 인증서 세부 정보에 각 내용 붙여넣기
  - 중요) 체인 순서 : 체인 -> root (root가 가장 마지막)

  ![image](https://github.com/dasoldasol/dasoldasol.github.io/assets/29423260/51c392f7-c3fc-43dd-9962-3034a363ef7a)


## ALB 리스너 추가 및 편집 

### HTTP:80
- HTTPS로 리디렉션될 수 있도록 리스너 편집
  
  ![image](https://github.com/dasoldasol/dasoldasol.github.io/assets/29423260/71f332e8-3cec-425f-a0c7-7cc49abc4291)

### HTTPS:443
- 기존 HTTP:80 리스너 역할
- 리스너 세부 정보 : 443 포트 리스너 추가, web 서버 대상그룹으로 라우팅
- 보안 리스너 설정 : 인증서 소스 'ACM' 선택 - 등록한 도메인 인증서 선택
  
  ![image](https://github.com/dasoldasol/dasoldasol.github.io/assets/29423260/f6ed1951-98c3-413a-b130-ed5963766afc)



### 나머지 포트 리스너 편집
- HTTPS 변경, 서버 인증서 선택
  
  ![image](https://github.com/dasoldasol/dasoldasol.github.io/assets/29423260/f5a09c47-dab5-4972-b191-13b71a451f01)

## properties 수정 
- 웹애플리케이션의 properties 엔드포인트 수정 (ALB HTTP 엔드포인트 -> HTTPS 도메인)

## 인증서 만료 알람 
- 2024-04-25 추가 
- ACM에서 직접 발급한 인증서가 아니므로 자동갱신이 안된다. 만료 30일전 알람 만들어준다. 간단함 
- 순서 : SNS 토픽 생성 -> CloudWatch 알람 생성

### SNS 주제/구독 생성 
- AWS 콘솔 - Simple Notification Service 서비스 진입
- 주제 생성
  
  ![image](https://github.com/dasoldasol/dasoldasol.github.io/assets/29423260/be314ee4-03f3-4ca1-81ae-9acee9747bc5)

- 구독 생성 : 생성한 주제 ARN 선택 -> 구독을 생성한다. 이메일로 Notification 가도록 준비가 끝났다.
  
  ![image](https://github.com/dasoldasol/dasoldasol.github.io/assets/29423260/03fd23bb-2273-4af8-89e2-2d6b2d08449c)

### CloudWatch 알람 생성 
- CloudWatch - 경보 - 경보 생성 클릭
- 지표/조건 지정 : 지표) ACM 인증서 선택(Certificate Manager) / 조건) 30일보다 낮으면 경보 발생하게 함
  
  ![image](https://github.com/dasoldasol/dasoldasol.github.io/assets/29423260/14ab68e4-11f3-4561-9862-8dbd0bca77c3)

- 작업 구성 : SNS 구독 연결.경보 발생 시 SNS 구독 메일이 가도록 연결

  ![image](https://github.com/dasoldasol/dasoldasol.github.io/assets/29423260/6ff594ce-7334-4c12-9788-24074263256d)

### SNS 구독 승인 
- 요런 메일로 오면 Confirm subscription 클릭하여 구독 완료한다.
  
  ![image](https://github.com/dasoldasol/dasoldasol.github.io/assets/29423260/e5d556a5-4355-4175-8d22-5a2dc96ad833)

  ![image](https://github.com/dasoldasol/dasoldasol.github.io/assets/29423260/1822fa98-b7fc-41f6-a5fe-f374cfeb5a19)

  


  



  
