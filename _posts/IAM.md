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
