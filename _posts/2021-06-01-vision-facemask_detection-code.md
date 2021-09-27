---
title: "[Vision/Object Detection]What is the best model for Face Mask Detection? - 코드구현"
excerpt: '코로나 시대, 객체 탐지 모델 7개를 비교하여 마스크 착용 유무 탐지에 가장 좋은 모델을 찾아본다.'
categories:
- Deep Learning
- Vision
- Object Detection
modified_date: 2021-06-01 10:36:28 +0900
toc: true
toc_sticky: true
---
# 목적 
- 마스크 착용 여부를 가장 정확하게 탐지하는 모델을 찾아보자. 
- 7개의 모델을 비교하고자 한다. 
- 설명 슬라이드 및 논문 페이퍼([링크]())
## Configuration
- Load Kaggle Dataset
- Import Libraries


```python
#코랩과 캐글 연동 및 다운로드
!pip install kaggle  
from google.colab import files  
files.upload()  
!mkdir -p ~/.kaggle  
!cp kaggle.json ~/.kaggle/    
!chmod 600 ~/.kaggle/kaggle.json  
!kaggle datasets download -d ashishjangra27/face-mask-12k-images-dataset
!unzip face-mask-12k-images-dataset.zip
!ls
```

    Requirement already satisfied: kaggle in /usr/local/lib/python3.7/dist-packages (1.5.12)
    Requirement already satisfied: certifi in /usr/local/lib/python3.7/dist-packages (from kaggle) (2020.12.5)
    Requirement already satisfied: python-dateutil in /usr/local/lib/python3.7/dist-packages (from kaggle) (2.8.1)
    Requirement already satisfied: tqdm in /usr/local/lib/python3.7/dist-packages (from kaggle) (4.41.1)
    Requirement already satisfied: six>=1.10 in /usr/local/lib/python3.7/dist-packages (from kaggle) (1.15.0)
    Requirement already satisfied: python-slugify in /usr/local/lib/python3.7/dist-packages (from kaggle) (5.0.2)
    Requirement already satisfied: requests in /usr/local/lib/python3.7/dist-packages (from kaggle) (2.23.0)
    Requirement already satisfied: urllib3 in /usr/local/lib/python3.7/dist-packages (from kaggle) (1.24.3)
    Requirement already satisfied: text-unidecode>=1.3 in /usr/local/lib/python3.7/dist-packages (from python-slugify->kaggle) (1.3)
    Requirement already satisfied: idna<3,>=2.5 in /usr/local/lib/python3.7/dist-packages (from requests->kaggle) (2.10)
    Requirement already satisfied: chardet<4,>=3.0.2 in /usr/local/lib/python3.7/dist-packages (from requests->kaggle) (3.0.4)




<input type="file" id="files-8eb80d34-1e2f-4ea4-b3a2-cc1ef7921e8e" name="files[]" multiple disabled
style="border:none" />
<output id="result-8eb80d34-1e2f-4ea4-b3a2-cc1ef7921e8e">
Upload widget is only available when the cell has been executed in the
current browser session. Please rerun this cell to enable.
</output>
 <script src="/nbextensions/google.colab/files.js"></script> 


    [1;30;43m스트리밍 출력 내용이 길어서 마지막 5000줄이 삭제되었습니다.[0m 
      inflating: Face Mask Dataset/Train/WithoutMask/1861.png  
      inflating: Face Mask Dataset/Train/WithoutMask/1862.png  
      inflating: Face Mask Dataset/Train/WithoutMask/1863.png  
      inflating: Face Mask Dataset/Train/WithoutMask/1864.png  
      inflating: Face Mask Dataset/Train/WithoutMask/1865.png  
      inflating: Face Mask Dataset/Train/WithoutMask/1866.png  
      ....
      inflating: Face Mask Dataset/Validation/WithoutMask/964.png  
      inflating: Face Mask Dataset/Validation/WithoutMask/965.png  
      inflating: Face Mask Dataset/Validation/WithoutMask/97.png  
      inflating: Face Mask Dataset/Validation/WithoutMask/970.png  
      inflating: Face Mask Dataset/Validation/WithoutMask/971.png  
      inflating: Face Mask Dataset/Validation/WithoutMask/974.png  
     face-mask-12k-images-dataset.zip   kaggle.json
    'Face Mask Dataset'		    sample_data



```python
!kaggle datasets download -d andrewmvd/face-mask-detection
```

    Downloading face-mask-detection.zip to /content
     99% 393M/398M [00:02<00:00, 211MB/s]
    100% 398M/398M [00:02<00:00, 182MB/s]



```python
!unzip face-mask-detection.zip
```

    Archive:  face-mask-detection.zip
      inflating: annotations/maksssksksss0.xml  
      inflating: annotations/maksssksksss1.xml  
      inflating: annotations/maksssksksss10.xml  
      inflating: annotations/maksssksksss100.xml  
      ...
      inflating: images/maksssksksss0.png  
      inflating: images/maksssksksss1.png  
      inflating: images/maksssksksss10.png  
      inflating: images/maksssksksss100.png  
      inflating: images/maksssksksss101.png  
      inflating: images/maksssksksss102.png



```python
! kaggle datasets download -d niharika41298/withwithout-mask
```

    Downloading withwithout-mask.zip to /content
     27% 9.00M/33.5M [00:00<00:01, 23.8MB/s]
    100% 33.5M/33.5M [00:00<00:00, 60.7MB/s]



```python
!unzip withwithout-mask.zip
```

    Archive:  withwithout-mask.zip
      inflating: maskdata/maskdata/test/with_mask/0-with-mask.jpg  
      inflating: maskdata/maskdata/test/with_mask/1-with-mask.jpg
      ...
      inflating: masks2.0/masks/train/1/augmented_image_257.jpg  
      inflating: masks2.0/masks/train/1/augmented_image_261.jpg  
      inflating: masks2.0/masks/train/1/augmented_image_265.jpg  
      inflating: masks2.0/masks/train/1/augmented_image_270.jpg  
      inflating: masks2.0/masks/train/1/augmented_image_281.jpg  
      inflating: masks2.0/masks/train/1/augmented_image_286.jpg  
      inflating: masks2.0/masks/train/1/augmented_image_291.jpg  
      inflating: masks2.0/masks/train/1/augmented_image_296.jpg  
      inflating: masks2.0/masks/train/1/augmented_image_305.jpg  
      inflating: masks2.0/masks/train/1/augmented_image_306.jpg  
      inflating: masks2.0/masks/train/1/augmented_image_314.jpg  
      inflating: masks2.0/masks/train/1/pra2.jpg  



```python
!mkdir with-and-without-mask
```


```python
!mv mask* with-and-without-mask
```


```python
!ls
```

     annotations			    kaggle.json
     face-mask-12k-images-dataset.zip   sample_data
    'Face Mask Dataset'		    with-and-without-mask
     face-mask-detection.zip	    withwithout-mask.zip
     images



```python
!kaggle datasets download -d lalitharajesh/haarcascades
```

    Downloading haarcascades.zip to /content
      0% 0.00/1.45M [00:00<?, ?B/s]
    100% 1.45M/1.45M [00:00<00:00, 48.8MB/s]



```python
!unzip haarcascades.zip
```

    Archive:  haarcascades.zip
      inflating: haarcascade_eye.xml     
      inflating: haarcascade_eye_tree_eyeglasses.xml  
      inflating: haarcascade_frontalcatface.xml  
      inflating: haarcascade_frontalcatface_extended.xml  
      inflating: haarcascade_frontalface_alt.xml  
      inflating: haarcascade_frontalface_alt2.xml  
      inflating: haarcascade_frontalface_alt_tree.xml  
      inflating: haarcascade_frontalface_default.xml  
      inflating: haarcascade_fullbody.xml  
      inflating: haarcascade_lefteye_2splits.xml  
      inflating: haarcascade_licence_plate_rus_16stages.xml  
      inflating: haarcascade_lowerbody.xml  
      inflating: haarcascade_profileface.xml  
      inflating: haarcascade_righteye_2splits.xml  
      inflating: haarcascade_russian_plate_number.xml  
      inflating: haarcascade_smile.xml   
      inflating: haarcascade_upperbody.xml  



```python
!mkdir frontalface
!mv haarcascade* frontalface
!ls
```

     annotations			    frontalface   with-and-without-mask
     face-mask-12k-images-dataset.zip   images	  withwithout-mask.zip
    'Face Mask Dataset'		    kaggle.json
     face-mask-detection.zip	    sample_data



```python
!cd with-and-without-mask
!ls
```

     annotations			    frontalface   with-and-without-mask
     face-mask-12k-images-dataset.zip   images	  withwithout-mask.zip
    'Face Mask Dataset'		    kaggle.json
     face-mask-detection.zip	    sample_data



```python
!kaggle datasets download -d omkargurav/face-mask-dataset
!unzip face-mask-dataset.zip
!ls
```

    [1;30;43m스트리밍 출력 내용이 길어서 마지막 5000줄이 삭제되었습니다.[0m
      inflating: data/with_mask/with_mask_3301.jpg  
      inflating: data/with_mask/with_mask_3302.jpg  
      inflating: data/with_mask/with_mask_3303.jpg  
      inflating: data/with_mask/with_mask_3304.jpg  
      ....
      inflating: data/without_mask/without_mask_997.jpg  
      inflating: data/without_mask/without_mask_998.jpg  
      inflating: data/without_mask/without_mask_999.jpg  
     annotations			    frontalface
     data				    images
     face-mask-12k-images-dataset.zip   kaggle.json
    'Face Mask Dataset'		    sample_data
     face-mask-dataset.zip		    with-and-without-mask
     face-mask-detection.zip	    withwithout-mask.zip



```python
import numpy as np # linear algebra
import pandas as pd # data processing, CSV file I/O (e.g. pd.read_csv)
import matplotlib.pyplot as plt
import seaborn as sns
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from tensorflow.keras.preprocessing.image import load_img
import cv2
import random

```


```python
import glob
import torch
import shutil
import itertools
import numpy as np # linear algebra
import pandas as pd # data processing, CSV file I/O (e.g. pd.read_csv)
import seaborn as sns
import matplotlib.pyplot as plt
from torch import nn
from torch import optim
from torchvision import transforms, datasets, models
from keras.models import Sequential
from keras.applications.vgg19 import preprocess_input
from keras.preprocessing.image import ImageDataGenerator
from keras.layers import Flatten, Dense, Conv2D, BatchNormalization, MaxPooling2D, Dropout
from tensorflow.keras.applications import EfficientNetB1, VGG19, ResNet50, InceptionV3, MobileNet, DenseNet201, NASNetMobile
```


```python
import os
os.listdir("Face Mask Dataset/Train/")
```




    ['WithoutMask', 'WithMask']




```python
print("Images in Train Dataset:\n")
print("Number of Images for with Mask category:{}".format(len(os.listdir("Face Mask Dataset/Train/WithMask"))))
print("Number of Images for with WithoutMask category:{}".format(len(os.listdir("Face Mask Dataset/Train/WithoutMask/"))))

```

    Images in Train Dataset:
    
    Number of Images for with Mask category:5000
    Number of Images for with WithoutMask category:5000



```python
train_dir = "Face Mask Dataset/Train/"
test_dir = "Face Mask Dataset/Test/"
```

# Data Augmentation

><h3>Images:</h3>


```python
#with Mask
plt.figure(figsize=(12,7))
for i in range(5):
    sample = random.choice(os.listdir(train_dir+"WithMask/"))
    plt.subplot(1,5,i+1)
    img = load_img(train_dir+"WithMask/"+sample)
    plt.subplots_adjust(hspace=0.001)
    plt.xlabel("With Mask")
    plt.imshow(img)
plt.show()

#without Mask
plt.figure(figsize=(12,7))
for i in range(5):
    sample = random.choice(os.listdir(train_dir+"WithoutMask/"))
    plt.subplot(1,5,i+1)
    img = load_img(train_dir+"WithoutMask/"+sample)
    plt.subplots_adjust(hspace=0.001)
    plt.xlabel("Without Mask")
    plt.imshow(img)
plt.show()
```



![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_21_0.png)





![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_21_1.png)



<h3>Data Augmentation:</h3>


```python
height = 150
width=150
train_datagen = ImageDataGenerator(rescale=1.0/255,validation_split=0.2,shear_range = 0.2,zoom_range=0.2,horizontal_flip=True)
train = train_datagen.flow_from_directory(directory=train_dir,target_size=(height,width),
                                          class_mode="categorical",batch_size=32,subset = "training")

valid_datagen = ImageDataGenerator(rescale=1.0/255)

valid = train_datagen.flow_from_directory(directory=train_dir,target_size=(height,width),
                                          class_mode="categorical",batch_size=32,subset="validation")
```

    Found 8000 images belonging to 2 classes.
    Found 2000 images belonging to 2 classes.


# Train 7 Models

## ConvNet Testing layers with ConvNet


```python
from keras.models import Sequential

histories = []
for i in range(3):
    model = Sequential()
    model.add(Conv2D(32, kernel_size=(3, 3), activation='relu', input_shape=(150, 150, 3)))
    model.add(BatchNormalization())
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Dropout(0.2))
    
    if i > 0: 
        model.add(Conv2D(64, kernel_size=(3, 3), activation='relu', input_shape=(150, 150, 3)))
        model.add(BatchNormalization())
        model.add(MaxPooling2D(pool_size=(2, 2)))
        model.add(Dropout(0.2))
    
        if i > 1: 
            model.add(Conv2D(128, kernel_size=(3, 3), activation='relu', input_shape=(150, 150, 3)))
            model.add(BatchNormalization())
            model.add(MaxPooling2D(pool_size=(2, 2)))
            model.add(Dropout(0.2))
    
    model.add(Flatten())
    model.add(Dense(2, activation='sigmoid'))
    model.summary()

    model.compile(optimizer='adam', loss='binary_crossentropy', metrics='accuracy')
    histories.append(model.fit_generator(generator=train, 
                                         validation_data=valid, 
                                         steps_per_epoch=len(train)//3, 
                                         validation_steps=len(valid)//3, 
                                         epochs=10))
```

    Model: "sequential_17"
    _________________________________________________________________
    Layer (type)                 Output Shape              Param #   
    =================================================================
    conv2d_25 (Conv2D)           (None, 148, 148, 32)      896       
    _________________________________________________________________
    batch_normalization_26 (Batc (None, 148, 148, 32)      128       
    _________________________________________________________________
    max_pooling2d_26 (MaxPooling (None, 74, 74, 32)        0         
    _________________________________________________________________
    dropout_26 (Dropout)         (None, 74, 74, 32)        0         
    _________________________________________________________________
    flatten_13 (Flatten)         (None, 175232)            0         
    _________________________________________________________________
    dense_13 (Dense)             (None, 2)                 350466    
    =================================================================
    Total params: 351,490
    Trainable params: 351,426
    Non-trainable params: 64
    _________________________________________________________________
    Epoch 1/10
    

    /usr/local/lib/python3.7/dist-packages/keras/engine/training.py:1915: UserWarning: `Model.fit_generator` is deprecated and will be removed in a future version. Please use `Model.fit`, which supports generators.
      warnings.warn('`Model.fit_generator` is deprecated and '
    

    83/83 [==============================] - 19s 219ms/step - loss: 1.2393 - accuracy: 0.8840 - val_loss: 0.5732 - val_accuracy: 0.7783
    Epoch 2/10
    83/83 [==============================] - 18s 214ms/step - loss: 0.3196 - accuracy: 0.9602 - val_loss: 0.9409 - val_accuracy: 0.6577
    Epoch 3/10
    83/83 [==============================] - 18s 215ms/step - loss: 0.2628 - accuracy: 0.9671 - val_loss: 0.2437 - val_accuracy: 0.9241
    Epoch 4/10
    83/83 [==============================] - 18s 213ms/step - loss: 0.2200 - accuracy: 0.9718 - val_loss: 0.2475 - val_accuracy: 0.9077
    Epoch 5/10
    83/83 [==============================] - 18s 213ms/step - loss: 0.1381 - accuracy: 0.9792 - val_loss: 0.2589 - val_accuracy: 0.9301
    Epoch 6/10
    83/83 [==============================] - 18s 215ms/step - loss: 0.1896 - accuracy: 0.9735 - val_loss: 0.8904 - val_accuracy: 0.8824
    Epoch 7/10
    83/83 [==============================] - 18s 214ms/step - loss: 0.2077 - accuracy: 0.9714 - val_loss: 0.4959 - val_accuracy: 0.9509
    Epoch 8/10
    83/83 [==============================] - 18s 212ms/step - loss: 0.2023 - accuracy: 0.9685 - val_loss: 0.3304 - val_accuracy: 0.9494
    Epoch 9/10
    83/83 [==============================] - 18s 215ms/step - loss: 0.1309 - accuracy: 0.9788 - val_loss: 0.6745 - val_accuracy: 0.9137
    Epoch 10/10
    83/83 [==============================] - 18s 212ms/step - loss: 0.2494 - accuracy: 0.9642 - val_loss: 0.6319 - val_accuracy: 0.9286
    Model: "sequential_18"
    _________________________________________________________________
    Layer (type)                 Output Shape              Param #   
    =================================================================
    conv2d_26 (Conv2D)           (None, 148, 148, 32)      896       
    _________________________________________________________________
    batch_normalization_27 (Batc (None, 148, 148, 32)      128       
    _________________________________________________________________
    max_pooling2d_27 (MaxPooling (None, 74, 74, 32)        0         
    _________________________________________________________________
    dropout_27 (Dropout)         (None, 74, 74, 32)        0         
    _________________________________________________________________
    conv2d_27 (Conv2D)           (None, 72, 72, 64)        18496     
    _________________________________________________________________
    batch_normalization_28 (Batc (None, 72, 72, 64)        256       
    _________________________________________________________________
    max_pooling2d_28 (MaxPooling (None, 36, 36, 64)        0         
    _________________________________________________________________
    dropout_28 (Dropout)         (None, 36, 36, 64)        0         
    _________________________________________________________________
    flatten_14 (Flatten)         (None, 82944)             0         
    _________________________________________________________________
    dense_14 (Dense)             (None, 2)                 165890    
    =================================================================
    Total params: 185,666
    Trainable params: 185,474
    Non-trainable params: 192
    _________________________________________________________________
    Epoch 1/10
    83/83 [==============================] - 20s 227ms/step - loss: 1.4548 - accuracy: 0.8697 - val_loss: 3.6322 - val_accuracy: 0.5268
    Epoch 2/10
    83/83 [==============================] - 18s 221ms/step - loss: 0.4808 - accuracy: 0.9614 - val_loss: 3.1423 - val_accuracy: 0.5253
    Epoch 3/10
    83/83 [==============================] - 18s 219ms/step - loss: 0.7233 - accuracy: 0.9539 - val_loss: 8.4443 - val_accuracy: 0.5372
    Epoch 4/10
    83/83 [==============================] - 18s 220ms/step - loss: 0.4472 - accuracy: 0.9629 - val_loss: 5.4666 - val_accuracy: 0.6503
    Epoch 5/10
    83/83 [==============================] - 18s 222ms/step - loss: 0.5129 - accuracy: 0.9696 - val_loss: 0.6152 - val_accuracy: 0.9464
    Epoch 6/10
    83/83 [==============================] - 18s 221ms/step - loss: 0.4910 - accuracy: 0.9682 - val_loss: 0.6641 - val_accuracy: 0.9479
    Epoch 7/10
    83/83 [==============================] - 18s 220ms/step - loss: 0.3646 - accuracy: 0.9815 - val_loss: 1.7643 - val_accuracy: 0.9018
    Epoch 8/10
    83/83 [==============================] - 18s 221ms/step - loss: 0.4164 - accuracy: 0.9763 - val_loss: 1.1468 - val_accuracy: 0.9211
    Epoch 9/10
    83/83 [==============================] - 18s 220ms/step - loss: 0.4656 - accuracy: 0.9766 - val_loss: 1.0286 - val_accuracy: 0.9494
    Epoch 10/10
    83/83 [==============================] - 18s 220ms/step - loss: 0.2667 - accuracy: 0.9871 - val_loss: 1.3896 - val_accuracy: 0.9494
    Model: "sequential_19"
    _________________________________________________________________
    Layer (type)                 Output Shape              Param #   
    =================================================================
    conv2d_28 (Conv2D)           (None, 148, 148, 32)      896       
    _________________________________________________________________
    batch_normalization_29 (Batc (None, 148, 148, 32)      128       
    _________________________________________________________________
    max_pooling2d_29 (MaxPooling (None, 74, 74, 32)        0         
    _________________________________________________________________
    dropout_29 (Dropout)         (None, 74, 74, 32)        0         
    _________________________________________________________________
    conv2d_29 (Conv2D)           (None, 72, 72, 64)        18496     
    _________________________________________________________________
    batch_normalization_30 (Batc (None, 72, 72, 64)        256       
    _________________________________________________________________
    max_pooling2d_30 (MaxPooling (None, 36, 36, 64)        0         
    _________________________________________________________________
    dropout_30 (Dropout)         (None, 36, 36, 64)        0         
    _________________________________________________________________
    conv2d_30 (Conv2D)           (None, 34, 34, 128)       73856     
    _________________________________________________________________
    batch_normalization_31 (Batc (None, 34, 34, 128)       512       
    _________________________________________________________________
    max_pooling2d_31 (MaxPooling (None, 17, 17, 128)       0         
    _________________________________________________________________
    dropout_31 (Dropout)         (None, 17, 17, 128)       0         
    _________________________________________________________________
    flatten_15 (Flatten)         (None, 36992)             0         
    _________________________________________________________________
    dense_15 (Dense)             (None, 2)                 73986     
    =================================================================
    Total params: 168,130
    Trainable params: 167,682
    Non-trainable params: 448
    _________________________________________________________________
    Epoch 1/10
    83/83 [==============================] - 20s 229ms/step - loss: 0.5875 - accuracy: 0.9091 - val_loss: 3.0262 - val_accuracy: 0.4762
    Epoch 2/10
    83/83 [==============================] - 18s 221ms/step - loss: 0.2056 - accuracy: 0.9687 - val_loss: 0.4334 - val_accuracy: 0.8259
    Epoch 3/10
    83/83 [==============================] - 18s 222ms/step - loss: 0.1600 - accuracy: 0.9792 - val_loss: 0.7784 - val_accuracy: 0.8408
    Epoch 4/10
    83/83 [==============================] - 18s 223ms/step - loss: 0.1560 - accuracy: 0.9798 - val_loss: 0.4578 - val_accuracy: 0.9405
    Epoch 5/10
    83/83 [==============================] - 18s 221ms/step - loss: 0.2043 - accuracy: 0.9751 - val_loss: 1.5926 - val_accuracy: 0.8110
    Epoch 6/10
    83/83 [==============================] - 18s 221ms/step - loss: 0.2302 - accuracy: 0.9763 - val_loss: 0.5961 - val_accuracy: 0.9390
    Epoch 7/10
    83/83 [==============================] - 18s 220ms/step - loss: 0.0967 - accuracy: 0.9854 - val_loss: 1.3696 - val_accuracy: 0.8661
    Epoch 8/10
    83/83 [==============================] - 18s 221ms/step - loss: 0.1184 - accuracy: 0.9851 - val_loss: 0.5381 - val_accuracy: 0.9435
    Epoch 9/10
    83/83 [==============================] - 18s 219ms/step - loss: 0.1724 - accuracy: 0.9810 - val_loss: 15.4781 - val_accuracy: 0.5149
    Epoch 10/10
    83/83 [==============================] - 18s 220ms/step - loss: 0.1163 - accuracy: 0.9894 - val_loss: 0.2193 - val_accuracy: 0.9762



```python
fig, axes = plt.subplots(2, 2, figsize=(15, 10))
for metric in histories[0].history:
    index = list(histories[0].history).index(metric)
    ax = axes.flatten()[index]
    layer_num = 0
    for history in histories:
        layer_num += 1
        ax.plot(history.history[metric], label=str(layer_num)+' layer(s)')
    ax.set_title(metric)
    ax.legend()
plt.show()
```



![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_27_0.png)



## ConvNet


```python
model_histories = []
for layer in [Conv2D(32, kernel_size=(3, 3), activation='relu', input_shape=(150, 150, 3))]:
    model = Sequential()
    model.add(layer)
    model.add(BatchNormalization())
    model.add(MaxPooling2D(pool_size=(2, 2)))
    model.add(Dropout(0.2))
    
    model.add(Flatten())
    model.add(Dense(2, activation='sigmoid'))
    model.summary()

    model.compile(optimizer='adam', loss='binary_crossentropy', metrics='accuracy')
    model_histories.append(model.fit_generator(generator=train, 
                                         validation_data=valid, 
                                         steps_per_epoch=len(train)//3, 
                                         validation_steps=len(valid)//3, 
                                         epochs=10))
```

    Model: "sequential"
    _________________________________________________________________
    Layer (type)                 Output Shape              Param #   
    =================================================================
    conv2d (Conv2D)              (None, 148, 148, 32)      896       
    _________________________________________________________________
    batch_normalization (BatchNo (None, 148, 148, 32)      128       
    _________________________________________________________________
    max_pooling2d (MaxPooling2D) (None, 74, 74, 32)        0         
    _________________________________________________________________
    dropout (Dropout)            (None, 74, 74, 32)        0         
    _________________________________________________________________
    flatten (Flatten)            (None, 175232)            0         
    _________________________________________________________________
    dense (Dense)                (None, 2)                 350466    
    =================================================================
    Total params: 351,490
    Trainable params: 351,426
    Non-trainable params: 64
    _________________________________________________________________
    

    /usr/local/lib/python3.7/dist-packages/keras/engine/training.py:1915: UserWarning: `Model.fit_generator` is deprecated and will be removed in a future version. Please use `Model.fit`, which supports generators.
      warnings.warn('`Model.fit_generator` is deprecated and '
    

    Epoch 1/10
    83/83 [==============================] - 62s 214ms/step - loss: 0.9515 - accuracy: 0.8875 - val_loss: 0.3282 - val_accuracy: 0.8943
    Epoch 2/10
    83/83 [==============================] - 17s 209ms/step - loss: 0.2300 - accuracy: 0.9663 - val_loss: 0.4833 - val_accuracy: 0.7842
    Epoch 3/10
    83/83 [==============================] - 17s 208ms/step - loss: 0.2003 - accuracy: 0.9739 - val_loss: 0.3448 - val_accuracy: 0.9182
    Epoch 4/10
    83/83 [==============================] - 17s 211ms/step - loss: 0.2527 - accuracy: 0.9627 - val_loss: 0.3171 - val_accuracy: 0.9077
    Epoch 5/10
    83/83 [==============================] - 18s 223ms/step - loss: 0.3326 - accuracy: 0.9537 - val_loss: 0.7074 - val_accuracy: 0.8527
    Epoch 6/10
    83/83 [==============================] - 18s 222ms/step - loss: 0.2556 - accuracy: 0.9740 - val_loss: 0.2292 - val_accuracy: 0.9554
    Epoch 7/10
    83/83 [==============================] - 18s 220ms/step - loss: 0.2083 - accuracy: 0.9746 - val_loss: 0.3235 - val_accuracy: 0.9554
    Epoch 8/10
    83/83 [==============================] - 18s 212ms/step - loss: 0.1827 - accuracy: 0.9766 - val_loss: 0.2851 - val_accuracy: 0.9449
    Epoch 9/10
    83/83 [==============================] - 19s 224ms/step - loss: 0.1357 - accuracy: 0.9767 - val_loss: 0.3161 - val_accuracy: 0.9524
    Epoch 10/10
    83/83 [==============================] - 18s 221ms/step - loss: 0.1169 - accuracy: 0.9829 - val_loss: 0.3526 - val_accuracy: 0.9554



```python
model.save('convnet.h5')
convnet_model = model
```


```python
convnet_evaluate = convnet_model.evaluate_generator(valid)
convnet_evaluate
```

    /usr/local/lib/python3.7/dist-packages/keras/engine/training.py:1948: UserWarning: `Model.evaluate_generator` is deprecated and will be removed in a future version. Please use `Model.evaluate`, which supports generators.
      warnings.warn('`Model.evaluate_generator` is deprecated and '
    




    [0.32139459252357483, 0.9520000219345093]




```python
from IPython.display import SVG
from keras.utils.vis_utils import model_to_dot

SVG(model_to_dot(model, show_shapes=True, dpi=65).create(prog='dot', format='svg'))
```





![svg](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_32_0.svg)




## MobileNet

><h3>Model Building:</h3>


```python
from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2

mobilenet = MobileNetV2(weights = "imagenet",include_top = False,input_shape=(150,150,3))
```

    WARNING:tensorflow:`input_shape` is undefined or non-square, or `rows` is not in [96, 128, 160, 192, 224]. Weights for input shape (224, 224) will be loaded as the default.
    Downloading data from https://storage.googleapis.com/tensorflow/keras-applications/mobilenet_v2/mobilenet_v2_weights_tf_dim_ordering_tf_kernels_1.0_224_no_top.h5
    9412608/9406464 [==============================] - 0s 0us/step



```python
for layer in mobilenet.layers:
    layer.trainable = False
```


```python
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Flatten,Dense
model = Sequential()
model.add(mobilenet)
model.add(Flatten())
model.add(Dense(2,activation="sigmoid"))
```


```python
model.summary()
```

    Model: "sequential"
    _________________________________________________________________
    Layer (type)                 Output Shape              Param #   
    =================================================================
    mobilenetv2_1.00_224 (Functi (None, 5, 5, 1280)        2257984   
    _________________________________________________________________
    flatten (Flatten)            (None, 32000)             0         
    _________________________________________________________________
    dense (Dense)                (None, 2)                 64002     
    =================================================================
    Total params: 2,321,986
    Trainable params: 64,002
    Non-trainable params: 2,257,984
    _________________________________________________________________



```python
model.compile(optimizer="adam",loss="binary_crossentropy",metrics ="accuracy")
```


```python
# from tensorflow.keras.callbacks import ModelCheckpoint,EarlyStopping
# checkpoint = ModelCheckpoint("moblenet_facemask.h5",monitor="val_accuracy",save_best_only=True,verbose=1)
# earlystop = EarlyStopping(monitor="val_acc",patience=5,verbose=1)
```


```python
model_histories.append(model.fit_generator(generator=train,steps_per_epoch=len(train)// 32,validation_data=valid,
                             validation_steps = len(valid)//32,epochs=10))
```

    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/engine/training.py:1940: UserWarning: `Model.fit_generator` is deprecated and will be removed in a future version. Please use `Model.fit`, which supports generators.
      warnings.warn('`Model.fit_generator` is deprecated and '
    

    Epoch 1/10
    7/7 [==============================] - 5s 366ms/step - loss: 1.3101 - accuracy: 0.7723 - val_loss: 0.8136 - val_accuracy: 0.8125
    Epoch 2/10
    7/7 [==============================] - 2s 259ms/step - loss: 0.5490 - accuracy: 0.9241 - val_loss: 0.0075 - val_accuracy: 1.0000
    Epoch 3/10
    7/7 [==============================] - 2s 245ms/step - loss: 0.1397 - accuracy: 0.9866 - val_loss: 0.0060 - val_accuracy: 1.0000
    Epoch 4/10
    7/7 [==============================] - 2s 256ms/step - loss: 0.0944 - accuracy: 0.9866 - val_loss: 0.0113 - val_accuracy: 1.0000
    Epoch 5/10
    7/7 [==============================] - 2s 255ms/step - loss: 0.1862 - accuracy: 0.9821 - val_loss: 0.2993 - val_accuracy: 0.9688
    Epoch 6/10
    7/7 [==============================] - 2s 240ms/step - loss: 0.0207 - accuracy: 0.9911 - val_loss: 0.0068 - val_accuracy: 1.0000
    Epoch 7/10
    7/7 [==============================] - 2s 257ms/step - loss: 0.0604 - accuracy: 0.9821 - val_loss: 5.8131e-05 - val_accuracy: 1.0000
    Epoch 8/10
    7/7 [==============================] - 2s 255ms/step - loss: 0.1621 - accuracy: 0.9866 - val_loss: 0.0020 - val_accuracy: 1.0000
    Epoch 9/10
    7/7 [==============================] - 2s 251ms/step - loss: 0.0516 - accuracy: 0.9911 - val_loss: 0.0098 - val_accuracy: 1.0000
    Epoch 10/10
    7/7 [==============================] - 2s 253ms/step - loss: 0.0249 - accuracy: 0.9955 - val_loss: 0.1287 - val_accuracy: 0.9688



```python
mobile_evaluate = model.evaluate_generator(valid)
mobile_evaluate
```

    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/engine/training.py:1973: UserWarning: `Model.evaluate_generator` is deprecated and will be removed in a future version. Please use `Model.evaluate`, which supports generators.
      warnings.warn('`Model.evaluate_generator` is deprecated and '
    




    [0.05435192584991455, 0.9879999756813049]




```python
model.save("mobilenet.h5")
# pred = model.predict_classes(valid)
# pred[:15]
mobilenet_model = model
```

    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/utils/generic_utils.py:497: CustomMaskWarning: Custom mask layers require a config and must override get_config. When loading, the custom mask layer must be passed to the custom_objects argument.
      category=CustomMaskWarning)



```python
from IPython.display import SVG
from tensorflow.python.keras.utils.vis_utils import model_to_dot

SVG(model_to_dot(mobilenet_model, show_shapes=True, dpi=65).create(prog='dot', format='svg'))
```





![svg](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_44_0.svg)




## DenseNet

><h3>Model Building:</h3>


```python
from tensorflow.keras.applications import DenseNet201

densenet = DenseNet201(weights = "imagenet",include_top = False,input_shape=(150,150,3))
```

    Downloading data from https://storage.googleapis.com/tensorflow/keras-applications/densenet/densenet201_weights_tf_dim_ordering_tf_kernels_notop.h5
    74842112/74836368 [==============================] - 1s 0us/step



```python
# freeze
for layer in densenet.layers:
    layer.trainable = False
```


```python
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Flatten,Dense
model = Sequential()
model.add(densenet)
model.add(Flatten())
model.add(Dense(2,activation="sigmoid"))
```


```python
model.summary()
```

    Model: "sequential_1"
    _________________________________________________________________
    Layer (type)                 Output Shape              Param #   
    =================================================================
    densenet201 (Functional)     (None, 4, 4, 1920)        18321984  
    _________________________________________________________________
    flatten_1 (Flatten)          (None, 30720)             0         
    _________________________________________________________________
    dense_1 (Dense)              (None, 2)                 61442     
    =================================================================
    Total params: 18,383,426
    Trainable params: 61,442
    Non-trainable params: 18,321,984
    _________________________________________________________________



```python
model.compile(optimizer="adam",loss="binary_crossentropy",metrics ="accuracy")
```


```python
# from tensorflow.keras.callbacks import ModelCheckpoint,EarlyStopping
# checkpoint = ModelCheckpoint("densenet_facemask.h5",monitor="val_accuracy",save_best_only=True,verbose=1)
# earlystop = EarlyStopping(monitor="val_accuracy",patience=5,verbose=1)
```


```python
model_histories.append(model.fit_generator(generator=train,steps_per_epoch=len(train)// 32,validation_data=valid,
                             validation_steps = len(valid)//32, epochs=10))
```

    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/engine/training.py:1940: UserWarning: `Model.fit_generator` is deprecated and will be removed in a future version. Please use `Model.fit`, which supports generators.
      warnings.warn('`Model.fit_generator` is deprecated and '
    

    Epoch 1/10
    7/7 [==============================] - 15s 677ms/step - loss: 0.3663 - accuracy: 0.8661 - val_loss: 0.0110 - val_accuracy: 1.0000
    Epoch 2/10
    7/7 [==============================] - 2s 264ms/step - loss: 0.0356 - accuracy: 0.9866 - val_loss: 5.8067e-05 - val_accuracy: 1.0000
    Epoch 3/10
    7/7 [==============================] - 2s 261ms/step - loss: 0.0371 - accuracy: 0.9955 - val_loss: 0.0018 - val_accuracy: 1.0000
    Epoch 4/10
    7/7 [==============================] - 2s 263ms/step - loss: 0.1412 - accuracy: 0.9821 - val_loss: 0.2351 - val_accuracy: 0.9688
    Epoch 5/10
    7/7 [==============================] - 2s 275ms/step - loss: 0.0040 - accuracy: 1.0000 - val_loss: 4.4025e-04 - val_accuracy: 1.0000
    Epoch 6/10
    7/7 [==============================] - 2s 272ms/step - loss: 0.0485 - accuracy: 0.9955 - val_loss: 5.6109e-06 - val_accuracy: 1.0000
    Epoch 7/10
    7/7 [==============================] - 2s 277ms/step - loss: 0.0391 - accuracy: 0.9777 - val_loss: 0.0014 - val_accuracy: 1.0000
    Epoch 8/10
    7/7 [==============================] - 2s 262ms/step - loss: 0.0904 - accuracy: 0.9821 - val_loss: 0.0164 - val_accuracy: 1.0000
    Epoch 9/10
    7/7 [==============================] - 2s 266ms/step - loss: 0.0157 - accuracy: 0.9955 - val_loss: 0.0150 - val_accuracy: 1.0000
    Epoch 10/10
    7/7 [==============================] - 2s 272ms/step - loss: 0.0234 - accuracy: 0.9955 - val_loss: 0.0038 - val_accuracy: 1.0000



```python
dense_evaluate = model.evaluate_generator(valid)
dense_evaluate
```

    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/engine/training.py:1973: UserWarning: `Model.evaluate_generator` is deprecated and will be removed in a future version. Please use `Model.evaluate`, which supports generators.
      warnings.warn('`Model.evaluate_generator` is deprecated and '
    




    [0.03043755330145359, 0.9919999837875366]




```python
model.save("densenet.h5")
densenet_model = model
#pred = model.predict_classes(valid)
#pred[:15]
```


```python
SVG(model_to_dot(densenet_model, show_shapes=True, dpi=65).create(prog='dot', format='svg'))
```





![svg](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_56_0.svg)




## InceptionV3

><h3>Model Building:</h3>


```python
from tensorflow.keras.applications import InceptionV3

inception = InceptionV3(include_top=False, input_shape=(150, 150, 3))
```

    Downloading data from https://storage.googleapis.com/tensorflow/keras-applications/inception_v3/inception_v3_weights_tf_dim_ordering_tf_kernels_notop.h5
    87916544/87910968 [==============================] - 0s 0us/step



```python
# freeze
for layer in inception.layers:
    layer.trainable = False
```


```python
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Flatten,Dense
model = Sequential()
model.add(inception)
model.add(Flatten())
model.add(Dense(2,activation="sigmoid"))
```


```python
model.summary()
```

    Model: "sequential_2"
    _________________________________________________________________
    Layer (type)                 Output Shape              Param #   
    =================================================================
    inception_v3 (Functional)    (None, 3, 3, 2048)        21802784  
    _________________________________________________________________
    flatten_2 (Flatten)          (None, 18432)             0         
    _________________________________________________________________
    dense_2 (Dense)              (None, 2)                 36866     
    =================================================================
    Total params: 21,839,650
    Trainable params: 36,866
    Non-trainable params: 21,802,784
    _________________________________________________________________



```python
model.compile(optimizer="adam",loss="binary_crossentropy",metrics ="accuracy")
```


```python
# from tensorflow.keras.callbacks import ModelCheckpoint,EarlyStopping
# checkpoint = ModelCheckpoint("densenet_facemask.h5",monitor="val_accuracy",save_best_only=True,verbose=1)
# earlystop = EarlyStopping(monitor="val_accuracy",patience=5,verbose=1)
```


```python
model_histories.append(model.fit_generator(generator=train,steps_per_epoch=len(train)// 32,validation_data=valid,
                             validation_steps = len(valid)//32, epochs=10))
```

    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/engine/training.py:1940: UserWarning: `Model.fit_generator` is deprecated and will be removed in a future version. Please use `Model.fit`, which supports generators.
      warnings.warn('`Model.fit_generator` is deprecated and '
    

    Epoch 1/10
    7/7 [==============================] - 7s 429ms/step - loss: 0.3650 - accuracy: 0.8616 - val_loss: 0.1306 - val_accuracy: 0.9375
    Epoch 2/10
    7/7 [==============================] - 2s 266ms/step - loss: 0.0570 - accuracy: 0.9866 - val_loss: 0.4049 - val_accuracy: 0.9688
    Epoch 3/10
    7/7 [==============================] - 2s 252ms/step - loss: 0.1229 - accuracy: 0.9866 - val_loss: 2.2869e-06 - val_accuracy: 1.0000
    Epoch 4/10
    7/7 [==============================] - 2s 251ms/step - loss: 0.0541 - accuracy: 0.9911 - val_loss: 8.2029e-04 - val_accuracy: 1.0000
    Epoch 5/10
    7/7 [==============================] - 2s 256ms/step - loss: 0.0031 - accuracy: 1.0000 - val_loss: 1.2229e-04 - val_accuracy: 1.0000
    Epoch 6/10
    7/7 [==============================] - 2s 250ms/step - loss: 0.0035 - accuracy: 1.0000 - val_loss: 3.8108e-04 - val_accuracy: 1.0000
    Epoch 7/10
    7/7 [==============================] - 2s 250ms/step - loss: 0.3397 - accuracy: 0.9732 - val_loss: 0.0016 - val_accuracy: 1.0000
    Epoch 8/10
    7/7 [==============================] - 2s 262ms/step - loss: 0.0755 - accuracy: 0.9955 - val_loss: 0.0206 - val_accuracy: 1.0000
    Epoch 9/10
    7/7 [==============================] - 2s 258ms/step - loss: 0.1150 - accuracy: 0.9911 - val_loss: 6.4188e-06 - val_accuracy: 1.0000
    Epoch 10/10
    7/7 [==============================] - 2s 249ms/step - loss: 0.1467 - accuracy: 0.9821 - val_loss: 6.5210e-04 - val_accuracy: 1.0000



```python
inception_evaluate = model.evaluate_generator(valid)
inception_evaluate
```

    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/engine/training.py:1973: UserWarning: `Model.evaluate_generator` is deprecated and will be removed in a future version. Please use `Model.evaluate`, which supports generators.
      warnings.warn('`Model.evaluate_generator` is deprecated and '
    




    [0.13425445556640625, 0.9775000214576721]




```python
model.save("inception.h5")
inception_model = model
#pred = model.predict_classes(valid)
#pred[:15]
```


```python
SVG(model_to_dot(inception_model, show_shapes=True, dpi=65).create(prog='dot', format='svg'))
```





![svg](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_68_0.svg)




## VGG19

><h3>Model Building:</h3>


```python
from tensorflow.keras.applications import InceptionV3

vgg19 = VGG19(include_top=False, input_shape=(150, 150, 3))
```

    Downloading data from https://storage.googleapis.com/tensorflow/keras-applications/vgg19/vgg19_weights_tf_dim_ordering_tf_kernels_notop.h5
    80142336/80134624 [==============================] - 0s 0us/step



```python
# freeze
for layer in vgg19.layers:
    layer.trainable = False
```


```python
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Flatten,Dense
model = Sequential()
model.add(vgg19)
model.add(Flatten())
model.add(Dense(2,activation="sigmoid"))
```


```python
model.summary()
```

    Model: "sequential_3"
    _________________________________________________________________
    Layer (type)                 Output Shape              Param #   
    =================================================================
    vgg19 (Functional)           (None, 4, 4, 512)         20024384  
    _________________________________________________________________
    flatten_3 (Flatten)          (None, 8192)              0         
    _________________________________________________________________
    dense_3 (Dense)              (None, 2)                 16386     
    =================================================================
    Total params: 20,040,770
    Trainable params: 16,386
    Non-trainable params: 20,024,384
    _________________________________________________________________



```python
model.compile(optimizer="adam",loss="binary_crossentropy",metrics ="accuracy")
```


```python
# from tensorflow.keras.callbacks import ModelCheckpoint,EarlyStopping
# checkpoint = ModelCheckpoint("densenet_facemask.h5",monitor="val_accuracy",save_best_only=True,verbose=1)
# earlystop = EarlyStopping(monitor="val_accuracy",patience=5,verbose=1)
```


```python
model_histories.append(model.fit_generator(generator=train,steps_per_epoch=len(train)// 32,validation_data=valid,
                             validation_steps = len(valid)//32, epochs=10))
```

    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/engine/training.py:1940: UserWarning: `Model.fit_generator` is deprecated and will be removed in a future version. Please use `Model.fit`, which supports generators.
      warnings.warn('`Model.fit_generator` is deprecated and '
    

    Epoch 1/10
    7/7 [==============================] - 6s 296ms/step - loss: 0.6241 - accuracy: 0.7143 - val_loss: 0.4291 - val_accuracy: 0.8438
    Epoch 2/10
    7/7 [==============================] - 2s 257ms/step - loss: 0.3762 - accuracy: 0.8616 - val_loss: 0.4027 - val_accuracy: 0.8438
    Epoch 3/10
    7/7 [==============================] - 2s 261ms/step - loss: 0.2947 - accuracy: 0.8929 - val_loss: 0.3127 - val_accuracy: 0.8750
    Epoch 4/10
    7/7 [==============================] - 2s 256ms/step - loss: 0.1942 - accuracy: 0.9464 - val_loss: 0.2254 - val_accuracy: 0.9375
    Epoch 5/10
    7/7 [==============================] - 2s 263ms/step - loss: 0.1968 - accuracy: 0.9330 - val_loss: 0.2045 - val_accuracy: 0.9375
    Epoch 6/10
    7/7 [==============================] - 2s 262ms/step - loss: 0.1478 - accuracy: 0.9643 - val_loss: 0.0764 - val_accuracy: 1.0000
    Epoch 7/10
    7/7 [==============================] - 2s 257ms/step - loss: 0.1300 - accuracy: 0.9777 - val_loss: 0.1285 - val_accuracy: 0.9688
    Epoch 8/10
    7/7 [==============================] - 2s 256ms/step - loss: 0.1249 - accuracy: 0.9732 - val_loss: 0.1094 - val_accuracy: 0.9688
    Epoch 9/10
    7/7 [==============================] - 2s 256ms/step - loss: 0.1324 - accuracy: 0.9509 - val_loss: 0.1518 - val_accuracy: 0.9375
    Epoch 10/10
    7/7 [==============================] - 2s 258ms/step - loss: 0.1596 - accuracy: 0.9420 - val_loss: 0.0807 - val_accuracy: 1.0000



```python
vgg19_evaluate = model.evaluate_generator(valid)
vgg19_evaluate
```

    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/engine/training.py:1973: UserWarning: `Model.evaluate_generator` is deprecated and will be removed in a future version. Please use `Model.evaluate`, which supports generators.
      warnings.warn('`Model.evaluate_generator` is deprecated and '
    




    [0.1290038824081421, 0.965499997138977]




```python
model.save("vgg19.h5")
vgg19_model = model
#pred = model.predict_classes(valid)
#pred[:15]
```


```python
SVG(model_to_dot(vgg19_model, show_shapes=True, dpi=65).create(prog='dot', format='svg'))
```





![svg](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_80_0.svg)




## EfficientNet

><h3>Model Building:</h3>


```python
from tensorflow.keras.applications import InceptionV3

efficientnet = EfficientNetB1(include_top=False, input_shape=(150, 150, 3))
```

    Downloading data from https://storage.googleapis.com/keras-applications/efficientnetb1_notop.h5
    27025408/27018416 [==============================] - 0s 0us/step



```python
# freeze
for layer in efficientnet.layers:
    layer.trainable = False
```


```python
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Flatten,Dense
model = Sequential()
model.add(efficientnet)
model.add(Flatten())
model.add(Dense(2,activation="sigmoid"))
```


```python
model.summary()
```

    Model: "sequential_4"
    _________________________________________________________________
    Layer (type)                 Output Shape              Param #   
    =================================================================
    efficientnetb1 (Functional)  (None, 5, 5, 1280)        6575239   
    _________________________________________________________________
    flatten_4 (Flatten)          (None, 32000)             0         
    _________________________________________________________________
    dense_4 (Dense)              (None, 2)                 64002     
    =================================================================
    Total params: 6,639,241
    Trainable params: 64,002
    Non-trainable params: 6,575,239
    _________________________________________________________________



```python
model.compile(optimizer="adam",loss="binary_crossentropy",metrics ="accuracy")
```


```python
# from tensorflow.keras.callbacks import ModelCheckpoint,EarlyStopping
# checkpoint = ModelCheckpoint("densenet_facemask.h5",monitor="val_accuracy",save_best_only=True,verbose=1)
# earlystop = EarlyStopping(monitor="val_accuracy",patience=5,verbose=1)
```


```python
model_histories.append(model.fit_generator(generator=train,steps_per_epoch=len(train)// 32,validation_data=valid,
                             validation_steps = len(valid)//32, epochs=10))
```

    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/engine/training.py:1940: UserWarning: `Model.fit_generator` is deprecated and will be removed in a future version. Please use `Model.fit`, which supports generators.
      warnings.warn('`Model.fit_generator` is deprecated and '
    

    Epoch 1/10
    7/7 [==============================] - 10s 505ms/step - loss: 2.6089 - accuracy: 0.5045 - val_loss: 1.1192 - val_accuracy: 0.5000
    Epoch 2/10
    7/7 [==============================] - 2s 254ms/step - loss: 1.9411 - accuracy: 0.5000 - val_loss: 1.8807 - val_accuracy: 0.4375
    Epoch 3/10
    7/7 [==============================] - 2s 264ms/step - loss: 1.5564 - accuracy: 0.4955 - val_loss: 1.5464 - val_accuracy: 0.5625
    Epoch 4/10
    7/7 [==============================] - 2s 257ms/step - loss: 1.0811 - accuracy: 0.5179 - val_loss: 0.8355 - val_accuracy: 0.3750
    Epoch 5/10
    7/7 [==============================] - 2s 266ms/step - loss: 0.8195 - accuracy: 0.5580 - val_loss: 1.0967 - val_accuracy: 0.3750
    Epoch 6/10
    7/7 [==============================] - 2s 265ms/step - loss: 0.9739 - accuracy: 0.5223 - val_loss: 0.7223 - val_accuracy: 0.6250
    Epoch 7/10
    7/7 [==============================] - 2s 262ms/step - loss: 0.9429 - accuracy: 0.5179 - val_loss: 1.2246 - val_accuracy: 0.3125
    Epoch 8/10
    7/7 [==============================] - 2s 265ms/step - loss: 0.9037 - accuracy: 0.5045 - val_loss: 0.8160 - val_accuracy: 0.5000
    Epoch 9/10
    7/7 [==============================] - 2s 253ms/step - loss: 0.8912 - accuracy: 0.4196 - val_loss: 0.8048 - val_accuracy: 0.5312
    Epoch 10/10
    7/7 [==============================] - 2s 255ms/step - loss: 0.7982 - accuracy: 0.5089 - val_loss: 0.7111 - val_accuracy: 0.6250



```python
efficientnet_evaluate = model.evaluate_generator(valid)
efficientnet_evaluate
```

    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/engine/training.py:1973: UserWarning: `Model.evaluate_generator` is deprecated and will be removed in a future version. Please use `Model.evaluate`, which supports generators.
      warnings.warn('`Model.evaluate_generator` is deprecated and '
    




    [0.7567768692970276, 0.5]




```python
model.save("efficientnet.h5")
efficientnet_model = model
#pred = model.predict_classes(valid)
#pred[:15]
```

    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/utils/generic_utils.py:497: CustomMaskWarning: Custom mask layers require a config and must override get_config. When loading, the custom mask layer must be passed to the custom_objects argument.
      category=CustomMaskWarning)



```python
SVG(model_to_dot(efficientnet_model, show_shapes=True, dpi=65).create(prog='dot', format='svg'))
```





![svg](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_92_0.svg)




## ResNet50

><h3>Model Building:</h3>


```python
from tensorflow.keras.applications import ResNet50

resnet = ResNet50(include_top=False, input_shape=(150, 150, 3))
```

    Downloading data from https://storage.googleapis.com/tensorflow/keras-applications/resnet/resnet50_weights_tf_dim_ordering_tf_kernels_notop.h5
    94773248/94765736 [==============================] - 1s 0us/step



```python
# freeze
for layer in resnet.layers:
    layer.trainable = False
```


```python
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Flatten,Dense
model = Sequential()
model.add(resnet)
model.add(Flatten())
model.add(Dense(2,activation="sigmoid"))
```


```python
model.summary()
```

    Model: "sequential_5"
    _________________________________________________________________
    Layer (type)                 Output Shape              Param #   
    =================================================================
    resnet50 (Functional)        (None, 5, 5, 2048)        23587712  
    _________________________________________________________________
    flatten_5 (Flatten)          (None, 51200)             0         
    _________________________________________________________________
    dense_5 (Dense)              (None, 2)                 102402    
    =================================================================
    Total params: 23,690,114
    Trainable params: 102,402
    Non-trainable params: 23,587,712
    _________________________________________________________________



```python
model.compile(optimizer="adam",loss="binary_crossentropy",metrics ="accuracy")
```


```python
# from tensorflow.keras.callbacks import ModelCheckpoint,EarlyStopping
# checkpoint = ModelCheckpoint("densenet_facemask.h5",monitor="val_accuracy",save_best_only=True,verbose=1)
# earlystop = EarlyStopping(monitor="val_accuracy",patience=5,verbose=1)
```


```python
model_histories.append(model.fit_generator(generator=train,steps_per_epoch=len(train)// 32,validation_data=valid,
                             validation_steps = len(valid)//32, epochs=10))
```

    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/engine/training.py:1940: UserWarning: `Model.fit_generator` is deprecated and will be removed in a future version. Please use `Model.fit`, which supports generators.
      warnings.warn('`Model.fit_generator` is deprecated and '
    

    Epoch 1/10
    7/7 [==============================] - 6s 397ms/step - loss: 1.0013 - accuracy: 0.4732 - val_loss: 0.6948 - val_accuracy: 0.6250
    Epoch 2/10
    7/7 [==============================] - 2s 262ms/step - loss: 0.7961 - accuracy: 0.5536 - val_loss: 0.7714 - val_accuracy: 0.5000
    Epoch 3/10
    7/7 [==============================] - 2s 260ms/step - loss: 0.7350 - accuracy: 0.5759 - val_loss: 0.6794 - val_accuracy: 0.6875
    Epoch 4/10
    7/7 [==============================] - 2s 264ms/step - loss: 0.6719 - accuracy: 0.6071 - val_loss: 0.6982 - val_accuracy: 0.6250
    Epoch 5/10
    7/7 [==============================] - 2s 250ms/step - loss: 0.7277 - accuracy: 0.5089 - val_loss: 0.6723 - val_accuracy: 0.4688
    Epoch 6/10
    7/7 [==============================] - 2s 260ms/step - loss: 0.6965 - accuracy: 0.5625 - val_loss: 0.6064 - val_accuracy: 0.5938
    Epoch 7/10
    7/7 [==============================] - 2s 265ms/step - loss: 0.7266 - accuracy: 0.5045 - val_loss: 0.7173 - val_accuracy: 0.5312
    Epoch 8/10
    7/7 [==============================] - 2s 256ms/step - loss: 0.6169 - accuracy: 0.6920 - val_loss: 0.6500 - val_accuracy: 0.7812
    Epoch 9/10
    7/7 [==============================] - 2s 264ms/step - loss: 0.6377 - accuracy: 0.6250 - val_loss: 0.6285 - val_accuracy: 0.6562
    Epoch 10/10
    7/7 [==============================] - 2s 255ms/step - loss: 0.6223 - accuracy: 0.6741 - val_loss: 0.6416 - val_accuracy: 0.7188



```python
resnet_evaluate = model.evaluate_generator(valid)
resnet_evaluate
```

    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/engine/training.py:1973: UserWarning: `Model.evaluate_generator` is deprecated and will be removed in a future version. Please use `Model.evaluate`, which supports generators.
      warnings.warn('`Model.evaluate_generator` is deprecated and '
    




    [0.5898503065109253, 0.7705000042915344]




```python
model.save("resnet.h5")
resnet_model = model
#pred = model.predict_classes(valid)
#pred[:15]
```

    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/utils/generic_utils.py:497: CustomMaskWarning: Custom mask layers require a config and must override get_config. When loading, the custom mask layer must be passed to the custom_objects argument.
      category=CustomMaskWarning)



```python
SVG(model_to_dot(resnet_model, show_shapes=True, dpi=65).create(prog='dot', format='svg'))
```





![svg](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_104_0.svg)




## ResNet50V2

><h3>Model Building:</h3>


```python
from tensorflow.keras.applications import ResNet50V2

resnetv2 = ResNet50V2(include_top=False, input_shape=(150, 150, 3))
```

    Downloading data from https://storage.googleapis.com/tensorflow/keras-applications/resnet/resnet50v2_weights_tf_dim_ordering_tf_kernels_notop.h5
    94674944/94668760 [==============================] - 1s 0us/step



```python
# freeze
for layer in resnetv2.layers:
    layer.trainable = False
```


```python
from tensorflow.keras import Sequential
from tensorflow.keras.layers import Flatten,Dense
model = Sequential()
model.add(resnetv2)
model.add(Flatten())
model.add(Dense(2,activation="sigmoid"))
```


```python
model.summary()
```

    Model: "sequential_6"
    _________________________________________________________________
    Layer (type)                 Output Shape              Param #   
    =================================================================
    resnet50v2 (Functional)      (None, 5, 5, 2048)        23564800  
    _________________________________________________________________
    flatten_6 (Flatten)          (None, 51200)             0         
    _________________________________________________________________
    dense_6 (Dense)              (None, 2)                 102402    
    =================================================================
    Total params: 23,667,202
    Trainable params: 102,402
    Non-trainable params: 23,564,800
    _________________________________________________________________



```python
model.compile(optimizer="adam",loss="binary_crossentropy",metrics ="accuracy")
```


```python
# from tensorflow.keras.callbacks import ModelCheckpoint,EarlyStopping
# checkpoint = ModelCheckpoint("densenet_facemask.h5",monitor="val_accuracy",save_best_only=True,verbose=1)
# earlystop = EarlyStopping(monitor="val_accuracy",patience=5,verbose=1)
```


```python
model_histories.append(model.fit_generator(generator=train,steps_per_epoch=len(train)// 32,validation_data=valid,
                             validation_steps = len(valid)//32, epochs=10))
```

    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/engine/training.py:1940: UserWarning: `Model.fit_generator` is deprecated and will be removed in a future version. Please use `Model.fit`, which supports generators.
      warnings.warn('`Model.fit_generator` is deprecated and '
    

    Epoch 1/10
    7/7 [==============================] - 5s 364ms/step - loss: 0.1961 - accuracy: 0.9196 - val_loss: 1.2123e-06 - val_accuracy: 1.0000
    Epoch 2/10
    7/7 [==============================] - 2s 251ms/step - loss: 0.0297 - accuracy: 0.9955 - val_loss: 0.5872 - val_accuracy: 0.9375
    Epoch 3/10
    7/7 [==============================] - 2s 255ms/step - loss: 0.1399 - accuracy: 0.9821 - val_loss: 0.3786 - val_accuracy: 0.9688
    Epoch 4/10
    7/7 [==============================] - 2s 254ms/step - loss: 0.1509 - accuracy: 0.9866 - val_loss: 3.3133e-07 - val_accuracy: 1.0000
    Epoch 5/10
    7/7 [==============================] - 2s 257ms/step - loss: 0.1544 - accuracy: 0.9911 - val_loss: 0.0814 - val_accuracy: 0.9688
    Epoch 6/10
    7/7 [==============================] - 2s 253ms/step - loss: 0.0488 - accuracy: 0.9955 - val_loss: 1.4253e-10 - val_accuracy: 1.0000
    Epoch 7/10
    7/7 [==============================] - 2s 254ms/step - loss: 0.0167 - accuracy: 0.9955 - val_loss: 4.7322e-06 - val_accuracy: 1.0000
    Epoch 8/10
    7/7 [==============================] - 2s 254ms/step - loss: 0.0468 - accuracy: 0.9955 - val_loss: 3.7470e-06 - val_accuracy: 1.0000
    Epoch 9/10
    7/7 [==============================] - 2s 250ms/step - loss: 0.0133 - accuracy: 0.9955 - val_loss: 0.0037 - val_accuracy: 1.0000
    Epoch 10/10
    7/7 [==============================] - 2s 256ms/step - loss: 0.0225 - accuracy: 0.9955 - val_loss: 2.0238e-10 - val_accuracy: 1.0000



```python
resnetv2_evaluate = model.evaluate_generator(valid)
resnetv2_evaluate
```

    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/engine/training.py:1973: UserWarning: `Model.evaluate_generator` is deprecated and will be removed in a future version. Please use `Model.evaluate`, which supports generators.
      warnings.warn('`Model.evaluate_generator` is deprecated and '
    




    [0.10062181204557419, 0.9890000224113464]




```python
model.save("resnetv2.h5")
resnetv2_model = model
#pred = model.predict_classes(valid)
#pred[:15]
```

    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/utils/generic_utils.py:497: CustomMaskWarning: Custom mask layers require a config and must override get_config. When loading, the custom mask layer must be passed to the custom_objects argument.
      category=CustomMaskWarning)



```python
SVG(model_to_dot(resnetv2_model, show_shapes=True, dpi=65).create(prog='dot', format='svg'))
```





![svg](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_116_0.svg)




# Model Comparison


```python
model_histories
```




    [<keras.callbacks.History at 0x7f09426c7a50>,
     <tensorflow.python.keras.callbacks.History at 0x7f09422356d0>,
     <tensorflow.python.keras.callbacks.History at 0x7f0806099090>,
     <tensorflow.python.keras.callbacks.History at 0x7f067efd9d10>,
     <tensorflow.python.keras.callbacks.History at 0x7f067d0d6050>,
     <tensorflow.python.keras.callbacks.History at 0x7f067b2fce50>,
     <tensorflow.python.keras.callbacks.History at 0x7f06787aaed0>,
     <tensorflow.python.keras.callbacks.History at 0x7f0676616b10>]




```python
names=['ConvNet', 'MobileNet', 'DenseNet', 'InceptionV3', 'VGG19', 'EfficientNet', 'ResNet50', 'ResNet50V2']
fig, axes = plt.subplots(2, 2, figsize=(15, 10))
fig.subplots_adjust(hspace=0.3)
for metric in model_histories[0].history:
    index = list(model_histories[0].history).index(metric)
    ax = axes.flatten()[index]
    name_index = 0
    for history in model_histories:
        ax.plot(history.history[metric], label=names[name_index])
        name_index += 1
    ax.set_title(metric+' over epochs', size=15)
    ax.set_xlabel('epochs')
    ax.set_ylabel(metric)
    ax.legend()
plt.show()
```



![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_119_0.png)




```python
df = pd. DataFrame([convnet_evaluate, mobile_evaluate, dense_evaluate, inception_evaluate, vgg19_evaluate, efficientnet_evaluate, resnet_evaluate, resnetv2_evaluate], 
                   columns = ["loss", "accuracy"],
                   index = ['ConvNet', 'MobileNet', 'DenseNet', 'InceptionV3', 'VGG19', 'EfficientNet', 'ResNet50', 'ResNet50V2'])
df
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
      <th>loss</th>
      <th>accuracy</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>ConvNet</th>
      <td>0.321395</td>
      <td>0.9520</td>
    </tr>
    <tr>
      <th>MobileNet</th>
      <td>0.054352</td>
      <td>0.9880</td>
    </tr>
    <tr>
      <th>DenseNet</th>
      <td>0.030438</td>
      <td>0.9920</td>
    </tr>
    <tr>
      <th>InceptionV3</th>
      <td>0.134254</td>
      <td>0.9775</td>
    </tr>
    <tr>
      <th>VGG19</th>
      <td>0.129004</td>
      <td>0.9655</td>
    </tr>
    <tr>
      <th>EfficientNet</th>
      <td>0.756777</td>
      <td>0.5000</td>
    </tr>
    <tr>
      <th>ResNet50</th>
      <td>0.589850</td>
      <td>0.7705</td>
    </tr>
    <tr>
      <th>ResNet50V2</th>
      <td>0.100622</td>
      <td>0.9890</td>
    </tr>
  </tbody>
</table>
</div>




```python
## download trained models 
from google.colab import files
files.download('convnet.h5')  # from colab to browser download
files.download('mobilenet.h5')
files.download('densenet.h5')
files.download('inception.h5')
files.download('vgg19.h5')
files.download('efficientnet.h5')
files.download('resnet.h5')
files.download('resnetv2.h5')
```


    <IPython.core.display.Javascript object>



    <IPython.core.display.Javascript object>



    <IPython.core.display.Javascript object>



    <IPython.core.display.Javascript object>



    <IPython.core.display.Javascript object>



    <IPython.core.display.Javascript object>



    <IPython.core.display.Javascript object>



    <IPython.core.display.Javascript object>



    <IPython.core.display.Javascript object>



    <IPython.core.display.Javascript object>



    <IPython.core.display.Javascript object>



    <IPython.core.display.Javascript object>



    <IPython.core.display.Javascript object>



    <IPython.core.display.Javascript object>



    <IPython.core.display.Javascript object>



    <IPython.core.display.Javascript object>


# Check Model Performance with OpenCV


```python
# Load & Evaluate another face mask image 
mask = "with-and-without-mask/"
plt.figure(figsize=(8,7))
label = {0:"With Mask",1:"Without Mask"}
color_label = {0: (0,255,0),1 : (0,0,255)}
cascade = cv2.CascadeClassifier("frontalface/haarcascade_frontalface_default.xml")
count = 0
i = "with-and-without-mask/maskdata/maskdata/test/without_mask/356.jpg"

frame =cv2.imread(i)
gray = cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY)
faces = cascade.detectMultiScale(gray,1.1,4)
models = [convnet_model, inception_model, mobilenet_model, densenet_model, vgg19_model, efficientnet_model, resnetv2_model]
for model in models:
    for x,y,w,h in faces:
        face_image = frame[y:y+h,x:x+w]
        resize_img  = cv2.resize(face_image,(150,150))
        normalized = resize_img/255.0
        reshape = np.reshape(normalized,(1,150,150,3))
        reshape = np.vstack([reshape])
        if model == convnet_model:
            name = 'ConvNet'
        if model == inception_model:
            name = 'InceptionV3'
        if model == mobilenet_model:
            name = 'MobileNet'
        if model == densenet_model:
            name = 'DenseNet'
        if model == vgg19_model:
            name = 'VGG19'
        if model == efficientnet_model:
            name = 'EfficientNet'
        if model == resnetv2_model:
            name = 'ResNet50V2'
        result = model.predict_classes(reshape)
        
        if result == 0:
            cv2.rectangle(frame,(x,y),(x+w,y+h),color_label[0],3)
            cv2.rectangle(frame,(x,y-50),(x+w,y),color_label[0],-1)
            cv2.putText(frame,label[0],(x,y-10),cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255),2)
            frame = cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)
            plt.imshow(frame)
        elif result == 1:
            cv2.rectangle(frame,(x,y),(x+w,y+h),color_label[1],3)
            cv2.rectangle(frame,(x,y-50),(x+w,y),color_label[1],-1)
            cv2.putText(frame,label[1],(x,y-10),cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255),2)
            frame = cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)
            plt.imshow(frame)
    plt.title(name)
    plt.axis("off")
    plt.show()
cv2.destroyAllWindows()
        
```

    /usr/local/lib/python3.7/dist-packages/keras/engine/sequential.py:450: UserWarning: `model.predict_classes()` is deprecated and will be removed after 2021-01-01. Please use instead:* `np.argmax(model.predict(x), axis=-1)`,   if your model does multi-class classification   (e.g. if it uses a `softmax` last-layer activation).* `(model.predict(x) > 0.5).astype("int32")`,   if your model does binary classification   (e.g. if it uses a `sigmoid` last-layer activation).
      warnings.warn('`model.predict_classes()` is deprecated and '




![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_123_1.png)



    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/engine/sequential.py:455: UserWarning: `model.predict_classes()` is deprecated and will be removed after 2021-01-01. Please use instead:* `np.argmax(model.predict(x), axis=-1)`,   if your model does multi-class classification   (e.g. if it uses a `softmax` last-layer activation).* `(model.predict(x) > 0.5).astype("int32")`,   if your model does binary classification   (e.g. if it uses a `sigmoid` last-layer activation).
      warnings.warn('`model.predict_classes()` is deprecated and '




![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_123_3.png)





![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_123_4.png)





![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_123_5.png)





![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_123_6.png)



    WARNING:tensorflow:5 out of the last 5 calls to <function Model.make_predict_function.<locals>.predict_function at 0x7f064e8d7170> triggered tf.function retracing. Tracing is expensive and the excessive number of tracings could be due to (1) creating @tf.function repeatedly in a loop, (2) passing tensors with different shapes, (3) passing Python objects instead of tensors. For (1), please define your @tf.function outside of the loop. For (2), @tf.function has experimental_relax_shapes=True option that relaxes argument shapes that can avoid unnecessary retracing. For (3), please refer to https://www.tensorflow.org/guide/function#controlling_retracing and https://www.tensorflow.org/api_docs/python/tf/function for  more details.




![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_123_8.png)



    WARNING:tensorflow:6 out of the last 6 calls to <function Model.make_predict_function.<locals>.predict_function at 0x7f064d37c440> triggered tf.function retracing. Tracing is expensive and the excessive number of tracings could be due to (1) creating @tf.function repeatedly in a loop, (2) passing tensors with different shapes, (3) passing Python objects instead of tensors. For (1), please define your @tf.function outside of the loop. For (2), @tf.function has experimental_relax_shapes=True option that relaxes argument shapes that can avoid unnecessary retracing. For (3), please refer to https://www.tensorflow.org/guide/function#controlling_retracing and https://www.tensorflow.org/api_docs/python/tf/function for  more details.




![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_123_10.png)




```python
#mask = "../input/with-and-without-mask/"
plt.figure(figsize=(8,7))
label = {0:"With Mask",1:"Without Mask"}
color_label = {0: (0,255,0),1 : (0,0,255)}
cascade = cv2.CascadeClassifier("frontalface/haarcascade_frontalface_default.xml")
count = 0
i = "with-and-without-mask/maskdata/maskdata/test/without_mask/431.jpg"

frame =cv2.imread(i)
gray = cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY)
faces = cascade.detectMultiScale(gray,1.1,4)
models = [convnet_model, inception_model, mobilenet_model, densenet_model, vgg19_model, efficientnet_model, resnetv2_model]
for model in models:
    for x,y,w,h in faces:
        face_image = frame[y:y+h,x:x+w]
        resize_img  = cv2.resize(face_image,(150,150))
        normalized = resize_img/255.0
        reshape = np.reshape(normalized,(1,150,150,3))
        reshape = np.vstack([reshape])
        if model == convnet_model:
            name = 'ConvNet'
        if model == inception_model:
            name = 'InceptionV3'
        if model == mobilenet_model:
            name = 'MobileNet'
        if model == densenet_model:
            name = 'DenseNet'
        if model == vgg19_model:
            name = 'VGG19'
        if model == efficientnet_model:
            name = 'EfficientNet'
        if model == resnetv2_model:
            name = 'ResNet50V2'
        result = model.predict_classes(reshape)
        
        if result == 0:
            cv2.rectangle(frame,(x,y),(x+w,y+h),color_label[0],3)
            cv2.rectangle(frame,(x,y-50),(x+w,y),color_label[0],-1)
            cv2.putText(frame,label[0],(x,y-10),cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255),2)
            frame = cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)
            plt.imshow(frame)
        elif result == 1:
            cv2.rectangle(frame,(x,y),(x+w,y+h),color_label[1],3)
            cv2.rectangle(frame,(x,y-50),(x+w,y),color_label[1],-1)
            cv2.putText(frame,label[1],(x,y-10),cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255),2)
            frame = cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)
            plt.imshow(frame)
    plt.title(name)
    plt.axis("off")
    plt.show()
cv2.destroyAllWindows()
        
```

    /usr/local/lib/python3.7/dist-packages/keras/engine/sequential.py:450: UserWarning: `model.predict_classes()` is deprecated and will be removed after 2021-01-01. Please use instead:* `np.argmax(model.predict(x), axis=-1)`,   if your model does multi-class classification   (e.g. if it uses a `softmax` last-layer activation).* `(model.predict(x) > 0.5).astype("int32")`,   if your model does binary classification   (e.g. if it uses a `sigmoid` last-layer activation).
      warnings.warn('`model.predict_classes()` is deprecated and '




![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_124_1.png)



    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/engine/sequential.py:455: UserWarning: `model.predict_classes()` is deprecated and will be removed after 2021-01-01. Please use instead:* `np.argmax(model.predict(x), axis=-1)`,   if your model does multi-class classification   (e.g. if it uses a `softmax` last-layer activation).* `(model.predict(x) > 0.5).astype("int32")`,   if your model does binary classification   (e.g. if it uses a `sigmoid` last-layer activation).
      warnings.warn('`model.predict_classes()` is deprecated and '




![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_124_3.png)





![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_124_4.png)





![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_124_5.png)





![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_124_6.png)





![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_124_7.png)





![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_124_8.png)




```python
#mask = "../input/with-and-without-mask/"
plt.figure(figsize=(8,7))
label = {0:"With Mask",1:"Without Mask"}
color_label = {0: (0,255,0),1 : (0,0,255)}
cascade = cv2.CascadeClassifier("frontalface/haarcascade_frontalface_default.xml")
count = 0
i = "/content/with-and-without-mask/masks2.0/masks/test/1/1.jpeg"

frame =cv2.imread(i)
gray = cv2.cvtColor(frame,cv2.COLOR_BGR2GRAY)
faces = cascade.detectMultiScale(gray,1.1,4)
models = [convnet_model, inception_model, mobilenet_model, densenet_model, vgg19_model, efficientnet_model, resnetv2_model]
for model in models:
    for x,y,w,h in faces:
        face_image = frame[y:y+h,x:x+w]
        resize_img  = cv2.resize(face_image,(150,150))
        normalized = resize_img/255.0
        reshape = np.reshape(normalized,(1,150,150,3))
        reshape = np.vstack([reshape])
        if model == convnet_model:
            name = 'ConvNet'
        if model == inception_model:
            name = 'InceptionV3'
        if model == mobilenet_model:
            name = 'MobileNet'
        if model == densenet_model:
            name = 'DenseNet'
        if model == vgg19_model:
            name = 'VGG19'
        if model == efficientnet_model:
            name = 'EfficientNet'
        if model == resnetv2_model:
            name = 'ResNet50V2'
        result = model.predict_classes(reshape)
        
        if result == 0:
            cv2.rectangle(frame,(x,y),(x+w,y+h),color_label[0],3)
            cv2.rectangle(frame,(x,y-50),(x+w,y),color_label[0],-1)
            cv2.putText(frame,label[0],(x,y-10),cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255),2)
            frame = cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)
            plt.imshow(frame)
        elif result == 1:
            cv2.rectangle(frame,(x,y),(x+w,y+h),color_label[1],3)
            cv2.rectangle(frame,(x,y-50),(x+w,y),color_label[1],-1)
            cv2.putText(frame,label[1],(x,y-10),cv2.FONT_HERSHEY_SIMPLEX,1,(255,255,255),2)
            frame = cv2.cvtColor(frame,cv2.COLOR_BGR2RGB)
            plt.imshow(frame)
    plt.title(name)
    plt.axis("off")
    plt.show()
cv2.destroyAllWindows()
        
```

    /usr/local/lib/python3.7/dist-packages/keras/engine/sequential.py:450: UserWarning: `model.predict_classes()` is deprecated and will be removed after 2021-01-01. Please use instead:* `np.argmax(model.predict(x), axis=-1)`,   if your model does multi-class classification   (e.g. if it uses a `softmax` last-layer activation).* `(model.predict(x) > 0.5).astype("int32")`,   if your model does binary classification   (e.g. if it uses a `sigmoid` last-layer activation).
      warnings.warn('`model.predict_classes()` is deprecated and '




![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_125_1.png)



    /usr/local/lib/python3.7/dist-packages/tensorflow/python/keras/engine/sequential.py:455: UserWarning: `model.predict_classes()` is deprecated and will be removed after 2021-01-01. Please use instead:* `np.argmax(model.predict(x), axis=-1)`,   if your model does multi-class classification   (e.g. if it uses a `softmax` last-layer activation).* `(model.predict(x) > 0.5).astype("int32")`,   if your model does binary classification   (e.g. if it uses a `sigmoid` last-layer activation).
      warnings.warn('`model.predict_classes()` is deprecated and '




![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_125_3.png)





![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_125_4.png)





![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_125_5.png)





![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_125_6.png)





![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_125_7.png)





![png](https://dasoldasol.github.io/assets/images/image/face_mask_detection_files/face_mask_detection_125_8.png)
    

