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

Defining `__all__` is a convention in python. The symbols included in it are the public API of the module. Only symbols in `__all__` are imported into another module when `from shelve import *` is run.

`_ClosedDict` is a private symbol as it starts with underscore - another convention in python. Interestingly, it is a class to denote a "closed" dict. Any access to method like `__getitem__` will throw `ValueError`. It is implemented by setting all the relevant dictionary method's reference to a single method whose implementation throw `ValueError` if invoked - a beautiful and idiomatic python.

```python
  class Shelf(collections.abc.MutableMapping):
      """Base class for shelf implementations.

      This is initialized with a dictionary-like object.
      See the module's __doc__ string for an overview of the interface.
      """

      def __init__(self, dict, protocol=None, writeback=False,
                  keyencoding="utf-8"):
          self.dict = dict
          if protocol is None:
              protocol = DEFAULT_PROTOCOL
          self._protocol = protocol
          self.writeback = writeback
          self.cache = {}
          self.keyencoding = keyencoding
      ...
```

The base class `Shelf` extends from `collections.abc.MutableMapping` which is an abstract base class that define interface for dictionary like behavior. `protocol` is passed to pickle to determine pickle's protocol to use. `keyencoding` define encoding for string key. `cache` maintains an in-memory copy of python object associated to the string key in the shelf. Finally, `dict` is the dictionary like object which is by default initialized with `dbm` database for disk persistence.

```python
      def __iter__(self):
          for k in self.dict.keys():
              yield k.decode(self.keyencoding)

      def __len__(self):
          return len(self.dict)

      def __contains__(self, key):
          return key.encode(self.keyencoding) in self.dict

      def get(self, key, default=None):
          if key.encode(self.keyencoding) in self.dict:
              return self[key]
          return default
      ...
```

`__iter__` dunder method is a generator that yields the key bytes decoded as string using the keyencoding originally passed to the shelf constructor. Rest of the dunder methods are standard fare for a python programmer. Crucially, `self[key]` in `get` method calls `__getitem__` defined further down.

```python
    def __getitem__(self, key):
        try:
            value = self.cache[key]
        except KeyError:
            f = BytesIO(self.dict[key.encode(self.keyencoding)])
            value = Unpickler(f).load()
            if self.writeback:
                self.cache[key] = value
        return value

    def __setitem__(self, key, value):
        if self.writeback:
            self.cache[key] = value
        f = BytesIO()
        p = Pickler(f, self._protocol)
        p.dump(value)
        self.dict[key.encode(self.keyencoding)] = f.getvalue()

    def __delitem__(self, key):
        del self.dict[key.encode(self.keyencoding)]
        try:
            del self.cache[key]
        except KeyError:
            pass
    ...
```