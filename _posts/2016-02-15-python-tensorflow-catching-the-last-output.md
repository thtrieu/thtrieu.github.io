---
published: true
title: Catching the last output of RNN while training in batches
---

### Intro

So I've been working on this project of sentence classification for a while. The baseline is this [very-simple-yet-effective CNN from Yoon Kim](https://arxiv.org/abs/1408.5882). It's been a while since the model was proposed and several other models have beaten this one on several datasets. But here I'll just work on this baseline with another focus - not beating the accuracy, but to see if injecting _more_ temporal information into the structure is of any good. The reason is: sentences are sequential words, but CNN kinda produces a _bag of patches_ to the next, typically, fully-connected discriminative layer. Even though patches of words contain some kind of sequential information, _a bag_ is essentially the opposite. The work so far is fine. Until I encounter this problem of varying sentence length.

### Problems with padding

One thing people commonly do with sentences is to pad them, as a preprossing step of their deep learning application, so that all sentences in a dataset are of the same length. The reason for this is: `Tensorflow` works with tensors only, apparently. And tensors essentially contains constant sized matrices or vectors, thus padding is unavoidable.

But say, sentences after being padded are passed into the structure. Then the padded part will be transformed and pushed through several layers of the network. There is a high chance that this padding information will mess with the actual content of the input at later layers and thus, create quite a bit of noise in the network's output. Even if the padded part are all zeros, when going through a linear transformation, they will be added by some bias weight and becomes visible in contributing to the activations. So, eliminating these noise is desirable.

The dataset that I am working on have the ratio of the average sentence length to the maximum one being \\( 1/4 \\). So padding is injecting one hell of noise into the network. This, must be taken into account seriously.

### Getting the last output signal of RNN
If you had a look on this [awesome blog post](http://karpathy.github.io/2015/05/21/rnn-effectiveness/) on RNN, you'll know that there is essentially two different uses of RNN when the input is a sequence. The first one is sequence-to-sequence, the second one is sequence-to-unit. The implementation of the first one looks something like this

```python
outputs, state = rnn.rnn(lstm_cell, inputs, initial_state = initial_state)
```

While in the second one:

```python
outputs, state = rnn.rnn(lstm_cell, inputs, initial_state = initial_state)
output = outputs[-1]
```

Not much of a difference huh? Yes, but in the second one, getting the last output signal is something very undesirable as indicated earlier. In order to come to this final element of the list `outputs`, the real content have to survive a considerable amount of paddings.

### The solution
This should easily be the solution.

```python
output = outputs[0]
for i in range(0, batch_size):
    # l_i : length of sentence number \\( i \\) in the batch
    l_i = sentence_length[i]
    output[i,:] = outputs[l_i - 1][i,:]
```

The problem is right there at `range(0, batch_size)`. You suppose to know the actual value of `batch_size` at construction phase of the graph. Can we do it? Well definitely, why in the world we cannot at all? The thing is, if you set `batch_size` to a specific defined number while building this graph, then how would it allow the validation/test data (which will not comes in batches) to flow in later on? Actually this can be solved in many different ways (you can easily think of one right now), and at the end of the day it actually boils down to coding style. [This post](http://thtrieu.github.io/2016/03/07/python-tensorflow-deep-learning-application-templates) discusses the topic in much greater length. Right now, let's assume we insist on not specifying a defined value for `batch_size` at construction phase.

So, if `batch_size`, instead of being a defined number, presents as a placeholder, how would we iterate over `range(0, batch_size)` and collect outputs at appropriate positions like above? Well, LSTM is theoretically a great subtitute solution thanks to its ability to 'forget' the unnecessary padding at the end of each sentences. And even if not using it, one can simply reverse the input so that the padding comes first and then (likely) be washed away as information propagates through several time steps. 

But what if the padding creates a too noisy signal that it must be eliminated completely like in the solution above. Or what if we are the die-hard perfectionists willing to spend days and months cleansing the hell out of this noise or else we will not be able to go on with life? 

Don't worry! I've got here a cool and fun solution ;)

### Defining the problem
So here is the problem statement: 

__Given__ 

1. `outputs`, a list of length `padded_sentence_length`, each element being a tensor of size `batch_size` \\( \times \\) `hidden_size`.
2. `sentence_length`, a vector of length `batch_size`, with entry number \\( i \\) being the real length of sentence number \\( i \\) in the batch. 

__Question__: how to calculate the tensor `output` of size `batch_size` \\( \times \\) `hidden_size` with the same value produced as in the solution code, without explicitly refering to `batch_size`'s value?

In other words, we are trying to come up with an equivalent piece of code, with much more stingy restrictions. (Excited yet?)

### The walk-around Solution
Before moving on to the solution, I will give here a toy example for illustration purpose

```python
# Assume hidden_size = 2, batch_size = 3, padded_sentence_length = 4
# And the given data is:
outputs = 
[[[1, 2],   [[0, 0],    [[0, 0],    [[0, 0],    
  [0, 0],    [0, 0],     [3, 4],     [0, 0],
  [0, 0]];   [5, 6]];    [0, 0]];    [0, 0]]]
sentence_length = [1, 3, 2]
# Then the expected return is
output =
[[1, 2],
 [3, 4],
 [5, 6]]
```

As in the restriction, you can't iterate over `batch_size`, so let's iterate over `padded_sentence_length` (this is pure trial and error reasoning). By this loop, we essentially go through each and every element of the list `outputs`. Note that each of these elements is of the same size with `output`, so a reasonable idea is to initialise `output` randomly and refine its value as we iterate through the loop using values of each `outputs[i]`

Specifically the main idea is, as we iterate through each element of `outputs`, imagine `output` being a filter, it receives the whole value of each element but only keeps what it needs, discards the rest and then moves on. 

If you follow the reasoning, at this point it is very clear that during this loop, step number \\( i \\) is exactly when we must set the value for __all rows of `output`__ that correspond the __sentences with length \\( i \\)__ to the value of __the same rows__ of __`outputs[i]`__. Well I admit I've just said something lengthy and confusing, so feel free to skip and just look at the example below to understand. Here we iterate by `i in range(0, 4)`

```python
# Progression of output as we go through each iteration:
time  |initial | i = 0  | i = 1  | i = 2  | i = 3
------+--------+--------+--------+--------+--------
      |[[x, x],|[[1, 2],|[[1, 2],|[[1, 2],|[[1, 2],
output| [x, x],| [0, 0],| [0, 0],| [3, 4],| [3, 4],
      | [x, x]]| [0, 0]]| [5, 6]]| [5, 6]]| [5, 6]]
# By 'x', I mean 'anything, random'.
```

How do we do that? The first thing to realise is that at each interation, the current `output` has some rows that should be unchanged, and some others to be updated from `outputs[i]`. We can do this by a matrix `mask` having the same size as `output` with entries being \\( 1 \\) where `output` should be kept and \\( 0 \\) otherwise.

Filtery speaking, entries with value of \\( 1 \\) indicates that this position on the filter `output` is occupied by a number that didn't make it through the filter at some previous step, and thus this position can no longer be occupied by anything else that comes later.

Again, let's look at the value of `mask` in the example

```python
# Progression of the mask as we go through each iteration:
i   |    0   |    1   |    2   |    3
----+--------+--------+--------+--------
    |[[0, 0],|[[1, 1],|[[1, 1],|[[1, 1],
mask| [0, 0],| [0, 0],| [0, 0],| [1, 1],
    | [0, 0]]| [0, 0]]| [1, 1]]| [1, 1]]
```

If we are able to calculate `mask` at each step, then the update rule for `output` is simply 

```python
output = tf.mul(output, mask) + tf.mul(outputs[i], 1 - mask)
```

So the remaining problem is to calculate `mask`.
Looking at `mask`, we realise that all entries on the same row have the same value, thus `mask`'s value can be inferred from a single vector `v` that has the progression as follows:

```python
# Progression of v as we go through each iteration:
i |  0  |  1  |  2  |  3
--+-----+-----+-----+------
  | [0, | [1, | [1, | [1,
v |  0, |  0, |  0, |  1,
  |  0] |  0] |  1] |  1]
```

See any patterns? Clearly the value of `v` must relies on the value of `i` (obviously, since `v` changes as `i` goes from 0 to 3), and the value of the constant `sentence_length`. Let's put these three together:

```python
l = sentence_length
# Progression of v as we go through each iteration:
i     |  0      |  1      |  2      |  3
------+---------+---------+---------+--------
      | [0, [1, | [1, [1, | [1, [1, | [1, [1,
v ; l |  0,  3, |  0,  3, |  0,  3, |  1,  3,
      |  0]; 2] |  0]; 2] |  1]; 2] |  1]; 2]
```

See the pattern now? Yes, it is indeed `v = l < (i+1)`. And we are done (Pheeewww), here is the walk-around solution:

```python
l = sentence_length
output = outputs[0]
one = tf.ones([1,hidden_size], tf.float32) # v * one = mask

for i in range(1, len(outputs)):
    v = tf.to_float(l < (i+1))
    v = tf.expand_dims(v, -1)
    mask = tf.matmul(v, one)
    output = tf.mul(output, mask)
    output += tf.mul(outputs[i], 1.0 - mask)
```

There you have it!

# Update 28th Aug

There is [this](https://gist.github.com/rockt/f4f9df5674f3da6a32786bcf9fbb6a88) much simpler way to do exactly the same thing

```python
def gather_by_lengths(outputs, seq_lengths):
    """
    :param outputs: [batch_size x max_seq_length x hidden_size] tensor of dynamic_rnn outputs
    :param seq_lengths: [batch_size] tensor of sequence lengths
    :return: [batch_size x hidden_size] tensor of last outputs
    """
    batch_size, max_seq_length, hidden_size = tf.unpack(tf.shape(outputs))
    index = tf.range(0, batch_size) * max_seq_length + (seq_lengths - 1)
return tf.gather(tf.reshape(outputs, [-1, hidden_size]), index)
```