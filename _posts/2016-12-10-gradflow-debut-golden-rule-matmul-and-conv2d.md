---
title: Golden rule of backprop, gradflow through matmul and dropout
---

* #table of content
{:toc}

### The goldren rule of back propagation

Back-propagation can be seen as the algorithm used to calculate gradient of all parameters in a (deeply) nested function. In the context of `tensorflow`, these gradient information will be fed to a gradient-based optimizer such as Gradient Descent to update new values to these parameters according to the optimizer's rule.

Let's say you have this scenario that an `op` takes N inputs from the list `inp` and produce its activation `a`, who then flows to M other ops in the list `out`.

```python
inp[1] = inp_op1(...)
inp[2] = inp_op2(...)
...
inp[N] = inp_op[N](...)

a = op(*inp)

out[1] = out_op1(..., a, ...)
out[2] = out_op2(..., a, ...)
...
out[M] = out_opM(..., a, ...)
```

Assuming that every ops in `out` contribute to the final loss, then the goldren rule of back-propagantion says that, the gradient of loss with respect to `ops` and gradients flow from `op` to `inp[n]` can be calculated in two recursive steps as follows:

```python
op.grad := sum[grad(out[m], op) for m in range(M)]
grad(op, inp[n]) := op.grad * op.partial(inp[n])  
```

Where `op.partial(inp[n])` is just the partial derivative $$ \frac{ \partial a}{\partial inp_n}$$. From this rule, we can infer that in the case `inp[n]` is fed to no one else but only `op`, `grad(op, inp[n])` is exactly `inp[n].grad`.  

Well, the name *golden rule of backpropagation* that I made up is just a fancy name for chain rule of calculus. Intuitively, the rule says that in order to calculate gradient from a node A to another node B, take the sum of all gradients flows to A as the gradient of A, and then multiply this result with the partial derivative of A with respect to B's contribution to A's activation.

### A typical view of a network layer

Now let's apply the golden rule to the context of Deep Learning, a deep neural net takes some form of a deeply nested function. Each layer that information has to pass through loosely follows a same 4-step template:

```python
class Network(object):
    def forward(self, input):
    """deeply nested function""" 
        self.output = \ 
        layer[n-1].forward(
            layer[n-1].forward(
                layer[n-2].forward(
                    ...
                        layer[0].forward(input)
        ))))

# where each component function layer[i]() follows the template
class Layer(object):
    def forward(self = layer[i], input = layer[i-1].output):
        """ 4 steps, performed by 4 ops"""
        self.signature_out = self.signature(input)
        self.batch_normed  = self.batch_norm(self.signature_out)
        self.biases_added  = self.add_biases(self.batch_normed)
        self.output =  self.activate(self.biases_added)
        return self.output
```

Where `activate()` might be `ReLU()`, `sigmoid()`, `tanh()`, or `identity()`. `add_biases()` simply adds a real-valued bias for each feature (can be a value, vector or matrix (feature map) - a slice at the information volume's last dimension in `tensorflow`'s convention). `batchnorm()` is less strictly required than the others, it essentially makes each feature map zero mean and unit variance before scaling back up by a parameter. `signature()` differentiates, say, a convolutional layer with a fully connected layer.

We first solve one and for all the gradflow through common modules `activate`, `add_biases` before moving on to the `signature` for different layers. There we'll go from simple to complex: `fully_connected`, `conv2d` and then `gru`, `lstm`, and finishes with `batchnorm`. Namely in this post we will finish at `fully_connected`.

### A few design choice

We'll first agree on the representation of tensors of high dimension in our implementation. Let's loosely follow the `tensorflow` convention: the `batch` dimension go first, then the volume's dimensions with feature map go last. Specifically we'll flatten the volume into 2D array so that information flows through the net in batch will be a 3D matrix with dimensions `[batch * spatial, feature]`. For later convenience, denote this shape as `[ns, f]`

Let's review the indexing of such flattened high-dimensional volume. Say our volume of information has shape `[size1, size2, size3, ..., sizeN]`, then in the flatten version, index of the entry at position `[p1, p2, p3, ..., pN]` will be 

```python
index(p)  = p(N)   + size(N)   * (
            p(N-1) + size(N-1) * (
            p(N-2) + size(N-2) * (
            p(N-3) + size(N-3) * ( ...
            p(1)   + size(1)   * (
            batch_index )) ... )))
```

Inversely,

```python
idx    = index(p)
pN     = (idx / (1)) % sizeN
p(N-1) = (idx / (1 * sizeN)) % size(N-1)
p(N-2) = (idx / (1 * sizeN * size(N-1))) % size(N-2)
...
p1     = (idx / (1 * sizeN * size(N-1) * ... * size2)) % size1
```

### Dynamics of gradflow

Assuming the last layer of our network produces a single real value - our objective to minimize (loss), then we can start the gradient's backward flow with the gradient of the loss with respect to itself: $$\Delta_{loss} loss = 1.0$$. Then apply this initial backward signal sequentially from the last layer to the first one:

```python
class Network(object):
    def backward(self):
        grad = 1.0
        for layer in self.layers.reverse():
            grad = layer.backward(grad)
```

According to step 1 in the golden rule. In order for gradient to start flowing from `B` to `A`, `B` must accumulate enough gradient from all ops that its activation go to. This is a kind of management one have to pay close attention to while implementing back-propagation.

As you will see, this management will actually be simplified in the context of our proposed template. For grad flow through `layer[i]`, We assume the gradient of loss with respect to `layer[i].activate` is already available and is readily flowed back through the layer's 4 ops. Let's call them 4 modules of the layer, the `layer.backward` method would look like this:

```python
class Layer(object):
    def backward(self, grad):
        for module in self.modules.reverse():
            grad = module.backward(grad)
        return grad
```

### gradflow through activate module

The activation module simply transforms its input volume by applying element-wise a nonlinearity, with a special case of identity activation (some call them `linear` activation instead of `identity`). Let's start looking at the `activate` module.

```python
layer.output = layer.activate(layer.biases_added)
```

We already have `layer.activate.grad`, so using the golden rule we are ready to calculate `grad(layer.output, layer.biases_added)` (notice `layer.biases_added` is the only input to `layer.activate()`). 

Now since `layer.biases_added` feed its output to only one op `layer.activate()`, `grad(layer.activate, layer.biases_added)` will be exactly `layer.biases_added.grad`, so we can calculate `layer.biases_added.grad` using the rule as follows:

```python
class activate(module):
    def backward(self, grad):
        partial = self.partial()
        return grad * partial # element-wise mult
```

The work left is to define `partial()`. You will see in later sections, `partial()` is where most of the heavy lifting at.

```python
class activate(module):
    def __init__(self):
        self.activation = None

    def __call__(self, x):
        self.forward(x)
        return self.activation


class sigmoid(activate):
    def forward(self, x):
        self.activation = 1. / (1. + exp(-x)) 

    def partial(self):
        a = self.activation
        return a * (1. - a)


class linear(activate):
    def forward(self, x):
        self.activation = x
    
    def partial(self):
        return 1.0


class relu(activate):
    def forward(self, x):
        self.activation = max(0. , x)
    
    def partial(self):
        a = self.activation
        return float(a > 0.)
```

And we are done with the `activate` module, easy right?

### gradflow through add_biases module

Now `layer.biases_added.grad` is ready to be served. Inputs to `layer.add_biases()` includes `layer.batch_normed` and bias parameter `b`. These two inputs also contribute to the loss only through `layer.add_biases()`, so similar to the previous part:


```python
class add_biases(module):
    def backward(self, grad):
        partial_biases = self.partial_b()
        grad_biases = grad * partial_biases
        
        partial_bnorm = self.partial_x()
        grad_bnorm = grad * partial_bnorm 
        return bnorm_grad
```

Again, let's solve for `partial()`. We know the operation essentially performs a broadcasted addition between input `x` and biases `b`. Recall that `x`'s shape is `[ns, f]`:

$$O_{bias} = x + \mathbf{1}_{ns} \cdot b^T $$

$$\frac{\partial O_{bias}^T}{\partial b} = \mathbf{1}_{ns}$$

Partial derivative with respect to `x` is an identity matrix, so gradient flows right through as if it was not multiplying with anything.

Notice the transpose sign on the numerator, this tells `add_biases.grad` need to be transposed before multiplying with this partial derivative. Notice as well, multiplication by a column vector of `1.0` amounts to taking the sum along your rows. So here is the code:

```python
class add_biases(module):
    def __init__(self, b_init):
        self.vars = {'b': b_init}
        self.grad = {'b': None}

    def __call__(self, x):
        self.shape = x.shape # ns, f
        return x + self.vars['b']

    def backward(self, grad):
        """modified version"""
        self.grad['b'] = grad.transpose().sum(axis = 1, keepdims = True)
        return grad # grad * partial_Ox = grad * identity
```

And we're done with `add_biases` module. Let's move on to the first signature `fully_connected`.

### gradflow through fully_connected

Now assume we have module `fully_connected` with `fully_connected.grad` already populated. The forward pass is a simple matrix multiplication, for the case of `fully_connected`, input `x` is of shape `[ns, f] = [b, f]` where spatial dimension is reduced to 1. For the forward pass we multiply `x` with weight matrix `w` of shape `[f, f_out]`

$$O_{matmul} = x \cdot w$$

$$\frac{\partial O_{matmul}^T}{\partial w^T} = x$$

$$\frac{\partial O_{matmul}}{\partial x} = w^T$$

The connectivity of this case is also very similar to previous two modules, so I will leave it self-explained.

```python
class fully_connected(module):
    def __init__(self, w_init):
        self.vars = {'w': w_init}
        self.grad = {'w': None}
    
    def __call__(self, x):
        self.x = x
        out = self.x * self.vars['w']
        return out
    
    def backward(self, grad):
        gradwT = grad.transpose() * self.partial_OTwT()
        self.grad['w'] = gradwT.transpose()
        gradx = grad * self.partial_Ox()
        return gradx
    
    def partial_OTwT(self):
        return self.x
    
    def partial_Ox2d(self):
        return self.vars['w'].transpose()
```

And we're finally done with `fully_connected` :)

### Dropout

Dropout is a special layer that does not follow the basic 4-step template. It basically does two steps: mask `p = 1 - keep_prob` percent of `x` columns to zero, then scale the volume's signal up by a factor of `1./p`. We can cast these two operations as two modules with their own partial derivatives too.

```python
class Dropout(Layer):
    def forward(self, input):
        self.masked = self.mask(input)
        self.output = self.amplify(self.masked)
```

#### Masking module

Implementation wise, the forward pass can be done using a broadcasted multiplication between input `x` and `r = numpy.random.binomial(1, keep_prob, shape = (1,f))`. For this to work with backward pass, define the broadcasted multiplication `w = identity(f) * r` and see how this would look mathematically:

$$O_{drop} = x \cdot w$$

This is basically the matmul that we did in previous section, where 

$$\frac{\partial O_{drop}}{\partial x} = \frac{\partial O_{matmul}}{\partial x} = w^T = w$$

Notice the last inequality holds because `w` is symmetric. So for the forward pass we are multiplying `x` with `w` and for the backward pass, the same thing happen for `grad`. This means our backward signal sent to `x` is dropped exactly the way `x` is dropped in its forward pass, this can be done efficiently by directly multiplying `grad` with `r` as in the forward pass.

```python
class mask(module):
    def __init__(self, keep_prob = .5):
        self.drop = 1. - keep_prob
        self.r = None
    
    def __call__(self, x):
        _, f = x.shape
        self.r = np.random.binomial(1, self.drop, [1, f])
        return x * self.r
    
    def backward(self, grad):
        return grad * self.r
```

Stunningly simple isn't it?

#### Amplifying module

This is very straightforward, `numpy` implementation is simply do an elementwise division `x / (1 - keep_prob)`. For mathematical formulation, define an amplifying matrix `w = identity(f) / (1 - keep_prob)` and we are back to the matmul case:

$$O_{amp} = x * w$$

$$\frac{\partial O_{amp}}{\partial x} = \frac{\partial O_{matmul}}{\partial x} = w^T = w$$

The implementation would proceed in a similar fashion:

```python
class amplify(module):
    def __init__(self, keep_prob = .5):
        self.drop = 1. - keep_prob

    def __call__(self, x):
        return self.x / self.drop
    
    def backward(self, grad):
        return grad / self.drop

```

#### Joining the two

Since both of the previous volume is so simple and their is no variation in any of them, let's join them into a single module `drop`:

```python
class Dropout(Layer):
    def forward(self, input):
        self.output = self.drop(input)
        return self.output


class drop(module):
    def __init__(self, keep_prob = .5):
        self.drop = 1. - keep_prob
        self.r = None
    
    def __call__(self, x):
        _, f = x.shape
        self.r = np.random.binomial(1, self.drop, [1, f])
        return self.x * self.r / self.drop
    
    def backward(self, grad):
        grad_mask = grad / self.drop
        return grad_mask * self.r
```

And I conclude the post here.