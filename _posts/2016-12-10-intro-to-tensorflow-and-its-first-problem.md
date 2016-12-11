---
title: Introduction to tensorflow, how to use and how to build one
---

* #table of content
{:toc}

### tensorflow as a computational graph builder

`tensorflow` builds computational graph. Computational graph computes numerical operations like multiplication, addtion, division, etc. But why on earth does a graph with its innocent nodes and edges has anything to do with computing? Well, because people love making abstractions and analogies. Namely, in a `tensorflow` graph, the analogy goes as follows:

#### Nodes

Nodes are operations. Each operation takes input and compute the output corresponds to its type. e.g. An addition operation `A` takes two inputs (can be scalars, vectors or matrices) and return the sum of them. `tensorflow`er calls operations `ops`.

#### Edges

Edges are the path along which data flows. Where does `A` takes its input from? From an edge. Where does `A`'s output go to? To an edge, that edge might directs this output sum to another operation.

#### Nodes (Ops) revisited

`A` takes two edge values and compute another edge value, this output is deterministic and totally controlled by two input values. The output value is therefore recomputed / renewed whenever two inputs hit `A`. We may call `A` a *renewing* ops, the old value is then completely irrelevant.

But what about ops that has no input? How do they produce values? These are special ops that require some memory to store a value, they will push this value out whenever asked to join a computation. This leads to the following categorization:

- Variables: ops that contain initial user-defined values during graph construction. These values are expected to be modified during graph flowing.
- Constants: ops that contain user-defined values during graph construction, but will not be changed thoughout any flowing session.
- Placeholder: ops that is blank during graph construction, but are expected to be fed by user-defined values during graph flowing.

A question is raised: Who update values of variables? The answer is: **another op**, obvious not a *renewing* one but more like an *updating* one, who takes the current value and some updating rules to produce a new value. `tensorflow` call these kinds of ops *assign ops*. These ops are handy in case of updating *moving average* variables and training variables by gradient-based algorithms.

#### Graph construction and flow

We have mentioned about graph construction and graph flowing. In `tensorflow`, these two are separated phases. Graph construction is done via calling to constructing methods of the nodes e.g. `tf.placeholder()`, `tf.Variable()`, `tf.add()`, `tf.mul()` creates ops and attach these nodes to the current graph. Edges are created implicitly when we create ops from output of other ops, e.g. `add_op = tf.add(a, b)` create edge from ops `a` and `b`  to `add_op`. 

Graph flow is done by a session attached to our current class, created by `tf.Session(graph = current_graph)`. In fact, a graph can be shared by multiple sessions running on different machines in the case of distributed computing, but that is something I am underqualified to talk about.

#### Wrap up: a model in action

Hit [tensorflow homepage](https://tensorflow.com) and you immediately see the following beautiful illustration:

<center>
<img src = "https://www.tensorflow.org/images/tensors_flowing.gif">
</center>

Orange nodes are variables, small circle nodes are constants (you can consider them hyper-parameters), 'Input' node is usually a placeholder, 'Gradients' node uses back-propagation to calculate all gradient of participating variables, the big fat 'SGD Trainer' op is an assigning op for all variables, in the illustration, it consists of smaller yellow ops and the values are updated sequentially backwards as in back-prop algorithm.

It can easily be seen that asking for 'SGD Trainer''s value will trigger the whole net, including updating the variables. Asking for 'Class labels', for example, will not trigger the assign ops. These are analogous to training and testing our models, namely, during training we call `sess.run(SGD_trainer)` many times over the training set until convergence, while for testing we only call for `sess.run(class_labels)` once for each example.

### How to build a differentiable computational graph

The fun part is `Auto-Differentiation` (corresponding to building the  `SGD_train` op in the previous example) that most current deep learning framework provides. The most important component of this feature is to build partial differentiation for each operation you provide the user. 

When the user build their graph using these operations, you will obtain nested functions of your pre-built ops. With partial derivaties already provided, calculating gradient for such nested functions is left with a systematic use of chain rule.

In general, let's say you have an `op` with defined partial derivative `op.partial_d(an_input)`, that takes N inputs and forward its output to M other ops as follows

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

Assuming that all ops in `out` contribute to the final loss, then the gradient flowing along edge `inp[n] <- op` can be defined recursively as

```python
op.grad := sum[grad(out[m], op) for m in range(M)]
grad(op, inp[n]) := op.grad * op.partial(inp[n])  
```

Where `op.partial(inp[n])` is just the partial derivative $$ \frac{ \partial a}{\partial inp_n}$$. From this rule, we can infer that in the case `inp[n]` is fed to no one else but only `op`, `grad(op, inp[n])` is exactly `inp[n].grad`.

Basically, each computational unit in a computational graph has two major methods, one carries information flowing forward and one carries backward. The gradflow series elaborates on this idea in the context of Deep Learning. Pay a visit if you are interested :)

#### Computational graph example 1: edmsyn

`edmsyn` stands for `Educational Data Synthesizer`, a project built in `R` during my first internship in Summer of 2015, when `tensorflow` was still not a thing to me. Coincidentally, `edmsyn` took the structure of a computational graph: a connected group of nodes, represents a set of parameters with two types of connection per computational unit, - analogous to the forward and backward passes.

Although things in Educational Data Mining works a bit differently than in Deep Learning, having forward and backward passes seems like a universal need for computational graph. In the first version of `edmsyn`, the graph was constant, all computational units as well as connections are predefined, the only thing users have to do is to decide at which point in the graph they want to feed value in.

Let's look at a definition of a node in `edmsyn`:

```r
poks. <- list(

      c("student.var","avg.success","state","or.t","or.f","po","alpha.c","alpha.p","p.min"),

      list(c("student.var", "students", "state", "or.t","or.f","po","alpha.c","alpha.p","p.min"),
           c("student.var", "students", "state", "po", "alpha.c", "alpha.p", "p.min"),
           c("students","po","avg.success","alpha.c","alpha.p","p.min")
      ),

      poks.learn,

      list(
        stvar.stu.state.or.po.2.poks,
        stvar.stu.state.po.2.poks,
        st.po.avg.2.poks
      )
)
```

A node's definition in this graph consists of four components: The first one is a list of variables whose value can be inferred using the third component - a function named `poks.learn`. The second component is a *list of list* of variables that can be used to generate value of node `poks`, in this example there are three such lists and three corresponding generative function provided in the fourth component.

There are also two main functions to operate across breadth and depth of the graph called `up.stream` and `down.stream` - you may have guessed their functionalities. Later on in the second version of `edmsyn`, operations that allow users to modify into this graph of standard models was added. If you are interested, please visit [here](https://github.com/thtrieu/edmsyn)

#### Computational graph example 2: darknet

Now let's look at a real example of computational graph in deep learning: [darknet](https://github.com/pjreddie/darknet). Although `darknet` was written in C, where OOP was not officially supported, the code factors nicely and allows us to examine the its structure. Indeed, each layer type (op type) in `darknet` has the critical components: forward and backward pass. Take a look at `darknet`'s implementation of `convolutional_layer.c`

```c
void forward_convolutional_layer(convolutional_layer l, network_state state)
{
    int out_h = convolutional_out_height(l);
    int out_w = convolutional_out_width(l);
    int i;

    fill_cpu(l.outputs*l.batch, 0, l.output, 1);
    // omitted code 
}
```

```c
void backward_convolutional_layer(convolutional_layer l, network_state state)
{
    int i;
    int m = l.n;
    int n = l.size*l.size*l.c;
    int k = convolutional_out_height(l)*convolutional_out_width(l);

    gradient_array(l.output, m*k*l.batch, l.activation, l.delta);
    backward_bias(l.bias_updates, l.delta, l.batch, l.n, k);
    //omitted code 
}
```

`darknet` is where the [You only look once](http://pjreddie.com/darknet/yolo/) is trained, an impressive real-time object detection and classification with state-of-the-art speed. [This](http://github.com/thtrieu/darkflow) is my implementation of `YOLO` in `tensorflow` if you are interested.

### A non-deep learning problem

`tensorflow` provides users with a rich enough set of operations to cover a large family of differentiable functions. Coupled with the power of auto differentiation, the scope of problems `tensorflow` can solve is obviously much larger than those of Deep Learning. 

I will proceed to present a straightforward and simple optimization problem, with the goal to introduce a typical structure of a `tensorflow` program.

#### Problem statement

Given a list `a` of 10 real numbers, return another real number that minimizes its total squared distances to these 10 given numbers.

#### Model the answer

We know the mean value of those 10 numbers should be our solution, since minimize such a objective would mathematically equivalent to minimize the distance between our solution and the mean. However, just pretend for a moment that we don't know this and want to model the solution as a linear combination of the other 10 numbers: $$sol = a^Tw$$

#### Solution

The solution will have two parts: graph construction and graph flowing, analogous to installing the model into a computational graph, and train it. First we import necessary libs and define constants

```python
import tensorflow as tf
import numpy as np
length = 10
```
In order to build a graph, you have to construct one

```python
# PHASE 1: build graph
graph = tf.Graph()
```

Currently this `graph` is empty, new ops and connections will be added soon. Make sure that every ops you declare must be attached to this graph. Putting all declarations of new ops into the following `with` block will guarantee so:


```python
with graph.as_default():
    # proceed to build graph
```

The way we train our model would be: feed a random vector of length 10 into the graph, use built-in ops to calculate the total squared distance, and minimize this number. It is clearly the case that `a` should be a placeholder since many different values of `a` will be fed into the network at training phase, while for now none of them is available. `w` would obviously be a variable, remember we have to assign an initial value for it.  

In supervise learning, however, people usually train a batch of examples instead of a single one, so each time feeding value into the network, we'll feed 1000 such random values. Therefore, the input matrix will have shape `[batch_size, length]`.

```python
batch_size = 1000
with graph.as_default()
    a = tf.placeholder(tf.float32, [batch_size, length])

    # model solution x = a * w
    intitial_w = np.random.uniform(0, 1, [length, 1])
    w = tf.Variable(intitial_w, dtype = tf.float32)
    x = tf.matmul(a, w)

    # objective to be minimize
    loss_op = tf.nn.l2_loss(a - x)
```

As stated earlier, we need an assign op to update new value to `w` after each forward pass of fed values, in a manner that will minimize our `loss_op`. `tensorflow` has several such built-in assign ops, in this example we'll use the vanilla Gradient Descent Optimizier.

```python
# with graph as default:
    # train model with learning rate 1e-5
    optimizer = tf.train.GradientDescentOptimizer(1e-5)
    gradients = optimizer.compute_gradients(loss_op)
    # our assign op:
    train_op = optimizer.apply_gradients(gradients)
```

Are we ready for training? Not really, `tensorflow` asks for all variable to be initialized first, otherwise we'll step into training with variables empty and errors raised. To do this we'll declare another op that takes the job of initializing all variables:

```python
# with graph as default:
    # initial
    initialize_all_variables_op = tf.initialize_all_variables()
    # the end of with block.
```

We're all set. Let's move on declaring a session associtated with `graph`

```python
# flow graph
sess = tf.Session(graph = graph)

# run the initialize_all_variables_op to initialize w
_ = sess.run(initialize_all_variables_op)
epoch = 10000
```
As you can see, the syntax for running an op, either a *renewing* one or an *assigning* one, is to put it as the `fetches` argument of `sess.run()`. This call will return the value associated with the requested op. In case of `initialize_all_variables_op`, we don't really care about what value it returns, the important thing is, in order to return that value, this op has to initialize all variables.

We'll apply the same thing to our *assign op* `train_op` by putting this op into `sess.run()`, however `train_op` requires `gradients` to be computed, this `gradients` in turns ask for a value of `loss_op`, which asks for a value of `a` and `x`, keep going and you'll see that in order for this sequence of evaluation to be executed, value for placeholder `a` must present. This value as discussed above, will be generated randomly 1000 times and put all into a single batch. This batch will be fed into the graph via `sess.run(feed_dict)`:

```python
# feed 10000 batches of values
for i in range(epoch):
    a_feed = np.random.uniform(0, 1, [batch_size, length])
    # we also want to monitor the value of loss
    # during this training procedure
    _, loss = sess.run([train_op, loss_op], feed_dict = {
        a : a_feed
    })
    # print loss to the screen and make sure
    # it decreases each time step
    print loss

# training finish, fetch the value of w
# check if they are all 0.1?
print sess.run(w)
```

And we're done.