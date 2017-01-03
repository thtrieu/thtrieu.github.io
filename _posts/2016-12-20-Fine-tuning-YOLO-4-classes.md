---
title: Fine tuning a depth-20 dissected ConvNet in five epoches
---

* #table of content
{:toc}


### Intro

Recently I have successfully trained a 4-class YOLO using the code in [this repo](https://www.github.com/thtrieu/darkflow). The problem I worked at was training a new YOLO model except it only contains four classes, **presented in the original 20 classes**. Specifically the four classes was *tvmonitor, person, chair, pottedplant*. So the trained weight file might be useful for in-house / in-office applications.

When you reduce the number of classes, the first thing to expect is to reduce both *memory* and *run time* of the application. Normally what people would do is to design another net, with some first few layers identical to a trained net that has been well established to be of good performance; then initialize the other layers, train them separately before fine-tuning the whole net.

This post is my notes during training the new model without having to design a new architecture, which converged pretty fast thanks to some trick of initialization.

### Dissecting the last layer of YOLO

In principle, what human would do when observing a scene is to first scan the whole image, specify the location where there is a potential object, the size and shape of it and the type of object comes last. That means - detection first and classification later - which, is the 2-stage approach most algorithms are using. Not following this convention gives YOLO a competitive speed. As the name suggests (*You only look once*), detection and classification go together at once. 

![image courtesy from the paper]({{site.url}}/assets/yolo.png)

As can bee seen, the last layer is simple a fully-connected layer that transform vector of size 4096 to (7x7x30) = 1470. In the read-out vector, (7x7x20) first entries are class probability predictions conditioned on probability of an object presenting in corresponding grid 
$$P(C|object)$$
. These entries are not affected by any of the confidence entries inside the next (7x7x2) volume, clearly this is the reason why YOLO's author chose to interprete the predictions to be $$P(C|object)$$ and $$P(object)$$ instead of $$P(C)$$ and $$P(object)$$.

Now let's say we only want to predict four classes *tvmonitor, person, chair, pottedplant*; which presents in position 8, 14, 15, 19 in the list of twenty objects; then the only thing we have to do is simply ignore all other prediction in slices of the output volume other than [:, :, (8, 14, 15, 19)]; to read out the class prediction. 

This would lead to two complications: first, 
$$P(C|object)$$ 
is now un-normalized, as the trained weights are trained in presence of 16 other objects as well. Second, the confidence entry can still be turned on even when there is none of our 4-class present in the image. Fortunately this turns out to be not a problem since the detection threshold is placed on 
$$P(C|object)P(object)$$, 
not $$P(object)$$ alone. So if 
$$P(C|object)$$ is penalizes properly, there will be no false positive. This penalization is done through L2 error in the first version of YOLO:

$$L = L_{dectect}(x) + L_{classify}(x)$$

$$L_{classify} = \lambda_{noobj}\sum_{i=0}^{S^2}\sum_{j=0}^B\mathbb{1}_{ij}^{noobj}(C_i - \hat{C}_i)^2 + \sum_{i=0}^{S^2}\sum_{c \in classes}(p_i(c)-\hat{p}_i(c))^2$$

#### YOLO9000 is not suitable for dissecting because of false positives

In newer version, the probability terms are normalized using softmax; in this case we can actually see the false positive would not be a prolem. Suppose the true class is $$bike$$, then for any class $$c \in \{$$ *tvmonitor, person, chair, pottedplant* $$\}$$, we have:

$$P(C = c | object)P(object)$$ 
< $$(1 - P(bike|object))P(object)$$ $$= P(object) - P(bike|object)P(object)$$
$$\leq 1 - threshold$$

So $$P(C = c \| object)$$ is smaller than $$threshold$$ if and only if $$threshold \geq 0.5$$. This is a very reasonable threshold, however, none of the YOLO version (older and newer) complies this framework. The above inequalities are based on two assumptions: probability of class given confidence is normalized, **and** all predicted candidate boxes share a single confidence term. The old YOLO follows L2 error for class prediction, thus there is no normalization guarantee, and prediction boxes in the new one do not share the same confidence term $$P(object)$$. This tells the new version will produce more false positives when one attempts to dissect it. In fact, let's see how this would show up in practice.

For older version of YOLO, this is the result of dissecting the last layer:

![img]({{site.url}}/assets/person_old.jpg)

While this is what happen with newer version of YOLO. As can be seen, the image if filled with false positives. In this case they are all `person`s since PASCAL VOC dataset's classes distribution is heavily unbalanced. A quick statistics give approximately 9 times more `person` than any other classes.

![img]({{site.url}}/assets/person_new.jpg)

This gives interesting insights into YOLOv2, even though it prevent us from dissecting the layer. The case of YOLOv1 gives no guarantee on not false positive, even though it is directly trained against that, fine-tuning dissected YOLOv1 should be very quick to convergence since it specifically seek to minimize the false positive loss, given that the other types of loss is already in stationary points. 

However, before fine-tuning any thing, we'll do a quick analysis on what is gained on dissecting only the last layer: From original size `180MB`, new graph contains `164MB` of floating point numbers and virtually no increase in FPS at all. Well, the first approach is clearly no good, we need to cut out even more weights and thus, some training must be involved. No free lunch.

### A quick look at dropout layer

Throwing away a unit (or turning off its activation to any other unit) is something people have done with dropout and doing so is theoretically backed to be advantagous to generalization. Notice that switching off a unit $$j$$ corresponds to switching off the whole $$w_{:,j}$$ row of weight matrix.

We try to give this a relevant interpretation. If one is using `sigmoid` as the activation, it can be interpreted as the unit is on or off, indicating the presence of some feature in the image that is useful for the net's decision. In case of convolutional layer, each feature map is the result of applying a single filter (other names: kernel/**feature detector**) across the image's spatial dimension, this tells each feature map detects **the same** type of feature. 

This motivates reduction of number of feature each convolution layer is detecting. In other words, if the kernel of a convolution is $$k \in \mathbb{R}^{k \times k \times c \times n}$$, we'll try to reduce $$n$$. Note that later layers in a convnet will normally detects higher level representation from features of lower layers. For example, the first few layers may detects edges and blob, which was then used by later layers to detects feature that is useful for differentiating a `person` and a `pottedplant` (does the object have nose? or have leaves?). That is why reduction in higher level layers are what we aim at instead of lower ones.

The next question to ask is, how do we decide which feature to drop off?

### Profiling the activations

Neurons from certain parts of the brain are excited when receive particular stimuli. This analogy applies for deep neural net in the sense of activation's norm. If we constantly feed images of `tvmonitor` to YOLO, we would expect a certain region of activation to be significantly stronger than for some other region. From this we can decide what features are relevant to detecting a `tvmonitor`, and which are not.

We can also do so jointly for all four of our office setting objects. With `YOLO-tiny` model, I set up two moving averages to keep track of the mean and variance for each feature map of all layers; while feeding the net images of *exclusively* tvmonitor/person/pottedplant/chair, i.e. no presence of `train`, `bottle`, `cat`, ... in the fed image.

There are 16,000 such images in PASCAL VOC dataset, and since the weights are not changing as in training, one epoch is enough for profiling all the moving averages. For each of the plot below, there are twelve subplot corresponds to twelve layers, the histogram of each is the histogram of the moving mean/variance of that layer's feature map's activation.

We first look at the mean and variance (in this order) profiles:

![img]({{site.url}}/assets/mean.png)

![img]({{site.url}}/assets/var.png)

There seems to be no distinct clusters in any histogram to decide which are the *more activated* features. This is not necessarily bad news since we are looking for *some outstanding features*, and what we found is that *the majority is average*; are not entirely contradicting things. However, we might not want to conclude without combining both of the statistics, for example, a big mean but spreaded variance tells us much less information than a small mean but concentrated distribution (small variance). The question is, how do we combine these two statistics in the most meaning full way?

We can assume the activation in each feature is normally distributed, then the probability of a zero activation given this distribution is a good measure of how likely this feature is an **irrelevant** one.

$$score(m, v) = - \log \mathcal{N}(0 | m, v) \propto \frac{m^2}{v} + \log {v}$$

Plotting the histograms for `score` results in:

![img]({{site.url}}/assets/score.png)

Again, the ideal situation where there are two clusters of low and high score is not here. Such a situation is desired since we can use a clustering algorithm of any sort and automatically decide the cut-off point. In this case though, I had to do it manually.

### Hand-picking good feature

The problem with hand-picking good features is that you want to include less and less features, without coming to the point of **underfitting** - the problem I did ran into during my first few trials, where I ambitiously reduce a `180MB` net to around `30MB`. Note that we can still possibly achieve this reduction without being underfit by **increasing** depth with a very thin model (this turns out to be a much better approach altogether, but is not the objective of my experiment).

Since I cannot automatically cluster the features, I simply picked the N highest features. The heuristics that works for me are:

- Keep the first few layers identical to the old ones, you do not want to throw away edge/blob detection.

- Since the class number is reduced 5 times, the ratio between kept and original number of features in each layer should be no less than `0.2`. Notice that if this ratio is `0.2` in two consecutive layers, the weight between them will be cut off 25 times, that would be a severe cut off.

Since I don't have access to GPU (poor me!), each experiment can be very expensive, so good practice is vital. Good practices learned along the way:

- Make sure to overfit a small data sample before start training.

- Run the original YOLO model to get an idea of how low the loss should be and set this to be your objective.

- Whenever the loss get stuck, take the current weight and overfit a small sample. If it can do this perfectly, then clearly the model is underfitting.

- Occasionally visualise the prediction and see what kind of mistake the model is making. In my case it was predicting almost all classes to be `person` due to heavily skewed data. When I gradually set the weight for class term in the loss objective higher, this mistake get less severe. Notice replicating other class's data to achieve balance will result in an unnatural distribution of training data. So I would advise against this.

And that's there for it. Good luck with your training.