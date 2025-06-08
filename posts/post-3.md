---
title: Circuit Breaker and Exponential Backoff for a frontend application
date: 2025-06-08
---

[[toc]]

## Introduction

I am going to introduce a well-known technique to combine circuit-breaker and exponential backoff algorithm to implement a scalable client-side solution when connecting to non-scalable legacy backend service.

## Motivation

Many moons ago in my previous team at work, we had few legacy services implemented using single threaded python scripts that talk to other scalable services further downstream. These scripts were behind firewall and security boundaries but exposed to a frontend application that were heavily used by internal users. They became a single point of failure and go down often unable to handle the peak volume of requests.

The two main problem statements I was faced with are:

1) How to avoid overloading a script that is struggling to handle high contention ?
2) How to decide when it is safe to retry ?

The answers to them are Circuit Breaker and Exponential Backoff respectively.

## Design

Circuit Breaker is a pattern to detect and prevent further calls to backend service when the backend service is down or degraded. Exponential Backoff (with jitter) is a pattern to avoid overloading a backend service when every client decide to retry.

Even though they are typically middleware patterns, I decided to use them on the frontend side since the application was used by internal users only. But be aware that frontend side implementation alone is not tamper resistant.

## Implementation

Below is a general solution that is similar to what I had implemented at work. This module can be imported into your existing frontend application and benefit from the DDOS prevention it provides to your legacy backend services.

```js
import _ from 'lodash';
import { heap } from 'heap'; // for analytics but it can be substituted for any other service.

/**
 * The entire concept implemented in js as a module that can be used in your own project.
 *
 * Based on:
 *
 * https://martinfowler.com/bliki/CircuitBreaker.html
 * https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/
 *
 */
const CircuitBreakerState = Object.freeze({
  CLOSED: Symbol('closed'),
  OPEN: Symbol('open'),
});

const getNextWaitDuration = (failureCount, maxWaitDuration, jitter = 10) => {
  const waitDuration = 2 ** failureCount * 1000 * jitter; /* default: 80 seconds */
  return _.random(waitDuration, _.min([waitDuration, maxWaitDuration]));
};

const getDurationAsMinutes = (duration) => {
  return duration / (1000 * 60.0);
};

export const wrapWithCircuitBreaker = (fn, failureThreshold = 3,
  maxWaitDuration = 25 * 60 * 10 ** 3 /* default: 25 minutes */, errorCallback = _.noop) => {
  
  let failureCount = 0;
  let lastFailedTimestamp = 0;
  let waitDuration = 0;
  let errorMsg;
  let circuitState = CircuitBreakerState.CLOSED;
  let heapCalledOnceOnCircuitOpen = false;

  return (args) => {
    if (lastFailedTimestamp && Date.now() - lastFailedTimestamp >= waitDuration) {
      circuitState = CircuitBreakerState.CLOSED;
    }

    if (circuitState === CircuitBreakerState.OPEN) {
      if (!heapCalledOnceOnCircuitOpen) {
        heap.track('Circuit Breaker State', {
          type: 'UNIQUE_TASK_NAME',
          failureThreshold,
          failureCount,
          'wait (m)': getDurationAsMinutes(waitDuration),
          'waited (m)': getDurationAsMinutes(Date.now() - lastFailedTimestamp),
          'maximum wait (m)': getDurationAsMinutes(maxWaitDuration),
          errorMsg,
          circuitState: String(circuitState),
          result: 'Service call is disallowed.',
        });
        heapCalledOnceOnCircuitOpen = true;
      }
      return errorCallback(errorMsg);
    }

    fn(args)
      .then((res) => {
        failureCount = 0;
        lastFailedTimestamp = 0;
        waitDuration = 0;
        errorMsg = null;
        circuitState = CircuitBreakerState.CLOSED;
        heapCalledOnceOnCircuitOpen = false;

        return res;
      })
      .catch((err) => {
        ++failureCount;

        if (failureCount >= failureThreshold) {
          lastFailedTimestamp = Date.now();
          waitDuration = getNextWaitDuration(failureCount, maxWaitDuration);
          circuitState = CircuitBreakerState.OPEN;
        }

        errorMsg = err;

        return errorCallback(errorMsg);
      });
  };
};

// client side code
export const setupPeriodicTask = (task, frequency = 1 * 60 * 10 ** 3) => {
  if (!task) {
    return _.noop;
  }

  const throttledTask = _.throttle(task, frequency);
  const intervalId = setInterval(throttledTask, frequency);

  return () => {
    throttledTask.cancel();
    clearInterval(intervalId);
  };
};

const yourAwesomeFunction = () => {
  // do some awesome thing!
};

const cbYourAwesomeFunction = wrapWithCircuitBreaker(yourAwesomeFunction)

const unsubscribePeriodicTask = setupPeriodicTask(() => {
   cbYourAwesomeFunction();
});

// at some point - maybe during page unload
unsubscribePeriodicTask();

```

## Reference

* [Circuit Breaker](https://martinfowler.com/bliki/CircuitBreaker.html)
* [Exponential-backoff](https://aws.amazon.com/blogs/architecture/exponential-backoff-and-jitter/)