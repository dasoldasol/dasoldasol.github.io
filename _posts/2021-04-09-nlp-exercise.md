---
title: "[NLP] NLP라이브러리 없는 자연어 처리"
excerpt: "NLP 라이브러리 없는 자연어 처리를 통한 텍스트 분석"
toc: true
toc_sticky: true
categories:
- NLP
- Data Analysis
modified_date: 2021-04-09 10:36:28 +0900
---
## 분석 개요 
- NLP 라이브러리를 사용하지 않고, 정규식과 collections.Counter 모듈을 사용하여 텍스트 분석
## Configuration
- Rules : DONOT use NLP libraries


```python
import re
from collections import Counter
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
```


```python
from google.colab import drive
drive.mount('./MyDrive')

DATA_PATH = "/content/MyDrive/My Drive/data/"

def make_path(add_path):
    path_list = [DATA_PATH]
    path_list.append(add_path)
    return ''.join(path_list)
```

    Mounted at ./MyDrive
    


```python
# load data 
with open(make_path('data1.csv'), 'r',encoding='UTF8') as f:
    data = f.readlines()
f.close()
data[0:5]
```




    ['\ufeffStately, plump Buck Mulligan came from the stairhead, bearing a bowl of\n',
     'lather on which a mirror and a razor lay crossed. A yellow\n',
     'dressinggown, ungirdled, was sustained gently behind him on the mild\n',
     'morning air. He held the bowl aloft and intoned:\n',
     '\n']



## Part1. Counting / Frequency


```python
word_list = []
for i in range(len(data)):
     words = re.findall('\w+', data[i])
     word_list+=words
word_list[0:7]
```




    ['Stately', 'plump', 'Buck', 'Mulligan', 'came', 'from', 'the']



### Q1.  Frequency of the word “Dedalus”


```python
freq_Dedalus = Counter(word_list)['Dedalus']
freq_Dedalus
```




    174



### Q2. Frequency of the word "mounted"


```python
freq_mounted = Counter(word_list)['mounted']
freq_mounted
```




    8



### Q3. Frequency of the word "Eunsok"


```python
freq_Eunsok = Counter(word_list)['Eunsok']
freq_Eunsok
```

## Part2. Data Cleaning and Frequency

### Q5. Data Cleaning
- 1) Remove all empty lines
- 2) remove all digits/numbers such as 1,2,3
- 3) all special characters such as ?, !, ”, *, [, ],-, etc. except 
period (.).



```python
cleaned = []
for line in data:
    line = re.sub(r"[^a-zA-Z.]+", " ", line)
    cleaned.append(line.strip())
cleaned_txt = ' '.join(cleaned)
cleaned_txt
```

### Q6. Add the single space before every period (.)


```python
with_space = []
for line in cleaned:
    line = line.replace('.', ' .') # add the single space 
    with_space.append(line)
print(*with_space[11:20], sep='\n')
```

    Solemnly he came forward and mounted the round gunrest . He faced about
    and blessed gravely thrice the tower the surrounding land and the
    awaking mountains . Then catching sight of Stephen Dedalus he bent
    towards him and made rapid crosses in the air gurgling in his throat
    and shaking his head . Stephen Dedalus displeased and sleepy leaned
    his arms on the top of the staircase and looked coldly at the shaking
    gurgling face that blessed him equine in its length and at the light
    untonsured hair grained and hued like pale oak .
    
    

### Q7. Total number of words
- after Q6


```python
with_space[0:4]
```




    ['Stately plump Buck Mulligan came from the stairhead bearing a bowl of',
     'lather on which a mirror and a razor lay crossed . A yellow',
     'dressinggown ungirdled was sustained gently behind him on the mild',
     'morning air . He held the bowl aloft and intoned']




```python
words_list = []
for word in with_space:
     words = re.findall('\w+', word) # is . (period) included in words? -> no (by professor)
     words_list+=words
words_list[300:306]
```




    ['oval', 'jowl', 'recalled', 'a', 'prelate', 'patron']




```python
len(words_list) # total number of words 
```




    2867884



### Q8. Top 10 most frequent word in Q6


```python
Counter(words_list).most_common()[:10] # is . period included in words? -> no (by professor)
```




    [('the', 210843),
     ('and', 131625),
     ('of', 117072),
     ('to', 50935),
     ('in', 44873),
     ('that', 42239),
     ('And', 39389),
     ('he', 35160),
     ('a', 33676),
     ('I', 32542)]



## Part3. Histogram

### Q9. Plot the histogram of all the words in Q6
- X : word , Y : frequency(DESC)


```python
cnt_dict = {}
cnt_dict['word'] = list(Counter(words_list).keys())
cnt_dict['count'] = list(Counter(words_list).values())
df = pd.DataFrame(cnt_dict)
sorted_df = df.sort_values('count', ascending=False)
sorted_df.reset_index(drop=True, inplace=True)
sorted_df
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
      <th>word</th>
      <th>count</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>the</td>
      <td>210843</td>
    </tr>
    <tr>
      <th>1</th>
      <td>and</td>
      <td>131625</td>
    </tr>
    <tr>
      <th>2</th>
      <td>of</td>
      <td>117072</td>
    </tr>
    <tr>
      <th>3</th>
      <td>to</td>
      <td>50935</td>
    </tr>
    <tr>
      <th>4</th>
      <td>in</td>
      <td>44873</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>43669</th>
      <td>enamelled</td>
      <td>1</td>
    </tr>
    <tr>
      <th>43670</th>
      <td>pegs</td>
      <td>1</td>
    </tr>
    <tr>
      <th>43671</th>
      <td>clamped</td>
      <td>1</td>
    </tr>
    <tr>
      <th>43672</th>
      <td>dyes</td>
      <td>1</td>
    </tr>
    <tr>
      <th>43673</th>
      <td>Stately</td>
      <td>1</td>
    </tr>
  </tbody>
</table>
<p>43674 rows × 2 columns</p>
</div>




```python
# plot top 30
fig = plt.figure()
fig.set_size_inches(20, 5, forward=True)    
sns.barplot(x=sorted_df['word'][:30], y=sorted_df['count'][:30])
plt.show()
```


    
![png](https://dasoldasol.github.io/assets/images/image/2020710911_hw03_34_0.png)
    



```python
# plot most of all (2000)
fig = plt.figure()
fig.set_size_inches(20, 5, forward=True)    
sns.barplot(x=sorted_df['word'][:2000], y=sorted_df['count'][:2000])
plt.show()
```


    
![png](https://dasoldasol.github.io/assets/images/image/2020710911_hw03_35_0.png)
    


### Q10. Top 10 most frequent Two Word Sequence in Q6


```python
two_words = []
len_lst = len(words_list) # words_list : extracted words list after Q6
for i in range(len_lst):
    if i != len_lst-1:
        two_words.append(" ".join(words_list[i : i+2]))
print(*two_words[0:20], sep=' | ')
```

    Stately plump | plump Buck | Buck Mulligan | Mulligan came | came from | from the | the stairhead | stairhead bearing | bearing a | a bowl | bowl of | of lather | lather on | on which | which a | a mirror | mirror and | and a | a razor | razor lay
    


```python
# Top 10 most frequent two word sequence
Counter(two_words).most_common()[:10]
```




    [('of the', 37120),
     ('the LORD', 17892),
     ('in the', 16890),
     ('and the', 13029),
     ('to the', 7739),
     ('shall be', 7436),
     ('And the', 6728),
     ('all the', 6644),
     ('unto the', 6063),
     ('I will', 6038)]



### Q11. Plot the two words in Q6
- X : two words 
- Y : frequency (DESC)


```python
cnt_dict_2 = {}
cnt_dict_2['two_words'] = list(Counter(two_words).keys())
cnt_dict_2['count'] = list(Counter(two_words).values())
df_2 = pd.DataFrame(cnt_dict_2)
sorted_df_2 = df_2.sort_values('count', ascending=False)
sorted_df_2.reset_index(drop=True, inplace=True)
sorted_df_2
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
      <th>two_words</th>
      <th>count</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th>0</th>
      <td>of the</td>
      <td>37120</td>
    </tr>
    <tr>
      <th>1</th>
      <td>the LORD</td>
      <td>17892</td>
    </tr>
    <tr>
      <th>2</th>
      <td>in the</td>
      <td>16890</td>
    </tr>
    <tr>
      <th>3</th>
      <td>and the</td>
      <td>13029</td>
    </tr>
    <tr>
      <th>4</th>
      <td>to the</td>
      <td>7739</td>
    </tr>
    <tr>
      <th>...</th>
      <td>...</td>
      <td>...</td>
    </tr>
    <tr>
      <th>372272</th>
      <td>educational careers</td>
      <td>1</td>
    </tr>
    <tr>
      <th>372273</th>
      <td>their educational</td>
      <td>1</td>
    </tr>
    <tr>
      <th>372274</th>
      <td>find their</td>
      <td>1</td>
    </tr>
    <tr>
      <th>372275</th>
      <td>Rathgar Did</td>
      <td>1</td>
    </tr>
    <tr>
      <th>372276</th>
      <td>you immortal</td>
      <td>1</td>
    </tr>
  </tbody>
</table>
<p>372277 rows × 2 columns</p>
</div>




```python
# plot top 30
fig = plt.figure()
fig.set_size_inches(30, 5, forward=True)    
sns.barplot(x=sorted_df_2['two_words'][:30], y=sorted_df_2['count'][:30])
plt.show()
```


    
![png](https://dasoldasol.github.io/assets/images/image/2020710911_hw03_41_0.png)
    



```python
# plot most of all (2000)
fig = plt.figure()
fig.set_size_inches(30, 5, forward=True)    
sns.barplot(x=sorted_df_2['two_words'][:2000], y=sorted_df_2['count'][:2000])
plt.show()
```


    
![png](https://dasoldasol.github.io/assets/images/image/2020710911_hw03_42_0.png)
    


## Extra Credit

### Extra Credit 1 : Top 10 most frequent three word sequence in Q6


```python
three_words = []
len_lst = len(words_list) # words_list : extracted words list after Q6
for i in range(len_lst):
    if i != len_lst-2:
        three_words.append(" ".join(words_list[i : i+3]))
print(*three_words[0:5], sep=' | ')
```

    Stately plump Buck | plump Buck Mulligan | Buck Mulligan came | Mulligan came from | came from the
    


```python
# Top 10 most frequent three word sequence
Counter(three_words).most_common()[:10]
```




    [('of the LORD', 4878),
     ('the son of', 3911),
     ('the children of', 3767),
     ('the house of', 2733),
     ('out of the', 2519),
     ('children of Israel', 1941),
     ('the land of', 1878),
     ('saith the LORD', 1845),
     ('the sons of', 1521),
     ('unto the LORD', 1464)]



### Extra Credit 2 : What are the three truths that Micheal learned?


```python
for idx, sentence in enumerate(lines):
    if 'three truths' in sentence:
        print (idx, " : ", sentence)
```

    28040  :   And I smiled three times, because God sent me to learn three truths, and I have learnt them
    28044  :  "  And Simon said, "Tell me, Michael, what did God punish you for? and what were the three truths? that I, too, may know them
    28061  :  ' And God said: 'Go-take the mother's soul, and learn three truths: Learn What dwells in man, What is not given to man, and What men live by
    


```python
for idx, sentence in enumerate(lines):
    if (idx >= 28040) and (idx < 28061):
        print(sentence)
```

     And I smiled three times, because God sent me to learn three truths, and I have learnt them
     One I learnt when your wife pitied me, and that is why I smiled the first time
     The second I learnt when the rich man ordered the boots, and then I smiled again
     And now, when I saw those little girls, I learn the third and last truth, and I smiled the third time
    "  And Simon said, "Tell me, Michael, what did God punish you for? and what were the three truths? that I, too, may know them
    "  And Michael answered: "God punished me for disobeying Him
     I was an angel in heaven and disobeyed God
     God sent me to fetch a woman's soul
     I flew to earth, and saw a sick woman lying alone, who had just given birth to twin girls
     They moved feebly at their mother's side, but she could not lift them to her breast
     When she saw me, she understood that God had sent me for her soul, and she wept and said: 'Angel of God! My husband has just been buried, killed by a falling tree
     I have neither sister, nor aunt, nor mother: no one to care for my orphans
     Do not take my soul! Let me nurse my babes, feed them, and set them on their feet before I die
     Children cannot live without father or mother
    ' And I hearkened to her
     I placed one child at her breast and gave the other into her arms, and returned to the Lord in heaven
     I flew to the Lord, and said: 'I could not take the soul of the mother
     Her husband was killed by a tree; the woman has twins, and prays that her soul may not be taken
     She says: "Let me nurse and feed my children, and set them on their feet
     Children cannot live without father or mother
    " I have not taken her soul
    


- he learned three truths : 
  - One I learnt when your wife pitied me, and that is why I smiled the first time
  - The second I learnt when the rich man ordered the boots, and then I smiled again
  - And now, when I saw those little girls, I learn the third and last truth, and I smiled the third time
