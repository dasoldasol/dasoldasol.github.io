---
title: "Directory Service"
excerpt: "AWS Directory Service"
toc: true
toc_sticky: true
categories:
  - AWS
modified_date: 2020-03-05 09:36:28 +0900
---
## Feature 
- Active Directory 개념
  - 조직의 규모가 커질 수록 Object 개수가 많아지기 때문에 관리하는 것이 어려워진다.
  - 사용자가 공유 자원의 위치(IP주소)와 해당 서버의 로컬 사용자 계정 정보를 모두 알고있어야 정상적으로 접근이 가능하다. 
  - 위와 같은 문제점을 해결하기 위해 **중앙 서버에 공통된 데이터 베이스를 생성**하여 각 **서버와 클라이언트는 해당 데이터베이스를 공유하여 Object를 검색하고, 중앙에서 사용자 인증 및 권한 부여 처리가 가능하도록 처리해주는 서비스**를 **Directory Service**라고 한다. 
- **Directory** : Object(개체) 정보를 저장할 수 있는 정보 저장소
- **Directory Service** : Object(개체) 생성, 검색, 관리, 사용할 수 있는 서비스
- **AD DS** : 윈도우 서버에서 제공하는 Directory Service. 
- AWS Directory Service를 사용하면 손쉽게 AWS 클라우드에서 디렉터리를 설정 및 실행하거나 AWS 리소스를 기존 온프레미스 Microsoft Active Directory에 연결할 수 있습니다. 디렉터리가 생성되면, 이를 사용하여 사용자와 그룹을 관리하고, 애플리케이션과 서비스에 SSO를 제공하며, 그룹 정책을 생성 및 적용하고, Amazon EC2 인스턴스를 도메인에 조인하고, 클라우드 기반 Linux 및 Microsoft Windows 워크로드의 배포 및 관리를 간소화할 수 있습니다. AWS Directory Service를 사용하면 최종 사용자가 기존 기업 자격 증명을 사용하여 Amazon WorkSpaces, Amazon WorkDocs, Amazon WorkMail과 같은 AWS 애플리케이션과 커스텀 .NET 및 SQL Server 기반 애플리케이션과 같은 디렉터리 인식 Microsoft 워크로드에 액세스할 수 있습니다. 마지막으로 기존 기업 자격 증명을 사용하면 AWS Management Console에 대한 AWS Identity and Access Management(IAM) 역할 기반 액세스를 통해 AWS 리소스를 관리할 수 있으므로 자격 증명 연동 인프라를 추가로 구축할 필요가 없습니다.

## Scenario
- A telecommunications company is planning to give AWS Console access to developers. Company policy mandates the use of identity federation and role-based access control. Currently, the roles are already assigned using groups in the **corporate Active Directory**.    
In this scenario, what combination of the following services can provide developers access to the AWS console? (Choose 2)
  - **A) IAM Roles, AWS Directory Service AD Connector**
  - 회사에서 회사 Active Directory를 사용하고 있다는 점을 고려하면보다 쉬운 통합을 위해 AWS Directory Service AD Connector를 사용하는 것이 가장 좋습니다. 또한 회사 Active Directory의 그룹을 사용하여 역할이 이미 할당되어 있으므로 IAM 역할을 사용하는 것이 좋습니다. AWS Directory Service AD 커넥터를 통해 VPC와 통합되면 Active Directory의 사용자 또는 그룹에 IAM 역할을 할당 할 수 있습니다.

- A company is using the AWS Directory Service to integrate their on-premises Microsoft Active Directory (AD) domain with their Amazon EC2 instances via an AD connector. The below identity-based policy is attached to the IAM Identities that use the AWS Directory service:    
````
  {
 "Version":"2012-10-17",
 "Statement":[
  {
   "Sid":"DirectoryTutorialsDojo1234",
   "Effect":"Allow",
   "Action":[
    "ds:*"
   ],
   "Resource":"arn:aws:ds:us-east-1:987654321012:directory/d-1234567890"
  },
  {
   "Effect":"Allow",
   "Action":[
   "ec2:*"
   ],
   "Resource":"*"
  }
 ]
}
````
  Which of the following BEST describes what the above resource policy does?    
    - **A) Allows all AWS Directory Service(`ds`) calls as long as the resource contains the directory ID: `d-1234567890`**
    - **Statement ID(SID)** : `DirectoryTutorialsDojo1234`
    - **Account ID** : `987654321012`

- You are a working as a Solutions Architect for a fast-growing startup which just started operations during the past 3 months. They currently have an **on-premises Active Directory** and 10 computers. To save costs in procuring physical workstations, they decided to **deploy virtual desktops** for their new employees in a virtual private cloud in AWS. The new cloud infrastructure should **leverage on the existing security controls** in AWS **but can still communicate with their on-premises network**.     
Which set of AWS services will you use to meet these requirements?
  - **A) AWS Directory Services, VPN connection, Amazon Workspaces.**
  - 먼저 VPC와 온-프레미스 네트워크를 연결하려면 **VPN connection**이 필요합니다. 둘째, 온 프레미스 Active Directory와 통합하려면 **AWS Directory Services**가 필요하며 마지막으로 **Amazon Workspace**를 사용하여 VPC에 필요한 가상 데스크톱을 생성해야합니다.
  - **Amazon Workspace** : 클라우드 데스크톱 서비스. 사용자를 위한 디렉터리를 만들거나 기존 AD 환경과 통합하여 사용자가 현재 자격 증명을 사용하여 회사 리소스에 원활하게 액세스 할 수 있습니다. 
