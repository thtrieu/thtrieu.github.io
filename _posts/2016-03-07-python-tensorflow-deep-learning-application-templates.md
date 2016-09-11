---
published: true
title: Should we define batch size during graph construction?
---

### Intro

So I've seen a number of Deep Learning snippets using `Tensorflow`, and reused a mixture of them here and there in my code. But there are things that cannot be mixed. Some codes follow their own philosophy (okay let's call it __taste__) and refuse incorporating some certain kind of code into its workflow (It is possible that this is because of my noop technical ability, but nevertheless there are points worth mentioning)

Studying this separation can be really beneficial for starting out with `Tensorflow`. Here I present two templates that I would comfortably switch back and forth between them depending on the deployed model. (And ofcourse they cannot be mixed)

### Review

Again I would throw a terrible generalised statement here about the workflow of any Deep Learning experiment:

1. _You read data (supervised one - features \\( X \\) and label \\( Y\\) )_ 
2. _If you don't have any test set, then use 10-fold Cross Validation_
3. _Now that you have train and test sets, hold-out a part of the train set for early stopping, if the size of train set is big enough_
4. _Now go on training (in batches), while simultaenously looking at the hold-out set to decide when to stop. Then stop and evaluate the model on test set, report it (if you are using 10 fold CV, you'll have to average the numbers)_.

So, this is the first code template of the two, it will look something like this: 

```python
import tensorflow as tf
import data_manipulator # you build this yourself

# Set up data
hope = FLAGS.hyperParameters.Hold_Out_PErcentage 
train, hold_out, test = data_manipulator.read(input_folder, hope)

# Set up model
class Model(object):
    def __init__(self, hyperParameters):
        self.loss_op, self.accuracy = self.Set_up_layers(hyperParameters)
        
    def Set_up_layers(hyperParameters):
        # 1. Set up placeholders self.x and self.y
        # 2. build layers gradually upon self.x 
        #    all the way through to the output layer
        # 3. calculate loss and accuracy, using self.y
        return((loss, acc))

# Session switch on
sess = tf.Session()
test_acc = float() # report this after the experiment

with sess.as_default():
    
    # Set up the graph
    hyperParams = FLAGS.hyperParameters
    m = Model(hyperParams)

	# Set up trainer
	optimizer = tf.train.AdamOptimizer(1e-3) # Adagrad, RMSprop, etc.
	gradients = optimizer.compute_gradients(m.loss_op)
	train_op  = optimizer.apply_gradients(gradients)

    # Post-training set-ups
    max_epoch = hyperParams.max_epoch
    batch_size = hyperParams.batch_size
    max_hold_acc = float(0.0) # keep track of the accuracy on hold-out set
    
    # Now start the training
    for batch in data_manipulator.yield_batch(train, batch_size, max_epoch):
        # 1. Let the tensors flows
        #    with gradients calculated and variables updated
        feed_dict = {m.x = batch.x, m.y = batch.y}
        _, train_acc = sess.run([train_op, m.accuracy], feed_dict)
        
        # 2a. Let the tensors simply flows through
        #     you may want to do this step much less frequently
        feed_dict = {m.x = hold_out.x, m.y = hold_out.y}
        hold_acc = sess.run([m.accuracy], feed_dict)
        
        # 2b. hold out peaked, report accuracy on test
        if hold_acc >= max_hold_acc:
            max_hold_acc = hold_acc
            feed_dict = {m.x = test.x, m.y = test.y}
            test_acc = sess.run([m.accuracy], feed_dict)
    
# now publish your paper maybe?
print(test_acc)
```

The second template comes later on in this post, which I initially consider being completely lack of good taste, but it solves problems. Go on reading if you are curious :D

### Okay, So where is the fun/interesting/troublesome part?

#### The troublesome `batch_size` placeholder

The hidden thing in the above code snippet is that, there are other placeholders besides `m.x` and `m.y` to be fed into `feed_dict`. Most likely they are `m.drop_out_probability` (yeah, very powerful regularisation technique - definitely recommended in every deep model) and `m.batch_size`. Why are they being placeholders? Because in the evaluation steps (`2a` and `2b`), they have a different value to step `1`. Namely, `model.drop_out_probability` must be \\( 1.0 \\) in both `2a` and `2b`, while  `model.batch_size` must be `hold_out.size` in `2a` and `test.size` in `2b`.

The good __taste__ here is that: the viewpoint above about `batch_size` generalizes very well from training set to both hold-out set and test set. It is brilliant to view hold-out and test sets to be two big fat batches, because who evaluates models _in small batches_ anyway (slower execution for the same output)? (well, I can imagine people do this in specific situations, like when hold-out and test sets are too big to fit in memory, but this is rare for my daily experiments). When there is a generalization, there is less branching statements in your code, and when the code is cleaner, people will just love it. 

But this also means, the actual value of `hyperParameters.batch_size`, although being passed to the initiation of `m`, will not be used because it is not applicable for hold-out and test sets. But hold on, you are _fine_ not specifying `model.batch_size` as the placeholder in almost many cases, because `Tensorflow` allows tensors with `None` dimension, as long as at run-time, tensor operations work out fine (e.g. tensor multiplication requires some dimension-matching) (cool!). That being said, there are cases when you do have to specifically refer to `batch_size` in the constructure phase (a.k.a. initiating `Model` object). For an example, the code below is from tensorflow's github repository:

```python
def zero_state(self, batch_size, dtype):
    """Return state tensor (shape [batch_size x state_size]) filled with 0.
    Args:
      batch_size: int, float, or unit Tensor representing the batch size.
      dtype: the data type to use for the state.
    Returns:
      A 2D Tensor of shape [batch_size x state_size] filled with zeros.
    """
```

`zero_state` is a function that most will use in every Recurrent model, see the documentation? `batch_size` should be `int`, `float` if you know the actual value at construction phase, or you can throw in a placeholder if you don't know its value.

#### So what is the problem anyway? 
The problem is, there are cases you _desparately_ have the need to iterate over `range(0,batch_size)` at construction phase. But when `batch_size` being a placeholder (you don't know the value at construction phase), iterate over it makes no sense. Yes, `Python` raise an error immediately when I desperately (and naively) try this loop expecting some magical colaboration between `range()` and `Tensorflow`'s placeholders.

Is this particular looping need _frequent and universal_? I'll say yes, as I and my colleagues encountered it for quite a number of times. In [this post](http://thtrieu.github.io/2016/02/15/python-tensorflow-catching-the-last-output) I point out a concrete situation of this looping need and a (cool) walk-around for it. Notice I call it a _walk around_. Because it is not a solution, I don't know if there is any built-in `Tensorflow` op, like `tensorflow.range()` or something, for people to loop over placeholders at construction phase. But the fact is, you __DON'T__ need such operation at all, as long as you use the following template (which I personally considered to be terribly lack of __taste__, but nevertheless works wonders)

Here it comes,

```python
import tensorflow as tf
import data_manipulator # you build this yourself

# Set up data
hope = FLAGS.hyperParameters.Hold_Out_PErcentage 
train, hold_out, test = data_manipulator.read(input_folder, hope)

# Set up model
class Model(object):
    def __init__(self, hyperParameters, batch_size = None):
        # Here comes the branching ...
        if batch_size is None:
            self.batch_size = hyperParameters.batch_size
        else:
            self.batch_size = batch_size
        self.loss_op, self.accuracy = self.Set_up_layers(hyperParameters)
        
    def Set_up_layers(hyperParameters):
        # 1. Set up placeholders self.x and self.y
        # 2. build layers gradually upon self.x 
        #    all the way through to the output layer,
        #    feel free to loop over self.batch_size
        #    it is an actual int/float now!
        # 3. calculate loss and accuracy, using self.y
        return((loss, acc))

# Session switch on
sess = tf.Session()
test_acc = float() # report this after the experiment

with sess.as_default():

    # Set up THREE graphs
    hyperParams = FLAGS.hyperParameters
    m_train = Model(hyperParams)
    m_hold = Model(hyperParams, hold_out.size)
    m_test = Model(hyperParams, test.size)

    # Set up trainer
	optimizer = tf.train.AdamOptimizer(1e-3) # Adagrad, RMSprop, etc.
	gradients = optimizer.compute_gradients(m.loss_op)
	train_op  = optimizer.apply_gradients(gradients)
    
    # Post-training set-ups
    max_epoch = hyperParams.max_epoch
    batch_size = hyperParams.batch_size
    max_hold_acc = float(0.0) # keep track of the accuracy on hold-out set
    
    # Now start training
    for batch in data_manipulator.yield_batch(train, batch_size, max_epoch):
        # 1. Let the tensors flows
        #    with gradients calculated and variables updated
        feed_dict = {m_train.x = batch.x, m_train.y = batch.y}
        _, train_acc = sess.run([train_op, m_train.accuracy], feed_dict)
        
        # 2a. Let the tensors simply flows through
        #     you may want to do this step much less frequently
        feed_dict = {m_hold.x = hold_out.x, m_hold.y = hold_out.y}
        hold_acc = sess.run([m_hold.accuracy], feed_dict)
        
        # 2b. hold out peaked, report accuracy on test
        if hold_acc >= max_hold_acc:
            max_hold_acc = hold_acc
            feed_dict = {m_test.x = test.x, m_test.y = test.y}
            test_acc = sess.run([m_test.accuracy], feed_dict)
    
# now publish your paper maybe?
print(test_acc)
```

Now see that this template has an `if` branching, thus it is kinda more verbose (uglier) than the previous one, not to mention it is longer and obviously requires more memory. Yes, there are ways to avoid the `if` but you will not be able to avoid instantiating _three different_ objects of class `Model`. The ugly part of this is that, these three objects, although containing only two `Tensorflow`-op attributes each, correspond to three separate underlying `Tensorflow` graphs. These graphs can be huge if your model is big enough, and guess what? All three of them are __identical__ except for the loop part! 

For me, the redundancy here is unbearable at the time discovering this template. But over time, it gradually becomes acceptable because _three_ is a constant anyway. And constants are fine, look, they are \\( O(1) \\). Nevertheless, whenever I encounter a loop need, the first thing I would do is to stick with __template 1__ until I cannot find a walk-around for it. Because walk-arounds are conceptually very cool, and every developers need that little stubborness when it comes to coding styles, isn't it? No? okay then =(.