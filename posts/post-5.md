---
title: "Code reading: The python std lib module - shelve.py"
date: 2025-06-21
---

[[toc]]

# Introduction

Reading Python Standard Library modules are fun and educational.
They also instructional on how to write idiomatic python.

Today we are going to look at a stdlib module called `shelve`.
Below is a sample usage of the module:

```python
  #!/usr/bin/env python

  import shelve

  class Bio:

      def __init__(self, name, age):
          self.name = name
          self.age = age

      def __repr__(self):
          return f"Bio(name={self.name}, age={self.age})"

  def main(name: str, age: int):
      with (d := shelve.open("bio", writeback=True)):
          d[name] = Bio(name, age)
      
      with (d := shelve.open("bio")):
          print(d[name])

  if __name__ == '__main__':
      main("beyonddream", 18)
```
A local database called `bio.db` will be created after running the above code.

In rest of the article, I will go over the source code of `shelve.py` and document many interesting tidbits along the way.

# Source Code

```python

    """Manage shelves of pickled objects.

    A "shelf" is a persistent, dictionary-like object.  The difference
    with dbm databases is that the values (not the keys!) in a shelf can
    be essentially arbitrary Python objects -- anything that the "pickle"
    module can handle.  This includes most class instances, recursive data
    types, and objects containing lots of shared sub-objects.  The keys
    are ordinary strings.

    ...

    """
```
One of the main advantage of using Shelve instead of directly using `dbm` module is that it natively supports working with and persisting dictionary like objects in python. It delegates the low level step of serializing the keys and values into bytes to `dbm` module internally. Allowing only `str` keys is also pragmatic design choice.

```python
  from pickle import DEFAULT_PROTOCOL, Pickler, Unpickler
  from io import BytesIO

  import collections.abc

  __all__ = ["Shelf", "BsdDbShelf", "DbfilenameShelf", "open"]

  class _ClosedDict(collections.abc.MutableMapping):
      'Marker for a closed dict.  Access attempts raise a ValueError.'

      def closed(self, *args):
          raise ValueError('invalid operation on closed shelf')
      __iter__ = __len__ = __getitem__ = __setitem__ = __delitem__ = keys = closed

      def __repr__(self):
          return '<Closed Dictionary>'
```

It is interesting to note that the `shelve` internally uses `pickle` module to serialize the value. Pickle is the standard binary serializer/deserializer of python objects that supports more types than `json`. Though, it is not secure esp. when deserializing from untrusted source.

Defining `__all__` is a convention in python. The symbols included in it are the public API of the module. Only symbols in `__all__` are imported into another module when below code is run:

`from shelve import *`.

`_ClosedDict` is a private symbol as it starts with underscore - another convention in python. Interestingly, it is a class to denote a "closed" dict. Any access to method like `__getitem__` will throw `ValueError`. It is implemented by setting all the relevant dictionary method's reference to a single method whose implementation throw `ValueError` if invoked - a beauty of idiomatic python.

