---
title: "serverless framework에서 python 쓰기"
excerpt: 'sls-python-requirements 플러그인으로 파이썬 패키징하기'
toc: true
toc_sticky: true
categories:
- AWS
- serverless 
modified_date: 2020-10-01 10:36:28 +0900
---
이전편 : [serverless framework 환경 설정 serverless.yml](https://dasoldasol.github.io/aws/serverless/sls-yml/)

## 배경 
- python을 Lambda에서 쓰려면 패키징하고.. zip파일로 만들고.. 업로드하고.. 그런 복잡한 작업들이 포함된다. 
- serverless 프레임워크에서 **sls-python-requirements** 플러그인을 사용하면, 배포시 필요한 파이썬 라이브러리를 패키징해준다.

## 1. python 가상환경 생성 
프로젝트에 필요한 라이브러리만 가져가기 위해, 가상환경을 생성한다. 
```shell
virtualenv venv --python=python3
```
```
created virtual environment CPython3.8.5.final.0-64 in 6858ms
  creator CPython3Windows(dest=C:\Users\icontrols\PycharmProjects\anoicos-data-pipeline\venv, clear=False, no_vcs_ignore=False, global=False)
  seeder FromAppData(download=False, pip=bundle, setuptools=bundle, wheel=bundle, via=copy, app_data_dir=C:\Users\icontrols\AppData\Local\pypa\virtualenv)
    added seed packages: pip==21.0.1, setuptools==54.2.0, wheel==0.36.2
  activators BashActivator,BatchActivator,FishActivator,PowerShellActivator,PythonActivator,XonshActivator
```
생성한 가상환경을 activate한다.   
**리눅스**    
```shell
source venv/scripts/activate
```
**윈도우**
```shell
call venv/scripts/activate
```
## 2. 필요 라이브러리 install
필요한 python 라이브러리를 install한다. 테스트를 위해 간단히 numpy 라이브러리만 설치해본다.
```shell
(venv) > pip install numpy
```
        
    
이 라이브러리를 테스트할 handler.py도 작성한다.     
**handler.py**
```python
# handler.py

import numpy as np


def main(event, context):
    a = np.arange(15).reshape(3, 5)

    print("Your numpy array:")
    print(a)


if __name__ == "__main__":
    main('', '')
```
로컬에서 이 파일을 실행해보면 잘 실행되는 것을 확인할 수 있다. 
```shell
(venv) > python handler.py
```
```
Your numpy array:
[[ 0  1  2  3  4]
 [ 5  6  7  8  9]
 [10 11 12 13 14]]
```
## 3. 필요 라이브러리 freeze
플러그인이 참조할 requirements.txt를 생성한다. 
```shell
(venv) > pip freeze > requirements.txt
```
## 4. serverless-python-requirements 플러그인 설치 
```shell
(venv) > npm init
(venv) > npm install --save serverless-python-requirements
```
## 5. yml 파일에 설정 추가 
```yaml
service: sncr-data-collectors

frameworkVersion: "2"

#### 플러그인 추가 #########################
plugins:
  - serverless-python-requirements

custom:
  pythonRequirements:
    dockerizePip: non-linux # 윈도우 환경에서 사용시 필수 기입 
    slim: true # non win32인 경우 적용됨, 인스톨 패키지에서 캐시 등을 삭제해준다
    layer: true # 이걸 true로 바꿔주고 각 함수에서 참조하면 된다. numpy, pandas같은 크기가 큰 라이브러리 쓸 때 필수.
    noDeploy: # 배포하지 않는 라이브러리 기술
      - pip
      - setuptool
      - boto3
      - botocore
      - jmespath
      - s3transfer
      - dateutil
      - docutils
      - python_dateutil
      - six
      - urllib3
############################################

provider:
  name: aws
  runtime: python3.8
  stage: dev
  region: ap-northeast-2


package:
  individually: true

## 테스트 function
functions:
  numpy:
    handler: handler.main
    layers:
      - Ref: PythonRequirementsLambdaLayer # 아까 layer : true 를 참조하는 부분
```
## 6. 배포 및 테스트 
이제 저 설정으로 배포하면 yml파일에 설정한 function이 lambda로 배포된다. 
```shell
(venv) > sls deploy
```
local invoke를 통해 함수가 잘 배포됐는지 콘솔에 접속하지 않고도 확인 가능하다. 
```shell
(venv) > serverless invoke local --function numpy
Your numpy array:

[[ 0  1  2  3  4]
 [ 5  6  7  8  9]
 [10 11 12 13 14]]
null
```