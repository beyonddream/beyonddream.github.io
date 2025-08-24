---
title: "Bloom Filters - a beginner introduction"
date: 2025-08-24
---

[[toc]]

## Introduction

In this article we will look at a very useful probabilistic data structure called bloom filters.

TLDR: If you are in need of a mechanism to check if an element is present in a set but don’t have enough memory to store the entire set and also fine to tolerate some amount of false positive rate (configurable) with no false negatives, then give bloom filters a try.

## Details

The original paper[1] was from 1970’s when the RAM size was small and for some problems it was too impractical to store the hashed contents of the set in memory. So the author compares the conventional approach of storing the entire hashed contents of the set on the disk vs. storing a much smaller bloom filter entirely in the RAM - with an extra catch that it exhibits no false negative rate but can have some positive % of false positive rate. This way the total percentage of disk access to verify set membership queries can be brought down drastically (only few queries might incorrectly hit the disk because of false positives). Currently with the advent of big data, even the hash of the datasets might not fit into the RAM and bloom filter can be a good candidate solution in those situations. The trade-off obviously is that we are optimizing for space reduction vs increase (somewhat) in response time (during false positive situation).

What is meant by false positive and false negative ?

false negative - It means, for a set membership query, a data structure says the element is not a member of the set even though that element is present in the set.

false positive - It means, for a set membership query, a data structure says the element is a member of the set even though that element is not present in the set.

Bloom filter, will not exhibit false negatives but can exhibit some % of false positives.

When do u want to use it ?

When space usage of the entire hashed contents of the set (conventional hash based solution) is too high to be stored entirely in RAM.
When majority of set membership queries return negative response. That is when great many elements to be tested for set membership doesn’t actually belong in the set.
We can accept some amount of false positives.

## How it works

The paper describes two ways of implmenting the bloom filter and we will only look at the second method which is demonstrably superior in terms of space usage.

The entire set is an array of 1 bit cells. The cell can have a value of 1 or 0. 1 if the element is present in the set. 0 otherwise.

```
n -> number of elements that are expected to be stored in bloom filter. 
m -> number of cells or size of the bloom filter.
k -> number of hash functions, f1, f2,..., fk. Each of these could be a hash functions like Murmur3, sha256 etc.
s = [] // set
f = [] // array of hash functions

set operations:

insert(x):
    for i in range(k):
        s[f[i](x)] = 1 // notice that the element is not added as key, only the hash of the element

lookup(x):
    for i in range(k):
        if(s[f[i](x)] == 0):
                return 0
    return 1
```

Initially all cells have 0 value.

For the insert case, we are finding the hash of the input element using each of the hash functions and using the hash as the index into the set and setting the value in that index position to 1.

During lookup (set membership), we again find the hash of the input element using each of the hash function and using the hash as the index into the set check if the value in the index is 0. If yes, we know for sure the element is not in set and we return 0 (not found). Else, we return 1 (found).

When we return 1 during lookup, we can be wrong. This is where the false positive can happen. Since more than two elements can map to the same index in the array we can’t be really sure if the element we are checking is the same element that was originally hashed into the index.

One thing to notice is our implementation didn’t have remove() method. Since we can’t guarantee that the element is present in the set, we also cannot blindly remove an element since if we do that then we potentially could remove some other element which also happen to hash into the same index. There are ways to overcome this limitation but we won’t go into it in this article.

## Time and Space complexity

The time taken for both operations are proportional to O(k), regardless of the number of elements in the set!

The space complexity is O(m). How we choose m and k is based on how much error rate we are willing to tolerate.

Analysis, proceeds like this:

The probability that after 1 insertion a cell will be 0, is (1 - 1/m)^k. After n insertions, the probability becomes (1 - 1/m)^kn.

Then the probability of false positive rate is

(1 - (1 - 1/m)^kn)^k and this turns out to be approx. ~ (1 - e^-kn/m)^k

Given this, if we raise k (number of hash functions) we can bring down the error rate, but in the original paper, one of the goal is to preserve the time spent on evaluating if a member is present in the set or not and it depends on keeping the k value low. We leave it to the consumer of bloom filter to choose the best m and n (according to their space requirements) and decide what would be the best k value we can derive based on that.

The optimal k, given m and n is,

optimal k = ln(2). m/n

False positive rate E = (1/2)^k ~ (0.6185)^m/n

Here, m/n is the number of bits per element.

In practice, k (which must be an integer) and m/n must be constants. Example, when m/n = 10 and k = 7, E is ~ 0.008.

## Conclusion

In the original paper, the author uses the example of 500,000 words to be hypenated and 450,000 of these words can be hypenated using simple means. The other 50,000 words need access to a reference dictionary that is completely disk resident. With bloom filter, for a choice of E = 1/16, an access required to read from disk for atmost (50,000 + (450,000/16)) ~ 78,000 of the 500,000 words to be hypenated, i.e for approximately 16% of the cases. This constitutes 84% reduction in disk access in case of completely disk resident hash area.

## Reference

[1] - Original bloom filter (https://web.archive.org/web/20200806134244/https://citeseerx.ist.psu.edu/viewdoc/download;jsessionid=3F51E4FEB211B03342A9D6B94D4E8B92?doi=10.1.1.641.9096&rep=rep1&type=pdf)

[2] - Counting bloom filter (addition operation supported) [https://web.archive.org/web/20200727040826/http://theory.stanford.edu/~rinap/papers/esa2006b.pdf]