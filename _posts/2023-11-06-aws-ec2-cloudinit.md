---
title: "[AWS] EC2 재기동 시 cloudinit으로 기존 애플리케이션 자동 실행하기"
excerpt: "EC2 재기동 시 cloudinit으로 기존 애플리케이션 자동 실행하기"
toc: true
toc_sticky: true
categories:
  - AWS
  - EC2
modified_date: 2023-11-06 09:36:28 +0900
---
## 상황 
- EC2 인스턴스를 재기동하는 순간이 있다. 인스턴스 타입 바꾼다던가..
- 그때마다 서버 위에 구동되던 애플리케이션을 다시 들어가서 구동해줘야한다.
- init할때와 마찬가지로, 서버 재기동때에도 실행되어야하는 작업을 작성해둘 수 있다.

## 방법 
- 사전사항) EC2에 cloud-init 설치되어있는지 확인(Amazon Linux 2의 경우 디폴트로 설치되어 있음)
- AWS 콘솔 - EC2 - 인스턴스 중지 확인 - 작업 - 사용자 데이터 클릭
- 사용자 데이터에 cloud-init 사용자 데이터 스크립트 작성 -> EC2 재기동 

  ```bash
  Content-Type: multipart/mixed; boundary="//"
  MIME-Version: 1.0
  
  --//
  Content-Type: text/cloud-config; charset="us-ascii"
  MIME-Version: 1.0
  Content-Transfer-Encoding: 7bit
  Content-Disposition: attachment; filename="cloud-config.txt"
  
  #cloud-config
  cloud_final_modules:
  - [scripts-user, always]
  
  --//
  Content-Type: text/x-shellscript; charset="us-ascii"
  MIME-Version: 1.0
  Content-Transfer-Encoding: 7bit
  Content-Disposition: attachment; filename="userdata.txt"
  
  #!/bin/bash
  # 이 아래부터 하고 싶은 작업 적으면 된다. sh 돌릴라고 했는데 실패해서 걍 명령어 적음
  # jar 실행 
  java -jar -Dspring.profiles.active=prd ./insite-was-0.0.1-SNAPSHOT.jar
  --//
  ```
