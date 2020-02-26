## Redshift CheatSheet
- fully managed, fast and powerful, petabyte scale **data warehouse** service
- uses **replication and continuous backups** to enhance availability and improve data durability and can automatically recover from node and component failures.
- Massive Parallel Processing(MPP) : distributing & parallelizing queries across multiple physical resources
- comlumnar data storage : improving query performance and allowing advance compression techniques
- **only supports Single-AZ deployments** and the nodes are available within the same AZ, if the AZ supports Redshift clusters.
- spot instances are **NOT** and option


## Features
- used for business intelligence(OLAP)
- Available in ONLY 1 AZ
## Backups
- Enabled by default with a 1 day retention period (Max 35days)
- maintain at least 3 copies of your data(original/replica on compute nodes/backup in s3)
- Disaster Recovery : replicate Snapshots to s3 in another region
