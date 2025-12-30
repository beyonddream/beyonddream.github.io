---
title: "What is Debounce ?"
date: 2025-12-23
---

[[toc]]

## Introduction

In an online tech news feed, someone posted a simplified note-taking web app implemented fully on the client side using html and javascript. The javascript included a function for performaing debounce. In the comments, many folks were ignorant of what a debounce is meant to achive and were surprised discovering the technique for the first time (Check Google Trends on how far back they go!) . Even the original poster seem to be surprised by it.

![Image 1](/images/post10/image1.png)
![Image 2](/images/post10/image2.png)

I will give a code walkthrough of debounce and explain its use-case.

## Code

I have copied only the relevant bit here and numbered explanation follow down below:

```js
//... more code
<article contenteditable="plaintext-only" spellcheck></article> // 1
<script>
const article = document.querySelector('article') // 2
article.addEventListener('input', debounce(500, save)) // 3

//... more code

function debounce(ms, fn) {
    let timer // 4
    return (...args) => { // 5
      clearTimeout(timer) // 6
      timer = setTimeout(() => fn(...args), ms) // 7
    }
}
</script>
```

1. The html tag (`article`) for a text area to enter text content. This will be the place to enter the note as input.

2. The html tag (`article`) is programmatically referenced via javascript.

3. A function (`debounce`) is executed immediately and the return value (another anonymous function that satisfies event listener type) is set as the event listener and attached to the article tag which will be invoked whenever an `input` event is triggered on the tag. `debounce` takes 2 parameters - timeout in milliseconds and another function (`save`) to invoke *after* the timeout expires.

4. `debounce` declare a `timer` variable which is referred inside the anonymous function and persist as part of the environment of anonymous function long after `debounce` has finished executing. This concept is called `closure` in programming language parlance.

5. `debounce` return an anonymous function (actual event listener) that takes in all the args passed to it by javascript environment (browser in this case) when an event is triggered.

6. The `timer` variable is cleared - This effectively cancel any future invocation of `setTimeout` callback function.

7. The `timer` variable holds the return reference to the `setTimeout` callback registration. The callback is invoked after `ms` time has passed and it invokes the original `fn` passed to `debounce` which in this case is `save` function - passing all the parameters passed to a event listener when `input` event is triggered.

## Summary of the code

`Debounce` make sure, an event listener is only invoked when:

1. `ms` time has passed *after* the event, and

2. There are no new event during `ms` wait time.

3. If there is a new event within `ms` wait time, the wait time is reset again, and we go to step 1.


## Debounce vs Throttle

While `debounce` make sure specific amount of time is elapsed since the *last* time the event is invoked, `throttle` guarantee that an event is invoked *atmost* only once within a specific amount of time. The implementation of `throttle` is left as an exercise to the reader. 
**Clue:** You can implement throttle using `setTimeout` and a `boolean` flag.

## Reference

[Github repo of note taking app](https://github.com/antonmedv/textarea)
