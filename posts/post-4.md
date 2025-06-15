---
title: Notes on Python programming language - a reference for the journeyman
date: 2025-06-10
---

[[toc]]

# Preface

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

```python
# import a single symbol from a namespace
from module_name import identifier
# rename the symbol in current namespace while importing it
from module_name import identifier as renamed_identifier
# import all the exported symbols from a module
import module_name
# import from a module from a module in the current working directory
from .module_name import identifier # number of dots specify the number of folders to backtrack up and one 'dot' is current folder
```

## Numbers

Almost everything in python is an object.

```python
# a is pointing to an object containing value 100000 which is of int data type
a = 100000 

# ** is a power operator
a ** b 

# integer division
a // b

# true division with fractional part
a / b 

# use this if you want to truncate the fractional part instead of flooring it.
int(4.20) 

# Boolean is a subtype of Integer in Python!
a = True
b = False

# Other boolean operators are : not, and, or
a and b
a or b
not a

# real number stored in 64 bits - double precision floating point format
pi = 3.141

# complex number is supported natively
c = 3.14 + 2.73j

print(c.real) # prints 3.14
print(c.imag) # prints 2.73
```

## Immutable Sequences

Important immutable sequences are string, tuples, bytes. Immutables can be used as keys in python dictionary.

```python
#string - unicode codepoint
s = ""
s = ''
# multiline string - useful for method level comments among other things.
s = """
"""
s = '''
'''

s_encoded = s.encode('utf-8') # utf-8 encoded
s_encoded.decode('utf-8')

s_bytes = b"A bytes object" # a bytes object

s = "abcd"
s[0] # 'a'

s[:3] # 'abc' - s[start:stop:step] - stop is exclusive

s[:] # make a copy of original

s[::-1] # copy of original in reverse order

t = () # tuple, a sequence of arbitrary python objects

t = (42,) # need a comma at the end for an one element tuple

a, b, c = 3, 2, 1 # multiple assignments

2 in t # membership test

a, b = b, a # pythonic way to swap two variables

```

## Mutable Sequences

Important mutable sequences are List, bytearray, Set, Dict.

```python

[] # empty list

list() # same as []

a = [1, 2, 3]

a = [x + 2 for x in [1, 2, 3]] # a = [3, 4, 5]


```

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


# Reference

[Learning Python by Fabrizio Romano](https://books.google.com/books/about/Learn_Python_Programming.html?id=abtLEAAAQBAJ) - A good first book to learn Python for someone who already know another programming language.

