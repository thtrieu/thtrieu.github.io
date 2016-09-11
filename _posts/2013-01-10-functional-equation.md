---
title: Functional equation solved by introducing local minima
---

# Intro

This is from IMO **1977**, the only reason why I can solve it.

# Find

\\(f: \mathbb{Z^+} \rightarrow \mathbb{Z^+}\\) such that \\(f(f(n)) < f(n+1) \forall n \in \mathbb{Z^+}\\).

# Solution

Let \\(n_i \ \  \(i \in \mathbb{Z^+}\) \\) be a positive integer such that

$$f(n_i)=min\{f(k)|k\in\mathbb{Z^+};k\geq i\}=min \  D_i$$

Notice that \\(n_i\\) can have multiple values since \\(D_i\\) does not necessarily have a single mimimum (which we are going to prove against, but hold on).

Since \\(f(n_1) > f(f(n_1-1))\\), either \\(n_1 - 1 \notin \mathbb{Z^+} \\) or \\(f(n_1-1) \notin D_1 \\). The second one cannot hold by definition of \\(f\\), so \\( n_1 - 1 \notin \mathbb{Z^+}\\). Since \\(n_1 \in \mathbb{Z^+}\\), \\(n_1 = 1\\).

This means function \\(f\\) achieves its minimum on \\(D_1\\) at a single point \\(n_1=1\\).

Move on to \\(n_2\\). Similarly the case is either \\(n_2-1\notin\mathbb{Z^+}\\) or \\(f(n_2-1)\notin D_2\\). This time the first case cannot be satisfied, so \\(f(n_2-1)\notin D_2\\) \\(\(*\)\\).

If \\(n_2 > 2\\), it follows that \\(n_2-1>n_1\\). From the fact that \\(f\\) has a single minimum at \\(n_1\\), we conclude \\(f(n_2-1) > f(n_1)\geq 1\\). This implies \\(f(n_2-1)\in D_2\\), directly contradict with \\(\(*\)\\). So \\(n_2 = 2\\).

From this point, induction in a similar fashion gives \\(n_i=i\\). From \\(D_1 \subseteq D_2 \subseteq D_3 \subseteq ... \\), we know \\(f(1)<f(2)<f(3)<...\\). 

Two things follow:

1. \\(f(n)\geq n \ \forall n\\)
2. \\(f\\) strictly increases

From **2.** and the what gives in the problem statement we have \\(f(n)< n+1 \ \forall n\in\mathbb{Z^+}\\). 

This and **1.** give 

$$f(n)=n \ \forall n\in\mathbb{Z^+}$$