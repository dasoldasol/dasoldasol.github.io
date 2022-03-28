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
```nums = [-1, 0, 1, 2, -1, -4]```
- 출력    
```[
    [-1, 0, 1],
    [-1, -1, 2]
]```
- 풀이 : 투 포인터
```python
class Solution:
    def threeSum(self, nums: List[int]) -> List[List[int]]:
        results = []
        nums.sort()
        
        for i in range(len(nums) - 2):
            # 중복된 값 건너뛰기 
            if i > 0 and nums[i] == nums[i - 1]:
                continue
            
            # 간격을 좁혀가며 합 sum 계산
            left, right = i+1, len(nums) - 1
            while left < right:
                sum = nums[i] + nums[left] + nums[right]
                if sum < 0:
                    left += 1
                elif sum > 0:
                    right -= 1
                else:
                    results.append([nums[i], nums[left], nums[right]])
                    while left < right and nums[left] == nums[left + 1]:
                        left += 1
                    while left < right and nums[right] == nums[right - 1]:
                        right -= 1
                    left += 1
                    right -= 1
        
        return results
```
# 배열 파티션 I (Array Partition I)
- n개의 페어를 이용한 min(a, b)의 합으로 만들 수 있는 가장 큰 수를 출력하라 
- 입력    
```[1,4,3,2]```
- 출력    
```4```
- 설명     
n은 2가 되며, 최대 합은 4이다. min(1,2) + min(3, 4) = 4
- 풀이 : 오름차순 짝수번째 계산하기
```python
class Solution:
    def arrayPairSum(self, nums: List[int]) -> int:
        return sum(sorted(nums)[::2]) # 두칸씩 건너뛰어 짝수 보기 
```
# 자신을 제외한 배열의 곱 (Product of Array Except Self)
- 배열을 입력받아 output[i]가 자신을 제외한 나머지 모든 요소의 곱셈 결과가 되도록 출력하라 
- 입력     
```[1,2,3,4]```
- 출력    
```[24,12,8,6]```
- 주의 : 나눗셈을 하지 않고 O(n)에 풀이하라 
- 풀이 : 왼쪽 곱셈 결과에 오른쪽 값을 차례대로 곱셈 
```python
class Solution:
    def productExceptSelf(self, nums: List[int]) -> List[int]:
        out = []
        p = 1
        # 왼쪽 곱셈 
        for i in range(0, len(nums)):
            out.append(p)
            p = p * nums[i]
        p = 1
        # 왼쪽 곱셈 결과에 오른쪽 값을 차례대로 곱셈 
        for i in range(len(nums) - 1, 0 - 1, -1):
            out[i] = out[i] * p
            p = p * nums[i]
        return out
```
# 주식을 사고팔기 가장 좋은 시점 (Best Time to Buy and Sell Stock)
- 한 번의 거래로 낼 수 있는 최대 이익을 산출하라 
- 입력    
```[7,1,5,3,6,4]```
- 출력    
```5```
- 설명 : 1일때 사서 6일때 팔면 5의 이익을 얻는다. 
- 풀이 : 저점과 현재 값과의 차이 계산 
    - 현재값을 가리키는 포인터가 우측으로 이동하면서 이전의 저점을 기준으로 가격 차이 계산 후, 클 경우 최댓값을 계속 교체
    - idea) 최댓값은 최솟값으로, 최솟값은 최댓값으로 지정 => 교체될 수 있도록 
 ```python
 class Solution:
    def maxProfit(self, prices: List[int]) -> int:
        profit = 0 
        min_price = sys.maxsize
        
        # min과 max를 계속 갱신
        for price in prices:
            min_price = min(min_price, price)
            profit = max(profit, price - min_price)
        
        return profit
 ```
