---
title: Support Vector Machine - a conversational writeup
---

This is a summary of Support Vector Machine, as for preparation of another post [Linear SVM on top of a deep net](https://thtrieu.github.io/notes/engineering-the-last-layer)

### Hard-margined reasoning

Suppose we want to classify over data $$(s_n, t_n)^N$$, with $$t_n \in \{-1, 1\}$$. Define the kernel $$\kappa(s_i, s_j) = \phi(s_i)^T\phi(s_j)$$ and the implicit decision boundary $$y(s;\theta, b) = \theta^T\phi (s) + b$$ (implicit, since $$\phi$$ is not explicitly defined). The euclidean distance from point $$s_n$$ to the decision boundary is then:

$$ d_n = t_n \frac{y(s_n; \theta, b)}{\left \| \theta \right \|} $$

Suppose data is linearly separable, i.e. there is at least one solution surface, SVM tries to find the best one. Amongst all data points there is always one that minimises $$d_n$$. Say this happens at $$s_{n'}$$, SVM formulation says that we want to maximize $$d_{n'}$$ to obtain the best surface. Let's say we did successfully maximize the thing by $$\theta^*$$. 

Since $$\theta^*$$ is the normal vector of our solution surface, we can scale it without affecting the surface's orientation (the solution). That means, if $$\theta^*$$ is a solution, $$c\theta^*$$ with $$c$$ being a non-zero constant, is also one. Assume $$t_ny(s_{n'}, \theta^*, b^*) = v$$, we know there is some $$c$$ that can be derived from $$v$$ such that:

$$t_n y(s_{n'}; c\theta^*, b^*) = 1$$

Now investigate $$c\theta^*$$. By definition of $$n'$$, this means $$t_ny(s_n, c\theta^*, b^*) \geq 1 \ \ \forall n \ (*)$$. Talking about the point $$s_{n'}$$, this means $$c\theta^*$$ maximises 

$$d_{n'} = \frac{ 1 }{\left \| c\theta^* \right \| }$$

Equivalently, $$c\theta^*$$ is also a maximizer of $${\left \| c\theta \right \|}^2 \ \ (**) $$

In both $$(*)$$ and $$(**)$$, we realise that $$c$$ and $$\theta$$ is coupled and thus $$c\theta$$ can be regarded as a single variable $$w$$. This allow a reformulation of the original optimization problem:

$$ \min_w \ \frac{1}{2} {\left \| w \right \|}^2$$

<center> subject to $$t_n y(s_n; w, b) \geq 1 \ \ \forall n$$ </center>

### Soft-margined reasoning

The above reasoning assumes separable data, due to this ideal situation we are able to establish a strict standard on all data points base on $$s_{n'}$$. Things need to relax when it comes to the linearly inseparable case. Namely we have to introduce a slack variable $$\xi_n$$ for each of the data points, so that some of them can violate the standard: $$t_n y(s_n; w, b) \geq 1$$. The soft-margined SVM objective is:

$$ \min_{\xi, w} \ C \sum_{n=1}^{N}\xi_n + \frac{1}{2} {\left \| w \right \|}^2$$

<center> subject to $$\xi_n \geq 0 \ \forall n$$ $$t_n y(s_n; w, b) \geq 1 - \xi_n$$</center>

Collectively denote the variables of interest $$\{\xi, w, b\}$$ as $$x$$, we rewrite the problem declaration:

$$\min_x \ f(x) \ \ s.t. \ \ g_{1n}(x) \leq 0 \ \ and \ \ g_{2n}(x) \leq 0 \ \forall n$$

<center> where $$ f(x) = C \sum_{n=1}^{N}\xi_n + \frac{1}{2} {\left \| w \right \|}^2$$ $$g_{1n}(x) = -\xi_n$$ $$g_{2n}(x) = 1 - \xi_n - t_ny(s_n; w, b)$$ </center>

Notice $$x$$ is a collection of parameters with component $$\xi$$, whose number of parameters equals to the number of data training points.

### Primal and Dual problems

Is there an unconstrained version of the above problem, cuz constraints are kinda ugly isn't it? In other words, is there a function $$P(x)$$ such that minimizing $$P(x)$$ yields the solution to our problem? In fact, there is one:

$$P(x) =  f(x) + \max_{\mu \geq 0, a \geq 0} \sum_n^N\mu_ng_{1n}(x) + a_ng_{2n}(x)$$

Equivalence can be mentally checked easily by investigating two cases. First, for each $$x$$ that violates **at least one** constraint, check that $$P(x)$$ reaches $$+\infty$$ and thus cannot be a minimum. Second, for each $$x$$ that satisfies **all** constraints, check that $$P(x) \equiv f(x)$$. Minimizing $$P(x)$$ is called the **Primal** problem (which is essentially a **minimax** problem), and turns out this one is no less nasty than the original one since minimax problems are definitely not easy to handle. 

Fortunately the whole Primal idea is not just about throwing away constraints, a guy named [Slater](https://en.wikipedia.org/wiki/Slater%27s_condition) and his friend told us that, for the specific problem we are solving, the equivalence extends a bit further: the corresponding **maximin** problem yields the same solution to our minimax problem (Primal problem) and thus the same solution to our original problem. This maximin problem is called the **Dual** problem, and turns out to be quite nice to its pet human whenever they do some trick to its amuse. Next part will introduce that trick called KKT necessary conditions.

To have a clearer notation that faithfully serves the names "minimax" and "maximin", let's introduce $$L(x, \mu, a) = f(x) + \sum_n^N\mu_ng_{1n}(x) + a_ng_{2n}(x)$$. Then the Primal and Dual problems respectively become

$$\min_x \max_{\mu \geq 0, a \geq 0} L(x, \mu, a)$$

$$\max_{\mu \geq 0, a \geq 0} \min_x L(x, \mu, a)$$

Absolutely on-point, isn't it?

### Solving the dual problem by the help of KKT conditions

There is another giant's shoulder to step on besides Slater's in the quest for $$x^*$$. It concerns something called **Karush-Kuhn-Tucker (KKT) conditions**: conditions that are *necessary* for any solution $$x^*$$ of our optimization problem. In other words, from the fact that $$x^*$$ is a solution to our problem, what can we infer? Just for the record, these conditions later greatly simplify the Dual problem.

We can actually derive such conditions intuitively. Check [here](http://www.onmyphd.com/?p=kkt.karush.kuhn.tucker) for a longer talk, I'll just cherry pick here the sweetest parts for the sake of our SVM. First, look at an illustrative plot of $$f(x)$$ and $$g(x)$$. There are only two possible scenarios:

<center>
<img src = "http://www.onmyphd.com/pages/kkt/graphical.explanation.svg" alt="img1" style ="width: 400px;"/> </center>

On the left: the solution $$\hat{x}$$ of the unconstrained problem satifies $$g$$, thus it is also solution $$x^*$$ to the whole problem. To obtain $$x^*$$, we can optimize $$f$$ regardless of $$g$$, i.e. minimizing $$L(x)$$ with $$\mu_n = a_n = 0 \ \forall n$$ solves an equivalent problem. On the right: solution to the unconstrained problem does not satify $$g$$, thus $$x^*$$ lies on the boundary of $$g$$-satified region, where $$g(x^*) = 0$$. Again, minimizing $$L(x)$$ along $$g(x) = 0$$ solves an equivalent problem.

In fact, these two cases are analogous to the two checks we did with the Primal problem. They will be visited again in later parts. Either case, $$\mu_ng_{1n}(x^*) = a_ng_{2n}(x^*) = 0$$. I.e. our first two KKT conditions are:

$$ \mu_n \xi_n^* = 0 \ \forall n \ \ (1)$$

$$ a_n(t_ny(s_n; w^*, b^*)-1+\xi_n^*) = 0 \ \forall n \ \ (2)$$

Remember that $$x^*$$ solves the Dual problem $$\{ \max_{\mu \geq 0, a \geq 0} \min_x L(x, \mu, a) \}$$, which means  $$x^*$$ minimizes $$L(x, \mu, a)$$. This gives the next conditions: $$ \bigtriangledown_xL(x^*, \mu, a) = 0 $$. Taking the partial derivative with respect to $$w$$, $$b$$, and $$\xi$$ separately yields:

$$ w^* = \sum_n^N a_nt_n\phi(s_n) \ \ (3)$$

$$ \sum_n^N a_nt_n = 0 \ \ (4)$$

$$ a_n = C - \mu_n \ \ (5)$$

The remaining conditions are obvious: $$ a_n \geq 0, \ $$
$$ \mu_n \geq 0 \ \ (6) $$

### Final form of the Dual problem

Now that's everything is settled, we are ready to simplify the Dual problem as promised. In fact, we will use all KKT conditions that involves $$x^*$$ as substitutions into the Dual objective. The obvious effect is that we completely eliminate $$\{w, b, \xi \}$$ variables out of the Dual objective. Also use $$(5)$$ to throw away $$\mu$$. Finally we obtain the simplified objective of maximization: $$\tilde{L}(a) = \sum_n^N a_n - \frac{1}{2}\sum_i^N\sum_j^N a_ia_j\kappa(s_i, s_j)$$. This optimization is subjected to $$(4)$$, $$(5)$$ and $$(6)$$ - conditions that involves $$a$$ - which, can be rewritten as 

$$a_i \in [ 0, C ]$$

$$\sum_n^N a_nt_n = 0$$

But there is something else happening, a side effect that reveals itself after the derivation of $$\tilde{L}$$: $$\kappa$$, who emerges from the disappearance of $$\phi$$. They say the thing did its **kernel trick**. But what's good about $$\kappa$$ anyway? To shortly explain the hype around $$\kappa$$, consider solving the Dual problem in this final form. Clearly we only have to deal with $$\kappa$$, not $$\phi$$ explicitly. There's a body of theories around this situation that states that there are certain $$\kappa$$ which are extremely convenient to deal with mathematically, who turn out to have their $$\phi$$ ultra-high-dimensional, sometimes even infinite. 

In other words, we are able to learn non-parameterized high-quality features without the need to deal with the curse of dimensionality. In the context of **Deep Learning**, $$\phi$$ is **explicitly defined** as the feature extractor of the network and its parameters are trained jointly with $$x^*$$. We'll come back to this point in Part 2.

### Sequential minimal optimization: the Dual solver

How come this final form of Dual objective nicer to solve than, say, the Original and the Primal?

Realise that the Dual objective is a polynomial of degree 2 for each of the $$a_n$$, the problem is thus convex and if we are able to progressively better the objective until convergence, the solution is found. So, we are talking about an interative algorithm and wish to define a convergence criteria for it. In fact, the KKT conditions $$(1)$$ and $$(2)$$ implies three things that can be used to check convergence around the optimal point:

$$1. \ \ a_n = 0 \Rightarrow t_ny(s_n; w^*, b^*) \geq 1 $$

$$2. \ \ a_n \in (0, C) \Rightarrow t_ny(s_n; w^*, b^*) = 1 $$

$$3. \ \ a_n = C \Rightarrow t_ny(s_n; w^*, b^*) \leq 1 $$

There is this guy [John Platt](https://en.wikipedia.org/wiki/Sequential_minimal_optimization) who proposed the algorithm we are looking for. His reasoning goes roughly like this: pick a subset from $$\{a_1, a_2, ..., a_N \}$$ and optimize the objective with respect to this subset, because that's easier than dealing with the whole bunch. Pick another one and another one and repeat until convergence. Basically each time we optimize a sub-problem, and this problem has to have at least two variables because otherwise, the equality constraint $$(4)$$ gives no room for (single-variable) optimization. And in fact he did choose $$2$$ to be the size of all sub-problems.

The sub-problem goes as follows: Maximize $$\tilde{L}$$ with respect to a pair of variable $$\{a_n, a_m\}$$ such that $$0 \leq a_n, a_m \leq C$$. From $$(4)$$ we get $$t_na_n + t_ma_m = k$$ where $$k$$ is the current value of $$ - \sum_{i \not = n, m} t_ia_i $$. This gives a one to one correspondence between $$a_n$$ and $$a_m$$, hence the sub-problem reduce to a single-variable optimization problem. Say we choose to express $$a_n$$ in terms of $$a_m$$ and solve the single-variable problem in $$a_m$$, there is another thing to care about: the bound $$[0, C]$$ of $$a_m$$ must be adjusted so that $$a_n$$ also lies in $$[0, C]$$.

Optimizing such single-variable quadratic function is something quite trivial: maximizer of $$q(x) = -x + c_1x + c2$$ is $$c_1/2$$. And since the problem is convex, the constraints can be handled easily by clipping the solution of the non-constrained problem back the the boundary of the feasible region. All the nitty-gritties that ensure convergence and heuristics to maximise algorithm's speed is discussed in the [original paper](https://www.microsoft.com/en-us/research/publication/sequential-minimal-optimization-a-fast-algorithm-for-training-support-vector-machines/). And there's that for SVM optimization!
