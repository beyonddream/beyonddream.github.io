---
title: "Code reading: The python std lib module - shelve.py"
date: 2025-06-21
---

[[toc]]

# Introduction

Reading Python Standard Library (stdlib) modules are fun. They are also instructional on how to write idiomatic python. In this article, we are going to look at a stdlib module called `shelve`. 

Given below is a sample usage of the module. A local database called `bio.db` will be created after running the code.

```python
  #!/usr/bin/env python

  import dbm
  import shelve

  class Bio:
      def __init__(self, name, age):
          self.name = name
          self.age = age

      def __repr__(self):
          return f"Bio(name={self.name}, age={self.age})"

  def main(name: str, age: int):
      with (d := shelve.open("bio", writeback=True)):
          print(f"The shelve module is currently using: {dbm._defaultmod}")
          d[name] = Bio(name, age)

      with (d := shelve.open("bio")):
          if name in d:
            print(d[name])

  if __name__ == '__main__':
      main("Jane Doe", 18)
```

# Source Code

I will go over the source code of `shelve.py` and document many interesting tidbits along the way.

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

It is interesting to note that the `shelve` internally uses `pickle` module to serialize the value. Pickle is the standard binary serializer/deserializer of python objects that supports more types than `json`. Though, it is not secure especially when deserializing from untrusted source.

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

`__getitem__` return the python object associated with the `key` from `cache`. If that fail, it return the value from the persistent store. It is a two step process:
a) Invoke `BytesIO` module to create a file-like object in memory represented as byte stream.
b) Invoke `Unpickler(f).load()` to deserialize the raw bytes into python object.
If `writeback` is `True` then it stores the python object in cache before returning it to the caller.

`__setitem__` track the key-value pair in a `cache` if `writeback` is `True`. Then, it does the reverse of `__getitem__` by first creating a file-like object in memory using `BytesIO` and then using `pickle` to serialize the value as byte stream and set to `dict` which persist it in storage.

When `writeback` is `True`, `cache` stores a copy of the key-value pair because when a value is mutated, we need to persist them in storage. When `close` is called, shelve writes back all entries in `cache` to persistent storage. It is very inefficient in terms of memory and time to do this since `cache` cannot know which key-value pair is value mutated so it writeback all of its entries.

`__delitem__` deletes the item in storage and also in `cache` if the key exists, since `writeback` could have been `False`.

```python
    def __enter__(self):
        return self

    def __exit__(self, type, value, traceback):
        self.close()
    ...
```

`shelf` is a context manager by virtue of defining `__enter__` and `__exit__` dunder methods.

```python

    def close(self):
        if self.dict is None:
            return
        try:
            self.sync()
            try:
                self.dict.close()
            except AttributeError:
                pass
        finally:
            # Catch errors that may happen when close is called from __del__
            # because CPython is in interpreter shutdown.
            try:
                self.dict = _ClosedDict()
            except:
                self.dict = None

    def __del__(self):
        if not hasattr(self, 'writeback'):
            # __init__ didn't succeed, so don't bother closing
            # see http://bugs.python.org/issue1339007 for details
            return
        self.close()

    def sync(self):
        if self.writeback and self.cache:
            self.writeback = False
            for key, entry in self.cache.items():
                self[key] = entry
            self.writeback = True
            self.cache = {}
        if hasattr(self.dict, 'sync'):
            self.dict.sync()
    ...
```

In `__del__`, a check is made before `close()` is called to prevent AttributeError. Even after looking at the bug report and fix, it is not clear why only `writeback` attribute is checked and not all of the attributes passed to `shelf.open()`.

`sync()` make sure the key-value pairs in `cache` is written back to persistent storage if `writeback` is `True` and `dict` which is a `dbm` instance is synced to disk. Here `writeback` is set to `False` before calling `self[key] = entry` to avoid mutating `cache` inside `__setitem__` while iterating on it in `sync()`.

`close()` calls `sync()` and then closes the `dict`. Rest of the code handle few corner case scenarios which is not clear even with comments.

```python

  class BsdDbShelf(Shelf):
    ...
```

Subclass of `Shelf` that is backed by "bsd" db interface that is different from the `dbm` db interface.

```python
  class DbfilenameShelf(Shelf):
      """Shelf implementation using the "dbm" generic dbm interface.

      This is initialized with the filename for the dbm database.
      See the module's __doc__ string for an overview of the interface.
      """

      def __init__(self, filename, flag='c', protocol=None, writeback=False):
          import dbm
          Shelf.__init__(self, dbm.open(filename, flag), protocol, writeback)

      def clear(self):
          """Remove all items from the shelf."""
          # Call through to the clear method on dbm-backed shelves.
          # see https://github.com/python/cpython/issues/107089
          self.cache.clear()
          self.dict.clear()

```
The method is self-explanatory. Inside `__init__`, we import `dbm` and then instantiate `Shelf` by setting the dict to the instance of `dbm.open`.

```python

  def open(filename, flag='c', protocol=None, writeback=False):
      """Open a persistent dictionary for reading and writing.

      The filename parameter is the base filename for the underlying
      database.  As a side-effect, an extension may be added to the
      filename and more than one file may be created.  The optional flag
      parameter has the same interpretation as the flag parameter of
      dbm.open(). The optional protocol parameter specifies the
      version of the pickle protocol.

      See the module's __doc__ string for an overview of the interface.
      """

      return DbfilenameShelf(filename, flag, protocol, writeback)
```

Again, self-explanatory. When `shelf.open()` is called, it invokes this method. If you pass `filename` as `bio` then `bio.db` will be the name of the database file persisted on disk.

You might be wondering about the default implementation of `dbm` interface. It depends on your system. On my MacOs, it defaults to `dbm.ndbm`.

# Takeaway

Python stdlib is vast and contains supremely readable idiomatic code. If you are looking for a way to develop code reading skill to become a better engineer then definitely checkout the source code of python stdlib.

# Reference
* [shelve documentation](https://docs.python.org/3/library/shelve.html)
* [shelve source code](https://github.com/python/cpython/blob/3.13/Lib/shelve.py)
* [dbm documentation](https://docs.python.org/3/library/dbm.html#module-dbm)
