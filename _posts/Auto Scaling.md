## AutoScaling CheatSheet

### Scale out / Scale up
- **Scale Up** : t2.micro -> c3.2xlarge, increase EBS
- **Scale Out** :  you have more of the same resource separately working in parallel (ELB, Autoscaling)

### Features
- **ensures correct number of EC2 instances are always running** to handle the load by scaling up or down automatically as demand changes 
- **CANNOT** span **multiple regions**
- attemps to distribute instances evenly between AZs that are enabled for the Auto Scaling group
- **to determine the health of an instance** : using EC2 status checks or can use ELB health checks and terminates the instance if unhealthy, to launch a new instance 
- can be scaled using **manual scaling, scheduled scaling, demand based scaling**
- **cooldown period** helps ensure instances are not launched or terminated before the previous scaling activity takes affect to allow the newly launched instances to start handling traffic and reduce load 

### AutoScaling & ELB
- AutoScaling & ELB can used for **High Availability and Redundancy** by spanning Auto Scaling groups across multiple AZs within a region and then setting up ELB to distribute incoming traffic across those AZs
- **With AutoScaling use ELB health check with the instances to ensure that traffic is routed only to the healthy instances**
