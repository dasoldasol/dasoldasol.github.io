---
title: "[논문구현]DeepFM: A Factorization-Machine based Neural Networks for CTR Prediction(2017)"
excerpt: 'Guo, Huifeng, et al. "DeepFM: a factorization-machine based neural network for CTR prediction." arXiv preprint arXiv:1703.04247 (2017).'
categories:
- Deep Learning
- 추천시스템
modified_date: 2021-09-21 10:36:28 +0900
toc: true
toc_sticky: true
---
# DeepFM
- [[논문리뷰]DeepFM: A Factorization-Machine based Neural Networks for CTR Prediction(2017)]()
- 논문
    - DeepFM: A Factorization-Machine based Neural Network for CTR Prediction
- Tensorflow 구현 버전([링크](https://github.com/shenweichen/DeepCTR))
- PyTorch 버전([링크](https://github.com/shenweichen/DeepCTR-Torch))
- Factorization Machine 등 다양한 모델을 사용해 볼 수 있는 [torchfm 링크](https://pypi.org/project/torchfm/)
- 위에 코드 보면서 느낀거 : 적용할 수 있는 fm 너무 많음 클남 ㅠ

## torchfm

- `pip install torchfm`으로 바로 설치가능


```python
!pip install torchfm
```

    Collecting torchfm
      Downloading torchfm-0.7.0.tar.gz (9.6 kB)
    Building wheels for collected packages: torchfm
      Building wheel for torchfm (setup.py) ... [?25l[?25hdone
      Created wheel for torchfm: filename=torchfm-0.7.0-py3-none-any.whl size=18357 sha256=e1cb287c46b8bbfa3ba8df350ededd5ba5b3dab456075104627d764945ff4307
      Stored in directory: /root/.cache/pip/wheels/5e/e9/25/1ae407681ff67b4334513b7793ced4c66a4bf37ee99ed31ffe
    Successfully built torchfm
    Installing collected packages: torchfm
    Successfully installed torchfm-0.7.0



```python
import torchfm
```

torchfm 라이브러리 뜯어보기


```python
import numpy as np
import torch
import torch.nn.functional as F
```


```python
# torchfm의 deepfm 부분 구현 


class FeaturesLinear(torch.nn.Module):

    # model initialize 
    def __init__(self, field_dims, output_dim=1):
        super().__init__()

        # 2개의 숫자만큼의 임베딩 공간 fc(fully connected) 만듬 
        self.fc = torch.nn.Embedding(sum(field_dims), output_dim) # sum(field_dim) : user100 item 10000이면 100+10000

        self.bias = torch.nn.Parameter(torch.zeros((output_dim,)))
        self.offsets = np.array((0, *np.cumsum(field_dims)[:-1]), dtype=np.long) # 어디까지가 user인지 마크 용도. 

    def forward(self, x):
        """
        :param x: Long tensor of size ``(batch_size, num_fields)``
        """
        x = x + x.new_tensor(self.offsets).unsqueeze(0)
        return torch.sum(self.fc(x), dim=1) + self.bias

# hidden layer 
class FeaturesEmbedding(torch.nn.Module):

    def __init__(self, field_dims, embed_dim):
        super().__init__()
        self.embedding = torch.nn.Embedding(sum(field_dims), embed_dim) # output형태가 다름. embed_dim으로 줄여짐 hidden layer가 됨 ## embedding init 수정 시 포인트!
        self.offsets = np.array((0, *np.cumsum(field_dims)[:-1]), dtype=np.long)
        torch.nn.init.xavier_uniform_(self.embedding.weight.data) ## emdedding weight 업데이트 부분 수정시 포인트 ! 

    def forward(self, x):
        """
        :param x: Long tensor of size ``(batch_size, num_fields)``
        """
        x = x + x.new_tensor(self.offsets).unsqueeze(0)
        return self.embedding(x)


class FactorizationMachine(torch.nn.Module):

    def __init__(self, reduce_sum=True):
        super().__init__()
        self.reduce_sum = reduce_sum

    def forward(self, x):
        """
        :param x: Float tensor of size ``(batch_size, num_fields, embed_dim)``
        """
        square_of_sum = torch.sum(x, dim=1) ** 2 # fm의 linear complexity 
        sum_of_square = torch.sum(x ** 2, dim=1) # fm의 linear complexity 
        ix = square_of_sum - sum_of_square
        if self.reduce_sum:
            ix = torch.sum(ix, dim=1, keepdim=True)
        return 0.5 * ix


class MultiLayerPerceptron(torch.nn.Module):

    def __init__(self, input_dim, embed_dims, dropout, output_layer=True):
        super().__init__()
        layers = list()
        for embed_dim in embed_dims:
            layers.append(torch.nn.Linear(input_dim, embed_dim))
            layers.append(torch.nn.BatchNorm1d(embed_dim))
            layers.append(torch.nn.ReLU())
            layers.append(torch.nn.Dropout(p=dropout))
            input_dim = embed_dim # check 
        if output_layer:
            layers.append(torch.nn.Linear(input_dim, 1))
        self.mlp = torch.nn.Sequential(*layers)

    def forward(self, x):
        """
        :param x: Float tensor of size ``(batch_size, embed_dim)``
        """
        return self.mlp(x)

```


```python
class DeepFactorizationMachineModel(torch.nn.Module):
    """
    A pytorch implementation of DeepFM.

    Reference:
        H Guo, et al. DeepFM: A Factorization-Machine based Neural Network for CTR Prediction, 2017.
    """

    def __init__(self, field_dims, embed_dim, mlp_dims, dropout):
        super().__init__()
        self.linear = FeaturesLinear(field_dims)
        self.fm = FactorizationMachine(reduce_sum=True)
        self.embedding = FeaturesEmbedding(field_dims, embed_dim)
        self.embed_output_dim = len(field_dims) * embed_dim
        self.mlp = MultiLayerPerceptron(self.embed_output_dim, mlp_dims, dropout)

    def forward(self, x):
        """
        :param x: Long tensor of size ``(batch_size, num_fields)``
        """
        embed_x = self.embedding(x) # 임베딩한 input x를 share 
        x = self.linear(x) + self.fm(embed_x) + self.mlp(embed_x.view(-1, self.embed_output_dim))
        return torch.sigmoid(x.squeeze(1))
```

## Load dataset and Train model


```python
from google.colab import drive
drive.mount('/content/drive')
data_path = '/content/drive/MyDrive/capstone/data/kmrd/kmr_dataset/datafile/kmrd-small'
```

    Mounted at /content/drive



```python
import torch.utils.data

class KMRDDataset(torch.utils.data.Dataset):
    def __init__(self, data_path):
        data = pd.read_csv(os.path.join(data_path,'rates.csv'))[:10000] # 코랩 리소스상 데이터 쪼갤게요 
        
        user_to_index = {original: idx for idx, original in enumerate(data.user.unique())}
        movie_to_index = {original: idx for idx, original in enumerate(data.movie.unique())}
        data['user'] = data['user'].apply(lambda x: user_to_index[x])
        data['movie'] = data['movie'].apply(lambda x: movie_to_index[x])
        # df [user, movie, rate] -> tuple list (user, movie, rate)
        data = data.to_numpy()[:, :3]

        self.items = data[:, :2].astype(np.int)  # -1 because ID begins from 1
        self.targets = self.__preprocess_target(data[:, 2]).astype(np.float32)
        self.field_dims = np.max(self.items, axis=0) + 1 # user, movie에서 가장 큰 값 뽑아내서 field 차원 찾기 
        self.user_field_idx = np.array((0, ), dtype=np.long)
        self.item_field_idx = np.array((1,), dtype=np.long)

    def __len__(self):
        return self.targets.shape[0]

    def __getitem__(self, index):
        return self.items[index], self.targets[index]

    def __preprocess_target(self, target):
        target[target <= 9] = 0 # KMRD 데이터 특성상 (9,10 평점에 몰려있음) 10점 아니면 다 0 
        target[target > 9] = 1
        return target
```


```python
import pandas as pd
import os
dataset = KMRDDataset(data_path=data_path)
```


```python
print(dataset.item_field_idx)
print(dataset.field_dims) # user 466 movie 532
print(sum(dataset.field_dims))
print(torch.nn.Embedding(sum(dataset.field_dims), 16)) # output dimension으로 16 잡아줌 (k)
print(torch.nn.Parameter(torch.zeros((1,))))
print(np.array((0, *np.cumsum(dataset.field_dims)[:-1]), dtype=np.long)) # offset 시의 결과 확인 : 0~466까지는 user, 뒷부분은 movie 
```

    [1]
    [466 532]
    998
    Embedding(998, 16)
    Parameter containing:
    tensor([0.], requires_grad=True)
    [  0 466]



```python
train_length = int(len(dataset) * 0.8)
valid_length = int(len(dataset) * 0.1)
test_length = len(dataset) - train_length - valid_length
train_dataset, valid_dataset, test_dataset = torch.utils.data.random_split(
    dataset, (train_length, valid_length, test_length))
```


```python
from torch.utils.data import DataLoader

train_data_loader = DataLoader(train_dataset, batch_size=16)
valid_data_loader = DataLoader(valid_dataset, batch_size=16)
test_data_loader = DataLoader(test_dataset, batch_size=1)
```


```python
print(dataset.items) # [user movie]
print(dataset.targets) # [rating]
```

    [[  0   0]
     [  0   1]
     [  0   2]
     ...
     [465  15]
     [465  15]
     [465 338]]
    [0. 0. 0. ... 0. 0. 0.]



```python
model = DeepFactorizationMachineModel(dataset.field_dims, embed_dim=16, mlp_dims=(16, 16), dropout=0.2)
model
```




    DeepFactorizationMachineModel(
      (linear): FeaturesLinear(
        (fc): Embedding(998, 1)
      )
      (fm): FactorizationMachine()
      (embedding): FeaturesEmbedding(
        (embedding): Embedding(998, 16)
      )
      (mlp): MultiLayerPerceptron(
        (mlp): Sequential(
          (0): Linear(in_features=32, out_features=16, bias=True)
          (1): BatchNorm1d(16, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
          (2): ReLU()
          (3): Dropout(p=0.2, inplace=False)
          (4): Linear(in_features=16, out_features=16, bias=True)
          (5): BatchNorm1d(16, eps=1e-05, momentum=0.1, affine=True, track_running_stats=True)
          (6): ReLU()
          (7): Dropout(p=0.2, inplace=False)
          (8): Linear(in_features=16, out_features=1, bias=True)
        )
      )
    )




```python
criterion = torch.nn.BCELoss() # 0,1이니까 binary cross entropy~
optimizer = torch.optim.Adam(params=model.parameters(), lr=0.001, weight_decay=1e-6)
```


```python
import tqdm
log_interval = 100

model.train()
total_loss = 0
tk0 = tqdm.tqdm(train_data_loader, smoothing=0, mininterval=1.0)
for i, (fields, target) in enumerate(tk0):
    # fields, target = fields.to(device), target.to(device)
    y = model(fields)
    loss = criterion(y, target.float())
    model.zero_grad()
    loss.backward()
    optimizer.step()
    total_loss += loss.item()
    if (i + 1) % log_interval == 0:
        tk0.set_postfix(loss=total_loss / log_interval)
        total_loss = 0
```

    100%|██████████| 500/500 [00:01<00:00, 342.01it/s, loss=0.606]

