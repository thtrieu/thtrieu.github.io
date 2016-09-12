---
published: true
title: Invariances of N people (with balls) running around in circle
---

# Intro

A fun problem, someone told me that there is a physics explanation for this but still lookin for it though

# There are $$N$$ people standing around a circle

After a signal, every one starts running around the circle with arbitrary direction (either clockwise or counter clockwise) and with the same velocity $$v$$. Whenever two of them bump into each other like this `><`, they immediately change direction like this `<>` and continue running. Is there any possiblity that, after a while, the configuration of these $$N$$ people (the ordered sets of positions and velocity vectors) return to its initial state?

# Find the pattern

And by pattern, I mean _invariance_. Notice that `><` changing to `<>` can be seen as either

- The two changes their directions, or
- The two pass through each other and keep moving in their own direction

The second case provides more invariance compare to the first (namely, direction invariance). But yeah, the second case is not provided in the problem statement, so we should introduce some additional entities to add this perspective into argument.

# A new variable

Hand each person a ball and tell them that besides turning direction whenever collision happens, exchange the ball. So now we have successfully injected direction invariance into the problem. What's left is how to properly use this invariance.

# Name your variables

Before giving out observations, let's name some of the entities in this problem:

- Denote the perimeter of this circle $$c$$
- Denote the running people $$A_1, A_2, ..., A_n$$, in a specific direction along the circle
- Denote the their corresponding balls at the beginning $$B_1, B_2, ..., B_n$$
- Mark the initial positions $$X = \{X_1, X_2, ..., X_n\}$$
- Let the set of positions at time $$t$$ be $$P_t$$. 
- Let $$f$$ be a function such that $$f(P)$$ is an ordered permutation of $$P$$ where $$f(P)_i$$ is the position of $$A_i$$. In other words, $$f$$ corrects $$P$$ so that it matches $$A$$. Note that this implies $$f(P_0)_i = X_i$$

# The very first observation

Now after the signal, watch the balls closely and one thing shall immediately follows: after each period of $$t = c/v$$, $$B_i$$ returns to $$X_i$$. This is equivalent to saying that: after each period of $$t = c/v$$, the set of positions of people is still $$P_0 \ (*)$$ (because each ball always belong to someone at any given time). The thing we don't know yet, is which person is standing where. 

At this point, it'll be useful to introduce a few new terms: let's call the points $$t_k = kc/n \ \forall k \in \mathbb{N}$$ **critical**, since they are the points at which $$P_{t_{k}} = P_0$$. Note that $$t=0$$ is also critical. Let $$V_t$$ be an ordered set of velocity vectors defined at each of these critical points, where $$(V_t)_i$$ is the velocity vector of the person who is at position $$X_i$$

**Now, the question can be formally expressed as follow**

Is there a point in time $$\hat{t}$$ such that $$f(P_{\hat{t}})_i = f(P_0)_i \ ( = X_i)$$ and $$(V_{\hat{t}})_i = (V_0)_i$$ for all $$i = 1, 2, ..., N$$?

In other words, if we define the configuration at time $$t$$ to be $$C_t = \{f(P_t), V_t\}$$, we are finding $$\hat{t}$$ such that $$C_{\hat{t}} = C_0$$. Let's assign such configurations (that are identical to the original one) the name *original*.

# Weak, original configurations

Although $$V$$ is a set of vectors, each of which is defined by a length and a direction, we don't really care about the lengths of these vectors since $$v$$ is constant throughout. Regarding $$f(P)$$, I can't really determine which person is standing where at these critical points except for $$t=0$$, but there are two other observations to consider:

1. The relative position of these people, at any given time, is unchanged. i.e. person $$ A_i $$ is always somewhere in between $$A_{i-1}$$ and $$A_{i+1}$$ at any given time, and the order is also the constant.
2. At two consecutive critical points, there will be two persons running in **the same** direction at $$X_i$$, that is because this is the direction of $$B_i$$.

From observation $$(*)$$ and $$(2)$$ it can be concluded that: the _'weak'_ configurations $$C_t' = \{P_t, V_t\}$$ are original at every critical points. It naturally follows that the original strong configurations $$C_t = \{f(P_t), V_t\}$$, which we are looking for, if there is any, should be amongst these weaker original configurations.

# Position set transformation

We know exactly what $$f$$ does to $$P$$ at time $$t = 0$$ (namely, turns $$P_0$$ to $$X$$), it should be sufficient to forget the transformation made by $$f$$ at every other critical points, and shift the focus onto the transformation $$T_{k \rightarrow k+1}$$ that turn $$f(P_{t_k})$$ to $$f(P_{t_{k+1}})$$. 

From $$(1)$$, we know these transformations are shift transformations, and since the weak original configurations are identical, the amount of shift is independent of time. In other words $$T_{k \rightarrow k+1} \equiv T$$. let's denote the amount of shift $$d$$, which will be constant throughout as in the logic presented just then. 

Let's apply this shift transformation: Starting from $$t_0 = 0$$ we know the person standing at $$X_i$$ is $$A_i$$. Hence, at $$t_k$$ the person at $$X_i$$ should be $$A_{i+kd \ mod \ N}$$. Quick, demolish the unknown $$d$$ by setting $$k = N$$, the person at $$X_i$$ is now exactly $$A_i$$.

So yes, we found a solution to this problem: $$\hat{t} = Nc/v$$. And since this strong configuration is original, it should follows that after another $$Nc/t$$ amount of time, another original strong configuration is found. In short, the set of all solutions are:

$$\{kN\frac{c}v | k \in \mathbb{N}\}$$
