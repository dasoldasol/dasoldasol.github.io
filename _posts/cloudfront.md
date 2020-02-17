## Udemy Comcept
- CDN
- Edge Location : location where the data cached. separate to Region/AZ
- Origin : the source of all the files that the CDN will distribute
- Distribution : collection of Edge Locations 
- Web Distribution : used for Websites (cf. RTMP -Real-Time Messaging Protocol- : Media data streaming)
- create invalidation : when update doesn't work, you can clear cache but will be charged
- not just READ ONLY, you can write
- TTL(Time to Live) 
##
- Origin : S3 bucket or http server(ex:web server)
- Additional montly charge ($600/month) for using dedicated IP address
- Invalidate : if objects update frequently, changing Object name is recommended
