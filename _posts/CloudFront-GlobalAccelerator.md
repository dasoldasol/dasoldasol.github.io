## CloudFront 
### CheatSheet
- provides low latency and high data transfer speeds for **distribution of static, dynamic web or streaming content** to web users. 
- delivers the content through a worldwide network of data centers called **Edge Location**. 
- keeps persistent connections with the origin servers so that the files can be fetched from the origin servers as quickly as possible   
- dramatically **reduces the # of network hops** that user's requests must pass through. 
- supports **multiple origin server options**, like AWS hosted service(S3, EC2, ELB) or an on premise server, which stores the original, definitive version of the objects.  

- **single distribution can have multiple origins** and Path pattern in a cache behavior determines which requests are routed to the origin

- supports **Web Download** distribution and **RTMP Streaming** distribution
  - Web distribution supports static, dynamic web content, on demand using progressive download & HLS and live streaming video content
  - RTMP supports streaming of media files using Adobe Media Server and the Adobe Real-Time Messaging Protocol(RTMP) **ONLY**
  
- supports HTTPS using either 
  - **dedicated IP address**, which is expensive as dedicated IP address is assigned to each CloudFront edge location 
  - **Server Name Indication(SNI)**, which is free but supported by modern browsers only with the domain name available in the request header
    
- object **removal** from cache 
  - would be removed upon **expiry(TTL)** from the cache, by default 24 hrs
  - can be **invalidated explicitly**, but has a cost associated, however might continue to see the old version until it expires from those caches
  - objects can be **invalidated only for Web distribution**
  - change object name, **versioning**, to serve different version 

- supports adding or modifying custom headers before the request is sent to origin which can be used to 
  - **validate** if user is accessing the content from CDN
  - **identifying CDN** from which the request was forwarded from, in case of multiple CloudFront distribution
  - for **viewers not supporting CORS** to return the Access-Conrol-Allow-Origin header for every request
    
- supports **Partial GET requests** using range header to download object in smaller units improving the efficiency of partial downloads and recovery from partially failed transfers 
- supports **compression** to compress and serve compressed files when viewer requests include Accept-Encoding: gzip in the request header 
- supports different **price class** to include all regions, to include only least expensive regions and other regions to exclude most expensive regions 
- supports **access logs** which contain detailed information about every user request for both web and RTMP distribution

### Features 
- CDN
- Edge Location : location where the data cached. separate to Region/AZ
- Origin : the source of all the files that the CDN will distribute
- Distribution : collection of Edge Locations 
- Web Distribution : used for Websites (cf. RTMP -Real-Time Messaging Protocol- : Media data streaming)
- create invalidation : when update doesn't work, you can clear cache but will be charged
- not just READ ONLY, you can write
- TTL(Time to Live) 
### Storage Option
- Origin : S3 bucket or http server(ex:web server)
- Additional montly charge ($600/month) for using dedicated IP address
- Invalidate : if objects update frequently, changing Object name is recommended
- Ideal Usage Pattern : distribution of frequently accessed static content, or dynamic content or for streaming audio or video that benefits from edge delivery
- Anti Pattern : data is infrequently accessed, cache invalidation(object versioning recommended) 

## S3 Pre-signed URLs vs. CloudFront Signed URLs vs. Origin Access Identity(OAI)
### S3 Pre-signed URLs
- 모든 객체 및 버킷은 기본적으로 **private**입니다. 개체 소유자만 이러한 개체에 액세스할 수 있는 권한을 갖습니다. Pre-signed URL은 소유자의 security credential을 사용하여 다른 사람들에게 개체를 다운로드하거나 **업로드**할 수 있는 시간 제한 권한을 부여합니다. 
- Pre-signed URL을 생성하는 경우 소유자로서 다음을 제공해야 합니다 
  - security credentials
  - 버킷 이름, 객체 키
  - HTTP 메서드(다운로드하려면 GET 업로드하려면 PUT)
  - URL의 만료 날짜/시간
### CloudFront Signed URLs
- 개인콘텐츠에 대한 사용자 액세스 제어 방법 2가지
  - CloudFront Edge caches에 대한 액세스 제한 
  - 웹 사이트 엔드포인트로 구성하지 않은 경우, S3 버킷 파일에 대한 액세스 제한 
- 사용자가 **signed URL**이나 **signed cookies**를 사용하여 파일에 액세스하도록 CloudFront 구성. 그런 다음 **signed URL**생성하여 인증된 사용자에게 배포하거나 인증된 사용자를 위해 뷰어에 signed cookies를 설정하는 Set-Cookie 헤더를 보내도록 응용프로그램 개발 
- 오리진이 S3버킷인지 아니면 HTTP서버인지에 관계 없이 모든 CloudFront 배포에 사용 가능 
- 파일에 대한 액세스를 제어하기 위해 signed URL/signed cookies를 작성할 때 다음 제한 사항을 지정할 수 있습니다.
  - URL의 만료 날짜(expiration date)/시간
  - (선택사항) URL 유효 날짜(valid date)/시간
  - (선택사항) 콘텐츠에 액세스하는데 사용할 수 있는 컴퓨터의 IP주소
### Origin Access Identity(OAI)
- CloudFront 배포의 원본으로도 S3 버킷을 구성할 수 있습니다. **OAI는 사용자가 direct URL을 이용해 S3 파일을 보지 못하게 합니다**. 대신 CloudFront URL을 통해 액세스해야 합니다.
- 사용자가 CloudFront URL을 통해 컨텐츠에 액세스하도록 요구하려면 다음 작업이 필요 
  - **origin access identity** 라는 특별한 CloudFront 사용자를 생성
  - 버킷의 파일을 읽을 수 있는 Origin Access ID 권한(permission) 부여 
  - 다른 사람이 S3 URL을 사용하여 파일을 읽을 수 있는 권한 제거(bucket policy or ACL)
- S3 버킷이 웹사이트 엔드 포인트로 구성된 경우 OAI를 설정할 수 없습니다. 

## AWS Global Accelerator
### Feature
- **AWS Global Accelerator**는 로컬 또는 글로벌 사용자를 대상으로 애플리케이션의 가용성과 성능을 개선하는 서비스입니다. Application Load Balancer, Network Load Balancer 또는 Amazon EC2 인스턴스와 같이 단일 또는 여러 AWS 지역에서 애플리케이션 엔드포인트에 대한 고정된 진입점 역할을 하는 정적 IP 주소를 제공합니다.    
AWS Global Accelerator는 AWS 글로벌 네트워크를 통해 사용자에서 애플리케이션으로 이어진 경로를 최적화하여 **TCP 및 UDP 트래픽의 성능을 개선**합니다. AWS Global Accelerator는 애플리케이션 엔드포인트의 상태를 모니터링하고 비정상적인 엔드포인트의 트래픽을 30초 안에 정상 엔드포인트로 리디렉션합니다.
- **글로벌 애플리케이션 가용성 개선**
  - AWS Global Accelerator는 애플리케이션 엔드포인트(예: Network Load Balancers, Application Load Balancers, EC2 인스턴스 또는 탄력적 IP)의 상태를 지속적으로 모니터링하여 상태 또는 구성 변화에 즉시 대응합니다. 그런 다음 AWS Global Accelerator는 사용자에게 최고의 성능과 가용성을 제공하는 정상 엔드포인트로 사용자 트래픽을 리디렉션합니다.
- **글로벌 애플리케이션 가속화**
  - AWS Global Accelerator는 네트워크 경로를 최적화하며 방대하고 정체가 없는 AWS 글로벌 네트워크의 장점을 활용합니다. AWS Global Accelerator는 사용자의 위치와 관계없이 지능적으로 최고의 애플리케이션 성능을 제공하는 엔드포인트로 트래픽을 라우팅합니다.
- **손쉽게 엔드포인트 관리**
  - AWS Global Accelerator의 고정 IP 주소를 통해 DNS 구성을 업데이트하거나 클라이언트 애플리케이션을 변경하지 않고도 가용 영역 또는 AWS 리전 간에 엔드포인트를 손쉽게 이동할 수 있습니다. Amazon IP 주소 풀의 고정 IP 주소를 사용하거나 AWS Global Accelerator에서 기존 보유 IP 주소를 사용(BYOIP)할 수 있습니다.

### UseCase
- **증가된 애플리케이션을 활용하도록 확장**
  - AWS Global Accelerator를 사용하면 클라이언트 애플리케이션에서 IP 주소를 업데이트하지 않고도 AWS 리전에서 엔드포인트를 추가 또는 제거하고, 블루/그린 배포 및 A/B 테스트를 실행할 수 있습니다. 이는 클라이언트 애플리케이션을 자주 업데이트 할 수 없는 IoT, 소매, 미디어, 자동차 및 건강 관리 사용 사례에 특히 유용합니다.
- **지연시간에 민감한 애플리케이션 가속화** 
  - 사용자 환경을 개선하기 위해 AWS Global Accelerator는 사용자 트래픽을 가장 가까운 애플리케이션 엔드포인트로 클라이언트로 직접 전달함으로써 인터넷 대기 시간과 지터를 줄입니다. Anycast를 통해 트래픽을 가장 가까운 엣지 로케이션으로 라우팅한 다음 AWS 글로벌 네트워크 전체에서 가장 가까운 리전 엔드포인트로 라우팅합니다. 
- **여러 리전 및 여러 가용 영역의 복원력에 기반한 재해 복구**
  - AWS Global Accelerator가 기본 AZ 또는 AWS 리전에서 애플리케이션 엔드포인트의 장애를 감지하면, 다른 AZ 또는 AWS 리전에 있는 다음으로 사용 가능하고, 가장 가까운 엔드포인트의 애플리케이션 엔드포인트로 트래픽을 다시 라우팅하도록 즉시 트리거합니다.
- **애플리케이션 보호** 
  - AWS Global Accelerator를 사용하면 내부 Application Load Balancer나 프라이빗 EC2 인스턴스를 엔드포인트로 추가할 수 있습니다. 단일 인터넷 연결 액세스 포인트로 AWS Global Accelerator를 사용하면 분산 서비스 거부(DDoS) 공격으로부터 AWS에서 실행 중인 애플리케이션을 보호하고 최종 사용자가 애플리케이션에 연결하는 방식을 제어할 수 있습니다. AWS Global Accelerator는 AWS Global Accelerator와 Amazon Virtual Private Cloud(Amazon VPC) 간에 피어링 연결을 생성합니다. 두 VPC 간의 트래픽은 프라이빗 IP 주소를 사용합니다.

## Scenarios
- A web application is using CloudFront to distribute their images, videos, and other static contents stored in their S3 bucket to its users around the world. The company has recently introduced a **new member-only access** to some of its high quality media files. There is a requirement to **provide access to multiple private media files only to their paying subscribers** without having to change their current URLs.      
Which of the following is the most suitable solution that you should implement to satisfy this requirement?
  - **A) Use Signed Cookies to control who can access the private files in your CloudFront distribution by modifying your application to determine whether a user should have access to your content. For members, send the required `Set-Cookie` headers to the viewer which will unlock the content only to them.**
  - **Signed URLs**
    - You want to use an RTMP distribution. Signed cookies aren't supported for RTMP distributions.
    - You want to restrict access to individual files, for example, an installation download for your application.
    - Your users are using a client (for example, a custom HTTP client) that doesn't support cookies.
  - **Signed Cookies**
    - You want to provide access to multiple restricted files, for example, all of the files for a video in HLS format or all of the files in the subscribers' area of a website.
    - You don't want to change your current URLs.
  - Match Viewer : is incorrect. It is an Origin Protocol Policy which configures CloudFront to communicate with your origin using HTTP or HTTPS, depending on the protocol of the viewer request. CloudFront caches the object only once even if viewers make requests using both HTTP and HTTPS protocols.
  - CloudFront distribution to use Field-Level Encryption : is incorrect because Field-Level Encryption only allows you to securely upload user-submitted sensitive information to your web servers. It does not provide access to download multiple private files.

- A popular social media website uses a CloudFront web distribution to serve their static contents to their millions of users around the globe. They are receiving a number of **complaints** recently that their users **take a lot of time to log into their website**. There are also occasions when their users are getting **HTTP 504 errors**. You are instructed by your manager to significantly reduce the user's login time to further optimize the system.    
Which of the following options should you use together to set up a **cost-effective** solution that can improve your application's performance? (Choose 2)
  - **Solution 1 : Set up an origin failover by creating an origin group with two origins. Specify one as the primary origin and the other as the second origin which CloudFront automatically switches to when the primary origin returns specific HTTP status code failure response.**
  - **Solution 2 : Customize the content that the CloudFront web distribution delivers to your users using Lambda@Edge, which allows your Lambda functions to execute the authentication process in AWS locations closer to the users.**
  - Lambda @ Edge는 Lambda 함수가 CloudFront가 제공하는 컨텐츠를 사용자 지정하고 사용자와 가까운 AWS 위치에서 인증 프로세스를 실행할 수 있도록합니다.

- A web application, which is used by your clients around the world, is hosted in an Auto Scaling group of EC2 instances behind a **Classic Load Balancer**. You need to secure your application by allowing **multiple domains to serve SSL traffic over the same IP address**.     
Which of the following should you do to meet the above requirement?
  - **A) Generate an SSL certificate with AWS Certificate Manager and create a CloudFront web distribution. Associate the certificate with your web distribution and enable the support for Server Name Indication(SNI)**
  - **SNI** : 서버 네임 인디케이션(Server Name Indication, SNI)은 컴퓨터 네트워크 프로토콜인 TLS의 확장으로, 핸드셰이킹 과정 초기에 클라이언트가 어느 호스트명에 접속하려는지 서버에 알리는 역할을 한다. 이를 이용하면 같은 IP 주소와 TCP 포트 번호를 가진 서버로 여러 개의 인증서를 사용할 수 있게 되고, 따라서 모든 사이트가 같은 인증서를 사용하지 않아도 동일한 아이피로 여러 HTTPS 웹사이트(또는 TLS 상에서 돌아가는 다른 서비스)를 운영할 수 있게 된다. 
  - **Amazon CloudFront** delivers your content from each edge location. It offers the same security as the Dedicated IP Custom SSL feature. SNI Custom SSL works with most modern browsers.
  - **SSL/TLS 암호화 및 HTTPS** : Amazon CloudFront를 사용하면 콘텐츠, API 또는 애플리케이션을 SSL/TLS를 통해 전송할 수 있으며, 고급 SSL 기능을 자동으로 활성화할 수 있습니다. AWS Certificate Manager(ACM)를 사용하여 사용자 지정 SSL 인증서를 손쉽게 생성하여 CloudFront 배포에 무료로 배포할 수 있습니다. ACM은 인증서 갱신을 자동으로 처리하므로 수동 갱신 프로세스의 오버헤드와 비용이 절감됩니다. 또한 CloudFront는 풀/하프 브리지 HTTPS 연결, OCSP 스테이플링, 세션 티켓, PFS(Perfect Forward Secrecy), TLS 프로토콜 시행, 필드 레벨 암호화 등과 같은 다양한 SSL 최적화 및 고급 기능을 제공합니다.
  - **Dedicated IP Custom SSL** : Some users may not be able to access your content because some **older browsers** do not support SNI and will not be able to establish a connection with CloudFront to load the HTTPS version of your content. If you need to support **non-SNI compliant browsers** for HTTPS content, it is recommended to use the **Dedicated IP Custom SSL feature**.
  - **Using Server Name Indication (SNI) on your Classic Load Balancer by adding multiple SSL certificates to allow multiple domains to serve SSL traffic** : is incorrect because a **Classic Load Balancer does not support SNI**. You have to use an Application Load Balancer instead or a CloudFront web distribution to allow the SNI feature.
  - **Using an Elastic IP and uploading multiple 3rd party certificates in your Application Load Balancer using the AWS Certificate Manager** : is incorrect because just like in the above, a Classic Load Balancer does not support Server Name Indication (SNI) and the use of an Elastic IP is not a suitable solution to allow multiple domains to serve SSL traffic. You have to use Server Name Indication (SNI).

- Your customer has clients all across the globe that access product files stored in several S3 buckets, which are behind each of their own CloudFront web distributions. They currently want to deliver their content to a specific client, and they need to make sure that **only that client can access the data**. Currently, all of their clients can access their S3 buckets directly using an S3 URL or through their CloudFront distribution. The Solutions Architect **must serve the private content securely via CloudFront only to speed up the distribution of files**.    
Which combination of actions should you implement to meet the above requirements? (Choose 2)
  - **A1) Restrict access to files in your origin by creating an origin access identity(OAI) and give it permission to read the files in the bucket.**
  - **A2) Require that your users access your private content by using special CloudFront signed URLs or signed cookies.**
  - To securely serve this private content by using CloudFront:
    - Require that your users access your private content by using special **CloudFront signed URLs or signed cookies.**
    - Require that your users access your Amazon S3 content by using CloudFront URLs, **not Amazon S3 URLs**. Requiring CloudFront URLs isn't necessary, but it is recommended to **prevent users from bypassing the restrictions** that you specify in signed URLs or signed cookies. You can do this by setting up an **origin access identity (OAI)** for your Amazon S3 bucket. You can also configure the custom headers for a private HTTP server or an Amazon S3 bucket configured as a website endpoint.
  - All objects and buckets by default are private. The **presigned URLs** are useful **if you want your user/customer to be able to upload a specific object to your bucket, but you don't require them to have AWS security credentials or permissions.** Anyone who receives a valid presigned URL can then programmatically upload an object.
  - **Use S3 pre-signed URLs to ensure that only their client can access the files. Remove permission to use Amazon S3 URLs to read the files for anyone else** : is incorrect because although this could be a valid solution, it doesn't satisfy the requirement to serve the private content securely via CloudFront only to speed up the distribution of files. A better solution is to set up an origin access identity (OAI) then use Signed URL or Signed Cookies in your CloudFront web distribution.

- You are responsible for running a **global news website** hosted in a fleet of EC2 Instances. Lately, the load on the website has increased which resulted to slower response time for the site visitors. This issue impacts the revenue of the company as some readers tend to leave the site if it does not load after 10 seconds.       
Which of the below services in AWS can be used to solve this problem? (Select TWO.)
  - **A1) Use Amazon ElastiCache for the website's in-memory data store or cache.**
  - **A2) Use Amazon CloudFront with website as the custom origin.**
  - this is a news website, most of its data are read-only, which can be cached to improve the read throughput and avoid the repetitive requests from the server.
  - Amazon CloudFront is the global content delivery network (CDN) service that you can use and for web caching

- You are working for a large global media company with multiple office locations all around the world. You are instructed to build a system to distribute training videos to all employees. Using **CloudFront**, what method would be used **to serve content that is stored in S3, but not publicly accessible from S3 directly**?
  - **A) Create an Origin Access Identity (OAI) for CloudFront and grant access to the objects in your S3 bucket to that OAI.**
  - Amazon S3 버킷에서 제공하는 콘텐츠에 대한 액세스를 제한하려면 CloudFront 서명된 URL 또는 서명된 쿠키를 만들어 Amazon S3 버킷에서 파일에 대한 액세스를 제한하고, **OAI(원본 액세스 ID)**라는 특별한 CloudFront 사용자를 만들어 배포와 연결합니다. 그런 다음 CloudFront가 OAI를 사용하여 사용자에 액세스하고 파일을 제공할 수 있지만, 사용자는 S3 버킷에 대한 직접 URL을 사용하여 파일에 액세스할 수 없도록 권한을 구성합니다. 
  - Alternatively, you can choose to manually change the bucket policy or change ACLs, which control permissions on individual objects in your bucket.

- A web application is hosted in an Auto Scaling group of EC2 instances deployed across multiple Availability Zones in front of an Application Load Balancer. You need to implement an SSL solution for your system to improve its security which is why you requested an SSL/TLS certificate from a third-party certificate authority (CA).       
Where can you safely **import the SSL/TLS certificate of your application**? (Select TWO.)
  - **A1) AWS Certificate Manager**
  - **A2) IAM certificate store**
  - **AWS Certificate Manager(ACM)**
    - AWS 인증 관리자 (ACM) 서비스는 SSL/TLS 인증서 발급 및 관리에 대한 많은 작업을 자동화 하고 단순화 하기 위해 시작되었습니다. ACM에서 제공되는 인증서는 Amazon의 인증 기관(CA)인 Amazon Trust Services (ATS)에서 발급됩니다.    
인증서에 발급되는 추가 비용이 발생하지 않습니다. SSL/TLS 인증서는 AWS Certificate Manager에서 무료로 사용하실 수 있습니다.    
ACM을 사용하면 몇 분만에 SSL 암호화 기능을 사용할 수 있습니다. 인증서 발급을 요청하면, Elastic Load Balancers 및 Amazon CloudFront에서 몇 번의 클릭으로 설정할 수 있습니다. 그 후 ACM은 자동으로 인증서를 정기적으로 업데이트 해줍니다.
  - **IAM Certificate Store**
    - ACM에서 지원되지 않는 리전에서 HTTPS 연결을 지원해야 하는 경우에만 IAM을 인증서 관리자로 사용합니다. IAM은 프라이빗 키를 안전하게 암호화하고 암호화된 버전을 IAM SSL 인증서 스토리지에 저장합니다.
  - **CloudFront** : is incorrect. CloudFront에 인증서를 업로드 할 수 있지만 SSL 인증서를 가져올 수있는 것은 아닙니다. CloudFront에 로드한 인증서를 내보내거나 단일 CloudFront 배포에 연결된 EC2 또는 ELB 인스턴스에 할당 할 수 없습니다.

- You recently launched a news website which is expected to be visited by millions of people around the world. You chose to deploy the website in AWS to take advantage of its extensive range of cloud services and global infrastructure. Aside from AWS Region and Availability Zones, which of the following is part of the AWS **Global Infrastructure** that is used for **content distribution**?
  - **A) Edge Location**

- An online trading platform with thousands of clients across the globe is hosted in AWS. To reduce latency, you have to **direct user traffic to the nearest application endpoint** to the client. The **traffic should be routed to the closest edge location via an Anycast static IP address**. AWS Shield should also be integrated into the solution for DDoS protection.
Which of the following is the MOST suitable service that the Solutions Architect should use to satisfy the above requirements?
  - **A) AWS Global Accelerator**
