## Volume & Snapshot
- Volume : exist on EBS. always on same AZ
- Snapshot : exist on S3. incremental. stop the instance before taking snapshots.
- migrate to another AZ : snapshot -> create AMI from snapshot -> use the AMI to launch instance in new AZ
- migrate to another region : snapshot -> create AMI from snapshot -> copy AMI to another region -> use the copied AMI to launch instance in new region
- when EC2 instance terminated.. : root device volume deleted, additional volumes NOT deleted by default 


## EBS vs. Instance Store 
- Instance Store Volume
  - Ephemeral Storage : Instance store volumes canNOT be stopped. If the underlying host fails, you will lose data.
- EBS
  - EBS backed instances can be stopped. you will not lose data on this instance if it's stopped.
- you can reboot both, you will not lose data.
- Both ROOT volumes will be deleted on termination by default. EBS) you can tell AWS to keep ROOT


## Encryption
- Snapshots of encrypted volumes are encrypted automatically.
- Volumes retored from encrypted snapshots are encrypted automatically.
- you can share snapshots ONLY IF they are UNENCRYPTED
- These snapshots can be shared with other AWS accounts or made public.
- you can now encrypt ROOT device volumes when you create the EC2 instance. 
- **HOW TO CHANGE UNENCRYPTED ROOT TO ENCRYPTED?**
  - Create a Snapshot of the unencrypted root device volume.
  - Copy the Snapshot and select the encrypt option
  - Create an AMI from the encrypted Snapshot
  - Use the AMI to launch new encrypted instances. 
