---
title: "[논문구현]Factorization Machines(2010)"
excerpt: 'S. Rendle, "Factorization Machines," 2010 IEEE International Conference on Data Mining, 2010, pp. 995-1000, doi: 10.1109/ICDM.2010.127.'
categories:
- MachineLearning
- 추천시스템
modified_date: 2021-09-15 10:36:28 +0900
toc: true
toc_sticky: true
---
# Factorization Machine
- [[논문 리뷰]Factorization Machines(2010)](https://dasoldasol.github.io/machinelearning/%EC%B6%94%EC%B2%9C%EC%8B%9C%EC%8A%A4%ED%85%9C/paper_review-recsys-fm/)
1. Paper
- [논문](https://www.csie.ntu.edu.tw/~b97053/paper/Rendle2010FM.pdf)
- [Higher-Order Factorization Machines](https://papers.nips.cc/paper/2016/file/158fc2ddd52ec2cf54d3c161f2dd6517-Paper.pdf)
2. Reference: Open-source
- [libfm](http://libfm.org), [libfm-github](https://github.com/srendle/libfm)
- [PyTorchFM](https://github.com/rixwew/pytorch-fm)
- [fastFM](https://github.com/ibayer/fastFM)
- [xlearn](https://github.com/aksnzhy/xlearn) : 빠른 속도가 장점





이 아래는 FM 이해를 위해 FM 뼈대를 직접 구현해본거


## Configuration


```python
import os
import pandas as pd
import numpy as np
from matplotlib import pyplot as plt
from sklearn.model_selection import train_test_split
import scipy
import math
from tqdm import tqdm
import warnings
warnings.filterwarnings("ignore")
```


```python
from google.colab import drive
drive.mount('/content/drive')
```

    Mounted at /content/drive



```python
data_path = "/content/drive/MyDrive/capstone/data/kmrd"
%cd $data_path

if not os.path.exists(data_path):
  !git clone https://github.com/lovit/kmrd
  !python setup.py install
else:
  print("data and path already exists!")
```

    /content/drive/MyDrive/capstone/data/kmrd
    data and path already exists!



```python
path = data_path + '/kmr_dataset/datafile/kmrd-small'
```

## Data Loader

- KMRD

### rates.csv


```python
df = pd.read_csv(os.path.join(path,'rates.csv'))
train_df, val_df = train_test_split(df, test_size=0.2, random_state=1234, shuffle=True)
```

### movie dataframe


```python
# Load all related dataframe
movies_df = pd.read_csv(os.path.join(path, 'movies.txt'), sep='\t', encoding='utf-8')
movies_df = movies_df.set_index('movie')

castings_df = pd.read_csv(os.path.join(path, 'castings.csv'), encoding='utf-8')
countries_df = pd.read_csv(os.path.join(path, 'countries.csv'), encoding='utf-8')
genres_df = pd.read_csv(os.path.join(path, 'genres.csv'), encoding='utf-8')

# Get genre information
genres = [(list(set(x['movie'].values))[0], '/'.join(x['genre'].values)) for index, x in genres_df.groupby('movie')]
combined_genres_df = pd.DataFrame(data=genres, columns=['movie', 'genres'])
combined_genres_df = combined_genres_df.set_index('movie')

# Get castings information
castings = [(list(set(x['movie'].values))[0], x['people'].values) for index, x in castings_df.groupby('movie')]
combined_castings_df = pd.DataFrame(data=castings, columns=['movie','people'])
combined_castings_df = combined_castings_df.set_index('movie')

# Get countries for movie information
countries = [(list(set(x['movie'].values))[0], ','.join(x['country'].values)) for index, x in countries_df.groupby('movie')]
combined_countries_df = pd.DataFrame(data=countries, columns=['movie', 'country'])
combined_countries_df = combined_countries_df.set_index('movie')

movies_df = pd.concat([movies_df, combined_genres_df, combined_castings_df, combined_countries_df], axis=1)

print(movies_df.shape)
print(movies_df.head())
```

    (999, 7)
                          title  ...   country
    movie                        ...          
    10001                시네마 천국  ...  이탈리아,프랑스
    10002              빽 투 더 퓨쳐  ...        미국
    10003            빽 투 더 퓨쳐 2  ...        미국
    10004            빽 투 더 퓨쳐 3  ...        미국
    10005  스타워즈 에피소드 4 - 새로운 희망  ...        미국
    
    [5 rows x 7 columns]



```python
movies_df.columns
```




    Index(['title', 'title_eng', 'year', 'grade', 'genres', 'people', 'country'], dtype='object')



- factorization machine에는 feature vector가 있다.
- feature vector : user onehot vector + item onehot vector + meta information + other feature engineered vectors


```python
movies_df['genres'].head()
```




    movie
    10001       드라마/멜로/로맨스
    10002           SF/코미디
    10003           SF/코미디
    10004    서부/SF/판타지/코미디
    10005     판타지/모험/SF/액션
    Name: genres, dtype: object




```python
# genre onehot vector (genre feature engineering)
dummy_genres_df = movies_df['genres'].str.get_dummies(sep='/')
```


```python
dummy_genres_df.head()
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
      <th>SF</th>
      <th>가족</th>
      <th>공포</th>
      <th>느와르</th>
      <th>다큐멘터리</th>
      <th>드라마</th>
      <th>로맨스</th>
      <th>멜로</th>
      <th>모험</th>
      <th>뮤지컬</th>
      <th>미스터리</th>
      <th>범죄</th>
      <th>서부</th>
      <th>서사</th>
      <th>스릴러</th>
      <th>애니메이션</th>
      <th>액션</th>
      <th>에로</th>
      <th>전쟁</th>
      <th>코미디</th>
      <th>판타지</th>
    </tr>
    <tr>
      <th>movie</th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>10001</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>10002</th>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
    </tr>
    <tr>
      <th>10003</th>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
    </tr>
    <tr>
      <th>10004</th>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>1</td>
    </tr>
    <tr>
      <th>10005</th>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
    </tr>
  </tbody>
</table>
</div>




```python
movies_df['grade'].unique()
```




    array(['전체 관람가', '12세 관람가', 'PG', '15세 관람가', 'NR', '청소년 관람불가', 'PG-13',
           'R', 'G', nan], dtype=object)




```python
dummy_grade_df = pd.get_dummies(movies_df['grade'], prefix='grade')
dummy_grade_df.head()
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
      <th>grade_12세 관람가</th>
      <th>grade_15세 관람가</th>
      <th>grade_G</th>
      <th>grade_NR</th>
      <th>grade_PG</th>
      <th>grade_PG-13</th>
      <th>grade_R</th>
      <th>grade_전체 관람가</th>
      <th>grade_청소년 관람불가</th>
    </tr>
    <tr>
      <th>movie</th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
      <th></th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>10001</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
    </tr>
    <tr>
      <th>10002</th>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>10003</th>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>10004</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
    </tr>
    <tr>
      <th>10005</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
  </tbody>
</table>
</div>



## Convert To Factorization Machine format

- user를 one-hot vector로 나타낸다
- item을 one-hot vector로 나타낸다
- `movies_df`에서 categorical features를 만든다


```
train_df.head()
# (user, movie, rate) -> 2D rating matrix -> matrix factorization, user-based, item-based CF
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
      <th>user</th>
      <th>movie</th>
      <th>rate</th>
      <th>time</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>137023</th>
      <td>48423</td>
      <td>10764</td>
      <td>10</td>
      <td>1212241560</td>
    </tr>
    <tr>
      <th>92868</th>
      <td>17307</td>
      <td>10170</td>
      <td>10</td>
      <td>1122185220</td>
    </tr>
    <tr>
      <th>94390</th>
      <td>18180</td>
      <td>10048</td>
      <td>10</td>
      <td>1573403460</td>
    </tr>
    <tr>
      <th>22289</th>
      <td>1498</td>
      <td>10001</td>
      <td>9</td>
      <td>1432684500</td>
    </tr>
    <tr>
      <th>80155</th>
      <td>12541</td>
      <td>10022</td>
      <td>10</td>
      <td>1370458140</td>
    </tr>
  </tbody>
</table>
</div>




```python
train_df = train_df[:1000] # 시간관계상 자르기~
print(train_df.shape)
```

    (1000, 4)



```python
train_df['movie'].apply(lambda x: dummy_genres_df.loc[x])
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
      <th>SF</th>
      <th>가족</th>
      <th>공포</th>
      <th>느와르</th>
      <th>다큐멘터리</th>
      <th>드라마</th>
      <th>로맨스</th>
      <th>멜로</th>
      <th>모험</th>
      <th>뮤지컬</th>
      <th>미스터리</th>
      <th>범죄</th>
      <th>서부</th>
      <th>서사</th>
      <th>스릴러</th>
      <th>애니메이션</th>
      <th>액션</th>
      <th>에로</th>
      <th>전쟁</th>
      <th>코미디</th>
      <th>판타지</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>137023</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>92868</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>94390</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>22289</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>80155</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
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
      <td>...</td>
      <td>...</td>
      <td>...</td>
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
      <th>2870</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>120892</th>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>93371</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>58284</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
    </tr>
    <tr>
      <th>4595</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
  </tbody>
</table>
<p>1000 rows × 21 columns</p>
</div>




```python
# user의 원 핫 벡터 테스트해보자 
test_df = pd.get_dummies(train_df['user'], prefix='user')
test_df.head()
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
      <th>user_0</th>
      <th>user_3</th>
      <th>user_4</th>
      <th>user_8</th>
      <th>user_19</th>
      <th>user_25</th>
      <th>user_28</th>
      <th>user_29</th>
      <th>user_41</th>
      <th>user_42</th>
      <th>user_44</th>
      <th>user_45</th>
      <th>user_58</th>
      <th>user_65</th>
      <th>user_67</th>
      <th>user_70</th>
      <th>user_73</th>
      <th>user_79</th>
      <th>user_82</th>
      <th>user_86</th>
      <th>user_94</th>
      <th>user_95</th>
      <th>user_98</th>
      <th>user_107</th>
      <th>user_110</th>
      <th>user_127</th>
      <th>user_130</th>
      <th>user_136</th>
      <th>user_140</th>
      <th>user_161</th>
      <th>user_176</th>
      <th>user_179</th>
      <th>user_181</th>
      <th>user_182</th>
      <th>user_213</th>
      <th>user_214</th>
      <th>user_217</th>
      <th>user_222</th>
      <th>user_224</th>
      <th>user_261</th>
      <th>...</th>
      <th>user_47075</th>
      <th>user_47275</th>
      <th>user_47421</th>
      <th>user_47486</th>
      <th>user_47493</th>
      <th>user_47547</th>
      <th>user_47746</th>
      <th>user_47823</th>
      <th>user_47847</th>
      <th>user_47971</th>
      <th>user_48256</th>
      <th>user_48333</th>
      <th>user_48387</th>
      <th>user_48423</th>
      <th>user_48432</th>
      <th>user_48475</th>
      <th>user_48521</th>
      <th>user_48761</th>
      <th>user_48802</th>
      <th>user_48846</th>
      <th>user_48864</th>
      <th>user_49037</th>
      <th>user_49045</th>
      <th>user_49540</th>
      <th>user_49606</th>
      <th>user_49645</th>
      <th>user_49686</th>
      <th>user_49692</th>
      <th>user_49976</th>
      <th>user_50323</th>
      <th>user_50358</th>
      <th>user_50470</th>
      <th>user_50617</th>
      <th>user_50924</th>
      <th>user_51129</th>
      <th>user_51236</th>
      <th>user_51293</th>
      <th>user_51344</th>
      <th>user_51940</th>
      <th>user_51993</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>137023</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>...</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>92868</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>...</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>94390</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>...</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>22289</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>...</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>80155</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>...</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
  </tbody>
</table>
<p>5 rows × 924 columns</p>
</div>




```python
# movie(item)의 원 핫 벡터 테스트해보자
test_df = pd.get_dummies(train_df['movie'], prefix='movie')
print(test_df.head())

```

            movie_10001  movie_10002  ...  movie_10988  movie_10998
    137023            0            0  ...            0            0
    92868             0            0  ...            0            0
    94390             0            0  ...            0            0
    22289             1            0  ...            0            0
    80155             0            0  ...            0            0
    
    [5 rows x 263 columns]



```python
# Xtrain 만들기 전에 테스트해보자 
X_train = pd.concat([pd.get_dummies(train_df['user'], prefix='user'), # user의 원핫 벡터 
           pd.get_dummies(train_df['movie'], prefix='movie'), # item의 원핫벡터
           train_df['movie'].apply(lambda x: dummy_genres_df.loc[x]),# metadata 
           train_df['movie'].apply(lambda x: dummy_grade_df.loc[x])], axis=1) # metadata
```


```python
X_train.shape
```




    (1000, 1217)




```python
X_train.head(2)
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
      <th>user_0</th>
      <th>user_3</th>
      <th>user_4</th>
      <th>user_8</th>
      <th>user_19</th>
      <th>user_25</th>
      <th>user_28</th>
      <th>user_29</th>
      <th>user_41</th>
      <th>user_42</th>
      <th>user_44</th>
      <th>user_45</th>
      <th>user_58</th>
      <th>user_65</th>
      <th>user_67</th>
      <th>user_70</th>
      <th>user_73</th>
      <th>user_79</th>
      <th>user_82</th>
      <th>user_86</th>
      <th>user_94</th>
      <th>user_95</th>
      <th>user_98</th>
      <th>user_107</th>
      <th>user_110</th>
      <th>user_127</th>
      <th>user_130</th>
      <th>user_136</th>
      <th>user_140</th>
      <th>user_161</th>
      <th>user_176</th>
      <th>user_179</th>
      <th>user_181</th>
      <th>user_182</th>
      <th>user_213</th>
      <th>user_214</th>
      <th>user_217</th>
      <th>user_222</th>
      <th>user_224</th>
      <th>user_261</th>
      <th>...</th>
      <th>movie_10953</th>
      <th>movie_10955</th>
      <th>movie_10962</th>
      <th>movie_10965</th>
      <th>movie_10970</th>
      <th>movie_10971</th>
      <th>movie_10980</th>
      <th>movie_10981</th>
      <th>movie_10988</th>
      <th>movie_10998</th>
      <th>SF</th>
      <th>가족</th>
      <th>공포</th>
      <th>느와르</th>
      <th>다큐멘터리</th>
      <th>드라마</th>
      <th>로맨스</th>
      <th>멜로</th>
      <th>모험</th>
      <th>뮤지컬</th>
      <th>미스터리</th>
      <th>범죄</th>
      <th>서부</th>
      <th>서사</th>
      <th>스릴러</th>
      <th>애니메이션</th>
      <th>액션</th>
      <th>에로</th>
      <th>전쟁</th>
      <th>코미디</th>
      <th>판타지</th>
      <th>grade_12세 관람가</th>
      <th>grade_15세 관람가</th>
      <th>grade_G</th>
      <th>grade_NR</th>
      <th>grade_PG</th>
      <th>grade_PG-13</th>
      <th>grade_R</th>
      <th>grade_전체 관람가</th>
      <th>grade_청소년 관람불가</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>137023</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>...</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>1</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>92868</th>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>...</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
  </tbody>
</table>
<p>2 rows × 1217 columns</p>
</div>




```python
X_train = pd.concat([pd.get_dummies(train_df['user'], prefix='user'),
           pd.get_dummies(train_df['movie'], prefix='movie'),
           train_df['movie'].apply(lambda x: dummy_genres_df.loc[x]),
           train_df['movie'].apply(lambda x: dummy_grade_df.loc[x])], axis=1)
# 평균 평점이 높기 때문에 10만 1로 주고, 나머지는 -1로 binary 지정한다(binary classification)
# loss 계산을 0이 아닌 -1로  지정한다
y_train = train_df['rate'].apply(lambda x: 1 if x > 9 else -1)
print(X_train.shape)
print(y_train.shape)

# 0이 아닌 데이터 위치 확인하기위해 csr matrix 활용한다
# csr_matrix 설명 참고: https://rfriend.tistory.com/551
X_train_sparse = scipy.sparse.csr_matrix(X_train.values)
```

    (1000, 1217)
    (1000,)



```python
X_train_sparse # 1000*1217 행렬에서 5614개의 값밖에 없다 (sparse)
```




    <1000x1217 sparse matrix of type '<class 'numpy.longlong'>'
    	with 5614 stored elements in Compressed Sparse Row format>



## Train Factorization Machine

1. Model Equation

![image.png](data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAacAAABiCAYAAAD0vRwrAAAgAElEQVR4Ae3dB7A1RZU4cKBUCrAQERRE+QgGJChBVBSVaCAjoCgSJCiYQAQMqGQQREQtAxkFiiggJYICRRRdQUUKMKwRXIKuKFjGVedfv949799v3tx756YXvten6r25M9PxdPeJPacXqQoUDBQMFAwUDBQMzDIMLDLL2lOaUzBQMFAwUDBQMFAV5lQmQcFAwUDBQMHArMNAYU6zbkhKgwoGCgYKBgoGxsac/va3v1W333579eUvf3kKlu+6664pz3o9+Otf/1r9+c9/Tn///J9/Nib3PNL8/e9/b0zT6+HPf/7z6rLLLquOPPLI6sEHH+yaXH133nlndfbZZ1enn356x7T/+Mc/JtoV7cuvf/nLXzrmna4XnXA6HfX/9re/rb77H9/t+Qdnf/zjH6tzzz03za3paNuo6tD2iy66qLr22mtbFfnjH/+4OvHEE6vf//fvW6WfDYl+85v/qj760Y9Wjz766LQ05ytf+Ur1gQ98oLrgggsq9Gam4Qc/+EF19NFHVyeffHJ1//33z3RzUv3f/OY3q8997nNja8s4yx8Lc0LcX/ayl1WLLLJI9ZKXvGQKYrbYYou+J/AxxxxTLbfccqnMU089dUqZHrzyla9M75/97GenCduYqMfDG264oVprrbWqJZdcssIQuwFCecghh6Q63/Wud3VMqsxXvOIVKd0TnvCEaqONNqo23njj6kUvelGqZ8UVV+yYd7pePO95z6ve+MY3Tld1k+r55Cc/mXCz6qqrpjFcsGBBujcO8AY/5tIll1xSrbPOOun35z//+UllzOYbhOqlL31paveHP/zhnk39+Mc/Xj3jGc9I6X/2nz/rmX62JPjsZz+b2nzWWWeNvUl77bVXtdtuuyUhctFFFx0rAW7TmSuvvDLRjUsvvbRafvnlq0033bRNtrGnefWrX1096UlPqsYlAI+z/LEwJxi/995700T90Ic+NGUAPvaxj1VHHHHElOe9HrzgBS9IZb7//e+fkvQTn/hEeoeInXfeeVPe9/MA03j5y1/eKst1112X6jU5uwHCqm1veMMbJiX71re+VW255ZaTnk3HzU9/+tNJ1eyyyy7Vu9/97knPpuvm2GOPrd70pjdNVPfOd74z4SqIHM1z/fXXr77xjW+kP3icS8xJx370ox+lPrVhTtKb4/o5m5nTjTfeOEkTRAAR53FrMbRKDInQB66//voZ1zBf+MIXVvvtt19qD+sLi8owcPjhhw+TfSLvT37yk8o4jQrqYz7q8vN2jo05hTR866235vWl31/72teq9dZbb8rzbg8eeOCBaokllkgLNidk8lj4z3zmM6vFFlsspWFCGRR+97vfpXLaEpFDDz20Wnzxxas//elPXaukWSE2QXAj8R/+8IfqtNNOi9tpuZ555pkViWe2AEbz7W9/e6I5debkhTYjRjfffHPC41xjTr/85S9Tu9vOK+ax2cycmPCsuWEFwYlB7+PHhRdemHDzne98p49c402KBhx44IEjqeT888+vWFhmG0z3mI+NOb3mNa9JZrh//etfU3BMqlh66aWnPO/2ADF6y1vekgaNSSxA+RtuuGH13ve+N03Y/F2kufvuuyvM8rjjjqtw+jrwt1xzzTUVjU4aRAERzIFpBhNBNHJzH7Mlk00voPVhnvwrgETcZAv+97//XdGmtAVjx8il1U++Ov4WtvYA2gStLAeSK03uIx/5SHXfffdVpDBMl/+CdGfib7fddtVtt91WYfr6fsIJJ0yxkz/yyCOVhSL/1VdfPVEFX5zy4QrccccdKc0999wzkcaPq666qjrnnHMmPWtz08ScIl8wp0996lPVQQcdlDQqGt9DDz0USarHHnts4h0NuC4QTCSsqsrcgKdtt902/d5hhx1SmUxUNAEazItf/OI0v3JfCm3uqKOOSuYbc+4d73hH9fDDD+dFJ5xts802SQtnhjKvcubER0GTXnPNNVP9P/zhDyfyt2VO+vaqV70qmTvf8573TDLfGCf1EkS0kYa6zz77pDrgeOutt04+Eg/4Stz70zcAj8bYujPPv/SlL6XnymWC1Z9111230kfzlj9N2kgncTc8wdenP/3p1H64kNdabloXqeKqqgiDLBvq1iftNYbgV7/6Veqv55tvvnny2UW+X//612m84IMffIMNNqiuuOKKeD3p2qnfkxL9383Xv/716nWve11qz3Oe85zUnmg/Jgrf3A0Yl3ID0BxrjouDmf9973tf9fjjj1cXX3xxEnb1T9+4M0A3PHqPVrztbW9Lvu8DDjgg4ZFA9MUvfrHaZJNNKkIwsB5jnF1f//rXp3uuGGAcrCv0Qb8Ct01jrj/18pXRbRy+973vpTE01vxVm222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)

2. Pairwise Interaction to be computed
- Linear Complexity

![image.png](data:image/png;base64,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+Pe11lpLPf7445q5nHzyyVonPXFmkrApESh6XGJftvzyyysWOocffrjafffdFe+eUPURYKxw5PDQQw/FVrb2jGWHHXZQSyyxhPr5559jG+t/gDOZzz//XC222GJq5syZ+uezzz5bHXjggf5HU/9/wQUXKJgJHN/UtWfPnurhhx9OnXdQBqgJMgh4cd966y1t5HTfffcFPSr3WhiBosflpZdeqlZYYQXNVDALeOmll/T4bOEuqE3T3333XT2nDBw4MLbOpTIWDBrfe++92EqGPUB8euR+7AKS0lNPPaW6d+/eSN6vXz91/fXXN/7P8gsrNHYO0LfffquWXHJJ9d1332VZRCOvyZMn6x3R4MGDNT4SEbMBjXzxIVDkuNx5553VrrvuqjbddFM5Z/H1Qx3+RQqyyCKLKBauUVQKY3n22WfVZZddprp27aqGDBkSVb/I39hdsCq/7rrrIp+L+pEzCMRhEJM97mA+++wzNXr06KhkiX5bZ511GoZGEyZMUP3799e+eB544IFE+UUlMucrMBQMnD744AN10kknRSWR31oUgaLGpfd8BR9UG264oZo/f766+OKLWxT5+jV75MiRes699tprIytfCmPB4ObWW29Va6+9tsLRWVLiMIkdC4MzKTG533333To5+tpwZERhGFxmSezO0AU3XgHuvfde1adPH3XQQQepPLTZNt54Yy1moA0HHHCAZp433XRTlk2SvJoAgSLHJYubNddcU6P2008/6V3L3nvvrc9bmgDKlmgCmwIW87h6iaJSGIupUK9evVIxFiZqVltpiAHuJbS20DTLg/xlJXHuZlsvJgwvwTSFBIEgBMoal7/99pviI1QfBNAiXGqppdSKK64YWenaMhYMreCcyGyFBAFBQBAQBIpBYP3119dzL2fcYVRbxoKGE4zlhBNOCGub3BcEBAFBQBDIGAHEYMy999xzT2jOtWUs2JrQuLiDe1TkcPmS1SeMS3/99deZlUFdUREOo99//10bWGbVJvIxZz9hZcr9eiJQ5Lgssqx69kZz1JqwJMy9Y8eODW1QbRmL4ZqoC0fRRhttpEEACM5k0ESJ+qy33nraYBJde+xbSOf9cC4URMZ4yDwbVQa/bbDBBlrNGVllp06d2pRBHiglfPzxx0FFqY8++kgtuOCCjTQoHMSVx1kUNjRdunRpk9bU96KLLgosS27WG4Ei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)


```python
# Compute negative log likelihood between prediction and label
def log_loss(pred, y):
    return np.log(np.exp(-pred * y) + 1.0)
```


```python
# Update gradients
def sgd(X, y, n_samples, n_features,
                w0, w, v, n_factors, learning_rate, reg_w, reg_v):
    data = X.data
    indptr = X.indptr # indptr[i]는 i번째 행의 원소가 data의 어느 인덱스에서 시작되는지 나타낸다
    indices = X.indices # indices[i]는 data[i]의 열 번호를 저장한다. 
    loss = 0.0

    for i in range(n_samples):
        pred, summed = predict(X, w0, w, v, n_factors, i)
        
        # calculate loss and its gradient
        loss += log_loss(pred, y[i])
        loss_gradient = -y[i] / (np.exp(y[i] * pred) + 1.0)
    
        # update bias/intercept term
        w0 -= learning_rate * loss_gradient

        # update weight
        for index in range(indptr[i], indptr[i + 1]):
            feature = indices[index]
            w[feature] -= learning_rate * (loss_gradient * data[index] + 2 * reg_w * w[feature])

        # update factor
        for factor in range(n_factors):
            for index in range(indptr[i], indptr[i + 1]):
                feature = indices[index]
                term = summed[factor] - v[factor, feature] * data[index]
                v_gradient = loss_gradient * data[index] * term
                v[factor, feature] -= learning_rate * (v_gradient + 2 * reg_v * v[factor, feature])
    
    loss /= n_samples
    return loss

```


```python
def predict(X, w0, w, v, n_factors, i):
    data = X.data
    indptr = X.indptr
    indices = X.indices
    """predicting a single instance"""
    summed = np.zeros(n_factors)
    summed_squared = np.zeros(n_factors)

    # linear output w * x
    pred = w0
    for index in range(indptr[i], indptr[i + 1]):
        feature = indices[index]
        pred += w[feature] * data[index]

    # factor output
    for factor in range(n_factors):
        for index in range(indptr[i], indptr[i + 1]):
            feature = indices[index]
            term = v[factor, feature] * data[index]
            summed[factor] += term
            summed_squared[factor] += term * term

        pred += 0.5 * (summed[factor] * summed[factor] - summed_squared[factor])

    # gradient update할 때, summed는 독립이므로 re-use 가능
    return pred, summed
```


```python
# Train Factorization Machine
# X -> sparse csr_matrix, y -> label
def fit(X, y, config):
    epochs = config['num_epochs']
    num_factors = config['num_factors']
    learning_rate = config['learning_rate']
    reg_weights = config['reg_weights']
    reg_features = config['reg_features']

    num_samples, num_features = X.shape
    weights = np.zeros(num_features) # -> w
    global_bias = 0.0 # -> w0
    
    # latent factors for all features -> v
    feature_factors = np.random.normal(size = (num_factors, num_features))

    epoch_loss = []
    for epoch in range(epochs):
        loss = sgd(X, y, num_samples, num_features,
                            global_bias, weights,
                            feature_factors, num_factors,
                            learning_rate, reg_weights, reg_features)
        print(f'[epoch: {epoch+1}], loss: {loss}')

        epoch_loss.append(loss)
      
    return epoch_loss

```


```python
config = {
    "num_epochs": 10,
    "num_factors": 10,
    "learning_rate": 0.1,
    "reg_weights": 0.01,
    "reg_features": 0.01
}
```


```python
epoch_loss = fit(X_train_sparse, y_train.values, config)
```

    [epoch: 1], loss: 2.5530346045055703
    [epoch: 2], loss: 1.0115441271017367
    [epoch: 3], loss: 0.4945105895776768
    [epoch: 4], loss: 0.26980520496116406
    [epoch: 5], loss: 0.176137422897979
    [epoch: 6], loss: 0.1321992253904276
    [epoch: 7], loss: 0.10100276394910408
    [epoch: 8], loss: 0.08020458255299875
    [epoch: 9], loss: 0.06571114718797659
    [epoch: 10], loss: 0.05607737598425833



```python
import matplotlib.pyplot as plt
plt.plot(epoch_loss)
plt.title('Loss per epoch')
plt.show()
```



![png](https://dasoldasol.github.io/assets/images/image/FM/3_Factorization_Machine_loss.png)



