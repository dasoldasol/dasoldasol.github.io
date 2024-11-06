---
title: "[AWS] python 라이브러리 lambda layer 패키징"
excerpt: "정신차려 이 각박한 import error 지옥에서"
toc: true
toc_sticky: true
categories:
- AWS
- python
modified_date: 2024-10-14 09:36:28 +0900
---


### 배경 
- 간단한 내용은 lambda 함수를 작성하고 있는데, python에서는 늘 라이브러리가 필요하다. 특히 DB 드라이버같은 경우.
- 라이브러리가 포함된 함수 전체를 zip파일로 올리고는하지만 amazon linux2 환경인 lambda와 충돌나는 경우가 많다. docker를 써도 충돌나는 경우가 있다. 파이썬 진짜 미쳤음.

### 개요
- 필요 라이브러리를 모아 설치하고 'lambda layer'로 생성한다.
- amazon linux2 환경의 EC2 인스턴스 상에서 구축하여 충돌을 미연에 방지한다..

### 구축 환경

ec2 (amazon linux 2023)

### 1\. EC2 인스턴스에서 OpenSSL 설치

```bash
sudo dnf install -y openssl openssl-devel
```

### 2\. Python 3\.10 소스 다운로드

```bash
cd /usr/src
sudo curl -O https://www.python.org/ftp/python/3.10.12/Python-3.10.12.tgz
sudo tar xzf Python-3.10.12.tgz
cd Python-3.10.12
```

### 3\. Python 3\.10 빌드

OpenSSL 경로를 정확히 지정하여 Python 빌드. OpenSSL이 제대로 설치된 후에 다음 명령을 실행

```bash
sudo ./configure --enable-optimizations --with-openssl={/usr/include/openssl}
```

openssl 경로반드시 파악하여(which openssl) 경로 작성해야 에러 안남.

### 4\. Python 빌드 및 설치

```bash
sudo make altinstall
```

### 5\. Python 3\.10 확인 \& SSL 모듈 확인

```bash
python3.10 --version
python3.10 -m ssl
```

### 6\. 가상환경 생성 및 `psycopg2-binary` 설치

```bash
python3.10 -m venv psycopg2-env
source psycopg2-env/bin/activate
pip install --upgrade pip  # pip을 최신 버전으로 업데이트
pip install psycopg2-binary
```

### 7\. 레이어 디렉토리 구조 생성

AWS Lambda 레이어를 만들기 위한 디렉토리 구조를 설정. 반드시 /python 내부에 있어야함

```bash
mkdir -p layer/python/lib/python3.10/site-packages
cp -r psycopg2-env/lib/python3.10/site-packages/* layer/python/lib/python3.10/site-packages
```

### 8\. 레이어 압축

```bash
cd layer
zip -r psycopg2_layer.zip python
```

### 9\. AWS CLI를 사용하여 레이어 업로드

```bash
aws lambda publish-layer-version \
    --layer-name psycopg2-binary \
    --zip-file fileb://psycopg2_layer.zip \
    --compatible-runtimes python3.10 \
    --license-info "MIT" \
    --region ap-northeast-2
```

or S3에 파일 업로드

```bash
aws s3 cp psycopg2-layer.zip s3://{BUCKET_NAME}/stat/psycopg2-layer.zip
```
