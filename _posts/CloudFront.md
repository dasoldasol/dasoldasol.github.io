## CloudFront CheatSheet
- provides low latency and high data transfer speeds for distribution of static, dynamic web or streaming content to web users. 
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
