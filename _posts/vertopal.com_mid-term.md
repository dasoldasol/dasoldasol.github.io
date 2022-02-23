---
jupyter:
  colab:
    authorship_tag: ABX9TyMwqu6C6SjSpFZp8jFXLWpy
    name: mid-term.ipynb
    toc_visible: true
  kernelspec:
    display_name: Python 3
    name: python3
  language_info:
    name: python
  nbformat: 4
  nbformat_minor: 0
---

::: {.cell .markdown id="GLJE_Wf1zTmt"}
tensor 차원 확인
:::

::: {.cell .code colab="{\"base_uri\":\"https://localhost:8080/\"}" executionInfo="{\"status\":\"ok\",\"user\":{\"photoUrl\":\"\",\"userId\":\"04248295090724833642\",\"displayName\":\"성균관대학교서다솔\"},\"user_tz\":-540,\"elapsed\":632,\"timestamp\":1619870568953}" id="IyDBrfLSzZeQ" outputId="6c9b25e3-e61c-46ad-e330-bcef6157eef4"}
``` {.python}
import numpy as np


x = np.array([[10, 20],[20, 30],[30, 40]])
print(x.ndim, "D tensors")
```

::: {.output .stream .stdout}
    2 D tensors
:::
:::

::: {.cell .markdown id="iFCd2_90SUIO"}
MSE
:::

::: {.cell .code id="PthzSJ1XN3pW"}
``` {.python}
def get_y(x, a, b):
    y_true = (a * x) + b
    return y_true

a = 9.8
b = 4.8
x = [1, 2, 3, 4, 5]
y_pred = [14, 24, 32, 44, 50]
```
:::

::: {.cell .code colab="{\"base_uri\":\"https://localhost:8080/\"}" executionInfo="{\"status\":\"ok\",\"user\":{\"photoUrl\":\"\",\"userId\":\"04248295090724833642\",\"displayName\":\"성균관대학교서다솔\"},\"user_tz\":-540,\"elapsed\":1433,\"timestamp\":1619837719479}" id="1PjvbjXVPATC" outputId="0db4c09c-81d9-4a3e-a07c-4abe1289b710"}
``` {.python}
y_true = []
for idx in x:
    y = get_y(idx, a, b)
    y_true.append(round(y, 1)) # 소수점 
y_true
```

::: {.output .execute_result execution_count="2"}
    [14.6, 24.4, 34.2, 44.0, 53.8]
:::
:::

::: {.cell .code colab="{\"base_uri\":\"https://localhost:8080/\"}" executionInfo="{\"status\":\"ok\",\"user\":{\"photoUrl\":\"\",\"userId\":\"04248295090724833642\",\"displayName\":\"성균관대학교서다솔\"},\"user_tz\":-540,\"elapsed\":2972,\"timestamp\":1619837721021}" id="GhxVrAJLPnyJ" outputId="4e964a2e-0c60-4f47-a0ca-7c59ebac80fa"}
``` {.python}
from sklearn.metrics import mean_squared_error

mean_squared_error(y_true, y_pred)
```

::: {.output .execute_result execution_count="3"}
    3.959999999999998
:::
:::

::: {.cell .code colab="{\"base_uri\":\"https://localhost:8080/\"}" executionInfo="{\"status\":\"ok\",\"user\":{\"photoUrl\":\"\",\"userId\":\"04248295090724833642\",\"displayName\":\"성균관대학교서다솔\"},\"user_tz\":-540,\"elapsed\":2969,\"timestamp\":1619837721022}" id="0vzdRDLnP0Aa" outputId="4ada41e5-d83e-4435-81ef-403fbb2fc8c3"}
``` {.python}
import numpy as np
MSE = np.square(np.subtract(y_true,y_pred)).mean()
MSE
```

::: {.output .execute_result execution_count="4"}
    3.959999999999998
:::
:::

::: {.cell .markdown id="T6Q191eJSXFW"}
조건부확률
:::

::: {.cell .code id="NKg6V13mSaaq"}
``` {.python}
p_spam = 0.5 # P(스팸)
p_spam_then_word = 0.95 # P(대출|스팸) : 스팸메일에 대출이란 단어가 있을 확률
p_normal_then_word = 0.02 # P(대출|정상) : 정상메일에 대출이란 단어가 있을 확률  
```
:::

::: {.cell .code colab="{\"base_uri\":\"https://localhost:8080/\"}" executionInfo="{\"status\":\"ok\",\"user\":{\"photoUrl\":\"\",\"userId\":\"04248295090724833642\",\"displayName\":\"성균관대학교서다솔\"},\"user_tz\":-540,\"elapsed\":734,\"timestamp\":1619838834820}" id="23QGHDURUOD9" outputId="d0dfea6e-b232-42ed-c8d4-81a01e77e608"}
``` {.python}
p_normal = round(1 - p_spam,1)
p_normal # P(정상)
```

::: {.output .execute_result execution_count="9"}
    0.5
:::
:::

::: {.cell .code colab="{\"base_uri\":\"https://localhost:8080/\"}" executionInfo="{\"status\":\"ok\",\"user\":{\"photoUrl\":\"\",\"userId\":\"04248295090724833642\",\"displayName\":\"성균관대학교서다솔\"},\"user_tz\":-540,\"elapsed\":793,\"timestamp\":1619838932001}" id="bJB_P-vsUWlP" outputId="5e87379f-5a95-4448-a2f1-f53c7376e2ec"}
``` {.python}
# Required P(스팸|대출) = P(대출|스팸)*P(스팸) / P(대출)

# 1. P(대출) = P(대출|스팸)P(스팸) + P(대출|정상)P(정상)
p_word = ( p_spam_then_word * p_spam)  + ( p_normal_then_word * p_normal )
print(p_word)

# 2. P(스팸|대출) = P(대출|스팸)*P(스팸) / P(대출)
p_word_then_spam = p_spam_then_word * p_spam / p_word

p_word_then_spam
```

::: {.output .stream .stdout}
    0.485
:::

::: {.output .execute_result execution_count="11"}
    0.979381443298969
:::
:::

::: {.cell .markdown id="agZa3tK0zCbI"}
유클리디언
:::

::: {.cell .code colab="{\"base_uri\":\"https://localhost:8080/\"}" executionInfo="{\"status\":\"ok\",\"user\":{\"photoUrl\":\"\",\"userId\":\"04248295090724833642\",\"displayName\":\"성균관대학교서다솔\"},\"user_tz\":-540,\"elapsed\":754,\"timestamp\":1619840220733}" id="-qS2eXz-9Qwk" outputId="72914b54-4265-4b9f-9920-931140f5611c"}
``` {.python}
from scipy.spatial import distance
center_1 = (1.90, 0.97)

p2 = (1.76, 0.84) # 0.1910
p3 = (2.32, 1.63) # 0.7823
p4 = (2.31, 2.09) # 1.1926
p5 = (1.14, 2.11) # 1.3701
p6 = (5.02, 3.02) # 3.7332
p7 = (5.74, 3.84) # 4.7940
p8 = (2.25, 3.47) # 2.5243
p9 = (4.71, 3.60) # 3.8487

#d = []
d = distance.euclidean(center_1, p9)
print("Euclidean distance: ",d)
```

::: {.output .stream .stdout}
    Euclidean distance:  3.8487660360172584
:::
:::

::: {.cell .code colab="{\"base_uri\":\"https://localhost:8080/\"}" executionInfo="{\"status\":\"ok\",\"user\":{\"photoUrl\":\"\",\"userId\":\"04248295090724833642\",\"displayName\":\"성균관대학교서다솔\"},\"user_tz\":-540,\"elapsed\":706,\"timestamp\":1619840293748}" id="eZ0K5qMTAGaR" outputId="8602f05f-9ebc-46cc-9b89-663f454a47ef"}
``` {.python}
(0.1910 + 0.7823 + 1.1926 + 1.3701 + 3.7332 + 4.7940 + 2.5243 + 3.8487)/8
```

::: {.output .execute_result execution_count="21"}
    2.304525
:::
:::
