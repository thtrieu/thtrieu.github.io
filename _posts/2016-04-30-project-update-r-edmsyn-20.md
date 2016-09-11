---
published: true
title: Educational Data Synthesizer - edmsyn the second part
---

### Intro
This is the follow-up post on my R package `edmsyn`. See the debut [here](http://thtrieu.github.io/2015/09/21/project-debut-r-package-educational-data-synthesizer). This is also to mark that a working commit of `edmsyn 2.0` is published. But first, let me real quick just admit something extremely awkward: the version number `2.0` right there may have been `5.0` or `6.0` if I figure out the way to change it earlier (yeah, you just jump right into the package description and change the freakin number, but it took me until now to do so). But hey, this turned out to be a blessing in disguise, no software should upgrade itself that fast unless it did substantially evolve, which is not the case for `edmsyn`, so `2.0` is just what I need.

For a fun read on some interesting things I learnt and solved during this build, go [here](http://thtrieu.github.io/2016/03/31/r-environment-and-scope-modify-list-of-funcs). Must say, the building process for this is probably amongst the most fun I had for a recent while. 

### The addition
Earlier in the debut post I wrote about working the package to beyond the point of being merely an interface to various specialised `R` packages. So what is it that I added into the source code to make it becomes more than just an interface? The answer is: the package is now not just a window for users to efficiently communicate with various packages at once, it also allow users to modify into the internal structure as well as adding their own content into it. And of course, the __two magic words__, what makes `edmsyn` what it is, (from the dedut post) will work just fine on this new content.

Here is a relevant quote from the formal documentation:
> `edmsyn` comes with a pre-defined set of parameters and relationships amongst themselves. These relationships are rules that help `edmsyn` derive values for one or more parameters from some others. Specifically, these rules are represented as functions in the package. For example, a function that takes two integers and randomly produce a binary matrix with its dimensions being the two inputted integers can be used as the rule to derive `M` (skill mastery matrix) from `students` and `concepts`. Rules that derive value for "data parameter" such as `poks`, `dina`, or `dino` encode POKS, DINA, DINO models respectively. Similarly, rules that derive value in the opposite direction encode the corresponding learning algorithms.

> The choice of built-in parameters, models, and learning algorithms is made independently at the time of development for `edmsyn` and thus, it may or may not satisfy users' need. That is why `edmsyn` also comes with a set of tools that allow its users to re-define all these components to the extent of building a whole new set of parameters and models, while still retaining all the original benefits that it offers.

Yes, at the end of the day, all attempts are made for the package to become more practically useful to users. Being more flexible and change-welcoming is probably the number one principle.

### Can we just now do something already?

Alright of course that is what we are going to do now. But everything takes time, you first need to get a refresh with the __actual__ syntax of `edmsyn` before going any further, what I introduced in the debut is not exactly the one built in the package. In fact, what was actually built is not that different except for some function/variable names. See below

```r
library(edmsyn)
# 1. To assemble a context
p <- pars(students = 15, items = 20)
class(p)
## [1] "context"
print(p)
## Activated information in the context:
## [1] "items"        "students"     "default.vals"

# 2. Magic word number 1: GENERATE!
poks.data <- gen(model = "poks", p)

# 3. Magic word number 2: SYNTHESIZE!
poks.syn <- syn(model = "poks", data = poks.data$poks)
```

Also, in `gen` and `syn`, you have the option of specifying argument `n` to a postive integer bigger than 1 if you want more than one repetition of the generating/synthesizing process. Setting `progress = TRUE` also print out the process of generating data that `gen` and `syn` followed to finish your order.

That's all! Of course there are much more to the capacity of this package but for an introduction, these are just enough. If you insist on knowing all the details, see 1st vignette [here](https://github.com/thtrieu/edmsyn/blob/master/vignettes/edmsyn.pdf). Now that you are familiar with the basic syntax, let's move on making a toy model and play around with it!

### A toy model

For the purpose of illustration, `toy` will operates on some of the built-in parameter of `edmsyn`, so I will now briefly go through each of them so that you can follow on to later sections.

- `concepts` and `students` are positive integer parameters. Never mind what they really are.

- `min.it.per.tree` is also a positive integer parameter, it has a default value of 1

- `M` is a binary matrix of size `concepts` \\( \times \\) `students`

- `default.vals` is where the package store all default values, for example: `default.vals$min.it.per.tree` has the value of 1. Note that not all parameters have a default value.

Okay, so now here is an outline of what is added to `edmsyn` by this new model (named `toy`):

- a root integer parameter named `foo`

- an integer parameter named `lower.foo` being the strict lower bound of `foo` (i.e. `foo` must be greater than `lower.foo`), `lower.foo` have the default value of 1.

- an integer parameter named `upper.foo` being the upper bound of `foo` (i.e. `foo` must be less than or equal to `upper.foo`), `upper.foo` have the default value equal to the sum of default value for `min.it.per.tree` and `concepts`.

- `bar`, a matrix with dimension (`foo`,`concepts`), its entries being real numbers between 0 and 1.

- data node of this model (named `toy`) is a list with two components: the first one is a matrix obtained from the rounded multiplication of `foo` and `M`, the second is the number of concepts

Now we are going to add all these parameters and relationships between them into the structure. I call this internal structure a `tree` and thus, functions that allow you to do so will have names starting with `edmtree`. Base on the specific task that each of them are trying to achieve, these functions will have different name extensions, like `edmtree.add`, `edmtree.replace`, `edmtree.remove`.

But first let's gain some background about the internal representation of a parameter within the structure before messing up with them. Let's just now fetch a random built-in parameter, say `M`, from the structure and investigate it.

```r
M.node <- edmtree.fetch('M')
class(M.node)
## [1] "list"
names(M.node)
## [1] "tell"   "gen"    "f.tell" "f.gen"
```

So, the representation of `M` is a list of four components. The first one, `tell`, is a set of names of parameters that will receive information if the value of `M` is known. The third component, `f.tell`, is the function to derive those values from `M`. Let's have a look (in the mean time, review your knowledge about `M`, `students` and `concepts`)

```r
M.node$tell
## [1] "concepts"    "students"

M.node$f.tell
## function (x) 
## {
##     list(nrow(x), ncol(x))
## }
## <environment: 0x4080c70>
```

The second component, `gen`, is a list of generating methods for `M`, each methods is actually a set of names of parameters from which value of `M` will be derived. Like `f.tell`, `f.gen` is a list of functions correspond to each generating method in `gen`.

```r
M.node$gen
## [[1]]
## [1] "S"
## 
## [[2]]
## [1] "students"    "skill.space" "skill.dist" 
## 
## [[3]]
## [1] "students"    "concept.exp"
```

So, in this example, `edmsyn` knows that there are three different methods to reach `M`: either using (`S`), (`students`,`skill.space`,`skill.dist`), or (`students`,`concept.exp`). Now it is straightforward from the definition of `f.gen` that it must be a list of three components, each being a function. The first one takes `S` as input and output `M`, the second takes `students`, `skill.space`, and `skill.dist` as input, and so on.

So that's it! you are now very well equipped to move on slaying `toy`. Ready?

### Adding `toy`

```r
# foo is a root node, with no default values
edmtree.add('foo', integer = TRUE)
## 'foo' appears to be a root node
## 'foo' appears to have no default initialization
edmtree.add('lower.foo', integer = TRUE,
            tell = 'foo', f.tell = less.strict,
            gen = 'default.vals', f.gen = 1)
## 'lower.foo' appears to have a constant default value
```
`less.strict` is a special function provided by edmsyn for cases when you want to tell the structure that `lower.foo` should be strictly less than `foo`. Alternatively, `edmtree.add.tell('foo', tell = 'lower.foo', f.tell = greater.strict)` gives the same effect. There are four such special functions recognised by `edmsyn`: `less.equal`, `less.strict`, `greater.equal`, and `greater.strict`. 

The presence of these four functions highlighted the fact that inferring information in `edmsyn` is not solely inferring values, but can also be inferring different aspects of this value, namely the bound of them in this case.

```r
# Now add upper.foo
edmtree.add('upper.foo', integer = TRUE,
            gen = c('default.vals', 'concepts'),
            f.gen = function(default.vals, concepts){
              return(default.vals$min.it.per.tree + concepts)
            })
## 'upper.foo' appears to be a root node
## 'upper.foo' appears to have a default value that relies on at least one run-time values
# Another use of special bound function
edmtree.add.tell('upper.foo', 'concepts', function(upper.foo){
  list(greater.equal(upper.foo - default()$min.it.per.tree))
})
## 'upper.foo' appears to have a default value that relies on at least one run-time values
# Instead of upper.foo telling the bound of foo,
# we will do it in the opposite direction,
# just for the purpose of illustration
edmtree.add.tell('foo', tell = 'upper.foo', f.tell = less.equal)
## 'foo' appears to have no default initialization
# Now since lower.foo and upper.foo are both presented in the structure
# it's time to add a generating method for foo
edmtree.add.gen('foo', gen.method = c('lower.foo', 'upper.foo'),
                f.gen.method = function(lower.foo, upper.foo){
                  sample((lower.foo+1) : upper.foo, 1)
                })
# add bar
edmtree.add('bar', gen = c('foo', 'concepts'),
            f.gen = function(foo, concepts){
              matrix(runif(foo * concepts), foo, concepts)
            })
## 'bar' appears to be a root node
# dimensions of bar are foo and concepts
edmtree.add.tell('bar', tell = c('foo', 'concepts'),
                 f.tell = function(bar){
                   list(nrow(bar), ncol(bar))
                 })
```
Note that it is okay not to add the `tell` component for `bar`, (in fact, it is okay to skip defining `tell` and `f.tell` in _every_ parameter, your application will still run just fine as long as the rest is properly designed). However doing so will limit the capability of `edmsyn` to recognise conflicts (__consistency__, remember?). For example, `pars(bar = matrix(0, 3, 5), concepts = 4)` will not raise the conflict between 4 and 5 if `bar$tell` does not include the inference for `concepts`. Adding `tell` and `f.tell` is a good practice if you want to add more debugging power to a big and complicated application.

```r
# to make the model a little more sophisticated,
# we add another generating method for bar
edmtree.add.gen('bar', gen = c('M', 'foo'),
                f.gen = function(M, foo){
                  concepts = nrow(M)
                  matrix(runif(foo * concepts), foo, concepts)
                })
# finally, add the data node "toy"
edmtree.add('toy', data = TRUE,
            gen = c('bar','M'), f.gen = function(bar, M){
              list(R = round(bar %*% M), concepts = nrow(M))
            },
            tell = c('bar', 'M'), f.tell = function(toy){
              # Note that the following learning algorithm makes no sense
              # it is just for the purpose of illustration
              concepts = toy$concepts
              R = toy$R
              foo = nrow(R)
              students = ncol(R)
              bar = matrix(runif(foo * concepts), foo, concepts)
              M = matrix(sample(0:1, concepts * students, TRUE),
                         concepts, students)
              list(bar, M)
            })

# Check if ALL.MODELS includes "toy" (yes it does)
edmconst$ALL.MODELS
##  [1] "exp"     "irt"     "poks"    "dina"    "dino"    "lin.avg" "nmf.con"
##  [8] "nmf.dis" "nmf.com" "toy"
```

So that's it!  You have successfully installed `toy`, now feel free to use your spell (the magic words) whenever you wish to do so ;). Here I will demonstrate a range of test cases to see if the structure is able to do what we want it to do (i.e. generate data, detect inconsistency and insufficiency). Let's go for it now.

### Test the model

```r
# 1. Test the bounds
p <- pars(lower.foo = 3, foo = 3)
## Error in down.stream(new.pars): 'foo' violates bound suggested by 'lower.foo'
p <- pars(foo = 4, upper.foo = 3)
## Error in down.stream(new.pars): 'upper.foo' violates bound suggested by 'foo'
# This one requires reasoning to detect
# Thus error is not raised immediately
p <- pars(lower.foo = 3, upper.foo = 2)
# But nevertheless, when p go into use, it immediately fails
get.par('foo', p)
## Error in down.stream(new.pars): 'upper.foo' violates bound suggested by 'foo'
p <- pars(upper.foo = 5, concepts = 5)
## Error in down.stream(new.pars): 'concepts' violates bound suggested by 'upper.foo'
# 2. Test foo$gen
get.par('foo', pars())
## Error in up.stream(target, pars, FALSE, progress): Cannot reach 'foo' since 'concepts' is missing
p <- pars(p, upper.foo = 15)
get.par('foo', p)
## $value
## [1] 14
## 
## $context
## Activated information in the context:
## [1] "lower.foo"    "upper.foo"    "default.vals" "foo"
p <- pars(concepts = 5)
get.par('foo', p, progress = TRUE)
## Generate foo from c("lower.foo", "upper.foo")
## Generate lower.foo from default.vals
## Generate upper.foo from c("default.vals", "concepts")
## $value
## [1] 3
## 
## $context
## Activated information in the context:
## [1] "concepts"     "default.vals" "lower.foo"    "upper.foo"   
## [5] "foo"
p <- pars(M = M)
p <- get.par('foo', p, progress = TRUE)
## Generate foo from c("lower.foo", "upper.foo")
## Generate lower.foo from default.vals
## Generate upper.foo from c("default.vals", "concepts")
print(p)
## $value
## [1] 2
## 
## $context
## Activated information in the context:
## [1] "M"            "default.vals" "concepts"     "concept.exp" 
## [5] "students"     "lower.foo"    "upper.foo"    "foo"
# 3. Test bar
get.par('bar', pars())
## Error in up.stream(target, pars, FALSE, progress): Cannot reach 'bar' since 'concepts' is missing
get.par('bar', pars(upper.foo = 15))
## Error in up.stream(target, pars, FALSE, progress): Cannot reach 'bar' since 'concepts' is missing
get.par('bar', pars(lower.foo = 3, concepts = 5), progress = TRUE)
## Generate bar from c("foo", "concepts")
## Generate foo from c("lower.foo", "upper.foo")
## Generate upper.foo from c("default.vals", "concepts")
## $value
##            [,1]      [,2]      [,3]      [,4]       [,5]
## [1,] 0.91478540 0.7967258 0.9820101 0.7482440 0.35750742
## [2,] 0.02396951 0.4519412 0.1814680 0.8105961 0.01884629
## [3,] 0.61441708 0.8048237 0.4863431 0.8290877 0.76060380
## [4,] 0.42642887 0.9406059 0.4413696 0.5245509 0.36794982
## 
## $context
## Activated information in the context:
## [1] "concepts"     "lower.foo"    "default.vals" "upper.foo"   
## [5] "foo"          "bar"
get.par('bar', pars(M = M), progress = TRUE)
## Generate bar from c("foo", "concepts")
## Generate foo from c("lower.foo", "upper.foo")
## Generate lower.foo from default.vals
## Generate upper.foo from c("default.vals", "concepts")
## $value
##           [,1]       [,2]      [,3]
## [1,] 0.6376158 0.41380815 0.3565500
## [2,] 0.1967733 0.90072361 0.6833823
## [3,] 0.1899659 0.08077038 0.6159836
## 
## $context
## Activated information in the context:
## [1] "M"            "default.vals" "concepts"     "concept.exp" 
## [5] "students"     "lower.foo"    "upper.foo"    "foo"         
## [9] "bar"
# 4. Test data
toys <- gen('toy', pars(M = M, bar = matrix(0, 3, 5)))
## Error in down.stream(new.pars): 'concepts' receives different values at once
toys <- gen('toy', pars(M = M, bar = matrix(1, 3, 3)),
            n = 2, progress = TRUE)
## Generate toy from c("bar", "M")
toys <- gen('toy', pars(students = 20, concepts = 4), 
            n = 3, progress = TRUE)
## Generate toy from c("bar", "M")
## Generate bar from c("foo", "concepts")
## Generate foo from c("lower.foo", "upper.foo")
## Generate lower.foo from default.vals
## Generate upper.foo from c("default.vals", "concepts")
## Generate M from c("students", "concept.exp")
## Generate concept.exp from concepts
toys <- gen('toy', pars(M = M), n = 3, progress = TRUE)
## Generate toy from c("bar", "M")
## Generate bar from c("M", "foo")
## Generate foo from c("lower.foo", "upper.foo")
## Generate lower.foo from default.vals
## Generate upper.foo from c("default.vals", "concepts")
toys.syn <- syn('toy', toys[[2]]$toy,
                keep.pars = c("foo","concept.exp"),
                students = 12, n = 3, progress = TRUE)
## Learning by 'toy' ...
## Generate toy from c("bar", "M")
## Generate bar from c("foo", "concepts")
## Generate M from c("students", "concept.exp")
```

### You have not seen everything

See, `edmtree.add` is all that we used in the above illustration. There are much more to that as mentioned earlier: `edmtree.replace`, `edmtree.remove`, and even `edmtree.dump`, `edmtree.load`, `edmtree.clear` that helps you save, load and remove the whole current tree (big deal, the built-in tree has 62 parameters, hundreds of connections, 11 models!). These are covered in detailed in the 2nd vignette [here](https://github.com/thtrieu/edmsyn/blob/master/vignettes/advancedVignette.pdf). 

I assume now that you've got everything you need to play around with the tree. Whenever in trouble, simply spell `edmtree.load()` to reverse everything back to the built-in tree, or even `edmtree.clear()` to wipe out everything and start out from scratch as you please (betcha like this one if EDM is a complete new thing to you). If these are too heavy operations, again there are intermediate, lighter operations like `emdtree.replace` and `edmtree.remove` to modify a part of the tree, or even a part of a single node. And they are very well documented in the 2nd vignette of `edmsyn`.

Good luck!