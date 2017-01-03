---
title: Vectorizing gradient of high-dimensional Batch Normalization
---

* #table of content
{:toc}


### Batch normalization overview

Batch normalization is a technique that stablizes the input distribution of intermediate layers in deepnet during training, this reduces the effect of information morphing and thus helps speed up training (during a few first steps). Batch-norm is claimed to reduce the need of using dropout due to its regularizing effect. As the name `Normalization` suggests, you simply normalize the output of the layer to zero mean and unit variance:

$$\hat{x} = Norm(x, \mathbb{X})$$

This requires expensive computation on $$Cov[x]$$ and its inverse square root $$Cov[x]^{-1/2}$$, so an approximation over each mini-batch during training is proposed. For a layer with input $$\mathbb{B} = \{x_{1..m}\}$$, besides its original parameters to learn, `Batch normalization` introduces two other learnable parameters: $$\gamma$$ and $$\beta$$. The forwarding proceeds as follows

$$\mu_{\mathbb{B}} \leftarrow \frac{1}{m}\sum_{i=1}^mx_i$$

$$\sigma_{\mathbb{B}} \leftarrow \frac{1}{m}\sum_{i=1}^m(x_i - \mu_{\mathbb{B}})^2$$

$$\hat{x_i} \leftarrow \frac{x_i - \mu_{\mathbb{B}}}{\sqrt{\sigma^2_{\mathbb{B}} + \epsilon}}$$

$$y_i \leftarrow \gamma \hat{x_i} + \beta \equiv BN_{\gamma, \beta}(x_i)$$

#### Goal

The above equation describes how BN handles scalars input. Real implementation, however, deals with much higher dimension vectors/ matrices. As an example, an information volume flowing through convolutional layer is 4 dimensional and we only takes the normalization steps over each feature map, separately. 

Let the volume of interest be $$k$$ dimensional and we are normalizing over the first $$k-1$$ dimensions, I will derive a sequence of vectorized operations on $$\triangledown_yLoss$$ - the gradient propagated back to this layer - to produce $$\triangledown_xLoss$$ and $$\triangledown_{\gamma}Loss$$. $$\triangledown_{\beta}Loss$$ will not be considered as it can be cast as a bias-adding operation and does not belong to the *atomic* view of batch-normalization. 

#### Denotations

For ease of denotation, I denote $$\triangledown_xLoss$$ as $$\delta x$$ and consider the case of one dimensional vector: $$x_{ij}$$ being the jth feature of ith training example in the batch. The design matrix is then $$x$$ of size $$n \times f$$ where $$n$$ is n is the batch size and $$f$$ is number of features. Although we are limiting the analysis to only one dimensional vectors, the later code is applicable to arbitralily bigger number of dimensions.

For example, a 4 dimensional volume with shape $$(n, h, w, f)$$ can be considered as $$(n*h*w, f)$$ after reshaping. For numpy broadcasting ability, reshaping is not even necessary.

### A computational graph view of Batch Normalization

First we break the process into simpler parts

<center> <img src ="https://i.imgur.com/ZSiV1tf.png"> </center>

Namely,

$$m = \frac{1}{n}\sum_{i = 1}^nx_i$$

$$\overline{x_i} = x_i - m$$

$$v = \frac{1}{n}\sum_{i=1}^n\overline{x_i}^2$$

$$x^*_{ij} = \frac{\overline{x_{ij}}}{\sqrt{v_j}}$$

$$x^{BN} = \gamma x^*$$

In our setting $$\delta x^{BN}$$ is available. Gradients flows backwards, so we first consider $$\delta x^*$$. Each entry $$x^*_{ij}$$ contribute to the loss only through $$x^{BN}_{ij}$$, so according to chain rule:

$$\delta x^*_{ij} = \delta x^{BN}_{ij} * \partial x^{BN}_{ij} / \partial x^*_{ij} = \gamma \delta x^{BN}_{ij}$$

$$\Rightarrow \delta x^* = \gamma x^{BN}$$

Next, we can do either $$v$$ or $$\overline{x}$$, $$v$$ is simpler since it contributes to the loss only through $$x^*$$ as shown in the graph (while $$\overline{x}$$ also contributes to the loss through $$v$$). Consider a single entry $$v_j$$, it contributes to the loss through $$x^*_{ij}$$ for all $$i$$, so according to chain rule:

$$\delta v_j = \sum_i \delta x^*_{ij} \frac{\partial x^*{ij}}{\partial v_j} = \sum_i \delta x^*_{ij} \frac{\partial (\overline{x}_{ij} v_j^{-1/2})}{ \partial v_j} = -1/2 v_j ^{-3/2} \sum_i \delta x^*_{ij} \overline{x}_{ij}$$

$$\Rightarrow \delta v_j = -1/2 v_j^{-3/2} \left( \sum_{i} x^*_i \odot \overline{x}_i \right)_j$$

Where $$\odot$$ denotes elemenet-wise multiplication and the power of $$-3/2$$ is applied element-wise. Move on to $$x^2$$ with $$v$$ being its mean, the gradient can be easily shown to be uniformly *spreaded* out from $$v$$ as follows:

$$\delta \overline{x}^2_i = \frac{1}{n} \delta v$$

We are now ready to calculate $$\delta \overline{x}$$, since it contributes to the loss through $$x^*$$ and $$x^2$$, its gradient consists of two parts, one coming from $$x^*$$ and the other from $$x^2$$. Let's do the $$x^2$$ first, since this square is applied element-wise, there is no summing in the derivative chain:

$$\delta_{x^2} \overline{x}_{ij} = \delta \overline{x}^2_{ij} \partial \overline{x}^2_{ij} / \partial \overline{x}_{ij} = \delta \overline{x}^2_{ij} \partial \overline{x}_{ij}^2 / \partial \overline{x}_{ij} = 2\delta \overline{x}^2_{ij} \overline{x}_{ij}$$

$$\Rightarrow \delta_{x^2} \overline{x} = 2 \delta x^2 \odot \overline{x}$$

For $$x^*$$, $$\overline{x}_{ij}$$ contributes to the loss through only $$x^*_{ij}$$, so there is also no summing in the chain:

$$\delta_{x^*} \overline{x}_{ij} = \delta x^*_{ij} / v_j^{-1/2}$$

There is no matrix-wide equation this time, however if we extend the definition of $$\odot$$ from element-wise to broadcasted mutiplication, then:

$$\delta_{x^*} \overline{x} = {v}^{-1/2} \delta x^*$$

Take the sum of $$\delta_{x^2}\overline{x}$$ and $$\delta_{x^*}\overline{x}$$, we have 

$$\delta \overline{x} = 2 \delta x^2 \odot \overline{x} + v^{-1/2}\delta x^*$$

Now for $$m$$, each entry in $$m_j$$ contributes to the loss through the whole $$jth$$ colume of $$\overline{x}$$, so:

$$\delta m_j = \sum_i \delta \overline{x}_{ij} \partial \overline{x}_{ij} / \partial {m_j} = \sum_i \delta \overline{x}_{ij} \partial (x_{ij} - m_j) / \partial {m_j} = - \sum_i \delta \overline{x}_{ij}$$

$$\Rightarrow \delta m = - \sum_i \delta \overline{x}_i$$

$$x$$ contributes to the loss through $$m$$ and $$\overline{x}$$, so its gradient is the sum of two parts. The part corresponds to $$m$$ is analogous to that of $$\overline{x}^2$$ and $$v$$ in the sense that one is the row mean of the other. Therefore we can quickly derive that part to be $$\delta_{m} x = \frac{1}{n} \delta{m}$$. 

The other part is also simple, as $$\overline{x} = x - m$$, there is no interaction between $$x$$ and $$m$$, hence $$\delta_{\overline{x}} x = \delta \overline{x}$$. So finally $$\delta x = \delta \overline{x} + \frac{1}{n} \delta m$$.

### Piece the pieces together, then simplify

Remember that the goal is to derive $$\delta x$$, we'll do it now using the results derived above:

$$\delta x =  \delta \overline{x} + \frac{1}{n} \delta m$$

$$ = \delta \overline{x} -1/n \sum_i \delta \overline{x}$$

Interestingly this is the action of centering $$\delta \overline{x}$$ around zeros, precisely what $$\overline{x}$$ did to $$x$$.

$$\delta \overline{x} = \delta {x^*} v^{-1/2} + 2\delta x^2 \odot \overline{x}$$

$$ = \gamma v^{-1/2} \delta x^{BN} + \frac{2}{n}\delta v \odot \overline{x}$$

$$ = \gamma v^{-1/2} \delta x^{BN} - \frac{1}{n} v^{-3/2} \odot \sum_i \left (\delta x^* \odot \overline{x}\right )_i \odot \overline{x}$$

$$ = \gamma v^{-1/2} \delta x^{BN} - \frac{\gamma}{n} v^{-3/2} \odot \sum_i \left (\delta x^{BN} \odot \overline{x}\right )_i \odot \overline{x} $$

$$ = \gamma v^{-1/2} \left ( \delta x^{BN} - \frac{1}{n} \sum_i \left (\delta x^{BN} \odot \overline{x}v^{-1/2}\right )_i \odot \overline{x}v^{-1/2}\right )$$

$$ = \gamma v^{-1/2} \left ( \delta x^{BN} - \frac{1}{n} \sum_i \left (\delta x^{BN} \odot x^*\right )_i \odot x^*\right )$$

We are done here. For efficient computation, in the forward pass we will save the value of $$v^{-1/2}$$ and $$x^*$$. This will not add anything to the computation complexity of forward pass.

### The code

#### Forward pass

```python
def forward(self, x, gamma, is_training):
    if is_training:
        mean = x.mean(self._fd)
        var = x.var(self._fd)
        self._mv_mean.apply_update(mean)
        self._mv_var.apply_update(var)
    else:
        mean = self._mv_mean.val
        var  = self._mv_var.val

    self._rstd = 1. / np.sqrt(var + 1e-8)
    self._normed = (x - mean) * self._rstd
    self._gamma = gamma
    return self._normed * gamma
```

#### Backward pass

```python
def backward(self, grad):
    N = np.prod(grad.shape[:-1])
    g_gamma = np.multiply(grad, self._normed)
    g_gamma = g_gamma.sum(self._fd)
    x_ = grad - self._normed * g_gamma * 1. / N
    x_ = self._rstd * self._gamma * x_
    return x_ - x_.mean(self._fd), g_gamma
```

The code is taken from a Github repo of mine where I am building something similar to an audo-diff DAG graph. [Visit](https://github.com/thtrieu/numpyflow) if you are interested. I conclude the post here. 
