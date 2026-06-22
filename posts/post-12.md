---
title: "Basic Proof Techniques for Software Engineers"
tags:
  - mathematics
  - algorithms
  - proofs
  - computer-science
---

> For those who want to get started with algorithm analysis, data structures, and mathematical reasoning.

Many software engineers encounter proofs when studying algorithms, complexity theory, discrete mathematics, machine learning, or theoretical computer science. Fortunately, a handful of proof techniques appear again and again.

In this post, we'll look at three fundamental methods:

1. Proof by Induction
2. Proof by Contradiction
3. Proof by Counterexample

---

## 1. Proof by Induction

Mathematical induction is commonly used to prove statements that depend on a positive integer $n$.

The method has two steps:

### Step 1: Prove the Base Case

Show that the statement is true for the smallest value (usually $n=1$).

### Step 2: Prove the Inductive Step

Assume the statement is true for some integer $n$. This assumption is called the **inductive hypothesis**.

Then prove that the statement must also be true for $n+1$.

If both steps succeed, the statement is true for all positive integers.

Think of a row of dominoes:

- The base case knocks over the first domino.
- The inductive step shows that whenever one domino falls, the next one falls too.
- Therefore all dominoes eventually fall.

## Example: Sum of Squares

Prove that for all integers $N \ge 1$,

$$
\sum_{i=1}^{N} i^2
=
\frac{N(N+1)(2N+1)}{6}.
$$

### Base Case: $N = 1$

$$
\sum_{i=1}^{1} i^2 = 1.
$$

$$
\frac{1(1+1)(2\cdot1+1)}{6}
=
\frac{1\cdot2\cdot3}{6}
=
1.
$$

Therefore, the formula holds for $N=1$.

### Inductive Hypothesis

Assume

$$
\sum_{i=1}^{N} i^2
=
\frac{N(N+1)(2N+1)}{6}.
$$

### Inductive Step

$$
\begin{aligned}
\sum_{i=1}^{N+1} i^2
&=
\sum_{i=1}^{N} i^2 + (N+1)^2 \\
&=
\frac{N(N+1)(2N+1)}{6} + (N+1)^2 \\
&=
(N+1)\left[\frac{N(2N+1)}{6} + (N+1)\right] \\
&=
(N+1)\left[\frac{2N^2+7N+6}{6}\right] \\
&=
\frac{(N+1)(N+2)(2N+3)}{6}.
\end{aligned}
$$

Since

$$
N+2=(N+1)+1
$$

and

$$
2N+3=2(N+1)+1,
$$

the formula holds for $N+1$. Therefore it is true for all $N \ge 1$.

---

## 2. Proof by Contradiction

In a proof by contradiction, we assume that the statement we want to prove is false.

We then follow a sequence of logically valid steps until we reach a contradiction. Since the contradiction cannot be true, the original assumption must be false.

## Example: There Are Infinitely Many Prime Numbers

Assume the statement is false.

Then there exists a largest prime number $p_k$, and the complete list of primes in the order of occurance is

$$
p_1, p_2, \ldots, p_k.
$$

Consider

$$
N = p_1p_2\cdots p_k + 1.
$$

Since $N > p_k$, our assumption implies that $N$ is not prime.

However, dividing $N$ by any prime $p_i$ leaves a remainder of $1$ because

$$
N = (p_1p_2\cdots p_k)+1.
$$

Therefore none of $p_1,p_2,\ldots,p_k$ divides $N$.

But every integer greater than $1$ is either prime or has a prime factor.

This contradiction shows that our assumption was false.

Hence there are infinitely many prime numbers.

---

## 3. Proof by Counterexample

A universal statement claims that something is true for every element in a set.

To disprove such a statement, it is sufficient to find a single example for which the statement fails. Such an example is called a **counterexample**.

## Example

Consider the claim:

> $F_k \le k^2$ for all $k$,

where $F_k$ denotes the $k$-th Fibonacci number.

For $k=11$,

$$
F_{11}=144
$$

and

$$
11^2=121.
$$

Therefore

$$
F_{11}>11^2.
$$

This single counterexample proves that the statement

$$
F_k \le k^2 \quad \text{for all } k
$$

is false.

---

## Final Thoughts

These three proof techniques appear throughout mathematics and computer science.

| Technique | Typical Use |
|------------|------------|
| Proof by Induction | Recursive structures, loops, recurrence relations |
| Proof by Contradiction | Existence proofs and impossibility results |
| Proof by Counterexample | Disproving universal statements |

Mastering these techniques provides a strong foundation for studying algorithms, data structures, discrete mathematics, machine learning, and theoretical computer science.
