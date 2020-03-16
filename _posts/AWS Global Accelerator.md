## Feature 
- **AWS Global Accelerator**는 로컬 또는 글로벌 사용자를 대상으로 애플리케이션의 가용성과 성능을 개선하는 서비스입니다. Application Load Balancer, Network Load Balancer 또는 Amazon EC2 인스턴스와 같이 단일 또는 여러 AWS 지역에서 애플리케이션 엔드포인트에 대한 고정된 진입점 역할을 하는 정적 IP 주소를 제공합니다.    
AWS Global Accelerator는 AWS 글로벌 네트워크를 통해 사용자에서 애플리케이션으로 이어진 경로를 최적화하여 **TCP 및 UDP 트래픽의 성능을 개선**합니다. AWS Global Accelerator는 애플리케이션 엔드포인트의 상태를 모니터링하고 비정상적인 엔드포인트의 트래픽을 30초 안에 정상 엔드포인트로 리디렉션합니다.
### 글로벌 애플리케이션 가용성 개선
- AWS Global Accelerator는 애플리케이션 엔드포인트(예: Network Load Balancers, Application Load Balancers, EC2 인스턴스 또는 탄력적 IP)의 상태를 지속적으로 모니터링하여 상태 또는 구성 변화에 즉시 대응합니다. 그런 다음 AWS Global Accelerator는 사용자에게 최고의 성능과 가용성을 제공하는 정상 엔드포인트로 사용자 트래픽을 리디렉션합니다.
### 글로벌 애플리케이션 가속화
- AWS Global Accelerator는 네트워크 경로를 최적화하며 방대하고 정체가 없는 AWS 글로벌 네트워크의 장점을 활용합니다. AWS Global Accelerator는 사용자의 위치와 관계없이 지능적으로 최고의 애플리케이션 성능을 제공하는 엔드포인트로 트래픽을 라우팅합니다.
### 손쉽게 엔드포인트 관리
- AWS Global Accelerator의 고정 IP 주소를 통해 DNS 구성을 업데이트하거나 클라이언트 애플리케이션을 변경하지 않고도 가용 영역 또는 AWS 리전 간에 엔드포인트를 손쉽게 이동할 수 있습니다. Amazon IP 주소 풀의 고정 IP 주소를 사용하거나 AWS Global Accelerator에서 기존 보유 IP 주소를 사용(BYOIP)할 수 있습니다.

## UseCase
### 증가된 애플리케이션을 활용하도록 확장
- AWS Global Accelerator를 사용하면 클라이언트 애플리케이션에서 IP 주소를 업데이트하지 않고도 AWS 리전에서 엔드포인트를 추가 또는 제거하고, 블루/그린 배포 및 A/B 테스트를 실행할 수 있습니다. 이는 클라이언트 애플리케이션을 자주 업데이트 할 수 없는 IoT, 소매, 미디어, 자동차 및 건강 관리 사용 사례에 특히 유용합니다.
### 지연시간에 민감한 애플리케이션 가속화 
- 사용자 환경을 개선하기 위해 AWS Global Accelerator는 사용자 트래픽을 가장 가까운 애플리케이션 엔드포인트로 클라이언트로 직접 전달함으로써 인터넷 대기 시간과 지터를 줄입니다. Anycast를 통해 트래픽을 가장 가까운 엣지 로케이션으로 라우팅한 다음 AWS 글로벌 네트워크 전체에서 가장 가까운 리전 엔드포인트로 라우팅합니다. 
### 여러 리전 및 여러 가용 영역의 복원력에 기반한 재해 복구
- AWS Global Accelerator가 기본 AZ 또는 AWS 리전에서 애플리케이션 엔드포인트의 장애를 감지하면, 다른 AZ 또는 AWS 리전에 있는 다음으로 사용 가능하고, 가장 가까운 엔드포인트의 애플리케이션 엔드포인트로 트래픽을 다시 라우팅하도록 즉시 트리거합니다.
### 애플리케이션 보호 
- AWS Global Accelerator를 사용하면 내부 Application Load Balancer나 프라이빗 EC2 인스턴스를 엔드포인트로 추가할 수 있습니다. 단일 인터넷 연결 액세스 포인트로 AWS Global Accelerator를 사용하면 분산 서비스 거부(DDoS) 공격으로부터 AWS에서 실행 중인 애플리케이션을 보호하고 최종 사용자가 애플리케이션에 연결하는 방식을 제어할 수 있습니다. AWS Global Accelerator는 AWS Global Accelerator와 Amazon Virtual Private Cloud(Amazon VPC) 간에 피어링 연결을 생성합니다. 두 VPC 간의 트래픽은 프라이빗 IP 주소를 사용합니다.

## Scenario
- An online trading platform with thousands of clients across the globe is hosted in AWS. To reduce latency, you have to **direct user traffic to the nearest application endpoint** to the client. The **traffic should be routed to the closest edge location via an Anycast static IP address**. AWS Shield should also be integrated into the solution for DDoS protection.
Which of the following is the MOST suitable service that the Solutions Architect should use to satisfy the above requirements?
  - **A) AWS Global Accelerator**
