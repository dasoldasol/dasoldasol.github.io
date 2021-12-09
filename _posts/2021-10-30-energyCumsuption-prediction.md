---
title: "Linear, RF, XGB, LGB를 이용한 아파트 에너지 사용량 예측 모델링"
excerpt: "Linear, RF, XGB, LGB를 이용한 아파트 에너지 사용량 예측 모델링"
toc: true
toc_sticky: true
categories:
- MachineLearning
- 에너지수요예측
modified_date: 2021-10-30 09:36:28 +0900
---
추후 참고용으로 올리는 energy consumption
# Configuration
## Install Libraries
```python
!pip install natsort
!pip install pytictoc
!pip install pymysql
!pip install lightgbm
!pip install xgboost
!pip install pytictoc
```

    Collecting natsort
      Downloading natsort-8.0.0-py3-none-any.whl (37 kB)
    Installing collected packages: natsort
    Successfully installed natsort-8.0.0
    [33mWARNING: You are using pip version 21.2.4; however, version 21.3.1 is available.
    You should consider upgrading via the '/home/ec2-user/anaconda3/envs/python3/bin/python -m pip install --upgrade pip' command.[0m
    Collecting pytictoc
      Downloading pytictoc-1.5.2-py2.py3-none-any.whl (4.0 kB)
    Installing collected packages: pytictoc
    Successfully installed pytictoc-1.5.2
    [33mWARNING: You are using pip version 21.2.4; however, version 21.3.1 is available.
    You should consider upgrading via the '/home/ec2-user/anaconda3/envs/python3/bin/python -m pip install --upgrade pip' command.[0m
    Collecting pymysql
      Downloading PyMySQL-1.0.2-py3-none-any.whl (43 kB)
    [K     |████████████████████████████████| 43 kB 1.1 MB/s eta 0:00:01
    [?25hInstalling collected packages: pymysql
    Successfully installed pymysql-1.0.2
    [33mWARNING: You are using pip version 21.2.4; however, version 21.3.1 is available.
    You should consider upgrading via the '/home/ec2-user/anaconda3/envs/python3/bin/python -m pip install --upgrade pip' command.[0m
    Collecting lightgbm
      Downloading lightgbm-3.3.1-py3-none-manylinux1_x86_64.whl (2.0 MB)
    [K     |████████████████████████████████| 2.0 MB 1.7 MB/s eta 0:00:01
    [?25hRequirement already satisfied: numpy in /home/ec2-user/anaconda3/envs/python3/lib/python3.6/site-packages (from lightgbm) (1.19.5)
    Requirement already satisfied: wheel in /home/ec2-user/anaconda3/envs/python3/lib/python3.6/site-packages (from lightgbm) (0.36.2)
    Requirement already satisfied: scikit-learn!=0.22.0 in /home/ec2-user/anaconda3/envs/python3/lib/python3.6/site-packages (from lightgbm) (0.24.1)
    Requirement already satisfied: scipy in /home/ec2-user/anaconda3/envs/python3/lib/python3.6/site-packages (from lightgbm) (1.5.3)
    Requirement already satisfied: joblib>=0.11 in /home/ec2-user/anaconda3/envs/python3/lib/python3.6/site-packages (from scikit-learn!=0.22.0->lightgbm) (1.0.1)
    Requirement already satisfied: threadpoolctl>=2.0.0 in /home/ec2-user/anaconda3/envs/python3/lib/python3.6/site-packages (from scikit-learn!=0.22.0->lightgbm) (2.1.0)
    Installing collected packages: lightgbm
    Successfully installed lightgbm-3.3.1
    [33mWARNING: You are using pip version 21.2.4; however, version 21.3.1 is available.
    You should consider upgrading via the '/home/ec2-user/anaconda3/envs/python3/bin/python -m pip install --upgrade pip' command.[0m
    Collecting xgboost
      Downloading xgboost-1.5.1-py3-none-manylinux2014_x86_64.whl (173.5 MB)
    [K     |████████████████████████████████| 173.5 MB 15 kB/s /s eta 0:00:01     |█████████████████████████████▉  | 161.8 MB 153.1 MB/s eta 0:00:01
    [?25hRequirement already satisfied: numpy in /home/ec2-user/anaconda3/envs/python3/lib/python3.6/site-packages (from xgboost) (1.19.5)
    Requirement already satisfied: scipy in /home/ec2-user/anaconda3/envs/python3/lib/python3.6/site-packages (from xgboost) (1.5.3)
    Installing collected packages: xgboost
    Successfully installed xgboost-1.5.1
    [33mWARNING: You are using pip version 21.2.4; however, version 21.3.1 is available.
    You should consider upgrading via the '/home/ec2-user/anaconda3/envs/python3/bin/python -m pip install --upgrade pip' command.[0m
    Requirement already satisfied: pytictoc in /home/ec2-user/anaconda3/envs/python3/lib/python3.6/site-packages (1.5.2)
    [33mWARNING: You are using pip version 21.2.4; however, version 21.3.1 is available.
    You should consider upgrading via the '/home/ec2-user/anaconda3/envs/python3/bin/python -m pip install --upgrade pip' command.[0m



```python
import gc, sys, os, warnings
import pandas as pd
import numpy as np
from datetime import date,datetime
from natsort import natsorted
from scipy import stats 
from pytictoc import TicToc
import datetime
from sklearn.linear_model import LinearRegression, Ridge, Lasso, ElasticNet
from sklearn.svm import LinearSVR, SVR
from sklearn.model_selection import GridSearchCV, KFold
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor
from xgboost import XGBRegressor
from lightgbm import LGBMRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import MinMaxScaler
import pickle, joblib



os.getcwd() # working directory check
gc.collect() # garbage collect
warnings.filterwarnings('ignore')# 경고 출력하지 않음 -----------

# scipen 제거
pd.options.display.float_format = '{:.2f}'.format

#library versions
print('Pandas:', pd.__version__)
print('Numpy:', np.__version__)
```

    Pandas: 1.1.5
    Numpy: 1.19.5


## Data Connection
```python
# mysql connector를 사용하기 위한 모듈 선언
import pymysql

# mysql connection을 선언한다. 
#파라미터는 host는 접속 주소, user는 ID, passwd는 패스워드, database는 접속할 데이터 베이스이다.
conn = pymysql.connect(host="hostip",
                       user="user", passwd="password",
                       db='database',
                       charset='utf8')
```

## Pickle Read and Write function
```python
# Pickle Read and Write function

import boto3 
from io import BytesIO

def write_joblib(file, path):
    # Path is an s3 bucket
    if path[:5] == 's3://':
        s3_bucket, s3_key = path.split('/')[2], path.split('/')[3:]
        s3_key = '/'.join(s3_key)
        with BytesIO() as f:
            joblib.dump(file, f)
            f.seek(0)
            boto3.client("s3").upload_fileobj(Bucket=s3_bucket, Key=s3_key, Fileobj=f)
    # Path is a local directory 
    else:
        with open(path, 'wb') as f:
            joblib.dump(file, f)
            
def read_joblib(path):
    # Path is an s3 bucket
    if path[:5] == 's3://':
        s3_bucket, s3_key = path.split('/')[2], path.split('/')[3:]
        s3_key = '/'.join(s3_key)
        with BytesIO() as f:
            boto3.client("s3").download_fileobj(Bucket=s3_bucket, Key=s3_key, Fileobj=f)
            f.seek(0)
            file = joblib.load(f)
    # Path is a local directory 
    else:
        with open(path, 'rb') as f:
            file = joblib.load(f)
    
    return file
```

# Data Load
## Load DB data
```python
t = TicToc()
t.tic()  # 시작 시간

Day_Energy = pd.read_sql_query('select ENERGY_YEAR,ENERGY_MONTH,ENERGY_DAY,DONG,HO,ENERGY_USE01 from dayenergy',conn)\
.assign(ENERGY_YEAR= lambda x: x['ENERGY_YEAR'].astype('str'),
        ENERGY_MONTH= lambda x: x['ENERGY_MONTH'].astype('str'),
        ENERGY_DAY= lambda x: x['ENERGY_DAY'].astype('str'),
        DONG=lambda x: x['DONG'].astype('str'),
        HO=lambda x: x['HO'].astype('str'),
        ENERGY_USE01=lambda x: x['ENERGY_USE01'].astype('float'))\
.rename(columns={'ENERGY_YEAR' : 'year', 'ENERGY_MONTH' : 'month', 'ENERGY_DAY' : 'day',
                 'DONG' : 'dong','HO' : 'ho','ENERGY_USE01' : 'power'})
    
Day_Energy['date']= pd.to_datetime(Day_Energy['year']+'-'+Day_Energy['month']+'-'+Day_Energy['day'],format='%Y-%m-%d')
Day_Energy['week']= pd.to_datetime(Day_Energy['date']).dt.day_name()
Condition1=Day_Energy['week'].isin(['saturday','sunday'])
Day_Energy.loc[:,'weekend']=0
Day_Energy.loc[Condition1,'weekend']=1

Day_Energy['dongho']=  Day_Energy['dong']+'-'+Day_Energy['ho']
Day_Energy["floor"]=Day_Energy["ho"].str[:-2]

Day_Energy=Day_Energy.sort_values(by=['date','dongho'], axis=0)

# 세대 유형(평형) 추가
Day_Energy.loc[:,'type']='34Py'
Condition1= Day_Energy['dongho'].isin(['805_2803','806_2903','808_2809'])
Condition2= Day_Energy['dong'].isin(['811','812'])
Day_Energy.loc[Condition1,'type']='45Py'
Day_Energy.loc[Condition2,'type']='Private 36Py'

# 에너지 사용량 상하한 기준 값(하한 0이상, 상한 70)
Day_Energy=Day_Energy.assign(power= lambda x: x['power'].clip(0,70))

Day_Energy= Day_Energy.drop(['year','month','day','dong','ho' ],axis=1)
Day_Energy['date']=Day_Energy['date'].astype('str')

Day_Energy['date']=pd.to_datetime(Day_Energy['date'],format='%Y-%m-%d')
Day_Energy=Day_Energy.sort_values(by=['date','dongho'], axis=0)

Day_Energy=Day_Energy.assign(date=lambda x: x['date'].astype('str'))

t.toc('calculates loading time: ')  # 종료 시간
```

    calculates loading time:  35.181209 seconds.



```python
Day_Energy=Day_Energy.query('date <="2021-07-24"')
```

## Load API data
```python
# Holiday
import requests

def get_request_query(url, operation, params, serviceKey):
    import urllib.parse as urlparse
    params = urlparse.urlencode(params)
    request_query = url + '/' + operation + '?' + params + '&' + 'serviceKey' + '=' + serviceKey+'&_type=json'
    return request_query

t.tic()  # 시작 시간
# 요청 URL과 오퍼레이션
URL = 'http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService'
OPERATION = 'getRestDeInfo' # 국경일 + 공휴일 정보 조회 오퍼레이션
SERVICEKEY = 'PROVIDED_SERVICE_KEY'# 파라미터

Holiday=pd.DataFrame(columns=['dateKind', 'dateName', 'isHoliday', 'locdate', 'seq'])

for year in range(2018,2022):
    for month in range(1,13):
        if month<10:
            PARAMS = {'solYear':str(year), 'solMonth': '0'+str(month)}
        else:
            PARAMS = {'solYear':str(year), 'solMonth': str(month)}
        request_query = get_request_query(URL, OPERATION, PARAMS, SERVICEKEY)
        html= requests.get(request_query)
        dictr=html.json().get('response').get('body').get('items')

        if dictr !=  '':
            recs = dictr['item']
            from pandas.io.json import json_normalize
            df = json_normalize(recs)
            Holiday=pd.concat([Holiday, df], axis=0)

del(year, month, dictr, recs, df, request_query)

Holiday=Holiday.assign(date= pd.to_datetime(Holiday['locdate'].astype(str), format='%Y-%m-%d')).drop(['dateKind', 'locdate','seq' ], axis=1)
Holiday=Holiday.rename(columns={'dateName' : 'datename','isHoliday' : 'isholiday'})
Holiday=pd.merge(pd.DataFrame(data=pd.date_range(start = '2018-01-01', end ='2021-12-31', freq = 'd'), columns=['date']), 
                 Holiday, how='left', left_on='date', right_on='date')
Holiday['isholiday']=Holiday['isholiday'].replace(np.nan, 'N')
Holiday=Holiday.drop(['datename'], axis=1)
Holiday['isholiday'] = Holiday['isholiday'].map({'N':0,'Y':1})
Holiday= Holiday.assign(date=lambda x: x['date'].astype('str'))

t.toc('calculates loading time: ')  # 종료 시간
Holiday.head()
```

    calculates loading time:  13.397597 seconds.





<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>date</th>
      <th>isholiday</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>2018-01-01</td>
      <td>1</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2018-01-02</td>
      <td>0</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2018-01-03</td>
      <td>0</td>
    </tr>
    <tr>
      <th>3</th>
      <td>2018-01-04</td>
      <td>0</td>
    </tr>
    <tr>
      <th>4</th>
      <td>2018-01-05</td>
      <td>0</td>
    </tr>
  </tbody>
</table>
</div>




```python
# 24 절기
import requests
import pandas as pd

def get_request_query(url, operation, params, serviceKey):
    import urllib.parse as urlparse
    params = urlparse.urlencode(params)
    request_query = url + '/' + operation + '?' + params + '&' + 'serviceKey' + '=' + serviceKey+'&_type=json'
    return request_query

t.tic()  # 시작 시간

# 요청 URL과 오퍼레이션
URL = 'http://apis.data.go.kr/B090041/openapi/service/SpcdeInfoService'
OPERATION = 'get24DivisionsInfo' # 국경일 + 공휴일 정보 조회 오퍼레이션
SERVICEKEY = 'PROVIDED_SERVICE_KEY' # 파라미터

Season=pd.DataFrame(columns=['dateKind', 'dateName', 'isHoliday','kst', 'locdate', 'seq','sunLongitude'])

for year in range(2018,2022):
    for month in range(1,13):
        if month<10:
            PARAMS = {'solYear':str(year), 'solMonth': '0'+str(month)}
        else:
            PARAMS = {'solYear':str(year), 'solMonth': str(month)} 
        request_query = get_request_query(URL, OPERATION, PARAMS, SERVICEKEY)
        html= requests.get(request_query)
        dictr=html.json().get('response').get('body').get('items')

        if dictr !=  '':
            recs = dictr['item']
            from pandas.io.json import json_normalize
            df = json_normalize(recs)
            Season=pd.concat([Season, df], axis=0)

del(year, month, dictr, recs, df, request_query)

Season=Season.assign(date= pd.to_datetime(Season['locdate'].astype(str), format='%Y-%m-%d'))\
.drop(['dateKind','isHoliday', 'kst','locdate','seq','sunLongitude' ], axis=1)
Season.head()

Season= pd.DataFrame(Season)
Condition3 = [
    (Season['dateName'].isin(['입춘'])),
    (Season['dateName'].isin(['입하'])),
    (Season['dateName'].isin(['입추'])),
    (Season['dateName'].isin(['입동']))]
            
values = ['Spring', 'Summer', 'Fall','Winter']
Season['season'] = np.select(Condition3, values)
Season=Season.drop(['dateName'], axis=1)
Season['season']=Season['season'].replace(str(0), np.nan)
Season= Season.dropna()
Season=pd.merge(pd.DataFrame(data=pd.date_range(start = '2018-01-01', end ='2021-12-31', freq = 'd'), columns=['date']), 
                Season, how='left', left_on='date', right_on='date')
        
Season.loc[:,'season']= Season.fillna(method='ffill')
Season.loc[:,'season']= Season.fillna('Winter')
Season= Season.rename(columns={'dateName' : 'datename','sunLongitude' : 'sunlongitude'})
# Season= Season.drop(['sunlongitude'],axis=1)
Season= Season.assign(date=lambda x: x['date'].astype('str'))

t.toc('calculates loading time: ')  # 종료 시간
Season.head()
```

    calculates loading time:  4.834492 seconds.





<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>date</th>
      <th>season</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>2018-01-01</td>
      <td>Winter</td>
    </tr>
    <tr>
      <th>1</th>
      <td>2018-01-02</td>
      <td>Winter</td>
    </tr>
    <tr>
      <th>2</th>
      <td>2018-01-03</td>
      <td>Winter</td>
    </tr>
    <tr>
      <th>3</th>
      <td>2018-01-04</td>
      <td>Winter</td>
    </tr>
    <tr>
      <th>4</th>
      <td>2018-01-05</td>
      <td>Winter</td>
    </tr>
  </tbody>
</table>
</div>




```python
# Data 병합
result= pd.merge(Day_Energy, Holiday, how='left', left_on='date', right_on='date')\
.merge(Season, how='left', left_on='date', right_on='date')
# .merge(Forecast, how='left', left_on='date', right_on='date')

longterm_test= pd.merge(Season, Holiday, how='left', left_on='date', right_on='date')

result.head()
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>power</th>
      <th>date</th>
      <th>week</th>
      <th>weekend</th>
      <th>dongho</th>
      <th>floor</th>
      <th>type</th>
      <th>isholiday</th>
      <th>season</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>1.10</td>
      <td>2018-05-01</td>
      <td>Tuesday</td>
      <td>0</td>
      <td>801-1001</td>
      <td>10</td>
      <td>34Py</td>
      <td>0</td>
      <td>Spring</td>
    </tr>
    <tr>
      <th>1</th>
      <td>1.00</td>
      <td>2018-05-01</td>
      <td>Tuesday</td>
      <td>0</td>
      <td>801-1002</td>
      <td>10</td>
      <td>34Py</td>
      <td>0</td>
      <td>Spring</td>
    </tr>
    <tr>
      <th>2</th>
      <td>4.20</td>
      <td>2018-05-01</td>
      <td>Tuesday</td>
      <td>0</td>
      <td>801-1003</td>
      <td>10</td>
      <td>34Py</td>
      <td>0</td>
      <td>Spring</td>
    </tr>
    <tr>
      <th>3</th>
      <td>1.00</td>
      <td>2018-05-01</td>
      <td>Tuesday</td>
      <td>0</td>
      <td>801-1004</td>
      <td>10</td>
      <td>34Py</td>
      <td>0</td>
      <td>Spring</td>
    </tr>
    <tr>
      <th>4</th>
      <td>1.00</td>
      <td>2018-05-01</td>
      <td>Tuesday</td>
      <td>0</td>
      <td>801-1101</td>
      <td>11</td>
      <td>34Py</td>
      <td>0</td>
      <td>Spring</td>
    </tr>
  </tbody>
</table>
</div>




```python
# 메모리 정리
del (conn,URL,OPERATION, SERVICEKEY, PARAMS, html, values, Condition1, Condition2, Condition3, 
     Day_Energy, Season, Holiday)


gc.collect()
```




    0


# Data Preprocessing
## 결측치 처리

```python
result=result.query('date>="2019-01-01" ').dropna(axis=0)
abnormal=pd.DataFrame(result.loc[result.power<=0].groupby(['dongho']).date.agg(['size']))
abnormal.reset_index(inplace=True)

abnormal['ab_type']=np.where(abnormal['size']<=7,'단기공실','장기공실')
abnormal_list=abnormal.dongho

# 장기 공실 데이터 삭제
result=pd.merge(result, abnormal, how='left', on='dongho')
result=result.loc[result.ab_type!='장기공실'].drop(['size', 'ab_type'], axis=1)
# 단기 공실 데이터 평균으로 대체
result['power']= result.power.replace(0,result.power.mean() )


```


```python
# 메모리 정리
del (abnormal, abnormal_list)

gc.collect()
```




    12



## 범주형 변수 one-hot, 연속형 변수 Scaling
```python
# 전처리

t = TicToc()
t.tic()  # 시작 시간

household = result[['date', 'power', 'season', 'isholiday', 'week', 'weekend','type', 'floor', 'dongho']]

week_dummy = pd.get_dummies(household['week'])
household = household.join(week_dummy.add_prefix('week_'))

household['weekend'] = household['weekend'].astype(np.uint8)
household['isholiday'] = household['isholiday'].astype(np.uint8)

type_dummy = pd.get_dummies(household['type'])
household = household.join(type_dummy.add_prefix('type_'))
household['floor'] = household.floor.astype('int')

season_dummy = pd.get_dummies(household['season'])
household = household.join(season_dummy.add_prefix('season_'))

household = household.drop(
    ['week', 'type','season'], axis=1).set_index('date', drop=True)

# 변수형 지정
num_var = list( set([ col for col in household.columns if household[col].dtypes in(['float64']) ]))

# scale 저장
# scaler = MinMaxScaler().fit(household[num_var])
# joblib.dump(scaler, 'scaler.pkl')
scaler = joblib.load("scaler.pkl")

household[num_var] = scaler.transform(household[num_var])
household[num_var] = np.where(household[num_var] < 0, 0, household[num_var])

household['floor']= household['floor'].astype(np.int32)
household[num_var]= household[num_var].astype(np.float32).round(4)


forecast_horizon = 30
df_list = []  # 리스트 초기화
for dongho, group_data in household.groupby('dongho'):

    group_data['dongho'] = np.repeat(dongho, len(group_data))

    for i in range(1, forecast_horizon+1, 1):
        group_data['power_lag' + str(i)] = group_data.power.shift(i)

    group_data = group_data.dropna(axis=0)
    df_list.append(group_data)  # 리스트에 담아준다

household = pd.concat(df_list)

t.toc('calculates preprocessing time: ')  # 종료 시간
```

    calculates preprocessing time:  19.029327 seconds.


# Train or Load Model
## Linear Model
```python
t = TicToc()
t.tic()  # 시작 시간
# 모델 학습 및 저장: Linear_model
# linear_model = LinearRegression(fit_intercept=True).fit(
#     household.drop(['power', 'dongho'], axis=1), y=household.power)
# joblib.dump(linear_model, 'linear_model.pkl')

linear_model = joblib.load("linear_model.pkl")
t.toc('calculates fitting time: ')  # 종료 시간
```

    calculates fitting time:  0.000642 seconds.


## Random Forest
```python
t.tic()  # 시작 시간
# 모델 학습 및 저장: rf_model
# param_grid = {'n_estimators': np.arange(2, 20, 2), 'bootstrap': [True, False], 'max_features': np.arange(2, 14, 2),
#               'max_depth': np.arange(2, 14, 2), 'random_state': [2]}
# rf_model = GridSearchCV(RandomForestRegressor(), param_grid=param_grid,
#                                refit=True).fit(household.drop(['power', 'dongho'], axis=1), y=household.power)
# print('rf best parameter:', rf_model.best_params_,
#       'best score:', rf_model.best_score_.round(2))
# joblib.dump(rf_model, 'rf_model.pkl')

rf_model = joblib.load("rf_model.pkl") 
t.toc('calculates fitting time: ')  # 종료 시간
```

    calculates fitting time:  0.018461 seconds.


## XGBoost
```python
t.tic()  # 시작 시간
# 모델 학습 및 저장: xgb_model
# param_grid = {'eta': np.arange(0.1, 1, 0.1), 'max_depth': np.arange(
#     1, 20, 1), 'random_state': [2]}
# xgb_model = GridSearchCV(XGBRegressor(objective='reg:squarederror'), param_grid=param_grid,
#                                 refit=True).fit(household.drop(['power', 'dongho'], axis=1), y=household.power)
# print('xgb best parameter:', xgb_model.best_params_,
#       'best score:', xgb_model.best_score_.round(2))
# joblib.dump(xgb_model, 'xgb_model.pkl')

xgb_model = joblib.load("xgb_model.pkl")
t.toc('calculates fitting time: ')  # 종료 시간
```

    calculates fitting time:  0.356841 seconds.


## LGBMRegressor
```python
t.tic()  # 시작 시간
# 모델 학습 및 저장: lgb_model
# param_grid = {'learning_rate': np.arange(
#     0.1, 1, 0.1), 'max_depth': np.arange(1, 20, 1), 'random_state': [2]}
# lgb_model = GridSearchCV(LGBMRegressor(), param_grid=param_grid,
#                          refit=True).fit(household.drop(['power', 'dongho'], axis=1), y=household.power)
# print('lgb best parameter:', lgb_model.best_params_,
#       'best score:', lgb_model.best_score_.round(2))
# joblib.dump(lgb_model, 'lgb_model.pkl')

lgb_model = joblib.load("lgb_model.pkl")
t.toc('calculates fitting time: ')  # 종료 시간
```

    calculates fitting time:  0.006973 seconds.


# Model Validation
```python
#validation
household['linear_fitted'] = linear_model.predict(household.drop(['power','dongho'],axis=1))
household['rf_fitted'] = rf_model.predict(household.drop(['power','dongho','linear_fitted'],axis=1))
household['xgb_fitted'] = xgb_model.predict(household.drop(['power','dongho','linear_fitted','rf_fitted'],axis=1))
household['lgb_fitted'] = lgb_model.predict(household.drop(['power','dongho','linear_fitted','rf_fitted','xgb_fitted'],axis=1))
household= household[['power', 'linear_fitted','rf_fitted','xgb_fitted','lgb_fitted', 'dongho']]

household = household.assign(linear_fitted= lambda x: (x['linear_fitted']*(scaler.data_max_[0]-scaler.data_min_[0]))+scaler.data_min_[0],
                             rf_fitted= lambda x: (x['rf_fitted']*(scaler.data_max_[0]-scaler.data_min_[0]))+scaler.data_min_[0],
                             xgb_fitted= lambda x: (x['xgb_fitted']*(scaler.data_max_[0]-scaler.data_min_[0]))+scaler.data_min_[0],
                             lgb_fitted= lambda x: (x['lgb_fitted']*(scaler.data_max_[0]-scaler.data_min_[0]))+scaler.data_min_[0],
                             power= lambda x: (x['power']*(scaler.data_max_[0]-scaler.data_min_[0]))+scaler.data_min_[0])
```


```python
from sklearn.metrics import make_scorer, r2_score, mean_absolute_error, mean_squared_error, mean_squared_log_error

def precision(data,name,predict,origin):
    MAE = mean_absolute_error(data[origin],data[predict]).round(2)
    RMSE = np.sqrt(mean_squared_error(data[origin],data[predict])).round(2)
    CV_RMSE= 100*((np.sqrt(mean_squared_error(data[origin],data[predict]))/np.mean(data[origin])).round(2))
    MAPE = round(np.nanmean((abs(data[origin]-data[predict]))/(data[origin]))*100,2) 
    MAPE_adjust = round(np.mean((abs(data[origin]-data[predict]))/(data[origin]+1))*100,2)
    Max_AE = round(np.max(abs(data[origin]-data[predict])),2)
    Max_APE = round(np.nanmax(abs(data[origin]-data[predict])/data[origin])*100,2)
    dict=pd.DataFrame({'Model':name,'MAE': MAE, 'RMSE':RMSE, 'CV_RMSE':CV_RMSE, \
                       'MAPE': MAPE, 'MAPE_adjust': MAPE_adjust, 'Max_AE': Max_AE, 'Max_APE': Max_APE}.items()).transpose().drop(0)
    dict.columns=['Model','MAE', 'RMSE', 'CV_RMSE', 'MAPE', 'MAPE_adjust','Max_AE','Max_APE']
    return(dict)

def func(x):
    d = {}
    d['MAPE_mean'] = x['MAPE'].mean().round(2)
    d['MAPE_std'] = x['MAPE'].std().round(2)
    d['MAPE_max'] = x['MAPE'].max()
    d['MAPE_min'] = x['MAPE'].min()
    d['MAPE_range'] = x['MAPE'].max() - x['MAPE'].min()
    return pd.Series(d, index=['MAPE_mean', 'MAPE_std', 'MAPE_max', 'MAPE_min', 'MAPE_range'])
```


```python
eval_list = [] ## 리스트 초기화
dongho_list=[]
for dongho, group_data in household.groupby('dongho'):
    dongho_list.append(dongho)
    eval_list.append(precision(group_data.loc[group_data.power>1], 'linear','linear_fitted','power'))
    dongho_list.append(dongho)
    eval_list.append(precision(group_data.loc[group_data.power>1], 'rf','rf_fitted','power'))
    dongho_list.append(dongho)
    eval_list.append(precision(group_data.loc[group_data.power>1], 'xgb','xgb_fitted','power'))
    dongho_list.append(dongho)
    eval_list.append(precision(group_data.loc[group_data.power>1], 'lgb','lgb_fitted','power'))
    
    
Evaluation= pd.concat(eval_list)
Evaluation['dongho']=dongho_list
t.toc('calculates evaluating time: ') # 종료 시간
Evaluation
```

    calculates evaluating time:  173.691505 seconds.





<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>Model</th>
      <th>MAE</th>
      <th>RMSE</th>
      <th>CV_RMSE</th>
      <th>MAPE</th>
      <th>MAPE_adjust</th>
      <th>Max_AE</th>
      <th>Max_APE</th>
      <th>dongho</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>1</th>
      <td>linear</td>
      <td>1.39</td>
      <td>1.98</td>
      <td>32.00</td>
      <td>23.04</td>
      <td>19.33</td>
      <td>13.60</td>
      <td>140.75</td>
      <td>801-1001</td>
    </tr>
    <tr>
      <th>1</th>
      <td>rf</td>
      <td>1.38</td>
      <td>1.93</td>
      <td>31.00</td>
      <td>23.28</td>
      <td>19.46</td>
      <td>13.83</td>
      <td>149.06</td>
      <td>801-1001</td>
    </tr>
    <tr>
      <th>1</th>
      <td>xgb</td>
      <td>1.30</td>
      <td>1.86</td>
      <td>30.00</td>
      <td>21.76</td>
      <td>18.24</td>
      <td>10.60</td>
      <td>157.67</td>
      <td>801-1001</td>
    </tr>
    <tr>
      <th>1</th>
      <td>lgb</td>
      <td>1.34</td>
      <td>1.93</td>
      <td>31.00</td>
      <td>22.48</td>
      <td>18.83</td>
      <td>13.23</td>
      <td>152.97</td>
      <td>801-1001</td>
    </tr>
    <tr>
      <th>1</th>
      <td>linear</td>
      <td>1.36</td>
      <td>1.78</td>
      <td>19.00</td>
      <td>15.76</td>
      <td>13.98</td>
      <td>8.89</td>
      <td>127.15</td>
      <td>801-1002</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>1</th>
      <td>lgb</td>
      <td>2.60</td>
      <td>3.42</td>
      <td>23.00</td>
      <td>20.00</td>
      <td>18.28</td>
      <td>13.68</td>
      <td>274.00</td>
      <td>811-101</td>
    </tr>
    <tr>
      <th>1</th>
      <td>linear</td>
      <td>4.66</td>
      <td>6.32</td>
      <td>31.00</td>
      <td>44.52</td>
      <td>37.54</td>
      <td>30.43</td>
      <td>747.50</td>
      <td>812-101</td>
    </tr>
    <tr>
      <th>1</th>
      <td>rf</td>
      <td>2.76</td>
      <td>3.75</td>
      <td>19.00</td>
      <td>20.25</td>
      <td>17.70</td>
      <td>16.06</td>
      <td>380.99</td>
      <td>812-101</td>
    </tr>
    <tr>
      <th>1</th>
      <td>xgb</td>
      <td>2.11</td>
      <td>2.98</td>
      <td>15.00</td>
      <td>15.21</td>
      <td>13.42</td>
      <td>13.90</td>
      <td>307.81</td>
      <td>812-101</td>
    </tr>
    <tr>
      <th>1</th>
      <td>lgb</td>
      <td>3.20</td>
      <td>4.45</td>
      <td>22.00</td>
      <td>23.06</td>
      <td>20.27</td>
      <td>19.04</td>
      <td>476.35</td>
      <td>812-101</td>
    </tr>
  </tbody>
</table>
<p>4708 rows × 9 columns</p>
</div>




```python
Evaluation.groupby(['Model']).apply(func)
```




<div>
<style scoped>
    .dataframe tbody tr th:only-of-type {
        vertical-align: middle;
    }

    .dataframe tbody tr th {
        vertical-align: top;
    }

    .dataframe thead th {
        text-align: right;
    }
</style>
<table border="1" class="dataframe">
  <thead>
    <tr style="text-align: right;">
      <th></th>
      <th>MAPE_mean</th>
      <th>MAPE_std</th>
      <th>MAPE_max</th>
      <th>MAPE_min</th>
      <th>MAPE_range</th>
    </tr>
    <tr>
      <th>Model</th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>lgb</th>
      <td>17.19</td>
      <td>5.12</td>
      <td>45.37</td>
      <td>6.72</td>
      <td>38.65</td>
    </tr>
    <tr>
      <th>linear</th>
      <td>17.96</td>
      <td>5.58</td>
      <td>61.39</td>
      <td>6.79</td>
      <td>54.60</td>
    </tr>
    <tr>
      <th>rf</th>
      <td>17.14</td>
      <td>4.98</td>
      <td>41.65</td>
      <td>6.52</td>
      <td>35.13</td>
    </tr>
    <tr>
      <th>xgb</th>
      <td>16.54</td>
      <td>4.66</td>
      <td>37.90</td>
      <td>6.53</td>
      <td>31.37</td>
    </tr>
  </tbody>
</table>
</div>




```python
import matplotlib.pyplot as plt
plt.rcParams["figure.figsize"] = (12, 8)
plt.rcParams['lines.linewidth'] = 2
plt.rcParams['lines.color'] = 'r'
plt.rcParams['axes.grid'] = True

pd.plotting.register_matplotlib_converters()
household.loc[household.dongho=="801-1002"].power.plot(figsize=(12,8),color="gray", legend=True, label="Actual_Data") 
household.loc[household.dongho=="801-1002"].linear_fitted.plot(style=":",color="red", legend=True, label="linear")
household.loc[household.dongho=="801-1002"].rf_fitted.plot(style=":",color="blue", legend=True, label="rf")
household.loc[household.dongho=="801-1002"].xgb_fitted.plot(style=":",color="green", legend=True, label="xgb")
household.loc[household.dongho=="801-1002"].lgb_fitted.plot(style=":",color="orange", legend=True, label="lgb")
```




    <AxesSubplot:xlabel='date'>





![png](https://dasoldasol.github.io/assets/images/image/Modeling_21_1.png)