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
  
## Scenario
- You are working as a Solutions Architect for a start-up company that has a not-for-profit crowdfunding platform hosted in AWS. Their platform allows people around the globe to raise money for social enterprise projects including challenging circumstances like accidents and illnesses. Since the system handles financial transactions, you have to ensure that your cloud architecture is secure.    
Which of the following **AWS services encrypts data at rest by default**? (Choose 2)
  - **A1) AWS Storage Gateway**
  - **A2) Amazon S3 Glacier**
  - All data transferred between **any type of gateway appliance and AWS storage is encrypted using SSL**. By default, all data stored by **AWS Storage Gateway in S3** is encrypted server-side with Amazon S3-Managed Encryption Keys (**SSE-S3**). Also, when using the file gateway, you can optionally configure each file share to have your objects encrypted with AWS KMS-Managed Keys using SSE-KMS.
  - Data stored in **Amazon Glacier** is protected by default; only vault owners have access to the Amazon Glacier resources they create. Amazon Glacier encrypts your data at rest by default and supports **secure data transit with SSL**.
  - **Amazon RDS, Amazon ECS, and AWS Lambda** :  are incorrect because although Amazon RDS, ECS and Lambda all support encryption, you still **have to enable** and configure them first with tools like **AWS KMS to encrypt** the data at rest.
