---
title: "[알고리즘] Leetcode-연결리스트"
excerpt: "연결리스트 관련 Leetcode 문제를 풀어보자"
toc: true
toc_sticky: true
categories:
- Algorithm
modified_date: 2022-04-02 17:03:28 +0900
---
## 팰린드롬 연결 리스트 
- [Palindrome Linked List](https://leetcode.com/problems/palindrome-linked-list/)
- 연결 리스트가 팰린드롬 구조인지 판별하라 
- 입력 & 출력 예시     
  ![image](https://user-images.githubusercontent.com/29423260/161366316-f8d8a843-1e1e-4f59-b4c9-d9bd3a871497.png)

- 풀이) Runner 기법 : fast runner는 2칸씩 slow runner가 1칸씩 이동하면, slow runner는 딱 절반을 가게 된다. 그 때 비교하며 계산 
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def isPalindrome(self, head: Optional[ListNode]) -> bool:
        rev = None 
        slow = fast = head
        
        # runner를 이용해 reversed 연결 리스트 구성 
        while fast and fast.next:
            fast = fast.next.next
            rev, rev.next, slow = slow, rev, slow.next
            
        if fast:
            slow = slow.next
        
        # 팰린드롬 확인 
        while rev and rev.val == slow.val:
            slow, rev = slow.next, rev.next
        
        return not rev
```
    
![image](https://user-images.githubusercontent.com/29423260/161366269-dc36c453-8805-4c17-b9a9-0c36aab6da71.png)
    
## 두 정렬 리스트의 병합 
- [21. Merge Two Sorted Lists](https://leetcode.com/problems/merge-two-sorted-lists/)
- 정렬되어 있는 두 연결 리스트를 합쳐라 
- 입력 & 출력 예시 
```
Input: list1 = [1,2,4], list2 = [1,3,4]
Output: [1,1,2,3,4,4]
```
- 풀이) 재귀 구조로 연결 
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def mergeTwoLists(self, l1: Optional[ListNode], l2: Optional[ListNode]) -> Optional[ListNode]:
        if (not l1) or (l2 and (l1.val > l2.val)):
            l1, l2 = l2, l1
        if l1:
            l1.next = self.mergeTwoLists(l1.next, l2)
        return l1
```
    
![image](https://user-images.githubusercontent.com/29423260/161368538-73de4d85-e0ab-4e0f-bf60-dbdf4c9c545a.png)
    
## 역순 연결 리스트 
- [206. Reverse Linked List](https://leetcode.com/problems/reverse-linked-list/)
- 연결 리스트를 뒤집어라 
- 입력 & 출력 예시     
  ![image](https://user-images.githubusercontent.com/29423260/161368609-0f465a39-d089-4221-bd6d-09e306334a96.png)    
- 풀이) 반복문으로 뒤집기 
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:
        node, prev = head, None 
        while node:
            next, node.next = node.next, prev
            prev, node = node, next
        
        return prev
```   
![image](https://user-images.githubusercontent.com/29423260/161369231-a31c9a1b-eb98-4091-98c4-ba5d7df68613.png)

## 역순 연결 리스트 II
- [92. Reverse Linked List II](https://leetcode.com/problems/reverse-linked-list-ii/)
- 인덱스 left에서 right까지를 역순으로 만들어라. left는 1부터 시작한다. 
- 입력 & 출력 예시    
![image](https://user-images.githubusercontent.com/29423260/161373351-9be88956-4cea-4d21-a6bf-bdfd87aa4a22.png)    
- 풀이) 반복 구조로 노드 뒤집기 
```python
# Definition for singly-linked list.
# class ListNode:
#     def __init__(self, val=0, next=None):
#         self.val = val
#         self.next = next
class Solution:
    def reverseBetween(self, head: Optional[ListNode], left: int, right: int) -> Optional[ListNode]:
        # exception 
        if not head or left == right:
            return head
        
        root = start = ListNode(None)
        root.next = head
        
        # start, end 지정 
        for _ in range(left - 1):
            start = start.next
        end = start.next
        
        # 반복하면서 노드 차례대로 뒤집기 
        for _ in range(right - left):
            tmp, start.next, end.next = start.next, end.next, end.next.next
            start.next.next = tmp
        
        return root.next
```
    
![image](https://user-images.githubusercontent.com/29423260/161373430-ba4b4f16-1e3c-482e-ab0b-81a873d3af2d.png)
