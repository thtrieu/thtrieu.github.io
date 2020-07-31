---
title: Linear Algebra Monologue
---



<script src="/assets/js/linear_algebra/lib.js"></script>

Sunday morning's breezes. Quy nhon, a quiet small town by the ocean.
When I was lazily sipping my favourite coffee, I noticed a group of high school students discussing some Linear Algebra stuff, maybe their homework. At that second, my mind was instantly push back to my highschool life, and definitely, these Algebra stuff.

Later then, I figure out that Linear Algebra is actually a story about one thing: "vector".

So, let me tell you that story, in hope that there're maybe some helps in case you find yourself in the same situation as mine.

<!-- In a busy coffee shop, two regular coffee buddies are chatting away on fun ideas. 

*"Linear Algebra?"* - said *Italica*, a student in Design who recently acquired an appetite for pretty illustrations of Math concepts.

"Yes. Linear Algebra is a story about vectors." - Regan, a Machine Learning engineer, sipping her favourite coffee with condensed milk.

*"I like stories. How does this one start?"*
 -->

## Vectors


<style type="text/css">
.js {
  font-size: 12.5;
  color: #696969;
  text-align: center-justify;
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 16px;
  top: -10px;
  left: 0px;
}

.switch.show {
  width: 52px;
  top: -8.5px;
}

.switch input { 
  opacity: 0;
  width: 0;
  height: 0;
  display: inline;
}

.slider {
  position: absolute;
  display: inline-block;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  -webkit-transition: .4s;
  transition: .4s;
}

.slider:before {
  position: absolute;
  content: "";
  height: 12px;
  width: 12px;
  left: 2px;
  bottom: 2px;
  background-color: white;
  -webkit-transition: .4s;
  transition: .4s;
}

input:checked + .slider {
  background-color: #2196F3;
}

input:focus + .slider {
  box-shadow: 0 0 1px #2196F3;
}

input:checked + .slider:before {
  -webkit-transform: translateX(24px);
  -ms-transform: translateX(24px);
  transform: translateX(24px);
}

/* Rounded sliders */
.slider.round {
  border-radius: 34px;
}

.slider.round:before {
  border-radius: 50%;
}

.slider:after
{
 content:'2D';
 font-weight: bold;
 color: white;
 display: block;
 position: absolute;
 transform: translate(-50%,-50%);
 top: 50%;
 left: 65%;
 font-size: 10px;
 font-family: Verdana, sans-serif;
}

input:checked + .slider:after
{  
  content:'3D';
  left: 35%;
}

input:checked + .slider.show:before {
  -webkit-transform: translateX(36px);
  -ms-transform: translateX(36px);
  transform: translateX(36px);
}

.slider.show:after {
  content: 'Show';
  font-weight: bold;
  left: 63%;
  font-size: 12px;
  font-family: Georgia, sans-serif;
}

input:checked + .slider.show:after
{  
  content:'Hide';
}

</style>

With the main character - vectors. Let's actually see them:

<center class='js'>
<svg width="300" height="250" id="svg_point_cloud"></svg>
<br/> 
Drag or <button id='but_point_cloud'>shuffle</button>
</center>

<script src="/assets/js/linear_algebra/point_cloud.js">
</script>

<script>
d3.selectAll('#but_point_cloud')
  .on('click', point_cloud.init)
</script>


<!-- *OK, so I assume each dot is a vector?*
 -->
<!-- Yeah, more  -->
Precisely, each vector is a point living in *space*. The space here can be 2-, 3-, or N- dimensional. To locate the vectors, we attach a coordinate system:

<!-- <center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_point_coord_lines'> <div class='slider'></div></label>
  <br/>
<svg width="600" height="280" id="svg_point_coord_lines"></svg>
<br/> 
Drag or <button id='init_point_coord_lines'>shuffle</button>
</center>

<script src="/assets/js/linear_algebra/point_coord_lines2d.js">
</script>
<script src="/assets/js/linear_algebra/point_coord_lines.js">
</script>

<script>

draw_on_svg('point_coord_lines',
            point_coord_lines2d,
            point_coord_lines)
</script>

*Do the coordinate axes here acting like rulers on a map?*

Yes! By measuring distance in different directions, this set of rulers (which we named $x, y,$ and $z$) can assign any point living in space a location as you suggested. The location here is a list of numbers, each is the measurement read from one ruler: -->

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_point_location'> <div class='slider'></div></label>
  <br/>
<svg width="600" height="280" id="svg_point_location"></svg>
<br/>
Rotate the space, drag individual point, or click
<button id='init_point_location'>shuffle</button>.
</center>

<script src="/assets/js/linear_algebra/point_location.js"></script>
<script src="/assets/js/linear_algebra/point_location2d.js"></script>
<script>
function draw_on_svg(svg_id, fn_2d, fn_3d=null) {
  let is_3d = false,
      data_2d = null,
      data_3d = null;
  fn_2d.select_svg('#svg_' + svg_id);
  fn_2d.init(0);

  d3.selectAll('#init_' + svg_id)
    .on('click', function(){
      if (is_3d) {
        fn_3d.init(1000);
      } else {
        fn_2d.init(1000);
      }
    });

  d3.selectAll('#switch_' + svg_id)
    .on('click', function(){
      is_3d = this.checked;
      if (is_3d) {
        data_2d = fn_2d.hasOwnProperty('data') ? fn_2d.data() : null;
        fn_3d.select_svg('#svg_' + svg_id);
        fn_3d.init(1000, data_2d);
      } else {
        data_3d = fn_3d.hasOwnProperty('data') ? fn_3d.data() : null;
        fn_2d.select_svg('#svg_' + svg_id);
        fn_2d.init(1000, data_3d);
      }
    })
}

draw_on_svg(
    'point_location',
    point_location2d, 
    point_location);
</script>

<!-- *Is this why sometimes people refer to a list of numbers $[x, y]$ as a "vector"?* -->
This is why sometimes people refer to a list of numbers $[x, y]$ as a "vector"! 
<!-- Exactly. -->
People also refer to a vector as an arrow pointing from the origin to the location. This arrow, the point living in a space, or the list of numbers are essentially 3 sides of the same coin. They are 3 different ways to refer to the same thing that we call "vector".

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_point_arrow_location'> <div class='slider'></div></label>
  <br/>
<svg width="600" height="280" id="svg_point_arrow_location"></svg>
<br/>
Rotate the space, move individual point, or click
<button id='init_point_arrow_location'>shuffle</button>.
</center>

<script src="/assets/js/linear_algebra/point_arrow_location2d.js"></script>
<script src="/assets/js/linear_algebra/point_arrow_location.js"></script>

<script>
draw_on_svg('point_arrow_location',
            point_arrow_location2d,
            point_arrow_location)
</script>

## Dot Product as Projection

<!-- *Right, so now what does a vector do?* -->
*So now what does a vector do?*

A vector itself does not do much. You start to have fun when there is more than one :) Dot product between two vectors is a simple and important concept. Below, you can see the dot product of two vectors $u$ and $v$, denoted $v^Tu$, is the **length of the projection** of $u$ onto $v$.


<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_dot_product_project'> <div class='slider'></div></label>
  <br/>
<svg width="600" height="280" id="svg_dot_product_project"></svg>
<br/>
Try dragging vector $u$, $v$, the whole space, or click
<button id='init_dot_product_project'>reset</button>.
<br/>
Can you make $v^Tu$ negative?
</center>

<script src="/assets/js/linear_algebra/dot_product_project2d.js"></script>
<script src="/assets/js/linear_algebra/dot_product_project.js"></script>
<script>
draw_on_svg('dot_product_project',
            dot_product_project2d,
            dot_product_project)
</script>

<!-- *It seems a negative projection indicate $u$ and $v$ are roughly opposite in direction? And why don't we just call it "projection" instead of "dot product"?* -->
*Obviously a negative projection indicate $u$ and $v$ are roughly opposite in direction. Then why don't we just call it "projection" instead of "dot product"?*

<!-- That's right. -->
The name "dot product" here stands for a very simple formula for this signed-projection. That is, we should take the product of corresponding coordinates between $u$ and $v$ and then add them up!

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_dot_product_formula'> <div class='slider'></div></label>
  <br/>
<svg width="600" height="250" id="svg_dot_product_formula"></svg>
<br/>
Try dragging vector $u$, $v$, the whole space, or click
<button id='init_dot_product_formula'>reset</button>.
</center>

<script src="/assets/js/linear_algebra/dot_product_formula2d.js"></script>
<script src="/assets/js/linear_algebra/dot_product_formula.js"></script>
<script>
draw_on_svg('dot_product_formula',
            dot_product_formula2d,
            dot_product_formula)
</script>

<!-- *Oh, that's surprisingly simple!* -->
That's surprisingly simple, right?
Indeed it is. Let's look at a very useful diagram for this formula. It represents the formula by showing $u$ and $v$ colliding into a single number (their dot product $v^Tu$).

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_dot_product_collide'> <div class='slider'></div></label>
  <br/>
<svg width="600" height="280" id="svg_dot_product_collide"></svg>
<br/>
Try dragging vector $u$, $v$, the whole space. Click
<button id='init_dot_product_collide'>reset</button> or <button id='but_dot_product_collide_compute'>compute $v^Tu$</button>.
</center>

<script src="/assets/js/linear_algebra/dot_product_collide2d.js"></script>
<script src="/assets/js/linear_algebra/dot_product_collide.js"></script>
<script>

d3.selectAll('#but_dot_product_collide_compute')
  .on('click', function(){
      let is_3d = d3.selectAll('#switch_dot_product_collide').node().checked;
      if (is_3d) {
        dot_product_collide.compute();
      } else {
        dot_product_collide2d.compute(); 
      }
  });

draw_on_svg('dot_product_collide',
            dot_product_collide2d,
            dot_product_collide);

</script>


*<!-- Looks like this diagram explains the notation $v^Tu$ very well: --> 
What this diagram explains here is simply just: $v^T$ is $v$ lying down, while $u$ is standing, and $v^Tu$ is the collision of $v^T$ and $u$.*

<!-- That's exactly what it is :) -->
The $^T$ operation here is called "transpose". Transposing flips the vector so it lies down. This diagram will become very helpful later on, so hang on to that for a little while.

<!-- *So since this operation is symmetric between $u$ and $v$, it should give the same result as projecting v onto u, i.e. $v^Tu = u^Tv$, right?* -->
*Since this operation is symmetric between $u$ and $v$, it should give the same result as projecting v onto u, i.e. $v^Tu = u^Tv$.*

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_dot_product_symmetric'> <div class='slider'></div></label>
  <br/>
<svg width="600" height="300" id="svg_dot_product_symmetric"></svg>
<br/>

Try dragging vector $u$, $v$, the whole space. Click
<button id='init_dot_product_symmetric'>reset</button> or <button id='but_dot_product_symmetric_swap'>swap $v^Tu \leftrightarrow v^Tu$</button>.
</center>

<script src="/assets/js/linear_algebra/dot_product_symmetric2d.js"></script>
<script src="/assets/js/linear_algebra/dot_product_symmetric.js"></script>
<script>

d3.selectAll('#but_dot_product_symmetric_swap')
  .on('click', function(){
      let is_3d = d3.selectAll('#switch_dot_product_symmetric').node().checked;
      if (is_3d) {
        dot_product_symmetric.swap();
        dot_product_symmetric2d.set_position(
            dot_product_symmetric.get_position());
      } else {
        dot_product_symmetric2d.swap(); 
        dot_product_symmetric.set_position(
            dot_product_symmetric2d.get_position());
      }
  });

draw_on_svg('dot_product_symmetric',
            dot_product_symmetric2d,
            dot_product_symmetric);

</script>

*But here, the illustration says projection of $u$ and $v$ onto each other isn't symmetric, although the colliding diagram is. So what's wrong?*

If that's what you're wondering about, you caught the flaw in my explanation!
This is because "Projection of $u$ onto $v$" is only half the picture of dot product. It is correct only when length of $v$ (denoted $\|v\|$) is 1 - which is what I set it to be so far. The correct formula 
here takes into account $|v|$ as well:

$$v^Tu = \left|v\right| \times \textrm{Projection of}\ u\ \textrm{onto}\ v$$

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_dot_product_correct'> <div class='slider'></div></label>
  <br/>
<svg width="600" height="280" id="svg_dot_product_correct"></svg>
<br/> 
Try stretching/rotating $v$, move $u$, or click
<button id='init_dot_product_correct'>reset</button>.
<br/>
Notice when $|v|=1$, $v^Tu$ coincides with the projection (shaded blue).
</center>

<script src="/assets/js/linear_algebra/dot_product_correct2d.js"></script>
<script src="/assets/js/linear_algebra/dot_product_correct.js"></script>
<script>
draw_on_svg('dot_product_correct',
            dot_product_correct2d,
            dot_product_correct);
</script>

So dot product not only projects $u$ onto $v$'s direction, it also scales the result by $\|v\|$. Now with this new interpretation, $v^Tu = u^Tv$ indeed!

<!-- = \textrm{Projection of}\ u\ \textrm{onto}\ v \times \textrm{length of}\ v = \textrm{Projection of}\ v\ \textrm{onto}\ u \times \textrm{length of}\ u$$ -->

<!-- *So, if $v$ is hold fixed and $u$ is moving around, then you are suggesting that dot product can be think of as a measurement of the projection of $u$ onto $v$ right?*

That's the right way to think about it :) The dot product here is simply the projection times a fixed constant (length of $v$). So to compare the projection of $u_1$ and $u_2$ onto $v$, we can just compare $u_1^Tv$ and $u_2^Tv$. -->

## Changing in persepective

<!-- *Okay, that makes sense. But why do we care about projections of vectors onto each other anyway?* -->
*Let say that makes sense to you all. Then why do we care about projections of vectors onto each other anyway?*

<!-- That's a good question. -->
One of the understanding here is that projecting $u$ onto $v$ is essentially applying a **change in perspective**.

In the current space and coordinate system, $u$ is a vector of certain location. The question is, what does $u$ look like in *another space and/or coordinate system?* In particular, how does $u$ look like from $v$'s perspective? One answer is that in $v$'s view, $u'=v^Tu$ is what $u$ looks like:


<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_v_perspective'> <div class='slider'></div></label>
  <br/>
<svg width="630" height="280" id="svg_v_perspective"></svg>
<br/> 
Try stretching/rotating $v$, move $u$, or click
<button id='init_v_perspective'>reset</button>.
<br/>
When does $u'$ stay the same?
</center>

<script src="/assets/js/linear_algebra/v_perspective2d.js"></script>
<script src="/assets/js/linear_algebra/v_perspective.js"></script>
<script>
draw_on_svg('v_perspective',
            v_perspective2d,
            v_perspective);
</script>

*So $u$ in $v$'s view is just one number and not a vector?*

<!-- Yes -->
It is<!--  just one number -->. However, a single number is still a vector: a 1-dimensional vector! And so, dot product achieves 1-dimensional change of perspective.

<!-- *Okay, from the above visualization, I can see why projecting to change view makes sense: the projection is larger when $u$ is more aligned to $v$, and shrinks to $0$ when the two are not aligned at all (perpendicular).* -->
*From the above visualization, you may see why projecting to change view makes sense: the projection is larger when $u$ is more aligned to $v$, and shrinks to $0$ when the two are not aligned at all (perpendicular).*

Bingo. **Changing in perspective** is the recurring theme in Linear Algebra. Much of Linear Algebra is concerned with studying how a certain object of interest (represented by a point) looks like under different perspectives (different spaces and coordinate systems).

*So what are the uses of changing perspective?*

There are many. Linear Algebra is truly ubiquitous! As a student in Machine Learning, I can vouch for its application in this field. For example, we want to find what changes of perspective that turn my cat, currently represented as pixels in a photo, into the text $\texttt{"my cat"}$.


<center class='js'>
<svg width="630" height="140" id="svg_cat_text_perspective"></svg>
<br/> 
An example of Image Captioning.
</center>

<script src="/assets/js/linear_algebra/cat_text_perspective.js"></script>

*<!-- So this is  -->
Have you ever think about how Facebook AI put captions on the photos uploaded to the site?*
This is the answer.
<!-- Yep. -->
Take Google Translate as another example. Linear Algebra is used to represent the changes of perspective that turn one sentence in one language to another.

<center class='js'>
<svg width="630" height="150" id="svg_translation_perspective"></svg>
<br/> 
An example of Translation.
</center>

<script src="/assets/js/linear_algebra/translation_perspective.js"></script>

<!-- *Okay, let me try to connect the dots here. -->
*So we should first somehow represent the photo as a vector $u$, then we try to find $v$ such that $u$ in $v$'s view, $u'=v^T u$, is the number that represents the caption text*

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_cat_text'> <div class='slider'></div></label>
  <br/>
<svg width="630" height="280" id="svg_cat_text"></svg>
<br/> 
Try rotating $v$, the whole space, or click 
<button id='init_cat_text'>reset</button>.
<br/>
Can you find $v$ such that our image captioning AI says "your dog"?
</center>

<script src="/assets/js/linear_algebra/cat_text2d.js"></script>
<script src="/assets/js/linear_algebra/cat_text.js"></script>

<script>
draw_on_svg('cat_text',
            cat_text2d,
            cat_text);
</script>

That is the spirit!
Although realistically, a single number isn't the best way to represent texts, but we'll come to that soon. The devil is really in the detail: How do we represent photo/text as vectors? How do we figure out the appropriate $v$? And so on :)

<!-- Consider writing this tutorial. All the visualizations of 3D spaces done here will be displayed on a screen, a 2D surface. This requires a perspective change between the two spaces. The code that I wrote for the visualizations must therefore handle this change using Linear Algebra. More broadly, computer games in 3D or softwares that involve 3D manipulation rely heavily on this specific change to display stuff on 2D screens. -->

<!-- *Changing in perspective might not be all the reasons for Linear Algebra though. I found [this answer](https://math.stackexchange.com/a/256695) on Math Stack Exchange that says people approximate complex questions with Linear Algebra to get approximate answers.* -->

Further, reach for Chapter 10 of [Introduction to Linear Algebra](https://math.mit.edu/~gs/linearalgebra/) from Prof. Gilbert Strang. You'll find there a diverse list of Linear Algebra applications, from Graph Theory to Cryptography, Economics, and the Google's PageRank algorithm that runs at the heart of the search engine itself. 

*These simple ideas are central to so many powerful tech!
That's surprising, right?*

## The coordinate system

<!-- I know right? :) -->
For now, let's get back on track to our main discussion. Reducing $u$, living in a multi-dimensional space, to a single number $v^Tu$ is useful, but we want more. What people do is instead projecting $u$ on many different $v$'s and obtain many different views at once.


<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_many_perspective'> <div class='slider'></div></label>
  <br/>
<svg width="630" height="280" id="svg_many_perspective"></svg>
<br/> 
Here we hide the coordinate axes to simplify the figure.
<br/>
Try dragging $u$, $v_1$, $v_2$, the whole space, or click 
<button id='init_many_perspective'>reset</button>.
</center>

<script src="/assets/js/linear_algebra/many_perspective2d.js"></script>
<script src="/assets/js/linear_algebra/many_perspective.js"></script>
<script>
draw_on_svg('many_perspective',
            many_perspective2d,
            many_perspective);
</script>

*So we are just essentially getting many numbers at once <!-- right -->?*

Right, but there's more to it than that. Let's say we project $u$ onto three vectors $ \\{ v_1, v_2, v_3 \\} $, and thereby obtaining a list of numbers $[v^Tu_1, v^Tu_2, v^Tu_3]$. This list of numbers is itself a vector $u'$ as well:

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_multi_dim_change'> <div class='slider'></div></label>
  <br/>
<svg width="630" height="280" id="svg_multi_dim_change"></svg>
<br/> 
<label class='switch show'> <input type='checkbox' id='show_hide_proj'> <div class='slider show'></div></label> projection details.
<br/>
Here we sync the two coordinate systems for easy comparison between $u$ and $u'$.
<br/>
Try dragging $u$, {$v_1$, $v_2$, $v_3$}, the whole space, or click 
<button id='init_multi_dim_change'>reset</button>.
</center>

<script src="/assets/js/linear_algebra/multi_dim_change2d.js"></script>
<script src="/assets/js/linear_algebra/multi_dim_change.js"></script>
<script>
draw_on_svg('multi_dim_change',
            multi_dim_change2d,
            multi_dim_change);


d3.selectAll('#show_hide_proj')
  .on('click', function(){
      let show_proj = !this.checked;
      let is_3d = d3.selectAll('#switch_multi_dim_change').node().checked;
      multi_dim_change2d.set_show_proj(show_proj);
      multi_dim_change.set_show_proj(show_proj);
      if (is_3d) {
        multi_dim_change.replot();
      } else {
        multi_dim_change2d.replot();
      }
  });
</script>

<!-- *OK, this list of numbers is three different views of $u$ from three different $v$ vectors. But if $v_1 = v_2$, we are obtaining the same view twice. If $v_1$ and $v_2$ are almost aligned, the two views are also almost the same.*

*So I guess my question is, if we are taking more than one view, shouldn't we select $ \\{ v_1, v_2, v_3 \\} $ such that these views don't correlate with each other as much as possible?*

Absolutely. Setting aside what we really mean by "correlation", this set of vectors needs to be pair-wise perpendicular for the views to not correlate. For example, -->

<!-- *Interesting. -->
*This is like using the 3 number lines that represents the world view of $v_1, v_2,$ and $v_3$ as the three coordinate axes of the new space.*

<!-- Exactly! -->
<!-- So -->
Now, using $v_1, v_2, v_3$ and the dot product, we achieved the multi-dimensional change in perspective from one vector $u$, to another $u'$ in another space and coordinate.

Let's take a fun example. Let $v_1 = [1, 0, 0]$, $v_2 = [0, 1, 0]$, and $v_3 = [0, 0, 1]$. In this case, projecting $u$ on $ \\{ v_1, v_2, v_3 \\} $ will, surprise surprise, give you back $u$ itself.

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_default_basis'> <div class='slider'></div></label>
  <br/>
<svg width="630" height="280" id="svg_default_basis"></svg>
<br/> 
<label class='switch show'> <input type='checkbox' id='show_hide_proj_basis'> <div class='slider show'></div></label> projection details.
<br/>
Try dragging $u$, the whole space, or click 
<button id='init_default_basis'>reset</button>.
</center>

<script src="/assets/js/linear_algebra/default_basis2d.js"></script>
<script src="/assets/js/linear_algebra/default_basis.js"></script>
<script>
draw_on_svg('default_basis',
            default_basis2d,
            default_basis);

d3.selectAll('#show_hide_proj_basis')
  .on('click', function(){
      let show_proj = !this.checked;
      let is_3d = d3.selectAll('#switch_default_basis').node().checked;
      default_basis2d.set_show_proj(show_proj);
      default_basis.set_show_proj(show_proj);
      if (is_3d) {
        default_basis.replot();
      } else {
        default_basis2d.replot();
      }
  });
</script>

*Does it look like to you that $v_1, v_2, v_3$ as defined above is acting as the coordinate system: they are measuring $u$ in three perpendicular directions that coincide with the three coordinate axes?*

<!-- Nice observation! -->
It actually is.
With this observation, there is no longer need for coordinate systems. Instead, think of space as being "measured" by this set of vectors through dot products:

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_basis_measure'> <div class='slider'></div></label>
  <br/>
<svg width="630" height="280" id="svg_basis_measure"></svg>
<br/> 
<label class='switch show'> <input type='checkbox' id='show_hide_proj_measure'> <div class='slider show'></div></label> projection details.
<br/>
Try dragging $u$, $v_1$, $v_2$, $v_3$, the whole space, or click 
<button id='init_basis_measure'>reset</button>.
</center>

<script src="/assets/js/linear_algebra/basis_measure2d.js"></script>
<script src="/assets/js/linear_algebra/basis_measure.js"></script>
<script>
draw_on_svg('basis_measure',
            basis_measure2d,
            basis_measure);
d3.selectAll('#show_hide_proj_measure')
  .on('click', function(){
      let show_proj = !this.checked;
      let is_3d = d3.selectAll('#switch_basis_measure').node().checked;
      basis_measure2d.set_show_proj(show_proj);
      basis_measure.set_show_proj(show_proj);
      if (is_3d) {
        basis_measure.replot();
      } else {
        basis_measure2d.replot();
      }
  });
</script>
<!-- 
And so, there is no intrinsic coordinate to any vector, only its location relative to others. This simplified the whole picture because now there is coordinate system no more!

*In other words: this set of $v$ vectors and dot product are what give any vector living in space a coordinate?*

Yes,
 -->

Be aware that there can be many such sets besides $\\{[1, 0, 0], [0, 1, 0], [0, 0, 1]\\}$. For example, rotating this set by any angle and we will obtain another valid set acting as coordinate system. This time, $u'$ is no longer $u$ but something else:

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_basis_rotate'> <div class='slider'></div></label>
  <br/>
<svg width="630" height="280" id="svg_basis_rotate"></svg>
<br/>
Try dragging $u$, {$v_1$, $v_2$, $v_3$}, the whole space, or click <button id='init_basis_rotate'>reset</button>. 
<br/>
How does $u'$ move when {$v_1$, $v_2$, $v_3$} rotates?<br/>
Here we added a sphere outline to help with tracing the movement of $u'$.
</center>

<script src="/assets/js/linear_algebra/basis_rotate2d.js"></script>
<script src="/assets/js/linear_algebra/basis_rotate.js"></script>
<script>
draw_on_svg('basis_rotate',
            basis_rotate2d,
            basis_rotate);
</script>

<!-- *It looks like $u'$ is moving around in the same sphere that also contains $u$?* -->
*You may notice that it looks like $u'$ is moving around in the same sphere that also contains $u$.*
That is right.
We call such transformations with a very familiar and intuitive name: Rotation. 

It can be shown that for rotation to happen, each vector in $ \\{ v_1, v_2, v_3 \\} $ has to have a length of $1$ and any pair of them must be perpendicular - which is what the illustration is set up to be. People call such sets "orthonormal": "ortho" stands for orthogonal and "normal" stands for length of $1$.

## Matrix multiplication

*Okay, but what if the set $ \\{ v_1, v_2, v_3 \\} $ is not orthonormal?*

<!-- You have just asked --> Oh, that generally is *The Question* of Linear Algebra. Earlier we see that if $ \\{ v_1, v_2, v_3 \\} $ is orthonormal, the result $u'$ looks like $u$, except rotated by an angle. Let's extend this a bit by considering a simple case where the set $ \\{ v_1, v_2, v_3 \\} $ is only "ortho" but not "normal": 


<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_rotate_stretch'> <div class='slider'></div></label>
  <br/>
<svg width="630" height="280" id="svg_rotate_stretch"></svg>
<br/>
Try to move $u$, stretch/rotate {$v_1$, $v_2$, $v_3$}, the whole space, or click <button id='init_rotate_stretch'>reset</button>. 
<br/>
Notice now the sphere that contains $u'$ got stretched to an ellipsoid.
<br/>
Double-clicking any of the 3 axes in $u'$ space to hide them before trying to rotate/stretch $v$s.
</center>

<script src="/assets/js/linear_algebra/rotate_stretch2d.js"></script>

<script src="/assets/js/linear_algebra/ellipse_lib.js"></script>

<script src="/assets/js/linear_algebra/rotate_stretch.js"></script>
<script>
draw_on_svg('rotate_stretch',
            rotate_stretch2d,
            rotate_stretch);
</script>

This time, we can see that the transformation from $u$ to $u'$ is equivalent to two steps: **(1) rotating**, just like previously done, ignoring the lengths of $v$'s,
and then **(2) stretching** the space along each axis individually, according to the length of $ v_1, v_2, v_3 $.


*And by that, I am suggesting rotating and stretching are the two building blocks of all transformations done by dot-products, not just ortho(normal) ones*

That's maybe a very quick jump ahead, but <!-- totally accurate :) --><!-- W -->we'll soon see how this is the case.
<!-- , but first  -->
For now, let's take it slow and enjoy ourselves some nice visualizations. This time, the set $ \\{ v_1, v_2, v_3 \\} $  is allowed to be neither "ortho" nor "normal"
<!-- as you suggested: -->

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_general_transform'> <div class='slider'></div></label>
  <br/>
<svg width="630" height="280" id="svg_general_transform"></svg>
<br/>
Try dragging $u$, {$v_1$, $v_2$, $v_3$}, the whole space, or click <button id='init_general_transform'>reset</button>. 
<br/>
Notice now the sphere that contains $u'$ got stretched to an ellipsoid.
</center>

<script src="/assets/js/linear_algebra/general_transform2d.js"></script>
<script src="/assets/js/linear_algebra/general_transform.js"></script>
<script>
draw_on_svg('general_transform',
            general_transform2d,
            general_transform);
</script>


Notation wise, if we stack $ \\{ v_1, v_2, v_3 \\} $ horizontally into a rectangle of numbers that we called the matrix $V$, we have just invented the matrix-vector multiplication using the "colliding" diagram:

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_matrix_vector_multiply'> <div class='slider'></div></label>
  <br/>
<svg width="630" height="280" id="svg_matrix_vector_multiply"></svg>
<br/>
Try dragging $u$, $V$, the whole space, or click <button id='init_matrix_vector_multiply'>reset</button> or <button id='but_matrix_vector_multiply_compute'>compute</button>.
</center>

<script src="/assets/js/linear_algebra/matrix_vector_multiply.js"></script>
<script src="/assets/js/linear_algebra/matrix_vector_multiply2d.js"></script>
<script>
d3.selectAll('#but_matrix_vector_multiply_compute')
  .on('click', function(){
    let is_3d = d3.selectAll('#switch_matrix_vector_multiply').node().checked;
    if (is_3d){
      matrix_vector_multiply.compute();  
    } else {
      matrix_vector_multiply2d.compute();
    }
  });

draw_on_svg('matrix_vector_multiply',
            matrix_vector_multiply2d,
            matrix_vector_multiply);
</script>


Compactly written, $Vu = u'$.

And so, the meaning of matrix-vector multiplication is really just projecting a vector onto the matrix rows. Let's go ahead and simultaneously project a bunch of vectors $ \\{ u_1, u_2, u_3, u_4 \\} $ onto the same set $ \\{ v_1, v_2, v_3 \\} $:

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_matrices_multiply'> <div class='slider'></div></label>
  <br/>
<svg width="630" height="280" id="svg_matrices_multiply"></svg>
<br/>
Try dragging $U$, $V$, the whole space, or click <button id='init_matrices_multiply'>reset</button> or <button id='but_matrices_multiply_compute'>compute</button>.
</center>

<script src="/assets/js/linear_algebra/matrices_multiply.js"></script>
<script src="/assets/js/linear_algebra/matrices_multiply2d.js"></script>
<script>
d3.selectAll('#but_matrices_multiply_compute')
  .on('click', function(){
    let is_3d = d3.selectAll('#switch_matrices_multiply').node().checked;
    if (is_3d){
      matrices_multiply.compute();  
    } else {
      matrices_multiply2d.compute();
    }
  });

draw_on_svg('matrices_multiply',
            matrices_multiply2d,
            matrices_multiply);

</script>



<!-- And t  -->There it is, we reinvent the matrix-matrix multiplication: $VU = U'$.

<!-- *Ah, that's very neat.*  -->
*And so multiplying matrices is essentially looking at a bunch of vectors from a new perspective?*

Exactly. With matrix multiplication, we now have the power to look at vectors from many different perspectives. So far we have been transforming vectors in 3 dimensional space into another 3 dimensional space (and 2 to 2). Let's try something else:

<center class='js'>
<svg width="630" height="280" id="svg_transform_3d2d"></svg>
<br/>
Try dragging $u_1$, $u_2$, $u_3$, $v_1$, $v_2$, the whole space, or click 
<button id='init_transform_3d2d'>reset</button>.
</center>

<script src="/assets/js/linear_algebra/transform_3d2d.js"></script>
<script>
draw_on_svg('transform_3d2d',
            transform_3d2d);
</script>


Here we have just turned 3-dimensional vectors into 2-dimensional vectors. This is done by using only $v_1$ and $v_2$ to project $u$ onto, i.e., the matrix $V$ now has 2 rows and 3 collumns.

*In a reversed manner, if we use 3 vectors $v$ in 2-D spaces, will we be able to achieve 2D to 3D transformation <!-- right -->?*

Definitely yes, with $V$ of size $3$ rows $\times$ $2$ columns, denoted $V \in \mathbb{R}^{3\times 2}$:

<center class='js'>
<svg width="630" height="300" id="svg_transform_2d3d"></svg>
<br/>
Try dragging $u_1$, $u_2$, $u_3$, $v_1$, $v_2$, $v_3$ the whole space, or click 
<button id='init_transform_2d3d'>reset</button>.
</center>

<script src="/assets/js/linear_algebra/transform_2d3d.js"></script>
<script>
draw_on_svg('transform_2d3d',
            transform_2d3d);
</script>

Although, the resulting vectors will still be restricted on a 2-D surface embedded in 3-D space. We'll soon see how this is always the case very soon!

*Is there an underlying characteristic that makes all these transformations -done by dot product- different to other types of transformations?*

We can start studying the question by first looking at the one-dimensional case. In this case, matrix-vector multiplication is simply multiplying two numbers $\alpha x = y$. Let's look at how two equal line segments change under this transformation:

<!-- different line segments change in terms of their lengths.

<center class='js'>
  <br/>
<svg width="630" height="180" id="svg_scaled1d"></svg>
<br/>
Try dragging $\alpha$, or points on the $x$ ruler, or click 
<button id='init_scaled1d'>reset</button>.
</center>

<script src="/assets/js/linear_algebra/scaled1d.js"></script>
<script>
draw_on_svg('scaled1d',
            scaled1d);
</script>


*Their lengths got scaled up/down by the same factor $\alpha$, regardless of position and size.*

That's right. Equivalently speaking, any two segments equal in length **before** a transformation will still be equal in length **after** the transformation.  -->

<center class='js'>
  <br/>
<svg width="630" height="180" id="svg_scale_equivariance"></svg>
<br/>
Try dragging $\alpha$, or points on the $x$ ruler, or click 
<button id='init_scale_equivariance'>reset</button>.
</center>

<script src="/assets/js/linear_algebra/scale_equivariance.js"></script>
<script>
draw_on_svg('scale_equivariance',
            scale_equivariance);
</script>

*They are equal both before and after.*

This property translates to higher dimensions as well. If two chunks of space are equal before a matrix-vector multiplication, they are also equal after said multiplication:


<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_multidim_equivolume'> <div class='slider'></div></label>
  <br/>
<svg width="630" height="300" id="svg_multidim_equivolume"></svg>
<br/> 
When does the resulting boxes got squashed to zero in area/volume?
</center>

<script src="/assets/js/linear_algebra/multidim_equivolume2d.js"></script>
<script src="/assets/js/linear_algebra/multidim_equivolume.js"></script>
<script>
draw_on_svg('multidim_equivolume',
            multidim_equivolume2d,
            multidim_equivolume);
</script>

*In addition, the resulting boxes got squashed to zero when the $v$ vectors in 2-D lies on the same line (or in 3-D, $v$'s are all on the same surface).
You do not see that coming, right? <!-- It seems  -->*

<!-- Correct! -->
Again, we'll come to show how this is the case very soon. Note that this description is also quite general. It is applicable for transformations between different number of dimensions as well. For example, from equal boxes in 3-D we obtain equal polygons in 2-D:

<center class='js'>
<svg width="630" height="280" id="svg_equivolume_3d2d"></svg>
<br/>
Try dragging the boxes, $v_1$, $v_2$, the whole space, or click 
<button id='init_equivolume_3d2d'>reset</button>.
</center>

<script src="/assets/js/linear_algebra/equivolume_3d2d.js"></script>
<script>
draw_on_svg('equivolume_3d2d',
            equivolume_3d2d);
</script>


In these cases, however, it is meaningless to compare the volume of the original box and the area of the resulting polygon.

*Still, for transformations between spaces of the same dimension - when this comparison is meaningful, a question arises: How much bigger or smaller does the space get?*

That's the right question! Volume contraction or expansion is one of the main concern to Linear Algebra. How much contraction/expansion tells us many things: whether the transformation flips the space around, or whether it is undo-able, etc. 

In the 1-dimensional case $\alpha x = y$, the answer is simply $\alpha$. 

*<!-- Right. --> If $\alpha < 0$, the number line is flipped. If $\alpha = 0$, it is impossible to find $x$ given $\alpha x=0$.
In N-dimensional space, however, how do we get such "$\alpha$" factor from an N-by-N matrix?*

We can do so by first setting the original box to have a volume of $1$, then compute the volume of the resulting box after transformation. In other words, given $V$, find $\alpha$:

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_find_det'> <div class='slider'></div></label>
  <br/>
<svg width="630" height="280" id="svg_find_det"></svg>
<br/>
Try dragging the boxes, $v_1$, $v_2$, $v_3$, the whole space, or click 
<button id='init_find_det'>reset</button>.
<br/> The question here is, how do we find $\alpha$ given the matrix $V$?
</center>

<script src="/assets/js/linear_algebra/find_det2d.js"></script>
<script src="/assets/js/linear_algebra/find_det.js"></script>
<script>
draw_on_svg('find_det',
            find_det2d,
            find_det);
</script>

*Then when $\alpha < 0$, the space is flipped, when $\alpha = 0$, the transformation is not invertible*

<!-- Exactly. -->
We have not discussed, however, exactly how to find $\alpha$. The keyword for our answer here is *Determinant of $V$*. But first let's take a break here? We'll come back with many more interesting findings.