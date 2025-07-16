---
title: "Java vs Python via the lens of an interview problem"
date: 2025-07-14
---

[[toc]]

## Intro

I recently had an interesting (to me atleast) thought about how certain assumptions about language features would make some class of bugs non-existent and being a concern for a programmer. In this post, I will give an instance of such a difference between Java and Python via the lens of a binary search algorithm - a technique to solve a class of interview coding problems.

Python has become my programming language of choice in recent years for implementing interview coding problems. A binary search is a technique to avoid doing extra work in certain special scenarios when the data to be searched is ordered. It brings down worst case time of search from an order of `n` to `log n`, where `n` is the size of the data set.

## Binary Search

### Java version

```java
/**
 * Performs a binary search on a sorted integer array to find the index of a target value.
 * 
 * @param arr - array of values ordered in ascending.
 * @param target - target value to find in the array.
 * 
 * @return index of the target value if found, otherwise -1.
*/
public int binarySearch(int[] arr, int target) {
    
    if (arr == null) {
      return -1;
    }
    
    int low = 0;
    int high = arr.length - 1;

    while (low <= high) {
        // Calculate the middle index using a safer way to prevent overflow
        int mid = low + (high - low) / 2;

        if (arr[mid] == target) {
            return mid;
        } else if (arr[mid] < target) {
            low = mid + 1;
        } else {
            high = mid - 1; 
        }
    }

    return -1;
}
```

### Python version

```python
from typing import List

def binary_search(arr: List[int], target: int) -> int:
    """
    Performs a binary search on a sorted integer array to find the index of a target value.

    Args:
        arr: array of values ordered in ascending.
        target: target value to find in the array.

    Returns:
        index of the target value if found, otherwise -1.
    """
    if not arr:
      return -1

    low = 0
    high = len(arr) - 1
    
    while low <= high:
        # Integer division, 
        # doesn't need to worry about overflow
        # since python integers support arbitrary precision
        mid = (low + high) // 2  

        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1
```

## A bug due to integer overflow was never

The only interesting difference between the Java and Python version is how the `mid` value is calculated. In Java, one has to know that `int` supports only fixed precision hence it is buggy to do `(low + high)/2` since `(low + high)` can overflow for very high values of `low` and `high`. Read all about how this bug had lurked in JDK for over 9 years without anyone noticing - https://web.archive.org/web/20101202023037/http://googleresearch.blogspot.com/2006/06/extra-extra-read-all-about-it-nearly.html

In python, since by default it supports arbitrary precision, the natural way to take an average of 2 numbers is also correct!

## Outro

In this post, I am not trying to compare Java and Python to show Java in negative light. It is to argue a general point that language semantics matter especially if the language syntax also makes it natural to write semantically correct code. In this particular case, I like the no-surprise syntax and semantics of Python when it comes to taking a mean of two values.
