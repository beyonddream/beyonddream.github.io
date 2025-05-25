---
title: How to read and write a set of datetime partitioned files using Spark
date: 2025-05-25
---

# Introduction

While at work, I came across a simple task of reading and writing datetime partitioned folders from one location to another, preserving the partitioning information after writing it to the sink. While researching on how to do this in spark, I found very few tutorials online on an end to end solution. I am capturing the below notes mainly for my future self.
