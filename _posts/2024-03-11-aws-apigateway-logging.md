---
title: "[AWS] API Gateway 호출 기록 로깅"
excerpt: "API Gateway API 호출 기록 CloudWatch 로깅 "
toc: true
toc_sticky: true
categories:
- AWS
- API Gateway
- CloudWatch
modified_date: 2024-03-11 09:36:28 +0900
---

# 문제 현황 
- API Gateway에 API 올려놨는데 갑자기 호출 막힘 
- 사용량 계획으로 트래픽 제어중이었음
  ![image](https://github.com/dasoldasol/dasoldasol.github.io/assets/29423260/f6e6b31b-5353-4cc0-a40e-3246a8277d14)
- 그치만 어디서 찔렀는지는 로깅을 안하고 있었음.. API 호출에 대한 로깅 필요성.

# 방법 개요 
- IAM 역할 생성
  
  - AmazonAPIGatewayPushToCloudWatchLogs 정책을 가진 역할 생성 후 ARN 복사해둔다. 

- API Gateway에서 액세스 로그 설정

# API Gateway 액세스 로그 설정
- 로그 설정하려는 API 선택 - 스테이지 선택
- 로그/트레이싱 탭 선택 - CloudWatch 액세스 로깅 활성화 체크
- CloudWatch 로그 역햘 ARN 입력
  - CloudWatch Logs role ARN must be set in account settings to enable logging 에러 -> 입력 형식 문제
  - 액세스 로그 대상 ARN 형식 : `arn:aws:logs:ap-northeast-2:{AWS콘솔ID}:log-group:/aws/apigateway/{API이름}`
- 로그 형식 입력
  - 액세스 로그 형식 에러 : 단일줄로 입력해야됨
  ```
  {"requestId": "$context.requestId", "ip": "$context.identity.sourceIp", "caller": "$context.identity.caller", "user": "$context.identity.user", "requestTime": "$context.requestTime", "httpMethod": "$context.httpMethod", "resourcePath": "$context.resourcePath", "status": "$context.status", "protocol": "$context.protocol", "responseLength": "$context.responseLength"}
  ```

# CloudWatch 로그 그룹 확인 
- 이제 CloudWatch 로그그룹에서 API 호출 내역 확인 가능하다.. 로그는 7일만 쌓도록 해뒀는데 이 정책은 다시 세워봐야곘음
  ![image](https://github.com/dasoldasol/dasoldasol.github.io/assets/29423260/886ce563-b0ec-4179-b68c-952bbe92b3b0)


