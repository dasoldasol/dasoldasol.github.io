---
title: "[보안]Lambda 환경변수 전송중 암호화 가이드"
excerpt : "Lambda 환경변수의 민감정보를 암호화 저장하고 복호화해서 꺼내쓰자 "
toc: true
toc_sticky: true
categories:
  - AWS
  - 보안
modified_date: 2025-10-19 09:36:28 +0900
---
# 목적 
- AWS Lambda에서 '환경변수' 전송 중 암호화 기능을 활성화한다.
- Lambda 함수의 환경변수는 함수 코드를 변경할 필요 없이 구성 설정을 저장하는 데 사용되는 키-값 쌍이다.
- 암호, 토큰 및 액세스 키와 같은 중요한 정보를 저장하는 Lambda 함수 환경변수가 전송 중 암호화 기능을 활성화되지 않은 경우 전송 중에 데이터가 노출될 위협이 생기게 되며, 이는 통신을 가로챌 수 있는 모든 사람이 잠재적으로 데이터를 읽거나 수정하거나 오용할 수 있으므로 보안 위협이 될 수 있다.
- 민감하고 중요한 데이터를 저장하는 Lambda 함수 환경 변수를 처리할 때 함수에 동적으로 전달하는 데이터를 악의적인 사용자의 무단 액세스로부터 보호하기 위해 암호화한다.

# 가이드 
## KMS 키 생성 
- [KMS] > [고객관리형키] > 생성
- 기본 설정 대칭키로 생성

## KMS 권한 추가
- Lambda 역할에 KMS 접근 정책을 만들어 추가한다.
- **KMSLambdaExecution**
  ```json
    {
  	"Version": "2012-10-17",
  	"Statement": [
  		{
  			"Effect": "Allow",
  			"Action": [
  				"kms:Decrypt",
  				"kms:DescribeKey"
  			],
  			"Resource": "arn:aws:kms:ap-northeast-2:{AWS_ACCOUNT_ID}:key/{KMS-KEY-UUID}"
  		}
  	]
  }
  ```

## 암호화 
- 함수 진입 > [구성] > [환경변수] > 전송중 암호화 체크 및 암호화

  <img width="1138" height="799" alt="image" src="https://github.com/user-attachments/assets/d4ecd4da-4468-4aeb-9f09-9a9938f7192b" />

## 복호화 
- 환경변수는 복호화하여 **전역변수**로 사용함

### python

  ```python
  import os
  import boto3
  from base64 import b64decode
  from botocore.exceptions import ClientError
  
  
  def decrypt_env(var_name: str) -> str:
      ENCRYPTED = os.environ[var_name]
      DECRYPTED = boto3.client('kms').decrypt(
      CiphertextBlob=b64decode(ENCRYPTED),
      EncryptionContext={'LambdaFunctionName': os.environ['AWS_LAMBDA_FUNCTION_NAME']})['Plaintext'].decode('utf-8')
      return DECRYPTED
      
  
  # ===== 환경 변수 설정 =====
  DB_HOST = decrypt_env('DB_HOST')
  DB_PORT = decrypt_env('DB_PORT')
  DB_USER = decrypt_env('DB_USER')
  DB_PASSWORD = decrypt_env('DB_PASSWORD')
  DB_NAME = decrypt_env('DB_NAME')
  BUCKET_NAME = decrypt_env('BUCKET_NAME')
  ```

### node.js

  ```javascript
  import { KMSClient, DecryptCommand } from "@aws-sdk/client-kms"

  const client = new KMSClient({ region: process.env.AWS_REGION || "ap-northeast-2", });
  
  async function decryptEnvVar(name) {
    try{
      const encrypted = process.env[name];
      if(!encrypted){
        throw new Error(`Missing encrypted env var: ${name}`);
      }
  
      const req = {
        CiphertextBlob: Buffer.from(encrypted, 'base64'),
        EncryptionContext: {
          LambdaFunctionName: process.env['AWS_LAMBDA_FUNCTION_NAME'],
        },
      };
  
      const command = new DecryptCommand(req);
      const response = await client.send(command);
      const decrypted = new TextDecoder().decode(response.Plaintext);
  
      process.env[name] = decrypted;
      return decrypted;
      }catch (err){
        console.log(`Error decrypting env var: ${name}`, err);
        throw err;
      }
    }
  
  async function decryptAll(names){
    return await Promise.all(names.map(decryptEnvVar));
  }
  
  await decryptAll([
    "WAS_PORT",
    "DB_HOST",
    "DB_DATABASE",
    "DB_USER",
    "DB_PASSWORD",
    "DB_PORT",
  ]);
  ```
