## Feature 
- **snowball** : import/export to s3(transfer) large amount of data 
- **snowball edge** : snowball + compute(lambda)
- snowmobile : data center migration

## Scenarios 
- You are working for a large telecommunications company. They have a requirement to move **83 TB data warehouse** to the cloud. It would **take 2 months to transfer the data given their current bandwidth allocation.**       
Which is the most cost-effective service that would allow you to quickly upload their data into AWS?
  - **A) Amazon Snowball Edge**
  - the storage capacity is different from the usable capacity
    - 80TB Snowball have 72TB usable capacity 
    - 100TB Snowball have 83TB usable capacity 
  - **Snowball Edge device** can transport data at speeds faster than the internet.

- A media company hosts large volumes of archive data that are about **250 TB in size** on their internal servers. They have decided to **move these data to S3** because of its durability and redundancy. The company currently has a **100 Mbps** dedicated line connecting their head office to the **Internet**.    
Which of the following is the FASTEST way to import all these data to Amazon S3?
  - **A) Order multiple AWS Snowball devices to upload the files to Amazon S3**
  - **Snowball usecase** : high network costs, long transfer times, and security concerns. Transferring data with Snowball is simple, fast, secure, and can be as little as one-fifth the cost of high-speed Internet.
