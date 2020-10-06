---
title: "[알고리즘] Stack을 이용한 회문(palindrome) 작성"
excerpt: '스택을 이용하여 주어진 문자열이 회문인지 아닌지를 결정하는 프로그램을 작성하라. '
toc: true
toc_sticky: true
categories:
  - Algorithm
modified_date: 2020-04-18 09:36:28 +0900
---
### 문제 
스택을 이용하여 주어진 문자열이 회문인지 아닌지를 결정하는 프로그램을 작성하라. (python)

### 소스코드
```python
import re


# 특수문자, 공백 제거, 소문자처리
def preprocessing(str):
    result = re.sub('[^0-9a-zA-Zㄱ-힗]', '', str)
    result = result.lower()
    return result


def palindrome(word):
    letters = []
    word = preprocessing(word)
    for letter in word:
        letters.append(letter)
    for letter in word:
        if letters.pop() != letter:
            return False
    return True


ex1 = "race car"
ex2 = "madam, I'm Adam"
ex3 = "abc"

print(ex1, "에 대한 회문 여부 : ", palindrome(ex1))
print(ex2, "에 대한 회문 여부 : ", palindrome(ex2))
print(ex3, "에 대한 회문 여부 : ", palindrome(ex3))

```

### 실행 결과
![result](https://dasoldasol.github.io/assets/images/image/2020-04-18-algorithm.png)