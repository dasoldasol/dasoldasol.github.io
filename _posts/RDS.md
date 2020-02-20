## Features
- OLTP (cf. DynamoDB:NoSQL, Redshift:OLAP)
- RDS runs on VM
- You cannot log in to these operation systmes however.(Amazon's responsibility)
- RDS is NOT Serverless
- Aurora is Serverless
## Backups, Multi-AZ, Read Replicas
- **Backup**
  - Automated Backups 
  - Database Snapshot
- **Read Replicas**
  - Can be Multi-AZ, different regions
  - Used to increase performance 
  - Must have backups turned on 
  - Can be promoted to master, this will break the Read Replica 
- **Multi-AZ**
  - Used For Disaster Recovery(failover by rebooting RDS instance)
  
