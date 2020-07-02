---
title: Interactive Visualizations of Linear Algebra - Part 1
---


<script src="/assets/js/linear_algebra/lib.js"></script>

Sunday morning's breezes. Quy nhon, a peaceful small town by the ocean. In a busy coffee shop, two regular coffee buddies are chatting away on fun ideas. 

*"Linear Algebra?"* - said *Italica*, a student in Design who recently acquired an appetite for pretty illustrations of Math concepts.

"Yes. Linear Algebra, is a story about vectors." - Regan, a Machine Learning engineer, sipping her favourite coffee with condensed milk.

*"I like stories. How does this one start?"*

<center><b>1. Vectors</b></center>


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

With the main character: vectors. Let's actually see them. Here is a bunch of vectors.

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


*OK, so I assume each dot is a vector?*

Yeah, more precisely, each vector is a point living in *space*. The space here can be 2-, 3-, or N- dimensional. To locate the vectors, we attach a coordinate system. Here are examples of coordinate systems in 2-dimensional and 3-dimensional spaces:

<center class='js'>
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
function draw_on_svg(svg_id, fn_2d, fn_3d) {
  let is_3d = false;
  fn_2d.select_svg('#svg_' + svg_id);
  fn_2d.init();

  d3.selectAll('#init_' + svg_id)
    .on('click', function(){
      if (is_3d) {
        fn_3d.init(tt=1000);
      } else {
        fn_2d.init(tt=1000);
      }
    });

  d3.selectAll('#switch_' + svg_id)
    .on('click', function(){
      is_3d = this.checked;
      if (is_3d) {
        fn_3d.select_svg('#svg_' + svg_id);
        fn_3d.init(tt=1000);
      } else {
        fn_2d.select_svg('#svg_' + svg_id);
        fn_2d.init(tt=1000);
      }
    })
}

draw_on_svg('point_coord_lines',
            point_coord_lines2d,
            point_coord_lines)
</script>

*Do the coordinate axes here acting like rulers on a map?*

Yes! By measuring distance in different directions, this set of rulers (which we named $x, y,$ and $z$) can assign any point living in space a location as you suggested. The location here is a list of numbers, each is the measurement read from one ruler:

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
draw_on_svg(
    'point_location',
    point_location2d, 
    point_location);
</script>

*Is this why sometimes people refer to a list of numbers as a "vector"?*

Exactly. People also refer to a vector as an arrow pointing from the origin to the location. This arrow, the point living in a space, or the list of numbers are essentially three sides of the same coin. They are 3 different ways to refer to the same thing that we call "vector".

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_point_arrow_location'> <div class='slider'></div></label>
  <br/>
<svg width="600" height="280" id="svg_point_arrow_location"></svg>
<br/>
Here we use round-headed arrows and simplify the coordinates by assuming the order $x\rightarrow y\rightarrow z$.
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

<center><b>2. Dot Product as Projection</b></center>

*Right, so now what does a vector do?*

A vector itself does not do much. You start to have fun when there is more than one :) Dot product between two vectors is a simple and important concept. Below, you can see the dot product of two vectors $u$ and $v$, denoted $u^Tv$, is the **length of the projection** of $u$ onto $v$.


<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_dot_product_project'> <div class='slider'></div></label>
  <br/>
<svg width="600" height="280" id="svg_dot_product_project"></svg>
<br/>
Try dragging vector $u$, $v$, the whole space, or click
<button id='init_dot_product_project'>reset</button>.
<br/>
Can you make $u^Tv$ negative?
</center>

<script src="/assets/js/linear_algebra/dot_product_project2d.js"></script>
<script src="/assets/js/linear_algebra/dot_product_project.js"></script>
<script>
draw_on_svg('dot_product_project',
            dot_product_project2d,
            dot_product_project)
</script>

*Projection length is not very accurate right? Length cannot be negative, while in the illustration above the number can sometimes be negative. And why don't we just call it "projection"?*

You are right, a negative dot-product carries more information than just the length of projection. Which is, $u$ and $v$ are roughly opposite in direction. The name "dot product" here stands for a very simple formula for this signed-projection. That is, we should take the product of corresponding coordinates between $u$ and $v$ and then add them up!

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

*Oh, that's surprisingly simple!*

Indeed it is. Let's look at a very useful diagram for this formula. It represents the formula by showing $u$ and $v$ colliding into a single number (their dot product $u^Tv$).

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_dot_product_collide'> <div class='slider'></div></label>
  <br/>
<svg width="600" height="280" id="svg_dot_product_collide"></svg>
<br/>
Try dragging vector $u$, $v$, the whole space. Click
<button id='init_dot_product_collide'>reset</button> or <button id='but_dot_product_collide_compute'>compute $u^Tv$</button>.
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


*Looks like this diagram explains the notation $u^Tv$ very well: $u^T$ is $u$ lying down, while $v$ is standing, and $u^Tv$ is the collision of $u^T$ and $v$.*

That's exactly what it is :) The $^T$ operation here is called "transpose". Transposing flips the vector so it lies down. This diagram will become very helpful later on, so hang on to that for a little while.

*So since this operation is symmetric between $u$ and $v$, it should give the same result as projecting v onto u, i.e. $u^Tv = v^Tu$, right?*

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_dot_product_symmetric'> <div class='slider'></div></label>
  <br/>
<svg width="600" height="300" id="svg_dot_product_symmetric"></svg>
<br/>

Try dragging vector $u$, $v$, the whole space. Click
<button id='init_dot_product_symmetric'>reset</button> or <button id='but_dot_product_symmetric_swap'>swap $u^Tv \leftrightarrow v^Tu$</button>.
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

Great observation. Well, I cheated a bit in the explanation so far :) "Projection of $u$ onto $v$" is almost, but not quite, the correct interpretation of dot product! It is only correct when length of $v$ (denoted $\|v\|$) is 1 - which is what I sneakily set it to be so far. The correct formula 
here takes into account $|v|$ as well:

$$u^Tv = \textrm{Projection of}\ u\ \textrm{onto}\ v \times \left|v\right|$$

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_dot_product_correct'> <div class='slider'></div></label>
  <br/>
<svg width="600" height="280" id="svg_dot_product_correct"></svg>
<br/> 
Try dragging $u$, $v$, or any of the other lines/points, or click
<button id='init_dot_product_correct'>reset</button>.
<br/>
Notice when $|v|=1$, $u^Tv$ coincides with the projection (shaded blue).
</center>

<script src="/assets/js/linear_algebra/dot_product_correct2d.js"></script>
<script src="/assets/js/linear_algebra/dot_product_correct.js"></script>
<script>
draw_on_svg('dot_product_correct',
            dot_product_correct2d,
            dot_product_correct);
</script>

So dot product not only projects $u$ onto $v$'s direction, it also scales the result by $\|v\|$. Now with this new interpretation, $u^Tv = v^Tu$ indeed!

<!-- = \textrm{Projection of}\ u\ \textrm{onto}\ v \times \textrm{length of}\ v = \textrm{Projection of}\ v\ \textrm{onto}\ u \times \textrm{length of}\ u$$ -->

<!-- *So, if $v$ is hold fixed and $u$ is moving around, then you are suggesting that dot product can be think of as a measurement of the projection of $u$ onto $v$ right?*

That's the right way to think about it :) The dot product here is simply the projection times a fixed constant (length of $v$). So to compare the projection of $u_1$ and $u_2$ onto $v$, we can just compare $u_1^Tv$ and $u_2^Tv$. -->

<center><b>3. Changing in persepective</b></center>

*Okay, that makes sense. But why do we care about projections of vectors onto each other anyway?*

That's a good question. One of the understanding here is that projecting $u$ onto $v$ is essentially applying a **change in perspective**.

In the current space and coordinate system, $u$ is a vector of certain location. The question is, what does $u$ look like in *another space and/or coordinate system?* In particular, how does $u$ look like from $v$'s perspective? One answer is that in $v$'s view, $u'=u^Tv$ is what $u$ looks like:


<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_v_perspective'> <div class='slider'></div></label>
  <br/>
<svg width="630" height="280" id="svg_v_perspective"></svg>
<br/> 
Try dragging $u$, $v$, the whole space, or click 
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

Yes it is just one number. However, a single number is still a vector: it is in fact a 1-dimensional vector! And so, dot product achieves 1-dimensional change of perspective: $u$ living in an arbitrary number of dimension is reduced into a 1-dimensional vector in $v$'s coordinate system.

*Okay, from the above visualization, I can see why projecting to change view makes sense: the projection is larger when $u$ is more aligned to $v$, and shrinks to $0$ when the two are not aligned at all (perpendicular).*

Bingo. **Changing in perspective** is the recurring theme in Linear Algebra. Much of Linear Algebra is concerned with studying how a certain object of interest (represented by a point) looks like under different perspectives (different spaces and coordinate systems).

*So what are the uses of changing perspective?*

There are many. Linear Algebra is truly ubiquitous! As a student in Machine Learning, I can vouch for its application in this field. For example, we want to find what changes of perspective that turn my cat, currently represented as pixels in a photo, into the text $\texttt{"my cat"}$.


<center class='js'>
<svg width="630" height="140" id="svg_cat_text_perspective"></svg>
<br/> 
An example of Image Captioning.
</center>

<script src="/assets/js/linear_algebra/cat_text_perspective.js"></script>

*So this is how Facebook AI put captions on the photos uploaded to the site?*

Yep. Take Google Translate as another example. Linear Algebra is used to represent the changes of the perspective that turn one sentence in one language to another.

<center class='js'>
<svg width="630" height="150" id="svg_translation_perspective"></svg>
<br/> 
An example of Translation.
</center>

<script src="/assets/js/linear_algebra/translation_perspective.js"></script>

*Okay, let me try to connect the dots here. So we should first somehow represent the photo as a vector $u$, then we try to find $v$ such that $u$ in $v$'s view, $u'=u^T v$, is the number that represents the caption text?*

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

That is the spirit! Although realistically, a single number isn't the best way to represent texts, but we'll come to that soon. The devil is really in the detail: How do we represent photo/text as vectors? How do we figure out the appropriate $v$? And so on :)

<!-- Consider writing this tutorial. All the visualizations of 3D spaces done here will be displayed on a screen, a 2D surface. This requires a perspective change between the two spaces. The code that I wrote for the visualizations must therefore handle this change using Linear Algebra. More broadly, computer games in 3D or softwares that involve 3D manipulation rely heavily on this specific change to display stuff on 2D screens. -->

<!-- *Changing in perspective might not be all the reasons for Linear Algebra though. I found [this answer](https://math.stackexchange.com/a/256695) on Math Stack Exchange that says people approximate complex questions with Linear Algebra to get approximate answers.* -->

Further, reach for Chapter 10 of [Introduction to Linear Algebra](https://math.mit.edu/~gs/linearalgebra/) from Prof. Gilbert Strang. You'll find there a diverse list of Linear Algebra applications, from Graph Theory to Cryptography, Economics, and the Google's PageRank algorithm that runs at the heart of the search engine itself. 

*Wow, I would have never imagined the simple ideas we talked about so far can turn into such exciting stuff!*

<center><b>4. The coordinate system</b></center>

I know right? :) For now, let's get back on track to our main discussion. Reducing $u$, living in a multi-dimensional space, to a single number $u^Tv$ is useful, but we want more. What people do is instead projecting $u$ on many different $v$'s and obtain many different views at once.


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

*So we are just essentially getting many numbers at once, that's kind of cumbersome right?*

It will not be. Let's say we project $u$ onto three vectors $ \\{ v_1, v_2, v_3 \\} $, and thereby obtaining a list of numbers $[u^Tv_1, u^Tv_2, u^Tv_3]$. This list of numbers is itself a vector $u'$ as well:

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_multi_dim_change'> <div class='slider'></div></label>
  <br/>
<svg width="630" height="280" id="svg_multi_dim_change"></svg>
<br/> 
<label class='switch show'> <input type='checkbox' id='show_hide_proj'> <div class='slider show'></div></label> projection details.
<br/>
Try dragging $u$, $v_1$, $v_2$, $v_3$, the whole space, or click 
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

*Interesting. This is like using the 3 number lines that represents the world view of $v_1, v_2,$ and $v_3$ as the three coordinate axes of the new space.*


Exactly! So now, using $v_1, v_2, v_3$ and the dot product, we achieved the multi-dimensional change in perspective from one vector $u$, to another $u'$ in another space and coordinate.

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

*It looks like $v_1, v_2, v_3$ as defined above is acting as the coordinate system: they are measuring $u$ in three perpendicular directions that coincide with the three coordinate axes.*

Nice observation! In fact with this observation, there is no longer need for coordinate systems. Instead, think of space as being "measured" by this set of vectors through dot products.

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

And so, there is no intrinsic coordinate to any vector, only its location relative to others. This simplified the whole picture because now there is coordinate system no more!

*In other words: this set of $v$ vectors and dot product are what give any vector living in space a coordinate?*

Yes, be aware that there can be many such sets besides $\\{[1, 0, 0], [0, 1, 0], [0, 0, 1]\\}$. For example, rotating this set by any angle and we will obtain another valid set acting as coordinate system:

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

*It looks like $u'$ is moving around in the same sphere that also contains $u$?*

That is right. In other words, the transformation preserves length of $u$. In Math, we call length-preserving transformations with a very familiar and intuitive name: Rotation. 

It can be shown that for rotation to happen, each vector in $ \\{ v_1, v_2, v_3 \\} $ has to have a length of $1$ and any pair of them must be perpendicular - which is what the illustration is set up to be. People call such sets "orthonormal": "ortho" stands for orthogonal and "normal" stands for length of $1$.

<center><b>5. Matrix multiplication</b></center>

*Okay, but what if the set $ \\{ v_1, v_2, v_3 \\} $ is not orthonormal?*

You have just asked *The Question* of Linear Algebra. Earlier we see that if $ \\{ v_1, v_2, v_3 \\} $ is orthonormal, the result $u'$ looks like $u$, except rotated by an angle. Let's extend this a bit by considering a simple case where the set $ \\{ v_1, v_2, v_3 \\} $ is only "ortho" but not "normal". This time, we can see that the transformation can be broken down to (1) rotating and (2) stretching on each axis individually, according to the length of $ v_1, v_2, v_3 $:


<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_rotate_stretch'> <div class='slider'></div></label>
  <br/>
<svg width="630" height="600" id="svg_rotate_stretch"></svg>
<br/>
Try dragging $u$, {$v_1$, $v_2$, $v_3$}, the whole space, or click <button id='init_rotate_stretch'>reset</button>. 
<br/>
Notice now the sphere that contains $u'$ got stretched to an ellipsoid.
</center>

<script src="/assets/js/linear_algebra/rotate_stretch2d.js"></script>
<script src="/assets/js/linear_algebra/rotate_stretch.js"></script>
<script>
draw_on_svg('rotate_stretch',
            rotate_stretch2d,
            rotate_stretch);
</script>


*That makes sense. Are you suggesting rotating and stretching are the two building blocks of all transformation done by dot-products?*

That's a very quick jump ahead, but totally accurate :) In fact, rotation and stretching are not only two, but **the only two** building blocks. We'll soon see how this is the case, but first let's take it slow and enjoy ourselves some nice visualizations. This time, the set $ \\{ v_1, v_2, v_3 \\} $  is allowed to be neither "ortho" nor "normal" as you suggested:

Notation wise, if we stack $ \\{ v_1, v_2, v_3 \\} $ horizontally into a rectangle of numbers that we called the matrix $A$, we have just invented the matrix-vector multiplication using the "colliding" diagram:

$$Vu = u'$$


And so, the meaning of matrix-vector multiplication is really just projecting a vector onto the matrix rows. Let's go ahead and simultaneously project a bunch of vectors $ \\{ u_1, u_2, u_3, u_4 \\} $ onto the same set $ \\{ v_1, v_2, v_3 \\} $:

And there it is, we reinvent the matrix-matrix multiplication!

$$VU = U'$$

*Ah, that's very neat. So multiplying matrices is essentially looking at a bunch of vectors from a new perspective?*

Exactly. With matrix multiplication, we now have the power to look at vectors from many different perspectives. So far we have been transforming vectors in 3 dimensional space into another 3 dimensional space. But that does not have to always be the case. Let's try something else:

Here we have just turned a 3-dimensional vectors into a 2-dimensional vector.

*So we have just discarded some information from $u$ by turning a list of 3 numbers into a list of 2 numbers right? I wonder if, in a reversed manner, we can add more information?*

Of course, we can certainly do so by projecting $u$, living in 2 dimensional space, onto a set of three vectors $v_1, v_2, v_3$:

*That looks cool! Although, now I'm seeing many different cases arise from matrix-vector multiplication. Is there an underlying characteristic that makes them different to other types of transformations?*

We can start studying the question by first looking at the one-dimensional case. In this case, matrix-vector multiplication is simply multiplying two numbers $x \times y = z$. Let's look at how different line segments change in terms of their length.

*It seems that they got scaled up/down by the same factor, regardless of their position and size.*

Yes. Equivalently speaking, any two segments equal in length before a transformation will still be equal in length after the transformation. 

This property translates to higher dimensions as well. If two chunks of space are equal in volume before a matrix-vector multiplication, they are also equal in volume after said multiplication:

*Oh that's an interesting way to describe it.*

Yes, this description is applicable for transformations between different number of dimensions as well (e.g. 2D to 3D and vice versa):

In these cases, it is meaningless to say how much scaled up a chunk of space in 2-D is to another in 3-D, or vice versa.

*Still, for transformations between spaces of the same dimension - when this comparison is meaningful, a question arises: How much bigger or smaller does the space get? In the 1-dimensional case $x \times \alpha = y$, this factor is simply $\alpha$. In N-dimensional space, however, how do we get such factor from an N-by-N matrix?*

You are asking all the right questions! The point of Linear Algebra is really studying these transformations inside-out, characterizing them, breaking them apart, or undoing them entirely. Volume contraction or expansion is just one of these studies. The keyword for your question here is *Determinant of a Matrix*. But let's take a break here? We'll come back with many more interesting findings :)