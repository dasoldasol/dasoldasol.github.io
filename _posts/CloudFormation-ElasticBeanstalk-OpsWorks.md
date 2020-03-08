## CloudFormation
- Is a way of completely scripting your cloud environment
- Quick Start is a bunch of CloudFormation **templates** already built by AWS Solutions Architects allowing you to create complex environments very quickly.
- **collection of related AWS resources**
- **"infrastructure as code"**
- UseCase : 개발자와 기업이 손쉽게 관련 AWS 및 타사 리소스의 모음을 쉽게 생성하고 순서에 따라 예측 가능한 방식으로 프로비저닝할 수 있는 방법을 제공하는 서비스


## Elastic Beanstalk
- quickly deploy and manage applications 
- automatically handles deployment details 
- PAAS(platform-as-a-service)
- UseCase : AWS 클라우드에서 애플리케이션을 몇 분 내에 배포하고 관리하기를 원하는 사람. 이전에 클라우드 컴퓨팅을 사용해 본 경험이 없어도 괜찮습니다. AWS Elastic Beanstalk는 Java, .NET, PHP, Node.js, Python, Ruby, Go 및 Docker 웹 애플리케이션을 지원합니다.

## AWS OpsWorks
- configuration management service that provides managed instances of Chef and Puppet.
- lets you use **Chef and Puppet** to automate how servers are configured, deployed, and managed across your EC2 instances or on-premise
- Layers depend on **Chef recipes** to handle tasks such as installing packages on instances, deploying apps, and running scripts. 
- UseCase : 모든 커뮤니티 스크립트 및 도구를 비롯하여 Chef/Puppet과 완벽하게 호환되는 구성 관리 환경을 원하지만 운영 오버헤드는 피하고자하는 고객

## AWS CodeDeploy
- You create a **deployment configuration file** to specify how deployments proceed.
- Q: AWS CodeDeploy는 AWS Elastic Beanstalk 및 AWS OpsWorks 등의 다른 AWS 배포 및 관리 서비스와 어떻게 다릅니까?    
AWS CodeDeploy는 개발자가 Amazon EC2 인스턴스 및 온프레미스에서 실행 중인 인스턴스를 비롯한 모든 인스턴스에서 소프트웨어를 배포하고 업데이트하도록 지원하는 데 초점을 맞춘 빌딩 블록 서비스입니다. AWS Elastic Beanstalk 및 AWS OpsWorks는 엔드 투 엔드 애플리케이션 관리 솔루션입니다.

## Scenario
You are a Solutions Architect working with a company that uses Chef Configuration management in their datacenter.      
Which service is designed to let the customer **leverage existing Chef recipes** in AWS?
  - **A) AWS OpsWorks**
  - **AWS OpsWorks** is a configuration management service that provides managed instances of **Chef and Puppet**. Chef and Puppet are automation platforms that allow you to use code to automate the configurations of your servers. OpsWorks lets you use Chef and Puppet to automate how servers are configured, deployed, and managed across your Amazon EC2 instances or on-premises compute environments.
  - **AWS Elastic Beanstalk** : is incorrect because this **handles an application's deployment details** of **capacity provisioning, load balancing, auto-scaling, and application health monitoring**. It does not let you leverage Chef recipes.
  - **AWS CloudFormation** : is incorrect because this is a service that lets you **create a collection of related AWS resources and provision them** in a predictable fashion **using infrastructure as code**. It does not let you leverage Chef recipes.
  
