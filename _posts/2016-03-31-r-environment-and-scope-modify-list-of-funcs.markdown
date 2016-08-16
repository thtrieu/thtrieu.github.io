---
published: true
title: Scopes, environments, locked bindings, modify list of functions
---

### Intro
This post will talk about two extremely awesome things that I've encountered while building the second part of [edmsyn](http://thtrieu.github.io/2015/09/21/project-debut-r-package-educational-data-synthesizer). The first one came across as a technical challenge, but then become the pointer to some advanced materials in R that I read, which then made me even more appreciative of this language. The second one is also an interesting technical problem and was solved by an equally interesting solution. 

Okay enough talking, let's just jump right into them now will me?

### Locked bindings in `R`
This is something you will definitely encounter while building an `R` package for the first time. Say you declare a variable named `STRUCTURE` (this is an actual variable in `edmsyn` that caused my trouble, but other than that, it is just a random name) of class `list` (the trouble to be discussed is not limited to only objects of class `list`, again, this is simply an example so I randomly choose `list`) inside your package, this way it is available to all internal scopes (`function`s). What to expect is, these functions, being exported to user's hand, will act as methods that allow users to access/modify `STRUCTURE` as a private attribute of your class (package).

Unfortunately that is not the case. Let's set up a toy package here:

```r
# the "private attribute"
STRUCTURE <- list(a = 1, b = 2, c = 3)

# The first "public method"
#' @export
query <- function(name){
    STRUCTURE[[name]]
}

# The second "public method"
#' @export
modify <- function(name, val){
    STRUCTURE[[name]] <- val 
}
```

And then use it

```r
my.package::query(name = 'a')
##  [1] 1
my.package::modify(name = 'a', val = 2)
my.package::query(name = 'a')
##  [1] 1
# what?
```

Did scoping rules in `R` broken or what? Nope, in fact the binding for your `STRUCTURE` is locked and thus, that `STRUCTURE` in the second "public method" you defined is just a local one, it is there the second you assign it a value and then gone (I mean, "puuufff").

So what if you force this operation by the famous operator `<<-` to avoid such local assignment? Unfortunately the answer is still resoundingly __No__, this time `R` will not go silently as before but directly throw an error indicating that `STRUCTURE` is locked. So now what would you do?

Some research of course! And this is [the place to go](http://adv-r.had.co.nz/Environments.html). Here I will just proceed directly to the solution: instead of using `STRUCTURE` as a list containing value with names `a`, `b` and `c`; let's make it __an explicit environment__ containing bindings between names `a`, `b`, `c` and their values. This way, the assignemnt `STRUCTURE[[name]] <- val` becomes rebinding a binding inside `STRUCTURE`, not a binding inside the package environment anymore (which is locked). The cool thing here is that you are allowed to access and rebind elements of an environment exactly the way you do it with a list (woohoo!). And there, you are now good to go!

```r
# the "private attributes"
STRUCTURE <- new.env() 
STRUCTURE$a <- 1
STRUCTURE$b <- 2
STRUCTURE$c <- 3

# Then define the two "public methods" 
# identical to what you did before ;)
#' @export
query <- function(name){
    STRUCTURE[[name]]
}
#' @export
modify <- function(name, val){
    STRUCTURE[[name]] <- val 
}
```

In `edmsyn`, I set up a whole bunch of "private" constants being lists. They all work just fine until I move on designing `edmsyn 2.0`, where users have the right to modify into the internal structure of the package. Guess what? `locked-binding` errors appear everywhere when I started to test a few new features by `Rmarkdown`. The next few days are wholely devoted to converting lists into environments, and a long lists of other objects that will be much better off being environments. Now the package looks much more (superfically) advanced than it used to be with "environmental variables" all over the place.

Excited about enviroments? Hold on, the best is yet to come

### Modifying a list of functions in `R` and `Python`

I will use `R` to illustrate this problem, but the solution is applicable to `Python` because they have similar scoping rule. 

#### Why at all?
As mentioned earlier, the new package allows modifying the internal structure of its. This includes modifying functions (existing ones). The second reason for this is, when users install their list of functions into the structure, these functions need to be modified, specifically they need to be wrapped by several layers, for debugging reasons (correct number of arguments, correct output format) and for them to fit in perfectly with other existing members of the family.

#### Illustrative problem
Let's first set up something

```r
modifier <- function(list.of.fun){
    # list.of.fun is a list of functions
    # TODO: return a list of functions (named lfun)
    # so that lfun[[i]] receives whatever
    # list.of.fun[[i]] receives, and returns whatever 
    # list.of.fun[[i]] returns plus 1
}
```
Easy isn't it? Let's jump right into the (wrong) solution now

```r
modifier <- function(list.of.fun){
    lfun <- list()
    for (i in 1:length(list.of.fun)){
        lfun <- append(lfun, list(function(...){
            list.of.fun[[i]](...) + 1
        }))
    }
    lfun
}
```

__side note from the future:__ there is a simple solution to this problem using some built-in loop of `R` (see the last section __update__ of this post), but at the time I was just blind-folded to see it for some reasons. Nevertheless, let's just go on with the current train of thought because it is still useful and conceptually interesting.

Great! Now let's test our beloved `modifier`

```r
f.1 <- function(x) {x + 1}
f.2 <- function(x) {x * 2}
f.l <- modifier(list(f.1, f.2))
f.l[[2]](2) # Should be 2 * 2 + 1 = 5
##  [1] 5
f.l[[1]](2) # Should be 2 + 1 + 1 = 4
##  [1] 5
# what?
```

What did I do wrong? You may have guessed it correctly, but let's first print out the content of our modified list

```r
print(f.l)
##  [[1]]
##  function (...) 
##  {
##      list.of.fun[[i]](...) + 1
##  }
##  <environment: 0x3fd45d0>

##  [[2]]
##  function (...) 
##  {
##      list.of.fun[[i]](...) + 1
##  }
##  <environment: 0x3fd45d0>
```

It is reasonable that the printed content of the first and second element of `f.l` are identical, because that is how we set them up. The thing we expect to make the difference between these two is that little index `i` inside the body of each of them. But apparently it is making no difference at all. 

Notice those lines `<environment: 0x3fd45d0>` appears at the end of the two printed functions? They both refering to the __enclosing environment__, and the twins share this same __enclosing environment__, which is in fact the environment inside `modifier`. At this point, one may realise that `i` also belong to that same environment, which is also the reason why the value of `i` inside each of the twins is not a separate one, this way both of the two modified functions produce identical results. Specifically, this value of `i` is the value __after__ the loop inside `modifier` is executed and thus always equal to \\( 2 \\) after the last twin was born. 

So how do we create, for each function of the list, a separate `i` that is trapped exclusively within the __internal environment__ of that function? Or maybe, `i` is trapped to the __enclosing environment__ of that function, but that __enclosing environment__ is not shared with any other member of the list, in other words, a series of exclusive enclosing environments? Well I guess you got the idea now: in order to create a __series of environments with controllable length__, the ancient technique we are talking about here is __recursion__. Here's the final solution:

```r
modifier <- function(list.of.fun){
    copy <- list.of.fun
    fixer <- function(i){ # Resursive function
        if (i > length(copy)) return()
        copy[[i]] <<- function(...) {
            list.of.fun[[i]](...) + 1
        }
        fixer(i + 1)
    }
    fixer(1)
    copy
}

copy[[1]](2)
##  [1] 4
copy[[2]](2)
##  [1] 5
```

`fixer`s are exactly the exclusive enclosing environments we were talking about. If your list of functions to be modified is not too big to reach stack overflow, then this solution is simply brilliant, isn't it? No? okay =(

__Update (6th May 2016).__ In `R` you have the magical `lapply`, so the following code would do just fine. With `Python`, however, there is no such `apply` functions, you may have to resort to the solution above.

```r
modifier <- function(list.of.fun){
  lapply(list.of.fun, function(l){
    function(...){
      l(...) + 1
    }
  })
}
```

