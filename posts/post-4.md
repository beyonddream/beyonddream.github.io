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

Module
  * a .py file.

Package
  * set of modules grouped together.
  * a folder which has .py files.
  * it must contain a `__init__.py` file inside this folder for it to qualify as a package.
  * as of 3.3, `__init__.py` is not strictly required.

Class
  
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
Dataclass

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

  list((1, 2, 3)) # [1, 2, 3] - list from set

  list('hello') # ['h', 'e', 'l', 'l', 'o'] - list from string

  # methods on list

  a.append(5) # a = [3, 4, 5, 5]

  a.count(5) # count of 5's in a

  a.extend([6, 7]) # a = [3, 4, 5, 5, 6, 7]

  a.index(4) # 1 - index value of 4 in a

  # operations on list

  min(a) # 3
  sum(a) # 30

  # bytearray

  name = bytearray(b'Arun')

  # str to bytearray

  s1 = "github"
  # we cannot directly update s1 since it is immutable
  b1 = bytearray(s1.encode('utf-8'))
  b1[0] = ord('h')
  s2 = b1.decode('utf-8')
  print(s2) # 'hithub'

  # set

  a = set() 

  a.add(1)
  a.add(2)
  a.add(3)
  a.add(4)

  # a = {1, 2, 3}

  1 in a # True
  1 not in a # False

  frozenset([1, 2]) # immutable set from a list

  # dict

  # different ways to initialize dictionary
  a = dict(A=1, Z=-1)
  a = {'A': 1, 'Z': -1}
  a = dict(zip(['A', 'Z'], [1, -1]))
  a = dict([('A', 1), ('Z', -1)])
  a = dict({'Z': -1, 'A': 1})

  del a['Z'] # delete entry whose key is 'Z'

  a['B'] = 2 # add or replace key 'B' with value 2

  'B' in a # True

  a.clear() # empty the dictionary

  a.keys() # retrieve the keys

  a.values() # retrieve the values

  a.items() # retrieve the key/value pairs

```

## List/Set Comprehension

List/Set comprehension is succinct syntax to iterate over a list or set.

```python

  square = []

  # conventional iteration of list
  for n in range(10):
    square.append(n * 2)

  # using list comprehension
  square = [n * 2 for n in range(10)]

  # using set comprehension
  square = {n * 2 for n in range(10)}
```

Nested comprehension

```python

  items = ['A', 'B']

  [(items[i], items[j]) for i in range(len(items)) for j in range(len(items))]
  #=> [('A', 'A'), ('A', 'B'), ('B', 'A'), ('B', 'B')]

  [[col for col in range(5)] for row in range(5)]
  #=> [[0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4], [0, 1, 2, 3, 4]]
```

Filtering comprehension

```python

  [n for n in range(10) if n % 2 == 0]
  #=> [0, 2, 4, 6, 8]
```

## Map, Zip, Filter

```python

# map return a map object which can be iterated upon
m = map(lambda x: x, range(3))
list(m) # [0, 1, 2]

# map also takes multiple iterators and the lambda takes as many parameters
m = map(lambda *x: x, range(3), 'abc')
list(m) # [(0, 'a'), (1, 'b'), (2, 'c')]

z = zip(['a', 'b'], [1, 2])
list(z)




```

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

