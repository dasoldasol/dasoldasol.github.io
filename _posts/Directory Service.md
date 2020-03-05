## Feature 
- Directory : 디렉터리는 네트워크의 개체에 대한 정보를 저장 하는 계층 구조입니다. 예를 들어 AD DS은 이름, 암호 등의 사용자 계정에 대한 정보를 저장하고, 동일한 네트워크에 있는 다른 권한 있는 사용자가이 정보에 액세스할 수 있도록 합니다.
- AWS Directory Service를 사용하면 손쉽게 AWS 클라우드에서 디렉터리를 설정 및 실행하거나 AWS 리소스를 기존 온프레미스 Microsoft Active Directory에 연결할 수 있습니다. 디렉터리가 생성되면, 이를 사용하여 사용자와 그룹을 관리하고, 애플리케이션과 서비스에 SSO를 제공하며, 그룹 정책을 생성 및 적용하고, Amazon EC2 인스턴스를 도메인에 조인하고, 클라우드 기반 Linux 및 Microsoft Windows 워크로드의 배포 및 관리를 간소화할 수 있습니다. AWS Directory Service를 사용하면 최종 사용자가 기존 기업 자격 증명을 사용하여 Amazon WorkSpaces, Amazon WorkDocs, Amazon WorkMail과 같은 AWS 애플리케이션과 커스텀 .NET 및 SQL Server 기반 애플리케이션과 같은 디렉터리 인식 Microsoft 워크로드에 액세스할 수 있습니다. 마지막으로 기존 기업 자격 증명을 사용하면 AWS Management Console에 대한 AWS Identity and Access Management(IAM) 역할 기반 액세스를 통해 AWS 리소스를 관리할 수 있으므로 자격 증명 연동 인프라를 추가로 구축할 필요가 없습니다.

## Scenario
- A telecommunications company is planning to give AWS Console access to developers. Company policy mandates the use of identity federation and role-based access control. Currently, the roles are already assigned using groups in the **corporate Active Directory**.    
In this scenario, what combination of the following services can provide developers access to the AWS console? (Choose 2)
  - A) IAM Roles, AWS Directory Service AD Connector
  - Considering that the company is using a corporate Active Directory, it is best to use AWS Directory Service AD Connector for easier integration. In addition, since the roles are already assigned using groups in the corporate Active Directory, it would be better to also use IAM Roles. Take note that you can assign an IAM Role to the users or groups from your Active Directory once it is integrated with your VPC via the AWS Directory Service AD Connector.
