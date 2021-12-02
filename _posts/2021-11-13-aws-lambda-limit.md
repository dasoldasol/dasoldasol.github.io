---
title: "AWS Lambda limit 극복방안"
excerpt: "AWS Lambda limit 극복방안"
toc: true
toc_sticky: true
categories:
- AWS 
modified_date: 2021-11-13 09:36:28 +0900
---
# 개요

람다는 배포시에 아래와 같은 용량 제한이 있다

* 50mb 제한 : 압축파일, 직접  업로드
* 250mb 제한 : 일반파일, 레이어포함(레이어 1개당 50mb, 5개까지 사용가능)

데이터분석, 기계학습을 위한 람다 함수 작성시 필요한 sklearn 등의 파이선 패키지는 용량이 커서 리밋을 넘는다

# 솔루션

이 문제를 해결하기 위한 방법 세가지 중 마지막 컨테이너 활용법을 제외한 두가지를 정리하였다.

* /tmp 폴더 이용
* EFS 이용
* 컨테이너 활용

## /tmp 폴더 이용, 512mb 제한

람다 내부의  tmp 폴더를 이용하여 512mb 까지의 패키지를 활용할 수 있다
절차는 아래와 같다

* [리눅스 환경]에서 특정 폴더에 설치할 패키지를 pip install

``` bash
# ex)
pip install sklearn -t lib_sklearn/
```

* 다운로드된 패키지 폴더를 압축

``` bash
# ex)
# zip 설치
sudo apt install zip
# 폴더 압축
zip -r sklearn.zip lib_sklearn/
```

* 압축파일을 s3에 업로드
* 람다 함수 작성(함수 최상단에 작성해야 한다)

``` python
#ex)
import os, zipfile
import sys
import boto3
s3 = boto3.resource('s3')
s3.meta.client.download_file('hdci-ambt-preden-artifact', 'python-packages/sklearn.zip', '/tmp/sklearn.zip')
os.chdir('/tmp/')
with zipfile.ZipFile('sklearn.zip', 'r') as zip:
    zip.extractall()
#압축 해제후 syspath를 등록해야함 이전에 등록하면 정상동작하지 않음
sys.path.insert(0, '/tmp/lib_sklearn')
#import는 lambda_handler 함수 위에 최상단에 선언해야함
import sklearn
import joblib
```

## EFS 이용

* EFS File system을 생성한다, 주의해야할 점은 vpc와 subnet, security grourp이 사용할 lamba와 일치해야한다
* 파일 시스템을 생성하였으면 아래 그림을 참고해서 access point 를 생성한다

![image.png](https://dasoldasol.github.io/assets/images/image/lambda-limit-1.png)

* EFS에 패키지를 설치하기 위해 EFS와 동일한 vpc에 있는 ec2를 활용하여 ssh로 접속한다
    * 본 프로젝트에서는 앰비언트용 배스천 ec2에 접근해서 사용하였다
* security group에서 inbound rule에 nfs 접근을 허용한다

![image.png](https://dasoldasol.github.io/assets/images/image/lambda-limit-1-1.png)

* ec2 ssh에 접근하였으면 efs를 마운트한다

``` bash
#efs mount helper 설치
sudo yum install -y amazon-efs-utils
#efs 폴더 생성
sudo mkdir efs
# efs를 마운트한다
# 마운트 커맨드는 efs filesystem에서 생성한 efs를 선택하고 attach 버튼을 누른다
# using the efs mount helper 항목의 커맨드를 복사한다
sudo mount -t efs -o tls fs-70b03110:/ efs
# 파이선 패키지를 설치한다
pip install sklearn -t /efs/lib_sklearn/
```

* efs 설정 후 람다를 생성한다
* 생성시에  vpc와 subnet, security group를 efs와 일치시켜야한다(같은 네트워크에 있어야 한다)
* 생성 후 conriguration  항목의 filesystem으로 가서 아래 이미지를 참고하여 file system을 등록한다

![image.png](https://dasoldasol.github.io/assets/images/image/lambda-limit-2.png)

* 람다 함수에서 sys.path를 추가하고 패키지를 import 한다

``` python
import json
import os
import sys
sys.path.insert(0, '/mnt/efs/lib_sklearn')
import sklearn
```
<br>
# 장단점 비교

|  | /tmp | EFS |
| --- | --- | --- |
| 장점 | <ul><li>vpc 설정을 하지 않아도 된다</li><li>비교적 설정이 간편하다</li></ul> | <ul><li>용량의 제한이 없다</li><li>한번 설정한 후에는 실행시마다 다운로드 및 압축해제 절차가 없으므로 속도가 비교적 빠르다</li></ul> |
| 단점 | <ul><li>512mb를 넘기지 못한다</li><li>함수 실행시마다 큰 용량을 다운로드 받고 압축을 해제하는데 소요시간이 걸린다</li></ul> | <ul><li>설정이 복잡하다(vpc 설정 등)</li></ul> |