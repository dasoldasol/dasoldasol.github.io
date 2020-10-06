---
title: "Storage Gateway"
excerpt: "AWS Storage Gateway"
toc: true
toc_sticky: true
categories:
  - AWS
modified_date: 2020-04-07 09:36:28 +0900
---
## Feautures 
- physical or virtual appliance that can be used to cache S3 locally at a customer's site
  - a way of using AWS S3 managed storage to supplement on-premise storage. It can also be used within a VPC in a similar way.
- File Gateway : flat files, stored directly on s3 
- Volume Gateway 
  - Stored Volumes : Entire Dataset stored on site and backed up to s3  
    *** Data is hosted on the On-premise server as well ***
  - Cached Volumes : Emtore Dataset stored on S3 and most used data is cached on site 
    ***  maintaining low-latency access to their frequently accessed data ***
- Gateway Virtual Tape Library 
### storage gateway vs. vpn connection vs. direct connect vs. VPC Endpoint
- **storage gateway** : **온프레미스 <-> S3** (온프레미스 스토리지 공간 줄이기 위해)
- **VPN** : 내 컴퓨터가 마치 다른 네트워크상에 있는 호스트인것처럼. VPN을 통해 **AWS 외부 <-> VPC Private 서브넷** 같은 내부망에 연결할 수 있도록. 내 컴퓨터가 VPC 네트워크에 있는 호스트인것처럼. 
- **VPN Endpoint, VPN Connection, VPN Tunnel** : **VPC <-> 로컬네트워크, 온프레미스** (보호할 리소스를 private subnet에 그대로 두고 VPN을 통해 접근)
  - 그러나 **프라이빗 서브넷의 EC2 인스턴스에 SSH**로 접근하려는 의도라면 **SSM**을 쓴다
- **direct connect** : **온프레미스 <-> AWS** (인터넷 대신쓰는 지정/프라이빗 네트워크 서비스)
- **VPC Endpoint** : **VPC <-> AWS service** (비공개로 연결, Amazon네트워크를 벗어나지 않음)

## Patterns
- Ideal Usage Patterns 
  - coporate file sharing
  - enabling existing on-premises backup applications to store primary backups on s3 
  - disaster recovery 
  - data mirroring to cloud-based compute resources 
- Anti Pattern
  - Database Storage : EC2 instances -> EBS 
- natively encripts data
- access data
  - Launch an new AWS Storage Gateway instance AMI in EC2, and restore from a gateway snapshot 
  - Create an EBS volume from a gateway snapshot, and mount it to EC2
  - Launch an AWS Storage Gateway virtual iSCSI device, and restore from a gateway snapshot
  
## Scenario
- You are working as a Solutions Architect for a start-up company that has a not-for-profit crowdfunding platform hosted in AWS. Their platform allows people around the globe to raise money for social enterprise projects including challenging circumstances like accidents and illnesses. Since the system handles financial transactions, you have to ensure that your cloud architecture is secure.    
Which of the following **AWS services encrypts data at rest by default**? (Choose 2)
  - **A1) AWS Storage Gateway**
  - **A2) Amazon S3 Glacier**
  - All data transferred between **any type of gateway appliance and AWS storage is encrypted using SSL**. By default, all data stored by **AWS Storage Gateway in S3** is encrypted server-side with Amazon S3-Managed Encryption Keys (**SSE-S3**). Also, when using the file gateway, you can optionally configure each file share to have your objects encrypted with AWS KMS-Managed Keys using SSE-KMS.
  - Data stored in **Amazon Glacier** is protected by default; only vault owners have access to the Amazon Glacier resources they create. Amazon Glacier encrypts your data at rest by default and supports **secure data transit with SSL**.
  - **Amazon RDS, Amazon ECS, and AWS Lambda** :  are incorrect because although Amazon RDS, ECS and Lambda all support encryption, you still **have to enable** and configure them first with tools like **AWS KMS to encrypt** the data at rest.

- You are working for a tech company which currently has an **on-premises** infrastructure. They are currently **running low on storage** and **want to have the ability to extend their storage** using AWS cloud.    
Which AWS service can help you achieve this requirement?
  - **A) Amazon Storage Gateway**
  - AWS Storage Gateway는 사실상 무제한의 클라우드 스토리지에 대한 온프레미스 액세스 권한을 제공하는 하이브리드 클라우드 스토리지 서비스입니다. Storage Gateway를 사용하는 고객은 하이브리드 클라우드 스토리지의 주요 사용 사례인 스토리지 관리 간소화 및 비용 절감 효과를 얻을 수 있습니다. 
  - **EBS** :  is incorrect since EBS is primarily used as a storage of your EC2 instances.

- A financial company wants to **store their data in Amazon S3** but at the same time, they want to **store their frequently accessed data locally on their on-premises** server. This is due to the fact that they do not have the option to extend their on-premises storage, which is why they are looking for a durable and scalable storage service to use in AWS.        
What is the best solution for this scenario?
  - **A) Use the Amazon Storage Gateway - Cached Volumes.**
  - 캐시된 볼륨을 사용하면 Amazon Simple Storage Service (Amazon S3)에 데이터를 저장하고 온 프레미스 네트워크에서 로컬로 자주 액세스하는 데이터 서브셋의 복사본을 유지합니다. 캐시된 볼륨은 기본 스토리지에서 상당한 비용을 절감하고 온 프레미스 스토리지를 확장해야 할 필요성을 최소화합니다. 또한 자주 액세스하는 데이터에 대한 지연 시간이 짧은 액세스를 유지합니다. 

- A data analytics company keeps a massive volume of data which they store in their on-premises data center. To scale their storage systems, they are looking for **cloud-backed storage volumes** that they can **mount using Internet Small Computer System Interface (iSCSI) devices** from their on-premises application servers. They have an **on-site data analytics application which frequently access the latest data subsets locally** while the older data are rarely accessed. You are required to minimize the need to scale the on-premises storage infrastructure while still providing their web application with low-latency access to the data.
**Which type of AWS Storage Gateway service** will you use to meet the above requirements?
  - **A) Cached Volume Gateway**
  - 이 시나리오에서 기술 회사는 분석 애플리케이션이 이전 데이터가 거의 사용되지 않는다고 언급 되었기 때문에 분석 애플리케이션이 전체 데이터 세트가 아닌 최신 데이터 서브 세트에 자주 액세스 할 수있는 스토리지 서비스를 찾고 있습니다. 이 요구 사항은 AWS Storage Gateway에서 캐싱 볼륨 게이트웨이를 설정하여 이행 할 수 있습니다.
  - 캐시 볼륨으로 Amazon S3를 기본 데이터 스토리지로 사용함과 동시에 자주 액세스하는 데이터를 스토리지 게이트웨이에 로컬 보관할 수 있습니다.    
  또한 온프레미스 스토리지 인프라를 확장(scale)할 필요성이 최소화되는 한편, 애플리케이션이 자주 액세스하는 데이터에 액세스할 때의 지연 시간(latency)을 짧게 유지할 수 있습니다.     
  최대 32TiB 크기의 스토리지 볼륨을 생성하고 온 프레미스 애플리케이션 서버의 iSCSI 디바이스로 볼륨을 연결할 수 있습니다. 게이트웨이는 이 볼륨에 작성하는 데이터는 Amazon S3에 저장하고 최근에 읽은 데이터는 온프레미스 스토리지 게이트웨이의 캐시 및 업로드 버퍼 스토리지에 보관합니다.
    - iSCSI(Internet Small Computer System Interface)는 컴퓨팅 환경에서 데이터 스토리지 시설을 이어주는 IP 기반의 스토리지 네트워킹 표준
  - 캐싱 볼륨의 크기는 1GiB~32TiB이어야 하고 GiB 단위의 근사값으로 반올림해야 합니다. 캐싱 볼륨에 맞게 구성된 각 게이트웨이는 총 1,024TiB(1PiB)의 최대 스토리지 볼륨에 대해 32개까지 볼륨을 지원합니다.
  - 캐싱 볼륨 솔루션에서 AWS Storage Gateway는 모든 온프레미스 애플리케이션 데이터를 Amazon S3의 스토리지 볼륨에 저장합니다.
  - **Stored Volume Gateway** : is incorrect. 요구 사항은 자주 액세스하는 **데이터 하위 집합**에 로컬로 낮은 대기 시간 액세스를 제공해야하기 때문에 올바르지 않습니다. Stored Volume Gateway는 **전체 데이터 세트**에 지연 시간이 짧은 액세스가 필요한 경우에 사용됩니다.
  - **Tape Gateway** : is incorrect. **데이터 아카이빙**을 위한 비용 효율적이고 내구성있는 장기적인 오프 사이트 대안일 뿐.
