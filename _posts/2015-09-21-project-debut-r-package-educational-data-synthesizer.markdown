---
published: true
title: EDMsyn - an R package that synthesizes educational data
---
### Intro

`edmsyn` is an [R](https://en.wikipedia.org/wiki/R_%28programming_language%29) package, the name is essentially Educational Data Synthesizer (originally it was the concatenation of _Educational Data Mining_ and _Synthetic_, not quite gramatically meaningful).

### What is synthesizing data?

Are you familiar with Data Mining? or Machine Learning, or Statistics? I would not delve into distinguishing these concepts, but would instead fearlessly throw a terrible generalization as follows: All you need to do in these fields of study are:

1. _Collect data_ (for `edmsyn` you collect data from educational context)
2. _Propose a model (and you are forced to choose a parameterised one)_
3. _Learn the parameters, test them on test data, report the performance of your model_

Synthesizing data in `edmsyn` takes an additional step: say you obtained a set of learnt parameters, you tweak them a little bit, and then generate new data from them, and finally call it synthetic data. There's that! 

### But what's good doing so? 

You may want to Google a bit to find that the answer is not a short one, or simply read [this paper](http://www.educationaldatamining.org/EDM2015/uploads/papers/paper_139.pdf) from Behzad Beheshti (my colleague at [polymtl.ca](http://www.polymtl.ca) - now already got his PhD) to see _one_ application of synthetic data.

### What's special about this R package?

Yes, obviously there are several R packages that serve the purpose of learning parameters from different models, generate them under a bunch of different options (including ones that I don't really understand). These packages are in fact very specialised, each of them go really deep into various aspects of a single model (or a class of models). How am I confident that `edmsyn` are going to do anything decently good?

In fact `edmsyn` serve something slightly different: it is useful when users want to study synthetic data under many different models. The package provides a framework that is really flexible: 

- You throw in data, then say the magic word (_SYNTHESIZE!_), and everything happen. Or,
- You throw in a bunch of parameters, then say the magic words (_GENERATE!_) and everything happen. 

A bunch of parameters as I mentioned few seconds ago is actually _not_ a simple concept. Let's say the data here is a matrix `A` of size \\( m \times n\\), with each entry being a real number between 0 and 1. If you throw in two numbers `m` and `n`, then the generating method can simply be as follows: generate \\( m \times n \\) numbers between 0 and 1, one by one arrage each of them into the result matrix. But what if you throw in `m` and a vector `v` of \\( n \\) real values, representing the expected value of \\( n \\) columns of `A`? Then things become a little complicated.

And as I mentioned above, all you have to do is saying the magic word. So basically `edmsyn` allow you to do either of the below: 

{% highlight r %}
edmsyn::generate(model = 'A', m = 4, n = 3)
edmsyn::generate(model = 'A', m = 4, v = c(0.5, 0.5, 0.5))
{% endhighlight %}

See that depending on what is inputted, `edmsyn::generate` automatically figured out what to do! And don't forget that you are working across different models, so the following is okay too: 

```r
edmsyn::generate(model = 'B', m = 4, n = 3, p = 6)
edmsyn::generate(model = 'C', v = c(0.5, 0.5, 0.5), t = matrix(0,3,5))
```

### __context__: another magic word

See that models `A`, `B` and `C` are sharing some parameters? That is what happen in Educational Data Mining. Specifically the famous `Q` matrix, defining the relationship between items and skills, is being used everywhere (not literally, but close)! That is why `edmsyn` introduces a useful notion that becomes the building block of the whole framework. The new thing here is called __a context__. It makes all the illustrative code above even simpler (in other words, the first magic word become even less verbose!). Look at the code below to see how it works:

```r
context <- edmsyn::create.context(m = 4, n = 3, v = c(0.5,0.5,0.5), t = matrix(0,3,5))
# magic!
A <- edmsyn::generate('A', context)
B <- edmsyn::generate('B', context)
C <- edmsyn::generate('C', context)
```

Notice that `n` should be the length of `v`. So putting both of them into a single context is kinda redundant, they are _inclusive_! And guess what, `edmsyn` allows you to put in only `v`, `n` will be automatically inferred.

```r
context <- edmsyn::create.context(m = 4, v = c(0.5,0.5,0.5), t = matrix(0,3,5))
context <- edmsyn::generate('A', context) # fine!
```

To make it even better, this is also possible:

```r
context <- edmsyn::create.context(n = 3, t = matrix(0,3,5))
# recall that model C need v and t, but context only have n and t
context <- edmsyn::generate(model = 'C', context)
```

In this case, `edmsyn` understands that it need to do an intermediate step: generate `v` from `n`, before using the resulting `v` and `t` to generate `C`. All of that happens without you having to specifically tell the package what to do. 

### Sufficiency and Consistency

What if you sneakily (or accidentally by some kind of bug - very likely when it comes to big complicated applications) throw in a single context something like this: `edmsyn::create.context(n = 4, v = c(0.5, 0.5, 0.5))`? You will be caught for inputting `v` with an incompatible length to `n`. The situation is called __inconsistent context__ and ofcourse will be caught by function `edmsyn::create.context()`

Simpler, if you do something like this `edmsyn::generate(model = 'A', edmsyn::generate.context(m = 3))`. You will be caught for not giving enough information with respect to model `A`. This is called __insufficient context__ and will be caught by function `edmsyn::generate()`.

When you are working across many models and contexts, the two essential conditions are being _sufficient_ and _consistent_. They are ensured and automatically resolved whenever possible by `edmsyn`

### Okay I got it, `edmsyn` is trying to be a flexible, shared interface to various specialised EDM package.

You are god damn right. But there is even more as I am working on `edmsyn` towards the second version of it. Right now if you are interested in using it right away (and are familiar to EDM literature) jump right to [the vignette](https://github.com/thtrieu/edmsyn/blob/master/vignettes/edmsyn.pdf) for a thorough tutorial on using it (you will find that the package is a little bit different from what I explained above, but the spirit is still there).

And of course to install it:

{% highlight R %}
library(devtools)
install_github('thtrieu/edmsyn','thtrieu')
{% endhighlight %}

Good luck!