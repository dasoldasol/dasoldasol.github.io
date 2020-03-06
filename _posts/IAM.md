## IAM CheatSheet 
### Features
- securely control access to AWS services and resources
- helps create and manage user identities and grant permissions for those users
- helps create groups for multiple users with similar permissions
- NOT appropriate for application authentication
- is Global and does not need to be migrated to a different region
- helps define Policies 
  - in JSON Format
  - all permissions are implicitly denied by default
  - most restrictive policy wins 
### IAM Role 
- helps grants and delegate access to users and services without the need of creating permanet credentials
- IAM Users or AWS Services can assume a role to obtain temporary security credentials that can be used to make AWS API calls
- needs **Trust policy** to define who and **Permission policy** to define what the user or service can access
- used with **Security Token Service(STS)**, a lightweight web service that provides **temporary, limited privilege** credentials for IAM users or for authenticated federated users
- Using **SAML** (Security Assertion Markup Language 2.0), you can give your **federated users single sign-on (SSO) access** to the AWS Management Console.
### IAM Role Scenarios
- Service access for e.g. EC2 to access S3/DynamoDB
- Cross Account access for users 
  - with user within the same account 
  - with user within an AWS account owned the same owner 
  - with user from a Third Party AWS account with External ID for enhanced security
- Identity Providers & Federation
  - Web Identity Federation, where the user can be authenticated using external authentication ID providers(like Amazon, Facebook, Google) or any OpenIdP using AssumeRoleWithWebIdentity
### IAM Best Practices 
- Do NOT use Root account for anything other than billing 
- Create Individual IAM Users 
- Use groups to assign permissions to IAM users
- Grant least previlege
- Use IAM Roles for applications on EC2
- Delegate using roles instead of sharing credentials 
- Rotate credentials regularly
- Use Policy conditions for increased details 
- Use CloudTrail to keep a history of activity
- Enforce a strong IAM password policy for IAM Users 
- Remove all unused users and credentials

## Using Role with EC2
- instead of using credentials, Attach the role to the instance
- hackers cannot take access key & secret access key from .aws 

## Concept
- PCI DSS(Payment Card Industry Data Security Standard)
- root account
- MFA on root
- universal : global (region xx)
- **group** : job function, policy (NO permissions when first created)
- **access key** : pragrammic access, not the same as a password, view just once 
- **policy** : document that provides a formal statement of one or more permissions.
- **role** : policy + policy
- password : customize password rotation policy 
- **STS(Security Token Service)** - temporary security credentials

## Scenarios 
- **A company is storing an access key (access key ID and secret access key) in a text file on a custom
AMI. The company uses the access key to access DynamoDB tables from instances created from the AMI. The security team has mandated a more secure solution. Which solution will meet the security team’s mandate?**        
         
  A. Put the access key in an S3 bucket, and retrieve the access key on boot from the instance.       
  B. Pass the access key to the instances through instance user data.       
  C. Obtain the access key from a key server launched in a private subnet.        
  **D. Create an IAM role with permissions to access the table, and launch all instances with the new role.**       
  
  - IAM roles for EC2 instances allow applications running on the instance to access AWS resources without having to create and store any access keys.
  - Any solution involving the creation of an access key then instrodues the complexity of managing that secret

- **You are deploying an Interactive Voice Response (IVR) telephony system in your cloud architecture that interacts with callers, gathers information, and routes calls to the appropriate recipients in your company. The system will be composed of an Auto Scaling group of EC2 instances, an Application Load Balancer, and a MySQL RDS instance in a Multi-AZ Deployments configuration. To protect the confidential data of your customers, you have to ensure that your RDS database can only be accessed using the profile credentials specific to your EC2 instances via an authentication token.    
As the Solutions Architect of the company, which of the following should you do to meet the above requirement?**
  - **A) Enable the IAM DB Authentication**
  - IAM database authentication works with MySQL and PostgreSQL. With this authentication method, you don't need to use a password when you connect to a DB instance. Instead, you use an authentication token.    
  An **authentication token** is a unique string of characters that Amazon RDS generates on request. You don't need to store user credentials in the database, because authentication is managed externally using IAM.
  ![iam-db-auth](./image/iam-db-auth.png)
  - Configuring SSL in your application to encrypt the database connection to RDS : is incorrect because an SSL connection is not using an authentication token from IAM.
  - assigning IAM Role to your EC2 instances which will grant exclusive access to your RDS instance : is incorrect because although you can create and assign an IAM Role to your EC2 instances, you still need to configure your RDS to use IAM DB Authentication.
  - a combination of IAM and STS : is incorrect. Although STS is used to send temporary tokens for authentication, this is not a compatible use case for RDS.

- A tech company that you are working for has undertaken a Total Cost Of Ownership (TCO) analysis evaluating the use of Amazon S3 versus acquiring more storage hardware. The result was that **all 1200 employees would be granted access to use Amazon S3** for storage of their personal documents.       
Which of the following will you need to consider so you can set up a solution that **incorporates single sign-on** feature from your corporate AD or LDAP directory and also **restricts access** for each individual user to a designated user folder in an S3 bucket? (Choose 2)
  - **Solution 1 : Set up a Federation proxy or an Identity provider, and use AWS Security Token Service to generate temporary tokens.**
  - **Solution 2 : Configuring an IAM role and an IAM Policy to access the bucket

- You work for an Intelligence Agency as its Principal Consultant developing a missile tracking application, which is hosted on both development and production AWS accounts. Alice, the Intelligence agency’s Junior Developer, only has access to the development account. She has received security clearance to access the agency’s production account but **the access is only temporary and only write access** to EC2 and S3 is allowed.    
Which of the following allows you to **issue short-lived access tokens that acts as temporary security credentials to allow access** to your AWS resources?
  - **A) AWS STS
  - **AWS STS vs. AWS Cognito JWT**
    - **STS** : provide trusted users with temporary **security credentials** that can control access to your AWS resources.
    - **JWT** : the Amazon Cognito service is primarily used for **user authentication** and not for providing access to your AWS resources. A JSON Web Token (JWT) is used for user authentication and **session management**.
