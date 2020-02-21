## Features
- OLTP (cf. DynamoDB:NoSQL, Redshift:OLAP, Elasticache:Memcached/Redis)
- RDS runs on VM
- You cannot SSH log in to these operation systmes however.(Amazon's responsibility)
- RDS is NOT Serverless
- Aurora is Serverless
- Error node : the response from **RDS API** to check RDS for an error
- provisioned IOPS over standard storage when.. : if you use online transaction processing in your production environment
## Backups, Multi-AZ, Read Replicas
- **Backup**
  - Automated Backups (by default)
  - Database Snapshot
  - single AZ RDS : I/O may be briefly suspended while the backup process initializes (typically under a few seconds), and you may experience a brief period of elevated latency.
- **Read Replicas**
  - Can be Multi-AZ, different regions
  - Used to increase performance (ex.for heavy traffics)
  - Must have backups turned on 
  - Can be promoted to master, this will break the Read Replica 
- **Multi-AZ**
  - Used For Disaster Recovery(failover by rebooting RDS instance)
 