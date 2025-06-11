---
title: Python programming language - a reference for the journeyman
date: 2025-06-10
---

[[toc]]

## Overview

This page contains the absolute minimum of what I think every journeyman in Python programming language should internalize. I have primarily written it for myself to serve as a reference to lookup when needed. Note, the current document is not meant to be a first encounter for learning Python - for that check the reference section.

## Python Code Style

Refer to PEP8 - https://www.python.org/dev/peps/pep-0008/

## Python Code Organization

### Package and Module

* Module
  * a .py file.
* Package
  * set of modules grouped together.
  * a folder which has .py files.
  * it must contain a `__init__.py` file inside this folder for it to qualify as a package.
  * as of 3.3, `__init__.py` is not strictly required.
* Class
  
  ```python
  class Bike:
    def __init__(self, color, frame_material):
        self.color = color
        self.frame_material = frame_material
    
    def print_detail(self):
        print(f"color : {self.color}, frame_material: {self.frame_material}")
    
    red_bike = Bike('Red', 'Carbon fiber')
    red_bike.print_detail()  # color : Red, frame_material: Carbon fiber
  ```  
* Dataclass

  ```python
  from dataclasses import dataclass

  @dataclass
  class Employee:
    """ Immutable public data of employee information """
    first_name: str
    middle_name: str
    last_name: str
    age: str
    department_id: int


  employee1 = Employee("John", "", "Doe", 23, 1)
  employee2 = Employee("Jane", "", "Doe", 20, 2)
  ```

## Scopes

Order of scope evaluation while trying to find a name in namespace:
LEGB (Local, Enclosing function, Global, Built-in)

### Modify a global variable

If you have a function and want to modify a global variable within the function

```python
x = 10

def func():
    global x # 'x' is in global namespace
    x += 1

func()
# x is now 11
```

### Modify a variable in outer scope

If you have a nested function and want to modify a variable in the outer scope.

```python
def outer():
    x = 10

    def inner():
        nonlocal x # modifies outer 'x'
        x += 1

    inner()
    # 'x' is now 11
```

## Imports

## Numbers

## Immutable Sequences

## Mutable Sequences

## List/Set Comprehension

## Map, Zip, Filter

## IterTools

## Generators

## Conditional

## Looping

## Iterators

## Functions

## Decorators

## Class

## Exceptions

## Typing

## Testing

## Debugging


## Reference

[Learning Python by Fabrizio Romano](https://books.google.com/books/about/Learn_Python_Programming.html?id=abtLEAAAQBAJ) - A good first book to learn Python for someone who already know another language.

