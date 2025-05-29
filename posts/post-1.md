---
title: How to read and write a set of datetime partitioned files using Spark
---

## Introduction

While at work, I had to implement a straightforward job that reads and writes datetime partitioned folders from one location to another, preserving the partitioning information while writing it to the sink. When I researched online on how to do this in spark, I found very few tutorials giving an end-to-end solution that worked. Below I have provided one such implementation using PySpark.

## Setup

Assumption is that the partition folders are created at the source with below pattern:
```
 year/month/day/hour/userid
```
Crucially, the folder names especially userid values are not known beforhand.

## PySpark Solution




