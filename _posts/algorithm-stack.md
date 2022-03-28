---
title: "[알고리즘] Leetcode-스택"
excerpt: "스택 관련 Leetcode 문제를 풀어보자"
toc: true
toc_sticky: true
categories:
- Algorithm
modified_date: 2022-03-28 22:03:28 +0900
---
# 유효한 괄호
- [Valid Parentheses](https://leetcode.com/problems/valid-parentheses/)
- 괄호로 된 입력 값이 올바른지 판별하라 
- 입력     
```
()[]{}
```
- 출력    
```
()[]{}
```
- 풀이 : 스택 일치 여부 판별
  - (,[,{ 은 푸시, ),],}은 팝해서 매핑 테이블 결과와 매칭되는지 확인
  ```python
  class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        table = {
            ')':'(',
            '}':'{',
            ']':'[',
        }
        
        for char in s:
            if char not in table:
                stack.append(char)
            elif not stack or table[char] != stack.pop():
                return False
        
        return len(stack) == 0
  ```
  
  
# 중복 문자 제거
- [Remove Duplicate Letters](https://leetcode.com/problems/remove-duplicate-letters/)
- 중복된 문자를 제외하고 사전식 순서로 나열하라
- 예제    
  ![image](https://user-images.githubusercontent.com/29423260/160411862-e0ec74be-0002-47be-a568-d931100d5844.png)
- 풀이 1) 재귀를 이용한 분리
  ```python
  class Solution:
    def removeDuplicateLetters(self, s: str) -> str:
        for char in sorted(set(s)):
            suffix = s[s.index(char):]
            # 전체 집합과 접미사 집합이 일치할 때 분리 
            if set(s)==set(suffix):
                return char + self.removeDuplicateLetters(suffix.replace(char, ''))
        
        return ''
  ```
- 풀이 2) 스택을 이용한 문자 제거
  ```python
  class Solution:
    def removeDuplicateLetters(self, s: str) -> str:
        counter, seen, stack = collections.Counter(s), set(), []

        for char in s:
            counter[char] -= 1
            # 이미 처리된 문자 여부 검색
            if char in seen:
                continue
            # 순서 맞추고 & 뒤에 붙일 문자가 남아있다면 스택에서 제거 
            while stack and char < stack[-1] and counter[stack[-1]] > 0:
                seen.remove(stack.pop())
            stack.append(char)
            seen.add(char)
            
        return ''.join(stack)
  ```

# 일일 온도
- [Daily Temperatures](https://leetcode.com/problems/daily-temperatures/)
- 매일의 온도 리스트 T를 입력받아서, 더 따뜻한 날씨를 위해서는 며칠을 더 기다려야하는지를 출력하라 
- 입력/출력    
  ![image](https://user-images.githubusercontent.com/29423260/160429515-db63d705-35c9-4e49-9d7c-6dcb7189a662.png)
- 풀이) 스택 값 비교 ([빗물 트래핑](https://dasoldasol.github.io/algorithm/algorithm-array/#%EB%B9%97%EB%AC%BC-%ED%8A%B8%EB%9E%98%ED%95%91trapping-rain-water)문제와 유사)
  ```python
  class Solution:
    def dailyTemperatures(self, T: List[int]) -> List[int]:
        answer = [0] * len(T)
        stack = []
        for i, cur in enumerate(T):
            # 현재 온도가 스택값보다 높다면 정답[스택값] = 현재 인덱스 - 스택값
            while stack and cur > T[stack[-1]]:
                last = stack.pop()
                answer[last] = i - last
            stack.append(i)
        
        return answer
  ```
