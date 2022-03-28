---
title: "[알고리즘]Leetcode-배열"
excerpt: "배열 관련 Leetcode 문제를 풀어보자"
toc: true
toc_sticky: true
categories:
- Algorithm
modified_date: 2022-03-28 09:36:28 +0900
---
# 두 수의 합(Two Sum)
- 덧셈하여 타겟을 만들 수 있는 배열의 두 숫자 인덱스를 리턴하라 
- 입력     
```nums = [2, 7, 11, 15], target = 9```
- 출력     
```[0, 1]```
- 풀이 
```python3
# 첫번째 수를 뺀 결과 키 조회
class Solution:
    def twoSum(self, nums: List[int], target: int) -> List[int]:
        nums_map = {}
        
        for i, num in enumerate(nums):
            # 2) 타겟에서 첫 번째 수를 뺀 결과를 키로 조회
            if target - num in nums_map:
                return [nums_map[target - num], i]
            # 1) 키와 값을 바꿔서 딕셔너리로 저장
            nums_map[num] = i
```
# 빗물 트래핑(Trapping Rain Water)
- 높이를 입력 받아 비 온 후 얼마나 많은 물이 쌓일 수 있는지 계산하라. 
 ![image](https://user-images.githubusercontent.com/29423260/160335188-17df60c7-16ae-47e5-9166-f6c8a59a3cff.png)
- 입력    
```[0,1,0,2,1,0,1,3,2,1,2,1]```
- 출력    
```6```
- 풀이 1) 투 포인터 이동 (64ms)
```python
class Solution:
    def trap(self, height: List[int]) -> int:
        if not height:
            return 0
        
        volume = 0
        left, right = 0, len(height) - 1
        left_max, right_max = height[left], height[right]
        
        while left < right:
            left_max, right_max = max(height[left], left_max), max(height[right], right_max)
            
            # 더 높은 쪽을 향해 투 포인터 이동
            if left_max <= right_max:
                volume += left_max - height[left]
                left += 1
            else:
                volume += right_max - height[right]
                right -= 1
        
        return volume
```
- 풀이 2) 스택 (43ms)
```python
class Solution:
    def trap(self, height: List[int]) -> int:
        stack = []
        volume = 0
        
        for i in range(len(height)):
            # 변곡점(현재높이가 이전 높이보다 높을때) 만나는 경우
            while stack and height[i] > height[stack[-1]]:
                # 스택에서 꺼냄
                top = stack.pop()
                
                if not len(stack):
                    break;
                
                # 이전과의 차이만큼 물 높이 처리 
                distance = i - stack[-1] - 1 
                waters = min(height[i], height[stack[-1]]) - height[top]
                volume += distance * waters
            
            stack.append(i)
        return volume
```
# 세 수의 합 (3Sum)
- 배열을 입력받아 합으로 0을 만들 수 있는 3개의 엘리먼트를 출력하라 
- 입력    
```nums = [-1, 0, 1, 2, -1, -4```
- 출력    
```[
    [-1, 0, 1],
    [-1, -1, 2]
]```
