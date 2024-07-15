---
title: "[보안] SSM으로 콘솔에서 EC2 원격 쉘 접속"
excerpt: "보안그룹 수정 없이 VPC 내부의 EC2 쉘 접속 해보자 "
toc: true
toc_sticky: true
categories:
- 보안
- SSM
- AWS
modified_date: 2024-06-14 09:36:28 +0900
---

## intro 

### 배경 
- 보안 정책에 따라 EC2 인스턴스 보안그룹 화이트 리스트 적용, 기존 원격 개발자들의 ssh 접속 불편 증가 
- 보안그룹 인바운드 정책을 계속 수정하는 것은 보안정책상 적합하지 않음

### 개요
- **AWS 콘솔에 접속 가능한 자**는 배스천 호스트나 pem 없이도 콘솔 상에서 인스턴스에 쉘 접속이 가능하다. 
- 접근제어를 위해, 해당 접속 기록은 '세션관리자'의 로그로 남는다.

## prerequisite 

### EC2 SSM agent 시작 
```sh
$ sudo yum install -y amazon-ssm-agent
$ sudo systemctl start amazon-ssm-agent
$ sudo systemctl enable amazon-ssm-agent
```

### EC2 리소스 IAM 역할 부여
- 역할 생성 
    - 정책) ```AmazonSSMManagedInstanceCore``` 
- EC2 인스턴스에 역할 부여 
    - 인스턴스 선택>작업>보안>IAM 역할 수정 

### SSM 세션 관리자 확인 
- Systems Manager 서비스 이동 
- 좌측 메뉴 '세션 관리자' 탭 이동 
- '세션 시작' 클릭하여 **대상 인스턴스** 항목에 해당 인스턴스가 보이는 지 확인
    - IAM 역할 부여 후 등록까지 수분 걸릴 수 있음 
    - 여기서 세션 시작을 클릭할 필요는 없음 

## (★사용방법) AWS 콘솔에서 EC2 접속하기

- EC2 서비스 진입 -> 인스턴스 목록에서 인스턴스 선택 -> 우측 상단의 '연결' 클릭 
![image](https://github.com/user-attachments/assets/473a81b8-71e5-4d91-b3d0-0915ca0825f4)

- session manager 연결 
![image](https://github.com/user-attachments/assets/6b605b41-2568-4210-af0c-e0752d8f9568)

- 정상 쉘 접속 되는 것을 확인할 수 있다.
![image](https://github.com/user-attachments/assets/b4a0ae13-a39e-4e0f-b794-6e3768b03b75)


## 보안사항 
- 권장 사항 : 프라이빗 인스턴스 직접 연결보다는, bastion 인스턴스로 진입하여 -> 프라이빗 인스턴스로 진입 권장 
    ```
    sudo ssh -i /home/ec2-user/hdcl-csp-key.pem ec2-user@[프라이빗 인스턴스 ip]
    ```
- AWS System Manager 서비스에서 세션 접속 기록 로깅 : 어떤 IAM 계정이 언제 세션 오픈하였는지 확인 가능
![image](https://github.com/user-attachments/assets/0403c275-a3a1-48e8-ad60-3e9a2ca8e3f7)
