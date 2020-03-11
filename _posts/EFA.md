## Feature 
- **Elastic Fabric Adapter (EFA)**
- a **network device** that you can **attach to your Amazon EC2** instance to **accelerate High Performance Computing (HPC)** and machine learning applications
- achieve the application performance of an on-premises HPC cluster, with the scalability, flexibility, and elasticity
- EFA provides lower and more **consistent latency and higher throughput than the TCP transport** traditionally used in cloud-based HPC systems.
- It enhances the performance of **inter-instance communication** that is critical **for scaling** HPC and machine learning applications.
- **OS-bypass** enables HPC and machine learning applications to bypass the operating system kernel and to **communicate directly with the EFA device.**
  - The **OS-bypass** capabilities of EFAs are **not supported on Windows** instances. If you attach an EFA to a Windows instance, the instance functions as an **Elastic Network Adapter(ENA)**, without the added EFA capabilities.
  - **Elastic Network Adapters (ENAs)** : provide traditional IP networking features that are required to support VPC networking. **EFA**s provide all of the same traditional IP networking features as ENAs, and they also support OS-bypass capabilities. 

## Scenario
- An automotive company is working on an autonomous vehicle development and deployment project using AWS. The solution requires **High Performance Computing (HPC)** in order to collect, store and manage massive amounts of data as well as to support deep learning frameworks. The **Linux** EC2 instances that will be used **should have a lower latency and higher throughput than the TCP transport** traditionally used in cloud-based HPC systems. It should also enhance the **performance of inter-instance communication** and must include an **OS-bypass** functionality to allow the **HPC to communicate directly with the network interface hardware** to provide low-latency, reliable transport functionality.    
Which of the following is the MOST suitable solution that you should implement to achieve the above requirements?
  - **A) Attach an Elastic Fabric Adapter (EFA) on each Amazon EC2 instance to acclerate High Performance Computing(HPC).**
  - **Elastic Network Adapter (ENA)** : is incorrect because Elastic Network Adapter (ENA) doesn't have OS-bypass capabilities, unlike EFA.
  - **Elastic Network Interface (ENI)** : is incorrect because an Elastic Network Interface (ENI) is simply a logical networking component in a VPC that represents a virtual network card. 
