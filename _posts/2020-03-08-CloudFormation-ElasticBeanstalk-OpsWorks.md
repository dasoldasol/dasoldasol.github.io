---
title: "CloudFormation vs. ElasticBeanstalk vs. OpsWorks"
excerpt: "AWS CloudFormation, ElasticBeanstalk, OpsWorks"
toc: true
toc_sticky: true
categories:
  - AWS
modified_date: 2020-03-08 09:36:28 +0900
---
## CloudFormation
- Is a way of completely scripting your cloud environment
- Quick Start is a bunch of CloudFormation **templates** already built by AWS Solutions Architects allowing you to create complex environments very quickly.
- **collection of related AWS resources**
- **"infrastructure as code"**
- Point : 개발자와 기업이 손쉽게 관련 AWS 및 타사 리소스의 모음을 쉽게 생성하고 순서에 따라 예측 가능한 방식으로 프로비저닝할 수 있는 방법을 제공하는 서비스    
  ![create-stack-diagram](https://dasoldasol.github.io/assets/images/image/create-stack-diagram.png)
  ![designer-jsoneditor](https://dasoldasol.github.io/assets/images/image/designer-jsoneditor.png)


## Elastic Beanstalk
- quickly **deploy** and manage applications 
- automatically handles deployment details 
- PAAS(platform-as-a-service)
- Point : AWS 클라우드에서 애플리케이션을 몇 분 내에 배포하고 관리하기를 원하는 사람. 이전에 클라우드 컴퓨팅을 사용해 본 경험이 없어도 괜찮습니다. AWS Elastic Beanstalk는 Java, .NET, PHP, Node.js, Python, Ruby, Go 및 Docker 웹 애플리케이션을 지원합니다.

## AWS OpsWorks
- configuration management service that provides managed instances of Chef and Puppet.
- lets you use **Chef and Puppet** to automate how servers are configured, deployed, and managed across your EC2 instances or on-premise
- Layers depend on **Chef recipes** to handle tasks such as installing packages on instances, deploying apps, and running scripts. 
- Point : 모든 커뮤니티 스크립트 및 도구를 비롯하여 Chef/Puppet과 완벽하게 호환되는 구성 관리 환경을 원하지만 운영 오버헤드는 피하고자하는 고객

## AWS CodeDeploy
- You create a **deployment configuration file** to specify how deployments proceed.
- Q: AWS CodeDeploy는 AWS Elastic Beanstalk 및 AWS OpsWorks 등의 다른 AWS 배포 및 관리 서비스와 어떻게 다릅니까?    
AWS CodeDeploy는 개발자가 Amazon EC2 인스턴스 및 온프레미스에서 실행 중인 인스턴스를 비롯한 모든 인스턴스에서 소프트웨어를 배포하고 업데이트하도록 지원하는 데 초점을 맞춘 빌딩 블록 서비스입니다. AWS Elastic Beanstalk 및 AWS OpsWorks는 엔드 투 엔드 애플리케이션 관리 솔루션입니다.

## Scenario
- You are a Solutions Architect working with a company that uses Chef Configuration management in their datacenter.      
Which service is designed to let the customer **leverage existing Chef recipes** in AWS?
  - **A) AWS OpsWorks**
  - **AWS OpsWorks**는 **Chef 및 Puppet**의 관리형 인스턴스를 제공하는 구성 관리 서비스입니다. Chef와 Puppet은 코드를 사용하여 서버 구성을 자동화 할 수 있는 자동화 플랫폼입니다. OpsWorks를 사용하면 Chef 및 Puppet을 사용하여 Amazon EC2 인스턴스 또는 온 프레미스 컴퓨팅 환경에서 서버를 구성, 배포 및 관리하는 방법을 자동화 할 수 있습니다.
  - **AWS Elastic Beanstalk** : is incorrect. 용량 프로비저닝,로드 밸런싱, 자동 확장 및 애플리케이션 상태 모니터링에 대한 애플리케이션의 **배포 세부 사항**을 처리합니다. Chef 레시피를 활용할 수 없습니다.
  - **AWS CloudFormation** : is incorrect. 이 서비스는 관련 AWS 리소스 모음을 생성하고 인프라를 코드로 사용하여 예측 가능한 방식으로 프로비저닝 할 수있는 서비스입니다. Chef 레시피를 활용할 수 없습니다.
  
- Your company is in a hurry of deploying their new web application written in NodeJS to AWS. As the Solutions Architect of the company, you were assigned to do the deployment without worrying about the underlying infrastructure that runs the application. Which service will you use to **easily deploy and manage your new web application** in AWS? 
  - **A) AWS Elastic Beanstalk**
  - **AWS CloudFormation** : is incorrect. 이 서비스는 배포 기능을 제공하지만 애플리케이션 요구 사항에 필요한 AWS 리소스가 포함 된 **사용자 지정 템플릿**을 디자인해야합니다. 따라서 Elastic Beanstalk를 직접 사용하는것보다 완료하는 데 더 많은 시간이 필요합니다.
  - **AWS CodeCommit** : is incorrect because AWS CloudCommit에서 NodeJS 코드를 업로드 할 수 있지만이 서비스는 **안전한 Git 기반 리포지토리를 호스팅**하는 완전 관리형 소스 제어 서비스이므로 AWS에서 애플리케이션을 배포하거나 관리 할 수있는 방법을 제공하지 않습니다.

- You are a new Solutions Architect in your department and you have created 7 CloudFormation templates. Each template has been defined for a specific purpose.    
What determines **the cost** of using these new **CloudFormation** templates?
  - **A) CloudFormation templates are free but you are charged for the underlying resources it builds.**

- The company you are working for has a set of AWS resources hosted in ap-northeast-1 region. You have been asked by your IT Manager to create an AWS CLI shell script that will call an AWS service which could create duplicate resources in another region in the event that ap-northeast-1 region fails. **The duplicated resources should also contain the VPC Peering configuration and other networking components from the primary stack**.    
Which of the following AWS services could help fulfill this task?
  - **A) AWS CloudFormation**
  - CloudFormation을 사용하면 한 지역에서 다른 지역으로 호스팅되는 모든 AWS 리소스와 함께 정확한 AWS 아키텍처 사본을 배포 할 수 있습니다.

- A technology company is building a new cryptocurrency trading platform that allows buying and selling of Bitcoin, Ethereum, XRP, Ripple and many others. You were hired as a Cloud Engineer to build the required infrastructure needed for this new trading platform. On your first week at work, you started to create **CloudFormation YAML scripts that defines all of the needed AWS resources** for the application. Your manager was shocked that you haven't created the EC2 instances, S3 buckets and other AWS resources straight away. He does not understand the text-based scripts that you have done and was disappointed that you are just slacking off at your job.     
In this scenario, what are the **benefits of using the Amazon CloudFormation** service that you should tell your manager to clarify his concerns? (Select TWO.)
  - **A1) Allows you to model your entire infrastructure in a text file**
  - **A2) Enables modeling, provisioning, and version-controlling of your entire AWS infrastructure**
  - CloudFormation을 사용하면 간단한 텍스트 파일을 사용하여 **모든 지역 및 계정에서** 애플리케이션에 필요한 모든 리소스를 자동화 된 방식으로 모델링하고 프로비저닝 할 수 있습니다.
  - 애플리케이션을 실행하는 데 필요한 AWS 리소스에 대해서만 비용을 지불합니다.

- You created a new **CloudFormation template** that creates 4 EC2 instances and are connected to one Elastic Load Balancer (ELB). Which section of the template should you configure **to get the Domain Name Server hostname of the ELB upon the creation of the AWS stack**?
  - **A) Outputs**
  - 템플릿은 AWS 인프라를 설명하는 JSON 또는 YAML 형식의 텍스트 파일입니다. 
  - **output** :  다른 스택으로 가져오거나(교차 스택 참조를 생성하기 위해), 응답으로 반환하거나(스택 호출을 설명하기 위해), 또는 AWS CloudFormation 콘솔에서 볼 수 있는 출력 값을 선언    
  ```yml
  Outputs:
  BackupLoadBalancerDNSName:
    Description: The DNSName of the backup load balancer
    Value: !GetAtt BackupLoadBalancer.DNSName
    Condition: CreateProdResources
  InstanceID:
    Description: The Instance ID
    Value: !Ref EC2Instance
  ```
  
- You are setting up a configuration management in your existing cloud architecture where you have to deploy and manage your EC2 instances including the other AWS resources using **Chef and Puppet**. Which of the following is the most suitable service to use in this scenario?
  - **A) AWS OpsWorks**
  - AWS OpsWorks는 Chef 및 Puppet의 관리 형 인스턴스를 제공하는 구성 관리 서비스입니다. Chef와 Puppet은 코드를 사용하여 서버 구성을 자동화 할 수있는 자동화 플랫폼입니다. OpsWorks를 사용하면 Chef 및 Puppet을 사용하여 Amazon EC2 인스턴스 또는 온 프레미스 컴퓨팅 환경에서 서버를 구성, 배포 및 관리하는 방법을 자동화 할 수 있습니다.
