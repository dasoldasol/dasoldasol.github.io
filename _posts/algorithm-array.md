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
