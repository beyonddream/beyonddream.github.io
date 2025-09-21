---
title: "Logical fallacies and cognitive biases"
date: 2025-09-20
---

[[toc]]

## Introduction

It is a well known fact that most software engineers are opiniated bunch and like to argue. But often their arguments exhibit certain biases and logical fallacies. They are also prone to errors in thinking due to some bias inherent in their recollection of the past. I was recently reading a book about this topic and was motivated to document some of them here for my own future self. They are by no means exhaustive but very much indicative of those I am aware of as a practicing software engineer.

## Appeal to authority

You are arguing for a design not because you have evaluated all the pros/cons using some prototype implementation with relevant metrics to prove your point but rather depend on another authority figure either in your company or in your field, as a justification in and of itself (unrelated to the matter at hand) to find acceptance for your proposal.

```text
I want to use PHP in my new project. If it is good enough for facebook then it will be good enough for us.
```

## Straw man

Mis-representing your opponent’s argument so that it can be easily knocked down. Usually, the argument presented was made more generalized that what was intended.

```text
Team member 1: We have an external library that we can use for this project.
Team member 2: Bringing in lot of external libraries will cause unaudited code in our code base and might cause a security risk to our application. It looks like you are trying to bring down security quality of our application.
```

The above argument misrepresent the Team member 1’s intention and even though the external library may have security risk, in-house solution might also have the same risk. Also there are ways to mitigate the security risks using automated code quality scanners, code auditing, PR reviews etc.

## Ad Hominem

Attacking the arguer rather than the argument.

```text
I would accept to discuss the proposal mentioned by George but given his track record of heading failed projects, I wouldn’t give too much weight on it.
```

Instead of discussing the proposal on its own merit, the person is attacked directly. The person’s past failure is used as an excuse to reject his current proposal idea.

## Slippery slope

Type of argument that supposes that a first step will eventually lead to a series of events ending up in a significant negative result. It is also a type of fear mongering.

```text
If we start using JavaScript in our project, it might be fine initially but when the project grows, no strong typing implies that eventually our project will end up in a big jumble of spaghetti code.
```

Here it is assumed that there is no intermediate mitigating factor in preventing JavaScript projects from becoming a “ball of mud” - by introducing type definitions using Typescript. Or that there could be ways to structure the app so that it is easy to maintain regardless of which language is used. Typically, this argument is used to prevent change or progress by suggesting only extreme consequences will result from initial starting condition.

## Hindsight bias

Tendency for a person to perceive an event that has already occurred as more predictable than they were before the event.

```text
I had bet on C++ when I began the project in my garage. My startup company is very successful now and I attribute its success mainly on deciding to use that language. I know it will be a good fit when I decided to use it.
```

## Halo effect

How our impression of a person affects our perception of the character of that same person or information about them.

```text
My friend is from MIT and given that he is very smart, if he couldn’t solve that engineering problem then I am sure it is tough and nobody could.
```

Here the concrete evidence is ignored and instead of really investigating the engineering problem, one judge the person favourably because he has a positive influence on you therefore assuming ambiguity about the information.

## Confirmation bias

Tendency for a person to recall/gather information selectively that favors one’s beliefs.

```text
Static typing is better than dynamic typing. There are many scientific studies that prove this fact.
```

Here the argument is made in favor of static typing even though there could be other scientific studies that might equally prove that dynamic typing is better too. Or there could be studies that couldn’t find any statistically significant difference between using either of them. The person only looked at research that proves his inherent bias for using static typing.





