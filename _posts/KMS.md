## Feature
### AWS Key Management Service(KMS)
- a managed service that makes it easy for you to create and control the encrypton keys used to encrypt your data. 
- The master keys that you create in AWS KMS are protected by validated cryptographic modules. 
- AWS KMS is integrated with most other AWS services that encrypt your data with encryption keys that you manage.


## Scenario
- **You are working as a Solutions Architect for a government project in which they are building an online portal to allow people to pay their taxes and claim their tax refunds online. Due to the confidentiality of data, the security policy requires that the application hosted in EC2 encryps the data first before writing it to the disk for storage.    
In this scenario, which service would you use to meet this requirement?**
  - **A) AWS KMS API
  - the scenario mentions that you have to encrypt data **before writing** it to disk for storage. What this means that you will have to temporarily store the data in **memory** and not persist it on the disk, then encrypt it immediately before finally storing it. The end result would be an encrypted 
