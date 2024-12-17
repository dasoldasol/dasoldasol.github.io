---
title: "[아키텍쳐] 월배치 Lambda 함수 자동화 - 이메일 알람까지"
excerpt: ""
toc: true
toc_sticky: true
categories:
- DataPipeline
- Architecture
modified_date: 2024-12-05 08:36:28 +0900
---
## 개요 
- 매월 1일 오전 1시에 각 빌딩별 분석 배치 실행

## 흐름도

![image](https://github.com/user-attachments/assets/6434b2dd-b819-403b-8c8d-1ed1fea98d2d)

- EventBridge : cron job으로 매월 1일에 오전 1시에 배치작업을 트리거함 

- stat-prep : 마스터 테이블 동기화. 
    - 빌딩 목록 최신화하여 저장(stat_dimension) : 새로 추가된 빌딩이 있는 경우 빌딩 마스터 정보 저장 
    - 통계 주기 최신화하여 저장(stat_period)
    - 해당 작업 완료 시, 분석 코드 병렬 invoke 

- stat-analysis: NLP 분석하여 건물별 분석 결과 DB 저장 
    - java 환경 설정 
    - 전달의 1일~말일로 필터링 날짜 설정 
    - 분석대상 데이터 가져오기 
    - NLP 분석 및 분석 결과 적재 

- 이 외 자원 
    - psycopg2-layer, konlpy-layer : 파이썬 라이브러리 계층 
    - java_package : java JVM 환경 설정

- **분석 코드랑 분석 환경은 다음에 다뤄보기로 하고 자주 쓰는 데이터 파이프라인 설정을 정리하고자 한다.**

## 배치 스케줄 작업 (EventTrigger)

- EventTrigger를 생성하여 Lambda Event에 추가해주면 된다.
- EventTrigger Cron식    

  ```
  0 16 L * ? *
  ```

  - 매월 마지막 날, UTC 기준 오후 4시 0분에 실행 = KST 기준 다음 날(매월 1일) 새벽 1시 0분에 실행
  - AWS EventTrigger 서버 시간은 항상 UTC이므로 KST에 맞춰 표시하는 것이 중요하다. 이는 Lambda 내에서 시간 관련 작업을 할 때도 마찬가지.
 
## Lambda 함수에서 다른 Lambda 함수 실행하기 

- stat-prep함수의 작업이 끝난 후 분석 모듈인 stat-analysis를 실행하도록 한다.
- stat-prep Lambda 함수 코드    

  ```python
  from datetime import datetime, timedelta
    from dateutil.relativedelta import relativedelta
    from zoneinfo import ZoneInfo  # KST 변환용
    import os
    import psycopg2
    import boto3
    import json
    
    def lambda_handler(event, context):
        # Lambda 클라이언트 생성
        lambda_client = boto3.client('lambda')
    
        try:
            # 1. building 테이블 변경사항을 stat_dimension에 저장
            insert_stat_dimension(cur)
            
            # 2. 직전 달의 기간을 stat_period에 저장
            insert_stat_period(cur)
    
            conn.commit()
    
            # 3. 분석 함수 invoke 
            event_data = {"message": "Test message from prep"}
            invoke_lambda(lambda_client, 'stat-analysis-01', event_data)
            invoke_lambda(lambda_client, 'stat-analysis-02', event_data)
            
        except Exception as e:
            conn.rollback()
            print("Error:", e)
            
        finally:
            cur.close()
            conn.close()
    
    def insert_stat_dimension(cur):
        ## 중략
    
    def insert_stat_period(cur):
        # UTC -> KST 변환
        utc_now = datetime.utcnow()
        today = utc_now.replace(tzinfo=ZoneInfo("UTC")).astimezone(ZoneInfo("Asia/Seoul"))
        ## 중략 
    
    def invoke_lambda(lambda_client, function_name, event):
        try:
            response = lambda_client.invoke(
                FunctionName=function_name,
                InvocationType='Event', # 테스트시에는 'RequestResponse'로 테스트 
                Payload=json.dumps(event)
            )
            print(f"Invoked {function_name} with response: {response}")
        except Exception as e:
            print(f"Error invoking {function_name}: {e}")
  ```

## 분석 후 이메일 알람 보내기(SNS)

- Lambda에서 에러가 발생 하거나 혹은 알람을 보내고 싶을 때 SNS(Simple Notification System)를 연동하면 된다.
- 선제조건 : SNS 구독 등록 
- Lambda 함수 코드

  ```python
  import json
  import boto3
  import psycopg2
  import csv
  import os
  from io import StringIO
  from datetime import datetime, timedelta, timezone
  
  KST = timezone(timedelta(hours=9))
  
  S3_BUCKET = os.environ['S3_BUCKET']
  SNS_TOPIC_ARN = os.environ['SNS_TOPIC_ARN']  # SNS 주제 ARN
  
  def send_sns_message(message):
      sns_client = boto3.client('sns')
      response = sns_client.publish(
          TopicArn=SNS_TOPIC_ARN,
          Message=message
      )
      return response
  
  def lambda_handler(event, context):
      
      s3 = boto3.client('s3')

      ## 중략 : 분석 코드 ##############
  
      output_file_key = f'stat/{start_date}-{end_date}.csv'
      s3.put_object(Bucket=S3_BUCKET, Key=output_file_key, Body=csv_buffer.getvalue().encode('utf-8-sig'))
  
      # S3 URL 생성 (콘솔 로그인 후 접근 가능)
      s3_url = f"https://{S3_BUCKET}.s3.amazonaws.com/{output_file_key}"
      message = f"분석 리포트가 업로드되었습니다. 링크 클릭 시 다운로드: {s3_url}"
      
      # SNS로 메시지 전송
      send_sns_message(message)
  
      return {
          'statusCode': 200,
          'body': json.dumps('Success')
      }

  ```
