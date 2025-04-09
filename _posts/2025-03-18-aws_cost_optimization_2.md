---
title: "[AWS] 비용 최적화 프로젝트_(2)EC2 기동/정지 스케줄링"
excerpt: "EC2를 안쓰는 시간에 끄면 얼마나 아낄까?"
toc: true
toc_sticky: true
categories:
  - AWS
  - Cloud Cost Optimization
modified_date: 2025-03-18 09:36:28 +0900
---

## 이 글의 목적과 커버 범위 

- 스테이징 혹은 테스트 EC2를 안 쓰는 시간에는 잠시 정지하여 비용을 아끼기 위함 
- 이 글은 철저히 AWS 상에서의 문제를 다루며, EC2 위에 어플리케이션 단으로 올라간 프로그램 자동 재시작 명령어는 쓰지 않았음 

## 1. 대상 EC2에 Tag 설정하기 
- 인스턴스 태그에 Key가 AutoStopStart이고 Value가 True인 태그 생성
- 태그를 이용하여 Lambda에서 스케줄링 작업이 진행되게한다.

  ![image](https://github.com/user-attachments/assets/b2c112ef-5369-45db-817a-f43b924ac60f)

## 2. EventBridge, Lambda로 스케줄링 함수 작성
### 스케줄링 상세 내용
- 월~금 저녁 9시 EC2 기동 중지
- 월~금 오전 6시 EC2 기동 시작
- 위의 조건으로 토~일은 자연스럽게 기동 중지된 상태

### 중지 스케줄링 
- 내용 : 월~금 저녁 9시 EC2Stop
- 중지 스케줄링 함수 Lambda
  
  ```python
  import boto3
  import logging
  import os
  from typing import List, Dict, Any
  
  # Logger 설정
  logger = logging.getLogger(__name__)
  logger.setLevel(logging.INFO)
  
  # AWS 리전 설정 (Lambda 실행 리전 자동 감지)
  region = os.environ.get("AWS_REGION", "ap-northeast-2")
  ec2 = boto3.client("ec2", region_name=region)
  
  def ec2_stop() -> None:
      """
      'AutoStopStart' 태그가 'True'로 설정된 모든 실행 중인 EC2 인스턴스를 정지하는 함수
      """
      filters = [
          {"Name": "tag:AutoStopStart", "Values": ["True", "true", "TRUE"]},  # 대소문자 모두 허용
          {"Name": "instance-state-name", "Values": ["running"]}  # 'Running' → 'running'로 통일
      ]
  
      try:
          # 실행 중인 인스턴스 조회
          response = ec2.describe_instances(Filters=filters)
          running_instances: List[str] = []
  
          for reservation in response.get("Reservations", []):
              for instance in reservation.get("Instances", []):
                  running_instances.append(instance["InstanceId"])
  
          logger.info(f"Total running instances found: {len(running_instances)}")
  
          if running_instances:
              ec2.stop_instances(InstanceIds=running_instances)
              logger.info(f"Stopping instances: {running_instances}")
          else:
              logger.info("No running instances found to stop.")
  
      except Exception as e:
          logger.error(f"Error stopping EC2 instances: {str(e)}")
  
  def lambda_handler(event: Dict[str, Any], context: object) -> None:
      """
      AWS Lambda 핸들러 함수
      """
      logger.info("Lambda function started.")
      ec2_stop()
      logger.info("Lambda function execution completed.")
  ```

  - Lambda 트리거 EventBridge 설정 사항 : Lambda 기본 시간은 UTC이므로 +09:00 하여 cron job 작성한다.

    ```sh
    cron(0 12 ? * 2-6 *)
    ```

### 기동 스케줄링 
- 내용 : 월~금 오전 6시 EC2 기동 시작
- 중지 스케줄링 함수 Lambda

  ```python
  import boto3
  import logging
  import os
  from typing import List, Dict, Any
  
  # Logger 설정
  logger = logging.getLogger(__name__)
  logger.setLevel(logging.INFO)
  
  # AWS 리전 설정 (Lambda 실행 리전 자동 감지)
  region = os.environ.get("AWS_REGION", "ap-northeast-2")
  ec2 = boto3.client("ec2", region_name=region)
  
  def ec2_start() -> None:
      """
      'AutoStopStart' 태그가 'True'로 설정된 모든 정지된 EC2 인스턴스를 시작하는 함수
      """
      filters = [
          {"Name": "tag:AutoStopStart", "Values": ["True", "true", "TRUE"]},  # 대소문자 모두 허용
          {"Name": "instance-state-name", "Values": ["stopped"]}  # 'Stopped' → 'stopped'로 통일
      ]
  
      try:
          # 정지된 인스턴스 조회
          response = ec2.describe_instances(Filters=filters)
          stopped_instances: List[str] = []
  
          for reservation in response.get("Reservations", []):
              for instance in reservation.get("Instances", []):
                  stopped_instances.append(instance["InstanceId"])
  
          logger.info(f"Total stopped instances found: {len(stopped_instances)}")
  
          if stopped_instances:
              ec2.start_instances(InstanceIds=stopped_instances)
              logger.info(f"Starting instances: {stopped_instances}")
          else:
              logger.info("No stopped instances found to start.")
  
      except Exception as e:
          logger.error(f"Error starting EC2 instances: {str(e)}")
  
  def lambda_handler(event: Dict[str, Any], context: object) -> None:
      """
      AWS Lambda 핸들러 함수
      """
      logger.info("Lambda function started.")
      ec2_start()
      logger.info("Lambda function execution completed.")

  ```

- Lambda 트리거 EventBridge 설정 사항 : Lambda 기본 시간은 UTC이므로 +09:00 하여 cron job 작성한다.

    ```sh
    cron(0 21 ? * 1-5 *)
    ```

## 비용 절감 결과 
- 비용 절감 예상안은 월 20만원 아끼는 건데, 청구서 나오면 다시 돌아오겠다..
  

  
