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
  
