---
title: "[알고리즘] 연결된 원형큐"
excerpt: '사용자로부터 양의 정수들을 입력받아서 연결된 큐에 저장하고, 결과를 다음과 같이 출력하는 프로그램을 작성하라. '
toc: true
toc_sticky: true
categories:
  - Algorithm
modified_date: 2020-05-03 09:36:28 +0900
---
### 문제 
사용자로부터 양의 정수들을 입력받아서 연결된 큐에 저장하고, 결과를 다음과 같이 출력하는 프로그램을 작성하라. (python)

### 소스코드
```python
class Node:
    def __init__(self, elem, link=None):
        self.data = elem  # 데이터 필드 생성 및 초기화
        self.link = link  # 링크 필드 생성 및 초기화


class CircularLinkedQueue:
    def __init__(self):
        self.tail = None

    def isEmpty(self):
        return self.tail == None

    def enqueue(self, item):
        node = Node(item, None)
        if self.isEmpty():
            node.link = node  # n의 링크가 자신을 가리키도록 함
            self.tail = node  # tail이 n을 가리키도록 함
        else:
            node.link = self.tail.link  # n의 링크가 front을 가리키도록 함
            self.tail.link = node  # tail의 링크가 n을 가리키도록 함
            self.tail = node

    def display(self):
        if not self.isEmpty():
            node = self.tail.link  # front부터 출발
            while not node == self.tail or node.data == -1:  # rear가 아닌 동안
                print(node.data, end='->')  # node 출력
                node = node.link  # 이동
            print("None", end=' ')  # 마지막으로 rear 출력

q = CircularLinkedQueue()

q.enqueue(input("양의 정수를 입력하세요(종료: -1) : "))
q.enqueue(input("양의 정수를 입력하세요(종료: -1) : "))
q.enqueue(input("양의 정수를 입력하세요(종료: -1) : "))
q.enqueue(input("양의 정수를 입력하세요(종료: -1) : "))
q.display()
```

### 실행 결과
![result](https://dasoldasol.github.io/assets/images/image/2020-05-03-algorithm.png)