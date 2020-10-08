---
title: "serverless framework로 AWS에 데이터 파이프라인 구축하기"
excerpt: 'serverless framework로 '
toc: true
toc_sticky: true
categories:
  - AWS
  - serverless framework
modified_date: 2020-09-10 09:36:28 +0900
---
## serverless framework를 쓰게된 이유
기존에는 open API를 통해 크롤링하는 python 코드를 작성해서 AWS Lambda 콘솔에서 직접 적용했다. 문제는.. 
- 파이썬 자체 패키지를 쓰려면 패키징을 해서 zip파일로 만들어 AWS Lambda 콘솔에서 업로드 해야함 
- API로 크롤링한 csv를 S3에 저장하고, DB에 적재하려면 AWS IAM 등에서 계속 권한을 줘야하니까 프로세스가 정리가 잘 안됨 
- 위의 두 문제로 소스 형상 관리가 지저분하게 됨     
이런 문제로 serverless 프레임워크를 통해 **Lambda Funtion 작성**부터 **권한 부여 및 배포**까지 한 프레임워크 내에서 해결하고자 한다.

## 목표
- 네이버 밴드 API로 크롤링하는 python 코드를 Lambda 함수로 작성해서 결과 csv를 S3로 저장하고, S3에 저장 즉시 이벤트 트리거링을 통해 MySQL 데이터베이스에 저장되도록 한다.    
  ![etl-architecture](https://dasoldasol.github.io/assets/images/image/2020-09-10-archi.png)    
      
- 필요 AWS 설정(권한, 정보)을 serverless 프레임워크를 이용하여 하나의 yml파일로 관리하고 배포하도록 한다. 