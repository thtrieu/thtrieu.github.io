---
title: Linear Support Vector Machine on top of a deep net
---

* #table of content
{:toc}

### Intro

For classification tasks, our deep net can be seen as having two parts: a feature extractor and linear classifier. Innovations usually comes from engineering the former - there is much more room to do so. It is therefore natural to wonder what if we rewire the later instead? A first experiment to do is replacing the usual softmax with some other well-known linear classifiers. Namely in this post I explore the soft-margined Support Vector Machine option, trained in One-Vs-Rest fashion. 

Notice that since the classifier and feature extractor is co-trained, replacing the classifer will change the kind of features learnt by the feature extractor. So the impact is network-wide and thus, do worth some time to consider.

The rest of this post refreshes the mathematical foundation of SVM. I then proceed to investigate if this formulation is compatible with deep feature extractor.

### Problem formulation

Say you had this deep feature extractor $$\phi(s_n; \alpha)$$ and would like to plug onto it the final layer being an SVM. $$\phi$$ in this case is explicit and there is no way of computing $$\kappa_{mn}$$ without computing $$\phi_n$$ and $$\phi_m$$ first. There is no kernel trick this time and the only thing we want to do here is defining a loss that **1)** allow gradients flowing backwards and **2)** faithfully follow the definition of SVM. From the previous part, we know that amounts to the following problem:

$$\min_{x} \ f(x) \ \ s.t. \ \ g_{1n}(x) \leq 0 \ \ and \ \ g_{2n}(x) \leq 0 \ \forall n$$

<center> where $$x = ( w, b, \xi, \alpha )$$ $$ f(x) = C \sum_{n=1}^{N}\xi_n + \frac{1}{2} {\left \| w \right \|}^2$$ $$g_{1n}(x) = -\xi_n$$ $$g_{2n}(x) = 1 - \xi_n - t_ny(s_n; w, \alpha)$$ $$y(s_n; w, b, \alpha) = w^T\phi(s_n; \alpha) + b$$</center>

### A first attempt at constructing deepSVM Loss

We can see that the construction of $$f$$ upon $$\phi$$ involves differentiable steps, thus back-propagation can comfortably flow the gradient all the way back from $$f$$ to $$\phi$$. It is, however, unclear how to incorporate the constraints into this optimization procedure. The general consensus, I found out, is to simply forget about the constraints and add new penalty terms into the objective to discourage violation. That means, for multi-class hard-margin SVM, the objective is as followed:

$$L(w, b) = \sum_k^K \frac{1}{2} \left \| W_k \right \|^2 + C \sum_n^N \varphi(1 - t_{kn}y(s_n; W_k, B_k, \alpha)) $$

Where $$\varphi(x) = max(0,x)$$, $$K$$ is the number of class and $$W_k$$ and $$b_k$$ is the corresponding $$(w, b)$$ of decision surface number $$k$$ - remember we are optimizing a One-vs-All SVM. The loss function for soft-margin is constructed in a similar fashion
 
$$L(x) = \sum_k^K \frac{1}{2} \left \| W_k \right \|^2 + \sum_n^N C \xi_{kn}+ \lambda \varphi(-\xi_{kn}) + \beta \varphi(1 - t_{kn}y(s_n; W_k, B_k, \alpha) - \xi_{kn})$$

### Tackle the first constraint $$g_{1n}$$

Apparently the above objectives are not mathematically equivalent to the original one, so plugging such a thing on top of $$\phi$$ is not exactly doing SVM. Here we try to refine the soft-margin objective presented above to get it as close to the original as possible. Observe that the first constraint simply establish a domain restriction on $$\xi$$, but we know that auto differentiation will produce gradients that push $$\xi$$ below $$0$$ whenever needed. So an obvious thing to do is to clip the gradient whenever it makes $$\xi$$ falls below zero.

But there is a clever mathematical trick to this that accomplishes both: a function that allows optimization over whole-axis domain *and* produce stationary gradient at zero, thus get rid of the need of gradient clipping *as long as* the variable is initialised to be non-negative. This is the function $$x^2$$, whose derivative $$2x$$ becomes zero if and only if $$x^2 = 0$$. By replacing $$\xi = \nu^2$$, we are now able to optimise over $$\nu$$ freely and obtain a better approximation to our original Loss function, i.e. get clear of the $$g_{1n}$$ penalty:

$$L_1(x) = \sum_k^K \frac{1}{2} \left \| W_k \right \|^2 + \sum_n^N C \nu_{kn}^2 + \lambda \varphi(1 - t_{kn}y(s_n; W_k, B_k, \alpha) - \nu_{kn}^2)$$

### Second constraint $$g_{2n}$$:

At this point, it is useful to look at what we are trying to approximate:

$$\min_x f(x) \ s.t. \ \ g_{kn}(x) \leq 0$$

<center> where $$x = (W, B, \nu, \alpha)$$
$$f(x) =\sum_k^K \frac{1}{2} \left \| W_k \right \|^2 + \sum_n^N C \nu_{kn}^2$$
$$g_{kn}(x) = 1 - t_{kn}y(s_n; W_k, B_k, \alpha) - \nu_{kn}^2$$
</center>

Going in the same direction as vanilla SVM to produce the Primal problem, we know that the following Lagrangian is equivalent to the original one:

$$L_2(x) = \sum_k^K \frac{1}{2} \left \| W_k \right \|^2 + \sum_n^N C \nu_{kn}^2 + \max_{\lambda \geq 0} \lambda_{kn} (1 - t_{kn}y(s_n; W_k, B_k, \alpha) - \nu_{kn}^2)$$

Realise that $$L_2$$ is strikingly similar to $$L_1$$. In fact, the similarity is not only syntactic, but also semantic. Suppose $$ 0 > g_{ kn } (x) $$, then $$\lambda_{kn} g_{kn}(x)$$ can not be positive, setting $$\lambda_{kn}$$ to zero is the only way to obtain maximization in $$L_2$$. For $$g_{kn}(x) = 0$$ it is clear that there is no room for optimization over $$\lambda$$ since $$\lambda_{kn}g_{kn}(x)$$ is always $$0$$. So either way, $$\max_{\lambda \geq 0} \lambda_{kn} g_{kn}(x)$$ $$=$$ $$\varphi(g_{kn}(x))$$ $$=$$ $$0$$. 

This gives the incentive to prove that $$L_1$$ is also similar to $$L_2$$ in its behavior: a non-constrained objective that achieve the same result to the original one. In fact, we have already done one of the two checks: Whenever $$x$$ satisfies **all** constraints, minimizing $$L_1$$ is the same as minimizing $$f(x)$$ since $$\varphi(g_{kn}(x)) = 0 \ \forall k, n$$. This left us with the other, more difficult check: $$x$$ that **some** $$g_{kn}(x) > 0$$. We want this to work in a similar fashion, i.e. to prove that $$L_1(x)$$ cannot be a local minimum. As a reminder, the primal objective can be summarised as:

- $$P(x) = f(x)$$ where $$x$$ feasible.

- $$P(x) = + \infty$$ elsewhere, clearly not a minimum.

While so far,

- $$L_1(x) = f(x)$$ where $$x$$ feasible.

- $$L_1(x)$$ finite elsewhere, but hopefully not a local minimum.

### Deriving sufficient conditions for equivalence: The first case

Again, we look at the simpler case: Suppose $$x$$ violates **all** constraints. Now have a look at $$L_1$$, where $$\varphi$$ becomes identity:

$$L_1(x) = \sum_k^K \frac{1}{2} \left \| W_k \right \|^2 + \sum_n^N C \nu_{kn}^2 + \lambda (1 - t_{kn}y(s_n; W_k, B_k, \alpha) - \nu_{kn}^2)$$

Expand and get rid of the constants, we obtain an equivalent objective:

$$L_3(x) = \sum_k^K \frac{1}{2} \left \| W_k \right \|^2 + \sum_n^N (C - \lambda) \nu_{kn}^2 - \lambda t_{kn}y(s_n; W_k, B_k, \alpha)$$

Taking the derivative with respect to $$(W_k, \nu_{kn}, B_k)$$ and set them to zero to see the necessary conditions of local minima. Assuming $$\lambda$$ is a non zero constant, we obtain:

$$W_k = \lambda \sum_n^Nt_{kn}\phi(s_n; \alpha) \ \forall k \ \ (7)$$

$$\sum_n^N t_{kn} = 0 \ \forall k \ \ (8)$$

$$(C - \lambda)\nu_{kn} = 0 \ \forall k, n \ \ (9)$$

From this point, you will quickly see that arguments supporting $$L_3$$ overpower its opponents. 

Let's consider cases where at least one of the above conditions is immediately wrong. $$(8)$$ is clearly not true if $$K > 2$$ since by definition, the construction of $$t_{kn}$$ requires $$\sum_k^K\sum_n^Nt_{kn} = N(2 - K)$$, which cannot be zero as $$(8)$$ suggests if $$K > 2$$. To prove this, consider the aggregated matrix $$T$$ with $$t_{kn}$$ entries: it has a single $$1$$ entry for each column and $$-1$$ for all the remainings, and the summation is taking over all of its entries, thus the equality.

Some will close the case at this point and conclude victory for $$L_1$$, but let's just assume $$K = 2$$ to see how far we can go. Note that $$K = 2$$ does not means $$(8)$$ automatically becomes true, this would require another assumption: an equal number of positive and negative training data points. Assume this assumption is satisfied, it can easily be broken by augmenting data points to produce unbalanced size of training examples, or simply make sure that **N is odd**. 


### The second case:

This is where things get messy. For some of the K classifiers in our One-vs-All scheme, there exists some data points that violates the second constraint, i.e. $$\exists k^{'}, n^{'}$$ such that 

$$ 1 - \nu_{k^{'}n^{'}}^2 > t_{k^{'}n^{'}} ( W_{k^{'}}^T \phi (s_{n^{'}}; \alpha ) + B_{k^{'}} ) $$

Since the K classifiers are independent and the loss is simply a sum of their losses, we can consider separately one of them and get rid of the subscript $$k^{'}$$ for simplicity of notation. Let $$V$$ be the set of data points that violate the above constraint with respect to this specific classifier, then our objective becomes

$$\frac{1}{2} \left \| W \right \|^2 + \sum_{n = 1}^NC_n\nu_n^2 - \lambda W^T \left ( \sum_{n^{'} \in V} t_{n^{'}} \phi_{n^{'}} \right ) - \lambda B \sum_{n^{'} \in V} t_{n^{'}} $$

Where $$C_n = C$$ if $$n \not \in V$$ and $$C_n = C - \lambda$$ if otherwise. Compute the derivatives and set them to zero and we obtain the necessary conditions:

$$W = \lambda \sum_{n^{'} \in V} t_{n^{'}}\phi_{n^{'}}$$

$$\sum_{n^{'} \in V} t_{n^{'}} = 0$$

$$C_{n^{'}}\nu_{n^{'}} = 0 \ \forall n^{'} \in V$$

We generally set $$C \neq \lambda$$, so the third condition essentially means if the current parameters are stationary, then all $$\nu$$ must be zero. By definition, for any data point $$m^{'} \in V$$, the following inequality holds

$$1 - \nu_{m^{'}}^2 = 1 > t_{m^{'}} (W^T\phi_{m^{'}} + B) $$

Subtitute $$W$$ by the first condition and we get:

$$1 > \lambda t_{m^{'}} \left( \sum_{n^{'} \in V} t_{n^{'}}\phi_{n^{'}}^T\phi_{m^{'}} + B \right)$$

Now since this holds for all $$m^{'} \in V$$, we can take the sum across all posible value of $$m^{'}$$:

$$ \left|V\right| > \lambda \left( \sum_{m^{'}, n^{'} \in V} t_{m^{'}} t_{n^{'}} \phi_{n^{'}}^T \phi_{m^{'}} \right) + \lambda B \sum_{m^{'} \in V} t_{m^{'}} $$

$$\lambda B\sum_{m^{'}} t_{m^{'}}$$ reduces to zero thanks to the second condition. Denote $$t$$ as the vector whose entries are all $$t_{m^{'} \in V}$$ and $$\mathbb{K}$$ the kernel for dot product $$\phi^T\phi$$. This inequality is vectorized to

$$ \left|V\right| > \lambda t^T\mathbb{K} t$$

Notice that each entry of $$t$$ is either $$1$$ or $$-1$$, and length of $$t$$ is exactly the size of $$ V $$, the final form of our violated constraint is thus:

$$ \lambda^{-1} >  x^T\mathbb{K}x \ \ where \ \left\|x\right\| = 1$$

We know with such value of $$x$$, value of $$x^T\mathbb{K}x$$ lies between $$\lambda_{min}$$ and $$\lambda_{max}$$ - the smallest and largest eigenvalue of positive definite $$\mathbb{K}$$. Since we are trying to prove this will not hold, the sure-fire way is to set $$\lambda^{-1} = \lambda_{min}$$