---
title: "[논문구현]Wide & Deep Learning for Recommender System(2016)"
excerpt: 'Cheng, Heng-Tze, et al. "Wide & deep learning for recommender systems." Proceedings of the 1st workshop on deep learning for recommender systems. 2016.'
categories:
- Deep Learning
- 추천시스템
modified_date: 2021-09-18 10:36:28 +0900
toc: true
toc_sticky: true
---
# Wide & Deep Learning for Recommender System

- Google에서 App Store를 활용해서 발표한 논문([링크](https://arxiv.org/pdf/1606.07792.pdf))


## Google 공식 문서
- Google의 AI Blog([링크](https://ai.googleblog.com/2016/06/wide-deep-learning-better-together-with.html))
- Google의 Tensorflow github([링크](https://github.com/tensorflow/tensorflow/blob/v2.4.0/tensorflow/python/keras/premade/wide_deep.py#L34-L219)) : API 어떻게 구현했는지 확인 가능
- TensorFlow v2.4 API
    - [tf.keras.experimental.WideDeepModel](https://www.tensorflow.org/api_docs/python/tf/keras/experimental/WideDeepModel?hl=en#methods_2)
    - [tf.estimator.DNNLinearCombinedClassifier](https://www.tensorflow.org/api_docs/python/tf/estimator/DNNLinearCombinedClassifier) : Linear(Wide) + DNN(Deep) => classifier API

## PyTorch Library 구현
- tensorflow보다 pytorch가 쓰기 편함(직관적, 디버깅 편함).. 그래서 가져와봄
- 이 라이브러리는 text, image도 가져와서 넣고 만들 수 있음!
- [pytorch-widedeep](https://github.com/jrzaurin/pytorch-widedeep)


```python
!pip install pytorch-widedeep # 설치후 colab restart 필요 
```

    Collecting pytorch-widedeep
      Downloading pytorch_widedeep-1.0.9-py3-none-any.whl (149 kB)
    [K     |████████████████████████████████| 149 kB 4.3 MB/s 
    [?25hCollecting torchmetrics
      Downloading torchmetrics-0.5.1-py3-none-any.whl (282 kB)
    [K     |████████████████████████████████| 282 kB 29.9 MB/s 
    [?25hRequirement already satisfied: tqdm in /usr/local/lib/python3.7/dist-packages (from pytorch-widedeep) (4.62.0)
    Requirement already satisfied: spacy in /usr/local/lib/python3.7/dist-packages (from pytorch-widedeep) (2.2.4)
    Requirement already satisfied: pandas in /usr/local/lib/python3.7/dist-packages (from pytorch-widedeep) (1.1.5)
    Requirement already satisfied: opencv-contrib-python in /usr/local/lib/python3.7/dist-packages (from pytorch-widedeep) (4.1.2.30)
    Requirement already satisfied: scipy in /usr/local/lib/python3.7/dist-packages (from pytorch-widedeep) (1.4.1)
    Requirement already satisfied: imutils in /usr/local/lib/python3.7/dist-packages (from pytorch-widedeep) (0.5.4)
    Requirement already satisfied: scikit-learn in /usr/local/lib/python3.7/dist-packages (from pytorch-widedeep) (0.22.2.post1)
    Requirement already satisfied: gensim in /usr/local/lib/python3.7/dist-packages (from pytorch-widedeep) (3.6.0)
    Requirement already satisfied: torchvision in /usr/local/lib/python3.7/dist-packages (from pytorch-widedeep) (0.10.0+cu102)
    Collecting numpy>=1.20.0
      Downloading numpy-1.21.2-cp37-cp37m-manylinux_2_12_x86_64.manylinux2010_x86_64.whl (15.7 MB)
    [K     |████████████████████████████████| 15.7 MB 191 kB/s 
    [?25hCollecting einops
      Downloading einops-0.3.2-py3-none-any.whl (25 kB)
    Requirement already satisfied: torch in /usr/local/lib/python3.7/dist-packages (from pytorch-widedeep) (1.9.0+cu102)
    Requirement already satisfied: wrapt in /usr/local/lib/python3.7/dist-packages (from pytorch-widedeep) (1.12.1)
    Requirement already satisfied: smart-open>=1.2.1 in /usr/local/lib/python3.7/dist-packages (from gensim->pytorch-widedeep) (5.1.0)
    Requirement already satisfied: six>=1.5.0 in /usr/local/lib/python3.7/dist-packages (from gensim->pytorch-widedeep) (1.15.0)
    Requirement already satisfied: pytz>=2017.2 in /usr/local/lib/python3.7/dist-packages (from pandas->pytorch-widedeep) (2018.9)
    Requirement already satisfied: python-dateutil>=2.7.3 in /usr/local/lib/python3.7/dist-packages (from pandas->pytorch-widedeep) (2.8.2)
    Requirement already satisfied: joblib>=0.11 in /usr/local/lib/python3.7/dist-packages (from scikit-learn->pytorch-widedeep) (1.0.1)
    Requirement already satisfied: cymem<2.1.0,>=2.0.2 in /usr/local/lib/python3.7/dist-packages (from spacy->pytorch-widedeep) (2.0.5)
    Requirement already satisfied: srsly<1.1.0,>=1.0.2 in /usr/local/lib/python3.7/dist-packages (from spacy->pytorch-widedeep) (1.0.5)
    Requirement already satisfied: wasabi<1.1.0,>=0.4.0 in /usr/local/lib/python3.7/dist-packages (from spacy->pytorch-widedeep) (0.8.2)
    Requirement already satisfied: catalogue<1.1.0,>=0.0.7 in /usr/local/lib/python3.7/dist-packages (from spacy->pytorch-widedeep) (1.0.0)
    Requirement already satisfied: setuptools in /usr/local/lib/python3.7/dist-packages (from spacy->pytorch-widedeep) (57.4.0)
    Requirement already satisfied: murmurhash<1.1.0,>=0.28.0 in /usr/local/lib/python3.7/dist-packages (from spacy->pytorch-widedeep) (1.0.5)
    Requirement already satisfied: plac<1.2.0,>=0.9.6 in /usr/local/lib/python3.7/dist-packages (from spacy->pytorch-widedeep) (1.1.3)
    Requirement already satisfied: requests<3.0.0,>=2.13.0 in /usr/local/lib/python3.7/dist-packages (from spacy->pytorch-widedeep) (2.23.0)
    Requirement already satisfied: blis<0.5.0,>=0.4.0 in /usr/local/lib/python3.7/dist-packages (from spacy->pytorch-widedeep) (0.4.1)
    Requirement already satisfied: preshed<3.1.0,>=3.0.2 in /usr/local/lib/python3.7/dist-packages (from spacy->pytorch-widedeep) (3.0.5)
    Requirement already satisfied: thinc==7.4.0 in /usr/local/lib/python3.7/dist-packages (from spacy->pytorch-widedeep) (7.4.0)
    Requirement already satisfied: importlib-metadata>=0.20 in /usr/local/lib/python3.7/dist-packages (from catalogue<1.1.0,>=0.0.7->spacy->pytorch-widedeep) (4.6.4)
    Requirement already satisfied: typing-extensions>=3.6.4 in /usr/local/lib/python3.7/dist-packages (from importlib-metadata>=0.20->catalogue<1.1.0,>=0.0.7->spacy->pytorch-widedeep) (3.7.4.3)
    Requirement already satisfied: zipp>=0.5 in /usr/local/lib/python3.7/dist-packages (from importlib-metadata>=0.20->catalogue<1.1.0,>=0.0.7->spacy->pytorch-widedeep) (3.5.0)
    Requirement already satisfied: chardet<4,>=3.0.2 in /usr/local/lib/python3.7/dist-packages (from requests<3.0.0,>=2.13.0->spacy->pytorch-widedeep) (3.0.4)
    Requirement already satisfied: urllib3!=1.25.0,!=1.25.1,<1.26,>=1.21.1 in /usr/local/lib/python3.7/dist-packages (from requests<3.0.0,>=2.13.0->spacy->pytorch-widedeep) (1.24.3)
    Requirement already satisfied: idna<3,>=2.5 in /usr/local/lib/python3.7/dist-packages (from requests<3.0.0,>=2.13.0->spacy->pytorch-widedeep) (2.10)
    Requirement already satisfied: certifi>=2017.4.17 in /usr/local/lib/python3.7/dist-packages (from requests<3.0.0,>=2.13.0->spacy->pytorch-widedeep) (2021.5.30)
    Requirement already satisfied: packaging in /usr/local/lib/python3.7/dist-packages (from torchmetrics->pytorch-widedeep) (21.0)
    Requirement already satisfied: pyparsing>=2.0.2 in /usr/local/lib/python3.7/dist-packages (from packaging->torchmetrics->pytorch-widedeep) (2.4.7)
    Requirement already satisfied: pillow>=5.3.0 in /usr/local/lib/python3.7/dist-packages (from torchvision->pytorch-widedeep) (7.1.2)
    Installing collected packages: numpy, torchmetrics, einops, pytorch-widedeep
      Attempting uninstall: numpy
        Found existing installation: numpy 1.19.5
        Uninstalling numpy-1.19.5:
          Successfully uninstalled numpy-1.19.5
    [31mERROR: pip's dependency resolver does not currently take into account all the packages that are installed. This behaviour is the source of the following dependency conflicts.
    tensorflow 2.6.0 requires numpy~=1.19.2, but you have numpy 1.21.2 which is incompatible.
    datascience 0.10.6 requires folium==0.2.1, but you have folium 0.8.3 which is incompatible.
    albumentations 0.1.12 requires imgaug<0.2.7,>=0.2.5, but you have imgaug 0.2.9 which is incompatible.[0m
    Successfully installed einops-0.3.2 numpy-1.21.2 pytorch-widedeep-1.0.9 torchmetrics-0.5.1





```python
# restart 후 install 확인
import pytorch_widedeep
```

    /usr/lib/python3.7/importlib/_bootstrap.py:219: RuntimeWarning: numpy.ufunc size changed, may indicate binary incompatibility. Expected 192 from C header, got 216 from PyObject
      return f(*args, **kwds)



```python
import os
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
```

## DataLoader


```python
from google.colab import drive
drive.mount('/content/drive')
```

    Drive already mounted at /content/drive; to attempt to forcibly remount, call drive.mount("/content/drive", force_remount=True).



```python
data_path = "/content/drive/MyDrive/capstone/data/kmrd"
%cd $data_path

if not os.path.exists(data_path):
  !git clone https://github.com/lovit/kmrd
  !python setup.py install
else:
  print("data and path already exists!")

path = data_path + '/kmr_dataset/datafile/kmrd-small'
```

    /content/drive/MyDrive/capstone/data/kmrd
    data and path already exists!



```python
df = pd.read_csv(os.path.join(path,'rates.csv'))
train_df, val_df = train_test_split(df, test_size=0.2, random_state=1234, shuffle=True)


```


```python
train_df.shape
```




    (112568, 4)




```python
# 리소스 한계로 1000개만 자를게욥 
train_df = train_df[:1000]
```


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

print(movies_df.shape) # movie_df 정보를 wide part에서 cross-product 쓰려고 가져옴 
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




```python
dummy_genres_df = movies_df['genres'].str.get_dummies(sep='/')
train_genres_df = train_df['movie'].apply(lambda x: dummy_genres_df.loc[x])
train_genres_df.head()
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
  </tbody>
</table>
</div>




```python
dummy_grade_df = pd.get_dummies(movies_df['grade'], prefix='grade')
train_grade_df = train_df['movie'].apply(lambda x: dummy_grade_df.loc[x])
train_grade_df.head()
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
  </thead>
  <tbody>
    <tr>
      <th>137023</th>
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
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>94390</th>
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
      <th>22289</th>
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
      <th>80155</th>
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
  </tbody>
</table>
</div>




```python
train_df['year'] = train_df.apply(lambda x: movies_df.loc[x['movie']]['year'], axis=1) # continous value 
```


```python
train_df = pd.concat([train_df, train_grade_df, train_genres_df], axis=1)
train_df.head()
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
      <th>year</th>
      <th>grade_12세 관람가</th>
      <th>grade_15세 관람가</th>
      <th>grade_G</th>
      <th>grade_NR</th>
      <th>grade_PG</th>
      <th>grade_PG-13</th>
      <th>grade_R</th>
      <th>grade_전체 관람가</th>
      <th>grade_청소년 관람불가</th>
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
      <td>48423</td>
      <td>10764</td>
      <td>10</td>
      <td>1212241560</td>
      <td>1987.0</td>
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
      <td>17307</td>
      <td>10170</td>
      <td>10</td>
      <td>1122185220</td>
      <td>1985.0</td>
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
      <td>1</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
      <td>0</td>
    </tr>
    <tr>
      <th>94390</th>
      <td>18180</td>
      <td>10048</td>
      <td>10</td>
      <td>1573403460</td>
      <td>2016.0</td>
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
      <td>1498</td>
      <td>10001</td>
      <td>9</td>
      <td>1432684500</td>
      <td>2013.0</td>
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
      <td>12541</td>
      <td>10022</td>
      <td>10</td>
      <td>1370458140</td>
      <td>1980.0</td>
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




```python
wide_cols = list(dummy_genres_df.columns) + list(dummy_grade_df.columns) # genre와 grade간의 interaction 보고자 함
wide_cols
```




    ['SF',
     '가족',
     '공포',
     '느와르',
     '다큐멘터리',
     '드라마',
     '로맨스',
     '멜로',
     '모험',
     '뮤지컬',
     '미스터리',
     '범죄',
     '서부',
     '서사',
     '스릴러',
     '애니메이션',
     '액션',
     '에로',
     '전쟁',
     '코미디',
     '판타지',
     'grade_12세 관람가',
     'grade_15세 관람가',
     'grade_G',
     'grade_NR',
     'grade_PG',
     'grade_PG-13',
     'grade_R',
     'grade_전체 관람가',
     'grade_청소년 관람불가']




```python
print(len(wide_cols))
print(wide_cols)
# 조합 너무 많아지니까 2개씩만 쓸게욥
wide_cols = list(dummy_genres_df.columns)[0:3] + list(dummy_grade_df.columns)[0:3]
```

    30
    ['SF', '가족', '공포', '느와르', '다큐멘터리', '드라마', '로맨스', '멜로', '모험', '뮤지컬', '미스터리', '범죄', '서부', '서사', '스릴러', '애니메이션', '액션', '에로', '전쟁', '코미디', '판타지', 'grade_12세 관람가', 'grade_15세 관람가', 'grade_G', 'grade_NR', 'grade_PG', 'grade_PG-13', 'grade_R', 'grade_전체 관람가', 'grade_청소년 관람불가']



```python
# wide_cols = ['genre', 'grade']
# cross_cols = [('genre', 'grade')]
wide_cols
```




    ['SF', '가족', '공포', 'grade_12세 관람가', 'grade_15세 관람가', 'grade_G']




```python
## cross-col 만들기 
import itertools
from itertools import product  
unique_combinations = list(list(zip(wide_cols, element)) 
                           for element in product(wide_cols, repeat = len(wide_cols))) 

print(unique_combinations)
cross_cols = [item for sublist in unique_combinations for item in sublist]
cross_cols = [x for x in cross_cols if x[0] != x[1]]
cross_cols = list(set(cross_cols))
print(cross_cols)
```

    IOPub data rate exceeded.
    The notebook server will temporarily stop sending output
    to the client in order to avoid crashing it.
    To change this limit, set the config variable
    `--NotebookApp.iopub_data_rate_limit`.
    
    Current values:
    NotebookApp.iopub_data_rate_limit=1000000.0 (bytes/sec)
    NotebookApp.rate_limit_window=3.0 (secs)




```python
print(cross_cols)
```

    [('grade_15세 관람가', 'grade_12세 관람가'), ('grade_G', '공포'), ('SF', '가족'), ('grade_12세 관람가', '공포'), ('공포', 'grade_G'), ('가족', 'grade_12세 관람가'), ('SF', 'grade_15세 관람가'), ('grade_15세 관람가', '가족'), ('공포', 'SF'), ('가족', 'SF'), ('grade_12세 관람가', '가족'), ('공포', 'grade_12세 관람가'), ('grade_G', '가족'), ('grade_G', 'grade_15세 관람가'), ('공포', '가족'), ('grade_12세 관람가', 'SF'), ('grade_15세 관람가', 'grade_G'), ('grade_15세 관람가', '공포'), ('공포', 'grade_15세 관람가'), ('가족', '공포'), ('SF', 'grade_G'), ('가족', 'grade_G'), ('SF', '공포'), ('grade_G', 'grade_12세 관람가'), ('grade_G', 'SF'), ('가족', 'grade_15세 관람가'), ('grade_12세 관람가', 'grade_15세 관람가'), ('SF', 'grade_12세 관람가'), ('grade_12세 관람가', 'grade_G'), ('grade_15세 관람가', 'SF')]



```python
## Deep
# embed_cols = [('genre', 16),('grade', 16)]
embed_cols = list(set([(x[0], 16) for x in cross_cols])) # embedding size만 정해줌 
continuous_cols = ['year']

print(embed_cols)
print(continuous_cols)
```

    [('가족', 16), ('grade_15세 관람가', 16), ('공포', 16), ('grade_12세 관람가', 16), ('grade_G', 16), ('SF', 16)]
    ['year']



```python
target = train_df['rate'].apply(lambda x: 1 if x > 9 else 0).values # 10점인 애들을 1, 아닌애들 0으로 binary로 
```

## Wide & Deep


```python
from pytorch_widedeep.preprocessing import WidePreprocessor,TabPreprocessor
from pytorch_widedeep.models import Wide, TabMlp, WideDeep
from pytorch_widedeep.metrics import Accuracy
```

### Wide Component


```python
preprocess_wide = WidePreprocessor(wide_cols=wide_cols, crossed_cols=cross_cols)
X_wide = preprocess_wide.fit_transform(train_df)
wide = Wide(wide_dim=np.unique(X_wide).shape[0], pred_dim=1)
```


```python
X_wide.size
```




    36000




```python
wide
```




    Wide(
      (wide_linear): Embedding(108, 1, padding_idx=0)
    )



### Deep Component


```python
preprocess_deep = TabPreprocessor(embed_cols=embed_cols, continuous_cols=continuous_cols)
X_deep = preprocess_deep.fit_transform(train_df)
deepdense = TabMlp(
    mlp_hidden_dims=[64, 32],
    column_idx=preprocess_deep.column_idx,
    embed_input=preprocess_deep.embeddings_input,
    continuous_cols=continuous_cols,
)
```


```python
deepdense
```




    TabMlp(
      (cat_embed_and_cont): CatEmbeddingsAndCont(
        (embed_layers): ModuleDict(
          (emb_layer_가족): Embedding(3, 16, padding_idx=0)
          (emb_layer_grade_15세 관람가): Embedding(3, 16, padding_idx=0)
          (emb_layer_공포): Embedding(3, 16, padding_idx=0)
          (emb_layer_grade_12세 관람가): Embedding(3, 16, padding_idx=0)
          (emb_layer_grade_G): Embedding(2, 16, padding_idx=0)
          (emb_layer_SF): Embedding(3, 16, padding_idx=0)
        )
        (embedding_dropout): Dropout(p=0.1, inplace=False)
        (cont_norm): BatchNorm1d(1, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
      )
      (tab_mlp): MLP(
        (mlp): Sequential(
          (dense_layer_0): Sequential(
            (0): Dropout(p=0.1, inplace=False)
            (1): Linear(in_features=97, out_features=64, bias=True)
            (2): ReLU(inplace=True)
          )
          (dense_layer_1): Sequential(
            (0): Dropout(p=0.1, inplace=False)
            (1): Linear(in_features=64, out_features=32, bias=True)
            (2): ReLU(inplace=True)
          )
        )
      )
    )



### Build and Train


```python
# build, compile and fit
from pytorch_widedeep import Trainer

model = WideDeep(wide=wide, deeptabular=deepdense)
trainer = Trainer(model, objective="binary", metrics=[Accuracy])
trainer.fit(
    X_wide=X_wide,
    X_tab=X_deep,
    target=target,
    n_epochs=5,
    batch_size=256,
    val_split=0.1,
)
```

    /usr/local/lib/python3.7/dist-packages/sklearn/utils/__init__.py:1108: DeprecationWarning: `np.int` is a deprecated alias for the builtin `int`. To silence this warning, use `int` by itself. Doing this will not modify any behavior and is safe. When replacing `np.int`, you may wish to use e.g. `np.int64` or `np.int32` to specify the precision. If you wish to review your current use, check the release note link for additional information.
    Deprecated in NumPy 1.20; for more details and guidance: https://numpy.org/devdocs/release/1.20.0-notes.html#deprecations
      return floored.astype(np.int)
    epoch 1: 100%|██████████| 4/4 [00:00<00:00,  9.40it/s, loss=nan, metrics={'acc': 0.1833}]
    valid: 100%|██████████| 1/1 [00:00<00:00, 12.79it/s, loss=nan, metrics={'acc': 0.0}]
    epoch 2: 100%|██████████| 4/4 [00:00<00:00, 63.76it/s, loss=nan, metrics={'acc': 0.0}]
    valid: 100%|██████████| 1/1 [00:00<00:00, 15.79it/s, loss=nan, metrics={'acc': 0.0}]
    epoch 3: 100%|██████████| 4/4 [00:00<00:00, 54.59it/s, loss=nan, metrics={'acc': 0.0}]
    valid: 100%|██████████| 1/1 [00:00<00:00, 12.24it/s, loss=nan, metrics={'acc': 0.0}]
    epoch 4: 100%|██████████| 4/4 [00:00<00:00, 61.07it/s, loss=nan, metrics={'acc': 0.0}]
    valid: 100%|██████████| 1/1 [00:00<00:00, 14.63it/s, loss=nan, metrics={'acc': 0.0}]
    epoch 5: 100%|██████████| 4/4 [00:00<00:00, 54.58it/s, loss=nan, metrics={'acc': 0.0}]
    valid: 100%|██████████| 1/1 [00:00<00:00, 13.19it/s, loss=nan, metrics={'acc': 0.0}]



```python
X_deep.shape
```




    (1000, 4)




```python
X_wide.shape
```




    (1000, 9)

