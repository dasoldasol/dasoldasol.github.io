---
title: "AWS Container Service의 이해"
excerpt: "AWS ECS, EKS, ECR"
toc: true
toc_sticky: true
categories:
  - AWS
modified_date: 2020-04-14 09:36:28 +0900
---
EC2에 올려놓은 Airflow를 컨테이너로 말아서 관리하면 좋다던데? (내가 한거 = ec2위에서 airflow docker-compose로 인스톨..) 근데 ecs, eks, ecr (다 똑가툰 콘테나 아닙니까???...).. AWS에 올려야되는데 얘네가 다 뭐지... 에서 시작한 용어정리
    
# 
- ECS(Elastic Container Service) : 도커 컨테이너를 관리하는 컨테이너 오케스트레이션 서비스
- EKS(Elastic Kubernetes Service) : AWS상에서 쿠버네티스를 이용해 클러스터를 구축, 관리할 수 있는 서비스 
  - 쿠버네티스(k8s, kubernetes) : 컨테이너를 쉽고 빠르게 배포/확장하고 관리를 자동화해주는 컨테이너 오케스트레이션 서비스 
- ECR(Elastic Container Registry) : 도커 컨테이너 이미지를 관리하는 Repository 서비스
