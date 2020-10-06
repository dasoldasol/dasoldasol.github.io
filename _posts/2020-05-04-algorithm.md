---
title: "[알고리즘] 연결 리스트"
excerpt: '연결 리스트에 사용자가 입력하는 값을 저장했다가 출력하는 프로그램을 작성하라. '
toc: true
toc_sticky: true
categories:
  - Algorithm
modified_date: 2020-05-04 09:36:28 +0900
---
### 문제 
연결 리스트에 사용자가 입력하는 값을 저장했다가 출력하는 프로그램을 작성하라. (python)

### 소스코드
```python
class Node:
    def __init__(self, elem, link=None):
        self.data = elem  # 데이터 필드 생성 및 초기화
        self.link = link  # 링크 필드 생성 및 초기화

class LinkedList:
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

    def display(self, msg='생성된 연결 리스트 : '):
        print(msg, end='')
        if not self.isEmpty():
            node = self.tail.link # front부터 출발 
            while not node == self.tail : # rear가 아닌 동안
                print(node.data, end='->') # node 출력
                node = node.link #이동 
            print(node.data, end='->') # 마지막으로 rear 출력 
        print() #한줄 띄우기

q = LinkedList() 

q.enqueue(input("노드 #1 데이터 : "))
q.enqueue(input("노드 #2 데이터 : "))
q.enqueue(input("노드 #3 데이터 : "))
q.display()
```

### 실행 결과
![result](https://dasoldasol.github.io/assets/images/image/2020-05-04-algorithm.png)