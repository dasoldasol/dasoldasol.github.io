---
title: "[AWS] S3 대용량 파일 리스트 조회 list_objects_v2"
excerpt: "list_objects_v2 paginator를 이용하여 여러 파티션으로 분할된 100만개 이상의 파일 리스트 조회"
toc: true
toc_sticky: true
categories:
- AWS 
modified_date: 2023-08-03 09:36:28 +0900
---
## 개요
- 데이터 엔지니어로 있다보면 s3에 쌓아놓은 파일들을 모아서 집계해달라는 요구가 있는데.. 그때 맨처음으로 하는게 파일이 얼마나 쌓였는지 등등의 파일 EDA를 간략하게 진행하는 것.
- S3 파일 리스트를 조회하는데 1000개 이상을 조회하려면 paginator가 필요


## 요구사항
- 각 단지 코드(site_code)별로 파일 리스트를 출력하여 dict에 저장한다.
- 기존 파일 형태
  - `BUCKET_NAME/dev/table_name=dc_distribution/site_code=02010013/year=2022/month=11/day=07/dc-distribution-2022-11-07-13-30-00.json`
  - 파티셔닝, 버킷 하나에 단지 에너지 로그/단지 월패드 로그/단지 입출입 로그 등등 모두 있고 prefix로 구분
  - 대상 파티션인 /table_name=dc_distribution/ 이 파티션에만 10TB 

## S3 file list pagination
``` python
import boto3
from tqdm import tqdm

s3 = boto3.client('s3',
aws_access_key_id=ACCESS_KEY_ID,
aws_secret_access_key=ACCESS_SECRET_KEY,
)
bucket_name='BUCKET_NAME'
prefix = 'dev/table_name=dc_distribution/site_code='
site_code = ['02010012', '02010013', '02010016', '02010017', '02010021'...]
prefix_lst = [prefix+cd+'/' for cd in site_code]

paginator = s3.get_paginator('list_objects_v2')
site_dict = {}
for pfx in tqdm(prefix_lst):
    key = pfx.split('/')[-2].split('=')[-1] # dict의 key인 site_code뽑는 것
    files = []
    pages = paginator.paginate(Bucket=bucket_name, Prefix=pfx)
    for page in pages:
        for obj in page['Contents']:
            files.append(obj['Key'])
    site_dict[key] = files
```

## 번외) S3 awscli 명령어 
```
!aws s3 ls s3://BUCKET_NAME/dev/table_name=dc_distribution/ --recursive| wc -l # 전체 수집량
```
