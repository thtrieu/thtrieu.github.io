---
published: true
title: Invariances of N people running around in circle
---

# Intro

A fun problem, someone told me that there is a physics explanation for this but still lookin for it though

# There is \\(N\\) people standing around a circle

After a signal, every one starts running around the circle with arbitrary direction (either clockwise or counter clockwise) and with the same velocity \\(v\\). Whenever two of them bump into each other like this `><`, they immediately change direction like this `<>` and continue running. Is there any possiblity that, after a while, the configuration of these \\(N\\) people (the ordered sets of positions and velocity vectors) return to its initial state?

# The key is to find a pattern inside this mess

Notice that `><` changing to `<>` can be seen as either

- The two changes their directions, or
- The two pass through each other and keep moving in their own direction

The second case provides more invariance compare to the first (namely, direction). But yeah, the second case is not provided in the problem statement, so we should introduce some additional entities to add this perspective into argument.

# A new variable

Hand each person a ball and tell them that besides turning direction whenever collision happens, exchange the ball. So now we have successfully injected direction invariance into the problem. What's left is how to properly use this invariance.

# Name your variables

Before giving out observations, let's name some of the entities in this problem:

- Call the running people \\(A_1, A_2, ..., A_n\\), in a specific direction along the circle
- Call the initial set of positions \\(P = \\{X_1, X_2, ..., X_n\\}\\).
- Call the corresponding ball \\(B_1, B_2, ..., B_n\\)
- Denote the perimeter of this circle \\(c\\)

# Some first observations

Now after the signal, watch the balls closely and one things shall immediately follows: after each period of \\(t = c/v\\), \\(B_i\\) returns to \\(X_i\\). This is equivalent to saying that: after each period of \\(t = c/v\\), the set of positions of people is still \\( \\{ X_1, X_2, ..., X_n \\} \ \(*\)\\) because each ball always belong to someone at any given time. The thing we don't know yet, is which person is standing where. In fact, I can't really decide which is standing where, but there are two others observations to consider:

1. The relative position of these people, at any given time, is unchanged. i.e. person \\( A_i \\) is always somewhere in between \\(A_{i-1}\\) and \\(A_{i+1}\\) at any given time, and the order of these three is also the same.
2. At two points in time \\(t_k = kc/v\\) and \\(t_{k+1} = (k+1)c/v\\) where \\(k\\) is an integer, there will be two persons running in the same direction at position \\(X_i\\), that is because this is the direction of \\(B_i\\).

From observation \\(\(*\)\\) and \\(\(2\)\\) we conclude that: if the order of position set is ignored, then the configurations of \\(N\\) people are identical at any time \\(t_k = kc/v, \ \  k \in \mathbb{N} \\). Of course, they are also indentical to the initial configuration.

# Position set transformation

Since these configurations are identical (unordered positions set and ordered velocity vectors set), whatever transformation that turns the position set \\(P_{t_k}\\) into \\(P_{t_{k+1}}\\), will also transforms \\(P_{t_{k+1}}\\) into \\(P_{t_{k+2}}\\). From \\(\(1\)\\), we know this transformation \\(T\\) is a shift transformation, let's denote the amount of shift \\(d\\), which is constant throughout all transformations as in the logic presented just then. 

Let's apply this shift transformation: Starting from \\(t_0 = 0\\) we know the person standing at \\(X_i\\) is \\(A_i\\). Hence, at \\(t_k\\) the person at \\(X_i\\) should be \\(A_{i+kd \ mod \ N}\\). Quick, demolish the unknown \\(d\\) by setting \\(k = N\\), the person at \\(X_i\\) is now exactly \\(A_i\\).

This confirms the ordered positions set is also unchanged at \\(t_N\\) and as presented above, so are the velocity vectors set. The problem is solved.
