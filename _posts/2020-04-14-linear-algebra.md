---
title: Interactive Visualizations of Linear Algebra - Part 1
---


<script src="/assets/js/linear_algebra/lib.js"></script>

*Italica* is a design student who recently acquired an appetite for intuitive illustration of Mathematical concepts. Regula is a graduate student in Machine Learning and a regular coffee buddy of *Italica*. Today they chat about Linear Algebra while striding leisurely along the sunny beach of Quy Nhon.

<center><b>1. Vectors</b></center>


<style type="text/css">
.js {
  font-size: 12.5;
  color: #696969;
}

.switch {
  position: relative;
  display: inline-block;
  width: 40px;
  height: 16px;
  top: -10px;
  left: 0px;
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

/*------ ADDED CSS ---------*/
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

/*--------- END --------*/
</style>

Here is a bunch of vectors.

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

Yeah, more precisely, each vector is a point living in *space*. The space here can be 2-, 3-, or N- dimensional. To locate the vectors, we usually attach a coordinate system. Here are examples of coordinate systems in 2-dimensional and 3-dimensional spaces:

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

Yes! By measuring distance in different directions, this set of rulers (which we named $x, y,$ and $z$) can assign any point living in space a location as you suggested:


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

*Right, so now what do I do with a vector?*

You don't do much with a vector. You start to have fun when there is more than one :) Dot product between two vectors is a simple and important concept. Below, you can see the dot product of two vectors $u$ and $v$, denoted $u^Tv$, is the **length of the projection** of $u$ onto $v$.


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

*Projection length is not very accurate right? Length cannot be negative, while in the illustration above the number can sometimes be negative. Why don't we call it "signed-projection"?*

You are right, a negative dot-product carries more information than just the length of projection. Which is, $u$ and $v$ are roughly opposite in direction. The name "dot product" here stands for a very simple formula for this signed-projection. That is, we should take the product of corresponding coordinates between $u$ and $v$ and then add them up!

<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_dot_product_formula'> <div class='slider'></div></label>
  <br/>
<svg width="600" height="350" id="svg_dot_product_formula"></svg>
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

That's exactly what it is :) The $^T$ operation here is called "transpose". Transposing flips the vector so it lies down. This diagram will become very helpful later on and we'll meet it again soon.

*So since this operation is symmetric between $u$ and $v$, it should give the same result as projecting v onto u, i.e. $u^Tv = v^Tu$, right?*

<center class='js'>
<svg width="315" height="350" id="svg_dot_product_symmetric2d"></svg><svg width="315" height="350" id="svg_dot_product_symmetric"></svg> 
<br/>
Try dragging vector $u$, $v$, the whole space. Click
<button id='but_dot_product_symmetric_init'>reset</button> or <button id='but_dot_product_symmetric_swap'>swap $u^Tv \leftrightarrow v^Tu$</button>.
</center>

<script src="/assets/js/linear_algebra/dot_product_symmetric2d.js"></script>
<script src="/assets/js/linear_algebra/dot_product_symmetric.js"></script>
<script>
d3.selectAll('#but_dot_product_symmetric_init')
  .on('click', function(){
      dot_product_symmetric2d.init();
      dot_product_symmetric.init();
  });
d3.selectAll('#but_dot_product_symmetric_swap')
  .on('click', function(){
      dot_product_symmetric2d.swap();
      dot_product_symmetric.swap();
  });
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

In the current space and coordinate system, $u$ is a vector of certain direction and length. The question is, what does $u$ look like in *another space and coordinate system?* In particular, how does $u$ look like from $v$'s perspective? One answer is that in $v$'s view, $u'=u^Tv$ is what $u$ looks like:


<center class='js'>
  <label class='switch'> <input type='checkbox' id='switch_v_perspective'> <div class='slider'></div></label>
  <br/>
<svg width="630" height="280" id="svg_v_perspective"></svg>
<br/> 
Try dragging $u$, $v$, the whole space, or click 
<button id='init_v_perspective'>reset</button>.
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

*Okay, from the above visualization, here is what I think why projecting makes sense: the projection is larger when $u$ is more aligned to $v$, and shrinks to $0$ when the two are not aligned at all (perpendicular). And so when the two is more aligned, each views the other as larger.*

Bingo. **Changing in perspective** is the recurring theme in Linear Algebra. Much of Linear Algebra is concerned with studying how a certain object of interest (represented by a point) looks like under different perspectives (different spaces and coordinate systems).

*So what are the specific applications?*

There are many. Linear Algebra is truly ubiquitous! As a student in Machine Learning, I can vouch for its application in this field. For example, we want to find what changes of perspective that turn my cat, currently represented as pixels in a photo, into the text $\texttt{"my cat"}$.

*So this is how Facebook AI put captions on the photos uploaded to the site?*

Yes. Take Google Translate as another example. Linear Algebra is used to represent the changes of the perspective that turn one sentence in one language to another.

*Cool, so we should first somehow represent the photo as a vector $u$, then we try to find $v$ such that the dot product $u\cdot v= u'$ is the number that represents the caption text?*

That is the spirit. The devil is in the detail though: How do we represent photo/text as vectors? How do we figure out the appropriate $v$? And so on :)

Consider writing this tutorial. All the visualizations of 3D spaces done here will be displayed on a screen, a 2D surface. This requires a perspective change between the two spaces. The code that I wrote for the visualizations must therefore handle this change using Linear Algebra. More broadly, computer games in 3D or softwares that involve 3D manipulation rely heavily on this specific change to display stuff on 2D screens.

*Changing in perspective might not be all the reasons for Linear Algebra. For example, I found [this answer](https://math.stackexchange.com/a/256695) on Math Stack Exchange.*

Good find! Better yet, reach for Chapter 10 of [Introduction to Linear Algebra](https://math.mit.edu/~gs/linearalgebra/) from Gilbert Strang. You'll find there a diverse list of Linear Algebra applications, from Graph Theory to Cryptography, Economics, and the Google's PageRank algorithm. 

<center><b>4. The coordinate system</b></center>

*Good to know! Back to changing of perspective, now what do I do with the projection of $u$ on $v$?*

Reducing $u$, living in a multi-dimensional space, to a single number $u^Tv$ is useful, but we want more. What people usually do is instead projecting $u$ on many different $v$'s and obtain many different views at once.

Let's say we project $u$ onto a bunch of vectors, e.g. three vectors $ \\{ v_1, v_2, v_3 \\} $, and thereby obtaining a list of numbers $[u^Tv_1, u^Tv_2, u^Tv_3]$, which is itself a vector as well! In other words, dot product is the building block of transforming one vector to another, thereby achieving a multi-dimensional change in perspective.

<!-- *OK, this list of numbers is three different views of $u$ from three different $v$ vectors. But if $v_1 = v_2$, we are obtaining the same view twice. If $v_1$ and $v_2$ are almost aligned, the two views are also almost the same.*

*So I guess my question is, if we are taking more than one view, shouldn't we select $ \\{ v_1, v_2, v_3 \\} $ such that these views don't correlate with each other as much as possible?*

Absolutely. Setting aside what we really mean by "correlation", this set of vectors needs to be pair-wise perpendicular for the views to not correlate. For example, -->

Let's take a concrete example. Let $v_1 = [1, 0, 0]$, $v_2 = [0, 1, 0]$, and $v_3 = [0, 0, 1]$. In this case, projecting $u$ on $ \\{ v_1, v_2, v_3 \\} $ will, surprise surprise, give you back $u$ itself.

*It looks like $v_1, v_2, v_3$ as defined above is acting as the coordinate system, because they are measuring $u$ in three perpendicular directions that coincide with the three coordinate axes.*

Nice observation. In fact with this observation, there is no longer need for coordinate systems. Instead, think of space as being "measured" by this set of vectors through dot products.

*So this set of vectors is what gives any vector living in space a coordinate?*

Exactly. Be aware that there can be many such sets. To get the position (coordinates) of a vector $u$ with respect to any of such set $ \\{ w_1, w_2, w_3 \\} $, simply project $u$ onto this set as shown earlier with $u$ and $ \\{ v_1, v_2, v_3 \\} $:


*It looks like the transformation I'm seeing here is rotation in 2-D and 3-D?*

That is right. Rotation happens because each vector in the set $ \\{ w_1, w_2, w_3 \\} $ here has length $1$ and any pair of them are perpendicular. You can sort of see why this is the case through the above illustrations. We'll make this concrete very soon. People call such sets "orthonormal", "ortho" stands for orthogonal (perpendicular) and "normal" stands for length of $1$.

<center><b>5. Matrix multiplication</b></center>

*Okay, but what if the set $ \\{ v_1, v_2, v_3 \\} $ is not orthonormal?*

You have just asked *The Question* of Linear Algebra. Earlier we see that if $ \\{ v_1, v_2, v_3 \\} $ is orthonormal, the result looks like $u$, except rotated by an angle. Let's extend this a bit by considering a simple case where the set $ \\{ v_1, v_2, v_3 \\} $ is only "ortho" but not "normal". We can see that the transformation amounts to first rotating, and then stretching on each axis individually, according to the length of $ v_1, v_2, v_3 $:

*Are you suggesting rotating and stretching are the two building blocks of any transformation done by dot-products?*

That's a very quick jump ahead, but totally accurate :) In fact, rotation and stretching are **the only two** building blocks. We'll soon see how this is the case, but first let's take it slow and enjoy ourselves some nice visualizations. Let's call the list of numbers $[u^T v_1, u^T v_2, u^T v_3]$ a new vector $u^\*$. This new vector is what $u$ looks like in the perspective of the skewed "coordinate system" $ \\{ v_1, v_2, v_3 \\} $:

Notation wise, if we stack $ \\{ v_1, v_2, v_3 \\} $ horizontally into a rectangle of numbers that we called the matrix $A$, we have just invented the matrix-vector multiplication using the "colliding" diagram:


And so, the meaning of matrix-vector multiplication is really just projecting a vector onto the matrix rows. Let's go ahead and simultaneously project a bunch of vectors $ \\{ u_1, u_2, u_3, u_4 \\} $ onto the set $ \\{ v_1, v_2, v_3 \\} $:

And there it is, we reinvent the matrix-matrix multiplication!

*Ah, that's very neat. So multiplying matrices is essentially looking at a bunch of vectors from a new perspective?*

Exactly. With matrix multiplication, we now have the power to look at vectors from many different perspectives. So far we have been transforming vectors in 3 dimensional space into another 3 dimensional space. But that does not have to be the case. Let's try something else:

Here we have just turned a 3-dimensional vectors into a 2-dimensional vector.

*So we have just discarded some information from $u$ by turning a list of 3 numbers into a list of 2 numbers right? I wonder if, in a reversed manner, we can add more information?*

Of course, we can certainly do so by projecting $u$, living in 2 dimensional space, onto a set of three vectors $v_1, v_2, v_3$:

*That looks cool! It seems matrix-vector multiplication is characterized by its stretching/squishing space uniformly everywhere. Is this true?*

That is true. Let's take a moment to unpack what you really mean by "uniformly everywhere". First, we can study this stretching/squishing by looking at the one-dimensional case. In this case, matrix-vector multiplication is simply multiplying two numbers. Let's look at how different line segments change in terms of their length.

*It seems that they got scaled up/down by the same factor, regardless of their position and size.*

Yes. Equivalently speaking, any two segments equal in length before a transformation will still be equal in length after the transformation. 

This property translates to higher dimensions as well. If two chunks of space are equal in volume before a matrix-vector multiplication, they are also equal in volume after said multiplication:

*Oh that's an interesting way to describe it. This raises the question: how much bigger or smaller does the space get after a given transformation? In the 1-dimensional case, this factor is simply the number used to multiply. In N-dimensional space, however, how do we get such factor from an N-by-N matrix?*

You are asking all the right questions! The point of Linear Algebra is really studying these transformations inside-out, characterizing them, breaking them apart. Volume contraction or expansion is just one of these studies. The keyword for your question here is *Determinant of a Matrix*. But let's take a break here and grab a coffee? We'll come back with many more interesting findings :)