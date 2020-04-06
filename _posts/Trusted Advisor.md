## Scenarios 
- Your IT Director instructed you to ensure that all of the **AWS resources** in your VPC **don’t go beyond** their respective service **limits.** You should prepare a system that provides you **real-time guidance in provisioning your resources** that adheres to the AWS best practices.
Which of the following is the MOST appropriate service to use to satisfy this task?
  - **A) AWS Trusted Advisor**
  - AWS Trusted Advisor는 AWS 모범 사례에 따라 리소스를 프로비저닝 할 수 있도록 실시간 지침을 제공하는 온라인 도구입니다. AWS 환경을 검사하고 비용 절감, 시스템 성능 및 안정성 향상 또는 보안 격차 해소에 대한 recommendation을 줍니다. 
  - 검사 목록
    - 비용 최적화 – 사용하지 않는 리소스와 비용을 절감 할 수있는 기회를 강조하여 비용을 절감 할 수있는 recommendation
    - 보안 – AWS 솔루션의 보안을 약화시킬 수있는 보안 설정을 식별합니다.
    - Fault Tolerance – 중복 부족, 현재 서비스 제한 및 과도하게 사용 된 리소스를 강조하여 AWS 솔루션의 복원력을 향상시키는 데 도움이되는 recommendation
    - 성능 – 응용 프로그램의 속도와 응답성을 향상시키는 데 도움이 되는 recommendation
    - 서비스 한도 – 서비스 사용량이 서비스 한도의 80 % 이상인 경우 알려주는 recommendation
   - **AWS Budgets** : is incorrect. 비용이나 사용량이 **예산 금액**을 초과하거나 초과 할 것으로 예상되는 경우를 알려주는 맞춤 예산을 설정하는 기능만 제공합니다. 또한 AWS Budgets를 사용하여 예약 활용률 또는 적용 범위 대상을 설정하고 사용률이 정의한 임계 값 아래로 떨어지면 알림을 받을 수 있습니다.
   - **Amazon Inspector** : is incorrect. AWS에 배포 된 애플리케이션의 **보안** 및 규정 준수를 개선하는 데 도움이되는 자동화 된 보안 평가 서비스입니다. Amazon Inspector는 노출, 취약성 및 모범 사례와의 편차에 대한 애플리케이션을 자동으로 평가합니다.
   - **AWS Cost Explorer** : is incorrect. 이것은 **비용과 사용량을 보고 분석 할 수있는 도구일뿐**입니다. 기본 그래프, 비용 탐색기 비용 및 사용 보고서 또는 비용 탐색기 RI 보고서를 사용하여 사용 및 비용을 탐색 할 수 있습니다. 또한 시간이 지남에 따라 AWS 비용 및 사용량을 시각화, 이해 및 관리 할 수있는 사용하기 쉬운 인터페이스가 있습니다.
