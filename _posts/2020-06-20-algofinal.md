---
title: "[알고리즘] Kruskal 최대비용 신장트리"
excerpt: 'Kruskal 최대비용 신장트리 구현'
toc: true
toc_sticky: true
categories:
  - Algorithm
modified_date: 2020-06-20 10:36:28 +0900
---
### 문제 
Kruskal 최대비용 신장트리 구현 (python)

### 소스코드
```python
def MSTKruskal_max(vertex, adj):
    vsize = len(vertex)
    init_set(vsize)
    eList=[]
    
    for i in range(vsize-1):
        for j in range(i+1, vsize):
            if adj[i][j] != None :
                eList.append( (i,j,adj[i][j]) )
    
    eList.sort(key= lambda e : e[2], reverse=False) ## 간선의 가중치를 '오름차순'으로 정렬 : True -> False로 수정 
    print(eList)
    
    edgeAccepted = 0
    while(edgeAccepted < vsize-1):
        e = eList.pop(-1)
        uset = find(e[0])
        vset = find(e[1])
        
        if uset != vset:
            print("간선추가 : (%s, %s, %d)" %(vertex[e[0]], vertex[e[1]], e[2]))
            union(uset, vset)
            edgeAccepted += 1
        
vertex =  ['A', 'B', 'C',   'D',  'E', 'F', 'G', 'H', 'I'] 

adj =    [[None, 20, None, None,   5, None, 35, 10, None],
          [20,   None,None, 10,   40, None, None, None, None],
          [None, None, None, None, None, None, 45, 25, 5],
          [None, 10, None, None, 30,   15, None, None, None],
          [5,   40,  None, 30,   None, 25,  15, None, 30],
          [None, None, None, 15,   25, None, None, None, 35],
          [35,  None, 45, None, 15, None, None, 40, 20],
          [10, None,   25, None, None, None, 40, None, None],
          [None, None,   5, None, 30, 35, 20, None, None]]

print("MST By Kruskal's Algorithm : maximum cost")
MSTKruskal_max(vertex, adj)
```

### 실행 결과
![result](https://dasoldasol.github.io/assets/images/image/2020-06-20-1.png)