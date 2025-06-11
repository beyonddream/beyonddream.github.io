---
title: Python programming language - a long form notes
date: 2025-06-10
---

[[toc]]

## Overview

This page contains the absolute minimum of what I think every beginner in Python programming language should know. I have primarily written it for myself to serve as a reference to lookup when needed.

## Python Code Style

Refer to PEP8 - https://www.python.org/dev/peps/pep-0008/

## Python Code Organization

### Package and Module

* module
  * a .py file.
* package
  * set of modules grouped together.
  * a folder which has .py files.
  * it must contain a `__init__.py` file inside this folder for it to qualify as a package.
  * as of 3.3, `__init__.py` is not strictly required.
* class
  
  ```python
  class Bike:
    def __init__(self, color, frame_material):
        self.color = color
        self.frame_material = frame_material
    
    def print_detail(self):
        print("color : %s, frame_material: %s" % (self.color, self.frame_material))  
    
    red_bike = Bike('Red', 'Carbon fiber')
    red_bike.print_detail()  # color : Red, frame_material: Carbon fiber
  ```  

## Reference

[Learning Python by Fabrizio Romano](https://books.google.com/books/about/Learn_Python_Programming.html?id=abtLEAAAQBAJ)

