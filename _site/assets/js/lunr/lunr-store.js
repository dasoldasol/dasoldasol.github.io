var store = [{
        "title": "SQS vs. SWF vs. SNS vs. MQ vs. StepFunctions",
        "excerpt":"SQS Features A Web Service that gives you access to a message queue that can be used to store messages while waiting for a computer to process them A Queue is a temporary repository for messages that are awaiting processing Using SQS, you can decouple the components of an application...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/SQS-SWF-SNS-MQ-StepFunctions/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "Storage Gateway",
        "excerpt":"Feautures physical or virtual appliance that can be used to cache S3 locally at a customer’s site a way of using AWS S3 managed storage to supplement on-premise storage. It can also be used within a VPC in a similar way. File Gateway : flat files, stored directly on s3...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/Storage_Gateway/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "EC2",
        "excerpt":"EC2 CheatSheet Features provides scalable computing capacity EC2 instances : Virtual computing environments Amazon Machine Images(AMI) : Preconfigured templates for EC2 instances package the bits needed for the server (including the os and additional sw) Instance types : Various configurations of CPU, memory, storage, and networking capacity for your instances...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/EC2/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "CloudHSM",
        "excerpt":"Cloud HSM AWS CloudHSM 서비스는 AWS 클라우드 내에서 전용 HSM(Hardware Security Module) 인스턴스를 사용함으로써 데이터 보안에 대한 기업, 계약 및 규제 준수 요구 사항을 충족하는 데 도움이 됩니다. CloudHSM을 사용하면 데이터 암호화에 사용되는 암호화 키를 사용자만 액세스할 수 있는 방법으로 안전하게 생성, 보관 및 관리할 수 있습니다. HSM(하드웨어 보안 모듈)...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/CloudHSM/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "EBS",
        "excerpt":"Elastic Block Store CheatSheet Point Amazon Elastic Compute Cloud(EC2)에서 사용하도록 설계된 사용하기 쉬운 고성능 블록 스토리지 서비스 어떤 워크로드에든 적합한 성능 : EBS 볼륨은 SAP, Oracle 및 Microsoft 제품과 같은 미션 크리티컬 애플리케이션을 포함하여, 가장 까다로운 워크로드에 적합합니다. SSD 지원 옵션으로는, 고성능 애플리케이션을 위해 설계된 볼륨(IOPS) 및 대부분의 워크로드에 적합한...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/EBS/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "Aurora",
        "excerpt":"Aurora CheatSheet Point Amazon Aurora는 고성능 상용 데이터베이스(high-end commercial databases) 의 성능(speed)과 가용성(realiability)에 오픈 소스 데이터베이스의 간편성과 비용 효율성을 결합하였으며 클라우드를 위해 구축된 MySQL 및 PostgreSQL 호환(compatible) 관계형 데이터베이스입니다. Amazon Aurora는 표준 MySQL 데이터베이스보다 최대 5배 빠르고 표준 PostgreSQL 데이터베이스보다 3배 빠릅니다. 또한, 1/10의 비용으로 상용 데이터베이스의 보안, 가용성 및...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/Aurora/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "RDS",
        "excerpt":"RDS Features provides Relational Database service supports MySQL, MariaDB, PostgreSQL, Oracle, MSSQL Server, MySQL-compatible Amazon Aurora DB engine it is a managed service, shell(root SSH) access is NOT provided manages backups, software patching, automatic failure detection, recovery supports user initiated manual backups and snapshots daily automated backups with database transaction...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/RDS/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "S3",
        "excerpt":"S3 CheatSheet Features Key-value based object storage with unlimited storage, unlimited objects up to 5TB for the internet Object Level Storage(not a Block Level Storage) and cannot be used to host OS or dynamic websites Durability by redundanctly storing objects on multiple facilities within a region SSL encryption of data...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/S3/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "AutoScaling",
        "excerpt":"AutoScaling CheatSheet Scale out / Scale up Scale Up : t2.micro -&gt; c3.2xlarge, increase EBS Scale Out : you have more of the same resource separately working in parallel (ELB, Autoscaling) Features ensures correct number of EC2 instances are always running to handle the load by scaling up or down...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/AutoScaling/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "Lambda",
        "excerpt":"Features Lambda scales out (not up) automatically : each time your function is triggered, a new, separate instance of that function is started. Independent 1 event = 1 function Serverless Traditional vs. Serverless can trigger other functions AWS X-ray allows you to debug can do things globally ex.s3 Know what...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/Lambda/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "DynamoDB",
        "excerpt":"DynamoDB Point Amazon DynamoDB는 어떤 규모에서도 10밀리초 미만의 성능을 제공하는 키-값 및 문서 데이터베이스입니다. 완전관리형의 내구성이 뛰어난 다중 리전(cross region replication), 다중 마스터 데이터베이스로서, 인터넷 규모 애플리케이션을 위한 보안, 백업 및 복원, 인 메모리 캐싱 기능을 기본적으로 제공합니다. 대규모 성능 지원 key-value data model : 관계형 데이터베이스에서처럼 테이블 스키마를 재정의할...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/DynamoDB/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "Redshift",
        "excerpt":"Redshift CheatSheet fully managed, fast and powerful, petabyte scale data warehouse service uses replication and continuous backups to enhance availability and improve data durability and can automatically recover from node and component failures. Massive Parallel Processing(MPP) : distributing &amp; parallelizing queries across multiple physical resources comlumnar data storage : improving...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/Redshift/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "Route53",
        "excerpt":"Route53 CheatSheet Features Highly available and scalable DNS &amp; Domain Registration Service Reliable and cost-effective way to route end users to Internet applications Multi-region and backup architectures for High Availability ELB is limited to region, does NOT support multi region HA architecture supports private Intranet facing DNS service Internal resource...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/Route53/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "AWS SAA Workshop",
        "excerpt":"영역1 : 복원력을 갖춘 아키텍처 설계 안정적이고 복원력을 갖춘 스토리지 선택하기 Instance Store Elastic Block Store 블록 스토리지 다양한 유형 : SSD / HDD SSD PIOPS : 데이터베이스 HDD Cold : 장기간 싼 가격에 백업 데이터 암호화 스냅샷 프로비저닝된 용량 : 만약 16TB 이상 원할때 복수개를 만들어서 RAID로 구성 EC2인스턴스와...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/webinar-saa/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "Trusted Advisor",
        "excerpt":"VPC CheatSheet Feature helps define a logically isoloated dedicated virtual network within the AWS provides control of IP addressing using CIDR block from a minimum of /28 to maximum of /16 block size supports IPv4 and IPv6 addressing can be extended by associating secondary IPv4 CIDR blocks to VPC Components...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/VPC/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "KMS",
        "excerpt":"Feature AWS Key Management Service(KMS) a managed service that makes it easy for you to create and control the encrypton keys used to encrypt your data. The master keys that you create in AWS KMS are protected by validated cryptographic modules. AWS KMS is integrated with most other AWS services...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/KMS/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "RAM",
        "excerpt":"Feauture AWS Resource Access Manager service easily and securely share AWS resources with any AWS account or within your AWS Organization You can share AWS Transit Gateways, Subnets, AWS License Manager configurations, and Amazon Route 53 Resolver rules resources with RAM. Scenario A global IT company with offices around the...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/RAM/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "CloudWatch vs. CloudTrail",
        "excerpt":"Features CloudWatch : performance standard monitoring : every 5 min by default detailed monitoring : interval 1min available alarms trigger notifications CloudTrail : auditing. API calls in the AWS platform. (define who) Features : Dashboard, Alarm, Event, Logs Scenarios You are an AWS Solutions Architect designing an online analytics application...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/CloudWatch-CloudTrail/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "Directory Service",
        "excerpt":"Feature Active Directory 개념 조직의 규모가 커질 수록 Object 개수가 많아지기 때문에 관리하는 것이 어려워진다. 사용자가 공유 자원의 위치(IP주소)와 해당 서버의 로컬 사용자 계정 정보를 모두 알고있어야 정상적으로 접근이 가능하다. 위와 같은 문제점을 해결하기 위해 중앙 서버에 공통된 데이터 베이스를 생성하여 각 서버와 클라이언트는 해당 데이터베이스를 공유하여 Object를 검색하고, 중앙에서...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/Directory-Service/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "Snowball",
        "excerpt":"Feature snowball : import/export to s3(transfer) large amount of data snowball edge : snowball + compute(lambda) snowmobile : data center migration Scenarios You are working for a large telecommunications company. They have a requirement to move 83 TB data warehouse to the cloud. It would take 2 months to transfer...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/Snowball/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "CloudFormation vs. ElasticBeanstalk vs. OpsWorks",
        "excerpt":"CloudFormation Is a way of completely scripting your cloud environment Quick Start is a bunch of CloudFormation templates already built by AWS Solutions Architects allowing you to create complex environments very quickly. collection of related AWS resources “infrastructure as code” Point : 개발자와 기업이 손쉽게 관련 AWS 및 타사 리소스의...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/CloudFormation-ElasticBeanstalk-OpsWorks/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "ELB",
        "excerpt":"Load Balancer CheatSheet Managed load balanding service and scales automatically distributes incoming application traffic across multiple EC2 instances is distributed system that is fault tolerant and actively monitored by AWS scales it as per the demand are engineered to not be a single point of failure need to Pre-Warm ELB...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/ELB/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "HA",
        "excerpt":"HA Network Diagram Adding Resilience And Autoscaling Write Node &amp; Read Node Scenario You are working for a University as their AWS Consultant. They want to have a disaster recovery strategy in AWS for mission-critical applications after suffering a disastrous outage wherein they lost student and employee records. They don’t...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/HA-Disaster-Recovery/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "DDos",
        "excerpt":"Scenario You have identified a series of DDoS attacks while monitoring your VPC. As the Solutions Architect, you are responsible in fortifying your current cloud infrastructure to protect the data of your clients. Which of the following is the most suitable solution to mitigate these kinds of attacks? A) AWS...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/DDos/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "ElastiCache",
        "excerpt":"ElastiCache CheatSheet in-memory caching to deploy and run Memcached or Redis protocol-compliant cache clusters can be used state management to keep the web applications stateless ElastiCache with Redis like RDS, supports Multi-AZ, Read Replicas and Snapshots Read Replicas are created across AZ within same region using Redis’s asynchronous replication technology...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/ElastiCache/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "Fargate",
        "excerpt":"Features AWS Fargate : a serverless compute engine for containers that works with both Amazon Elastic Container Service (ECS) and Amazon Elastic Kubernetes Service (EKS). Fargate makes it easy for you to focus on building your application : removes the need to provision and manage servers lets you specify and...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/Fargate/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "EMR",
        "excerpt":"Feature Amazon EMR(Elastic Map Reduce) provides a managed Hadoop framework that makes it easy, fast, and cost-effective to process vast amounts of data across dynamically scalable Amazon EC2 instances. handles a broad set of big data use cases: log analysis, web indexing, data transformations (ETL), machine learning, financial analysis, scientific...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/EMR/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "IAM & Cognito",
        "excerpt":"IAM CheatSheet Features securely control access to AWS services and resources helps create and manage user identities and grant permissions for those users helps create groups for multiple users with similar permissions NOT appropriate for application authentication is Global and does not need to be migrated to a different region...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/IAM-Cognito/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "EFS vs. FSx",
        "excerpt":"EFS Amazon Elastic File System NFS(Network File System) protocol only pay for the storage you use(no pre-provisioning required like EBS Volume) support : scale up to petabytes, concurrent NFS connections Data is stored across multiple AZ Read after Write Consistency Amazon FSx Amazon FSx를 사용하면 인기있는 파일 시스템을 쉽고 빠르게...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/EFS-FSx/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "Shared Responsibility Model",
        "excerpt":"Feature Scenario You are a Solutions Architect of a media company and you are instructed to migrate an on-premises web application architecture to AWS. During your design process, you have to give consideration to current on-premises security and determine which security attributes you are responsible for on AWS. Which of...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/Shared_Responsibility_Model/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "DMS",
        "excerpt":"Features AWS Database Migration Service 는 oracle - oracle 과 같은 동종 마이그레이션뿐만 아니라 oracle/microsoft SQL server - aurora와 같은 다른 데이터베이스 플랫폼간의 이종 마이그레이션을 지원합니다. DMS를 이용하여, RDS/EC2 기반 데이터베이스로 한번에 데이터 마이그레이션이 가능합니다. Redshift 및 S3에 데이터를 스트리밍하여, 고 가용성(다중 AZ 사용)으로 데이터를 지속적으로 복제하고, 페타 바이트 규모의...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/DMS/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "Trusted Advisor",
        "excerpt":"Scenarios Your IT Director instructed you to ensure that all of the AWS resources in your VPC don’t go beyond their respective service limits. You should prepare a system that provides you real-time guidance in provisioning your resources that adheres to the AWS best practices. Which of the following is...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/TrustedAdvisor/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "Application",
        "excerpt":"Elastic Transcoder Media transcoder in the cloud. API Gateway API Gateway Options API Gateway Configuration API Gateway Deployment API Gateway Caching : increase performance Same Origin Policy : A web browser permits scripts contained in a first web page to access data in a second web page. This is done...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/Application/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "Athena vs. Glue ",
        "excerpt":"Athena An interactive query service that makes it easy to analyze data directly in Amazon S3 using standard SQL. Serverless : there is no infrastructure to set up or manage, and you pay only for the queries you run. Athena scales automatically—executing queries in parallel—so results are fast, even with...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/Athena-Glue/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "CloudFront vs. Global Accelerator",
        "excerpt":"CloudFront CheatSheet provides low latency and high data transfer speeds for distribution of static, dynamic web or streaming content to web users. delivers the content through a worldwide network of data centers called Edge Location. keeps persistent connections with the origin servers so that the files can be fetched from...","categories": ["AWS"],
        "tags": [],
        "url": "http://localhost:4000/aws/CloudFront-GlobalAccelerator/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "[알고리즘] Stack을 이용한 회문(palindrome) 작성",
        "excerpt":"문제 스택을 이용하여 주어진 문자열이 회문인지 아닌지를 결정하는 프로그램을 작성하라. (python) 소스코드 import re # 특수문자, 공백 제거, 소문자처리 def preprocessing(str): result = re.sub('[^0-9a-zA-Zㄱ-힗]', '', str) result = result.lower() return result def palindrome(word): letters = [] word = preprocessing(word) for letter in word: letters.append(letter) for letter in word: if letters.pop()...","categories": ["Algorithm"],
        "tags": [],
        "url": "http://localhost:4000/algorithm/algorithm/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "[알고리즘] Deque을 이용한 회문(palindrome) 작성",
        "excerpt":"문제 덱을 이용하여 주어진 문자열이 회문인지 아닌지를 결정하는 프로그램을 작성하라. (python) 소스코드 import re # 덱 구현 class Deque: def __init__(self): self.items = [] def isEmpty(self): return self.items == [] def addFront(self, item): self.items.append(item) def addRear(self, item): self.items.insert(0, item) def deleteFront(self): return self.items.pop() def deleteRear(self): return self.items.pop(0) def size(self): return...","categories": ["Algorithm"],
        "tags": [],
        "url": "http://localhost:4000/algorithm/algorithm2/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "[알고리즘] 연결된 원형큐",
        "excerpt":"문제 사용자로부터 양의 정수들을 입력받아서 연결된 큐에 저장하고, 결과를 다음과 같이 출력하는 프로그램을 작성하라. (python) 소스코드 class Node: def __init__(self, elem, link=None): self.data = elem # 데이터 필드 생성 및 초기화 self.link = link # 링크 필드 생성 및 초기화 class CircularLinkedQueue: def __init__(self): self.tail = None def isEmpty(self): return...","categories": ["Algorithm"],
        "tags": [],
        "url": "http://localhost:4000/algorithm/algorithm3/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "[알고리즘] 연결 리스트 (1)",
        "excerpt":"문제 연결 리스트에 사용자가 입력하는 값을 저장했다가 출력하는 프로그램을 작성하라. (python) 소스코드 class Node: def __init__(self, elem, link=None): self.data = elem # 데이터 필드 생성 및 초기화 self.link = link # 링크 필드 생성 및 초기화 class LinkedList: def __init__(self): self.tail = None def isEmpty(self): return self.tail == None def...","categories": ["Algorithm"],
        "tags": [],
        "url": "http://localhost:4000/algorithm/algorithm4/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "[알고리즘] 연결 리스트 (2)",
        "excerpt":"문제 생성된 연결 리스트의 맨 처음에 있는 노드를 삭제하는 프로그램을 작성하라. (python) 소스코드 class Node: def __init__(self, elem, link=None): self.data = elem # 데이터 필드 생성 및 초기화 self.link = link # 링크 필드 생성 및 초기화 class LinkedList: def __init__(self): self.tail = None def isEmpty(self): return self.tail == None...","categories": ["Algorithm"],
        "tags": [],
        "url": "http://localhost:4000/algorithm/algorithm5/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "[알고리즘] 연결 리스트 (3)",
        "excerpt":"문제 연결 리스트에 정수가 저장되어 있다. 연결 리스트의 모든 데이터 값을 더한 합을 출력하는 프로그램을 작성하라. (python) 소스코드 class Node: def __init__(self, elem, link=None): self.data = elem # 데이터 필드 생성 및 초기화 self.link = link # 링크 필드 생성 및 초기화 class LinkedList: def __init__(self): self.tail = None def...","categories": ["Algorithm"],
        "tags": [],
        "url": "http://localhost:4000/algorithm/algorithm6/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "[알고리즘] 연결 리스트 (4)",
        "excerpt":"문제 연결 리스트에서 특정한 데이터 값을 갖는 노드의 개수를 계산하는 함수를 작성하라. (python) 소스코드 class Node: def __init__(self, elem, link=None): self.data = elem # 데이터 필드 생성 및 초기화 self.link = link # 링크 필드 생성 및 초기화 class LinkedList: def __init__(self): self.head = None def isEmpty(self): return self.head ==...","categories": ["Algorithm"],
        "tags": [],
        "url": "http://localhost:4000/algorithm/algorithm7/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "[논문리뷰] Human level control through deep reinforcement learning(2015)",
        "excerpt":"1. 논문 선정 이유 및 개요 논문명 : Mnih, Volodymyr, et al. “Human-level control through deep reinforcement learning.” Nature 518.7540 (2015): 529-533. 이 연구는 Nature지에 기재되었으며, 인용횟수 9642회에 달한다. 딥 강화학습의 출발점인 DQN의 기본 논문이라 리뷰하고자 한다. 이 연구는 기존의 Q-network를 개선한 DQN으로 더 효율적인 강화학습을 진행한다. 이에 대한 결과로...","categories": ["Deep Learning"],
        "tags": [],
        "url": "http://localhost:4000/deep%20learning/deeplearning/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "[논문리뷰] Rainbow: Combining Improvements in Deep Reinforcement Learning(2018)",
        "excerpt":"1. 논문 선정 이유 및 개요 이 연구는 AAAI에 등재됐으며, 인용횟수가 501회에 달한다. 이 논문을 선택한 이유는 DQN을 강화한 6가지의 기법을 적용한 Rainbow DQN을 내세웠기 때문이다. DDQN, Dueling DQN, PER, Multi-step Learning, Distributional RL, Noisy Net 6개의 기법을 다시 톺아볼 수 있기 때문에 이 논문에 대한 review paper를 작성하면서 강화학습의...","categories": ["Deep Learning"],
        "tags": [],
        "url": "http://localhost:4000/deep%20learning/deeplearning/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "[알고리즘] 최대힙",
        "excerpt":"문제 자신이 할 일에 우선순위를 매겨서 힙에 저장했다가 우선순위 순으로 꺼내서 출력하는 프로그램을 작성하여 보자. (python) 소스코드 class MaxHeap : def __init__ (self) : self.heap = [] self.heap.append((0, '')) def size(self) : return len(self.heap) - 1 def isEmpty(self) : return self.size() == 0 def Parent(self, i) : return self.heap[i//2] def...","categories": ["Algorithm"],
        "tags": [],
        "url": "http://localhost:4000/algorithm/algo1/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "[알고리즘] Kruskal 최대비용 신장트리",
        "excerpt":"문제 Kruskal 최대비용 신장트리 구현 (python) 소스코드 def MSTKruskal_max(vertex, adj): vsize = len(vertex) init_set(vsize) eList=[] for i in range(vsize-1): for j in range(i+1, vsize): if adj[i][j] != None : eList.append( (i,j,adj[i][j]) ) eList.sort(key= lambda e : e[2], reverse=False) ## 간선의 가중치를 '오름차순'으로 정렬 : True -&gt; False로 수정 print(eList) edgeAccepted...","categories": ["Algorithm"],
        "tags": [],
        "url": "http://localhost:4000/algorithm/algofinal/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "[알고리즘] 병합정렬",
        "excerpt":"문제 병합정렬을 반복 함수로 구현하라 (python) 소스코드 def merge_sort(x): list = [] for i in range(len(x)): temp = [x[i]] list.append(temp) print(\"Original :\",x) while(len(list) != 1): j = 0 while(j &lt; len(list)-1): tempList = merge(list[j], list[j+1]) list[j] = tempList del list[j+1] j = j+1 print(\"Steps :\",list) print(\"MergeSort :\",list[0]) def merge(a, b):...","categories": ["Algorithm"],
        "tags": [],
        "url": "http://localhost:4000/algorithm/algofinal2/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "[논문리뷰] Label Efficient Visual Abstractions for Autonomous Driving(2020)",
        "excerpt":"      Intro                Related Works                    Model                                Experiments                                        Summary             ","categories": ["Deep Learning"],
        "tags": [],
        "url": "http://localhost:4000/deep%20learning/deeplearning/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "Tableau SSO 토큰 발급 API 만들기",
        "excerpt":"목적 Tableau의 대시보드를 신뢰할 수 있는 인증을 거친 사용자만 볼 수 있도록 SSO 토큰을 발급한다. 여기서는 spring boot로 GET 요청시 SSO 토큰을 발급하는 api를 개발한다. /tableau/v1/dashboards/tableau 로 GET 요청 시 SSO 토큰을 발급하는 API를 구현한다. 소스 Config Tableau 서버의 HOST와 USERNAME을 config로 등록한다. 외부 유출을 막기 위해 env 파일은 따로...","categories": ["Tableau"],
        "tags": [],
        "url": "http://localhost:4000/tableau/tableau-sso/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "serverless framework로 AWS에 데이터 파이프라인 구축하기",
        "excerpt":"serverless framework를 쓰게된 이유 기존에는 open API를 통해 크롤링하는 python 코드를 작성해서 AWS Lambda 콘솔에서 직접 적용했다. 문제는.. 파이썬 자체 패키지를 쓰려면 패키징을 해서 zip파일로 만들어 AWS Lambda 콘솔에서 업로드 해야함 API로 크롤링한 csv를 S3에 저장하고, DB에 적재하려면 AWS IAM 등에서 계속 권한을 줘야하니까 프로세스가 정리가 잘 안됨 위의 두...","categories": ["AWS","serverless"],
        "tags": [],
        "url": "http://localhost:4000/aws/serverless/sls-tutorial/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "serverless framework 시작하기",
        "excerpt":"이전편 : serverless framework로 AWS에 데이터 파이프라인 구축하기 목표 serverless framework를 설치하고, AWS와 연동해보자. 1. install node.js &amp; npm node.js와 npm을 설치한다. ubuntu 18.04에서 설치. sudo apt-get update sudo apt-get install nodejs sudo apt-get install npm 설치 후 확인을 위해 버전을 출력한다. node -v # v12.13.1 npm -v # 6.13.4...","categories": ["AWS","serverless"],
        "tags": [],
        "url": "http://localhost:4000/aws/serverless/sls-tutorial-2/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "serverless framework 환경 설정 serverless.yml",
        "excerpt":"이전편 : serverless framework 시작하기 목표 serverless.yml 파일 수정으로 AWS 배포 환경 설정을 한다. 배포 리전, IAM Role부여, vpc 설정, lambda 함수 설정 배포 리전 : 서울 리전 사용 언어 : python3.8 필요 IAM Role : ssm get, s3 put/get project 이름 : sncr-data-collectors lambda 함수 이름 : naverBand 매일...","categories": ["AWS","serverless"],
        "tags": [],
        "url": "http://localhost:4000/aws/serverless/sls-yml/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "보안된 내부망 rds DB클라이언트 접속",
        "excerpt":"과제 private 망에 위치한 RDS를 putty가 아닌 DB 클라이언트에서 접속 선행사항 EC2에 대한 pem 파일 DataGrip(옵션) 방법 다음 1~3 방법을 거쳐 클라이언트 접속한다. create new - &gt; data source에서 Amazon Aurora MySQL 선택 General Host : RDS 엔드포인트 url Database : RDS 데이터 베이스 이름 SSH/SSL SSH tunnel 사용 :...","categories": ["AWS","DB"],
        "tags": [],
        "url": "http://localhost:4000/aws/db/connect-rds/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      },{
        "title": "로컬DB 일배치로 S3에 파일 전송하기",
        "excerpt":"문제 기존에는 MSSQL Server에 위치한 DB의 데이터를 가져오기 위하여 Glue를 사용했다. 그러나 쿼리 시간이 너무 오래걸려 비용문제가 발생. 과제 따라서 MSSQL Server DB에서 해당 데이터를 읽어서 파일로 생성 후, 그 파일을 S3로 전송한다. 그리고 Glue는 S3의 파일을 읽도록 한다. 이를 통해 Glue의 구동시간을 줄인다. sqlcmd, batch를 이용하여 MSSQL Server에서 1일...","categories": ["AWS","DB"],
        "tags": [],
        "url": "http://localhost:4000/aws/db/mssql-to-s3/",
        "teaser": "http://localhost:4000/assets/images/share.png"
      }]
