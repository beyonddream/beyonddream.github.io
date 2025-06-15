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

  # combine elements from multiple iterators
  z = zip(['a', 'b'], [1, 2])
  list(z) # [('a', 1), ('b', 2)]

  f = filter(None, [1, 0, 3, 4])
  list(f) #  [1, 3, 4] - None implies identitfy function, 0 (False) is removed.
```

## IterTools

itertools / functools provide functions and classes that support functional programming style and general operations on callables. See more here: https://docs.python.org/3.13/library/functional.html

```python
  from itertools import permutations

  print(list(permutations('ABC')))

  #=> [('A', 'B', 'C'), ('A', 'C', 'B'), ('B', 'A', 'C'), ('B', 'C', 'A'), ('C', 'A', 'B'), ('C', 'B', 'A')]

```

## Generators

**Generator functions** - They are similar to functions but instead of returning value, they yield which allows the program to suspend and resume state between each call.

```python
  def get_squares(n):
    for x in range(n):
      yield x ** 2

  squares = get_squares(3)
  print(next(squares)) # print 0
  print(next(sqaures)) # print 1
  print(next(sqaures)) # print 4

  def counter(start=0):
    n = start
    while True:
      result = yield n
      if result == 'Q':
        break
      n += 1
      
  c = counter()
  print(next(c)) # 0
  print(next(c)) # 1
  print(c.send('Q')) # throws StopIteration

```

**Generator expressions** - They are similar to list comprehensions but instead of returning list, they return an object that produces results one by one.

```python
  cubes_gen = (k ** 3 for k in range(10)) # this is a generator expression
  #=> (k ** 3) above can be replaced with any type of lambda or def function

```

## Conditional

if/elif/else

```python
  if income < 1000:
    pass #do something
  elif income < 2000:
    pass #do something else
  else:
    pass #do entirely different thing
```

Ternary operator

```python
  discount = 25 if order_total > 101 else 0
```

## Looping

**For**

```python
  for number in [1, 2, 3]:
  print number
  
  
  for key in dict:
    # keys printed in arbitrary order
    print dict[key]

```

**While**

```python
  reminders = []
  while n > 0:
  remainder = n % 2
  remainders.append(remainder)
  n //= 2

  remainders = remainders[::-1]
  print(remainders)

```

**For Else**

```python
  class DriverException(Exception):
    pass

  people = [('Spock', 3), ('Kirk', 9)]

  # If for loop is not exited via break then it will go to else clause.
  for person, age in people:
    if age >= 18:
      break
  else:
    raise DriverException('Driver not found.')
```

## Iterators

Any class that defines **\_\_iter\_\_()** and **\_\_getitem\_\_()** method can be used as iterators. Iterator is an object capable of returning its value one at a time.

```python
  class CustomIterator:
      def __init__(self, data):
          self.data = data
      
      def __iter__(self):
          return iter(self.data)
      
      def __getitem__(self, index):
          return self.data[index]

  my_list = [1, 2, 3, 4, 5]
  iterator = CustomIterator(my_list)

  list(iterator) #=> [1, 2, 3, 4, 5]
```

## Functions

Standard fare as any other language. Nice thing about python function is it can return multiple values. One main thing to consider - Avoid mutable defaults arguments.

```python

  def func(a, b, c):
    print(a, b, c)

  func(a=1, c=3, b=2)
  func(1, 3, 3)

  def func2(a=10):
    print a

  func2()
  func2(11)
```

**Variable positional arguments** 
It can be used to pass variable number of positional arguments.

```python
  def min(*args):
    # args is a tuple now
    if args:
      mn = args[0]
      for value in args[1:]:
        if value < mn:
          mn = value
      print mn

  min(1, 3, 4, -1)

  values = (1, 3, 4, -1)
  min(*values) # unpacking the tuple to pass it as separate params

 ```
**Variable keyword argument**
It is similar to variable positional argument but uses ** syntax and collects the parameters in a dict.

```python
  def func(**kwargs):
    print kwargs
  
  func(a=1, b=10)
  func(**dict(a=1, b=10))
```

**Anonymous function (lambda)**

```python
  lambda x: x
  lambda _: print 'hi' # argument not used can be denote by 'underscore'
```

## Decorators

A pattern to add extra functionality to a function in a DRY (Don't Repeat Yourself) manner.

```python
  from time import sleep, time
  from functools import wraps

  def measure(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
      t = time()
      func(*args, **kwargs)
      print(func.__name__, 'took:', time() - t)
    return wrapper
  
  @measure
  def f(sleep_time=0.1):
    """I'm a dog and I love sleeping!"""
    sleep(sleep_time)
    
  f(sleep_time=0.3)
  print(f.__name__, ':', f.__doc__)

```

Decorator factory passes arguments to decorator to modify its behavior dynamically.

## Class

Just a basic class and sub-class knowledge is good enough.

```python
  class Book:
    pass
  
  #Ebook extends Book
  class EBook(Book):
    pass
  
  class EBook(Book):
    def __init__(self, title, format):
      Book.__init__(self, title)
      self.format = format
```

## Exceptions

```python
  class Exception1(Exception):
    pass

  class Exception2(Exception):
    pass

  class Exception3(Exception):
    pass

  try:
    pass # some code
  except Exception1:
    pass # react to Exception1
  except (Exception1, Exception2):
    pass # react to Exception1 and Exception2
  except Exception3:
    pass # react to Exception3
```

## Typing

Type hints are not enforced at runtime. They are very useful though for e.g. running static analysis tools like  `mypy` and documenting function signature.

```python
  from typing import List

  y : int

  # function param
  def func1(x: int) -> List:
    y = 10 * x
    return [y]
```

## Testing

**Lazy way**

```python
  #poor man's unit testing of module
  if __name__ == '__main__':
    funcToTest()
```

**Better way**

```python
  # content of test_client_module.py

  import pytest
  from some_client_module import client_function_add

  # test functions start with test_
  def test_add_positive_numbers():
      assert client_function_add(2, 3) == 5
```

To run the above test file:

```bash
  $ pip install pytest
  $ pytest test_client_module.py
```

## Debugging

There are various sophisticated ways to debug python. But the best one that is readily available to everyong is:

```python
  print("inspect values in your code")
```

Another option is **pdb**. Insert below at near the problematic location in your code:

```python
  import pdb; pdb.set_trace()
```

# Reference

[Learning Python by Fabrizio Romano](https://books.google.com/books/about/Learn_Python_Programming.html?id=abtLEAAAQBAJ) - A good first book to learn Python for someone who already know another programming language.
