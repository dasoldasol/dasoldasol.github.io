## CloudFront CheatSheet
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

## Features 
- CDN
- Edge Location : location where the data cached. separate to Region/AZ
- Origin : the source of all the files that the CDN will distribute
- Distribution : collection of Edge Locations 
- Web Distribution : used for Websites (cf. RTMP -Real-Time Messaging Protocol- : Media data streaming)
- create invalidation : when update doesn't work, you can clear cache but will be charged
- not just READ ONLY, you can write
- TTL(Time to Live) 
## Storage Option
- Origin : S3 bucket or http server(ex:web server)
- Additional montly charge ($600/month) for using dedicated IP address
- Invalidate : if objects update frequently, changing Object name is recommended
- Ideal Usage Pattern : distribution of frequently accessed static content, or dynamic content or for streaming audio or video that benefits from edge delivery
- Anti Pattern : data is infrequently accessed, cache invalidation(object versioning recommended) 

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
