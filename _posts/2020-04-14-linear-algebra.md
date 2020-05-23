---
title: Interactive Visualizations of Linear Algebra - Part 1
---

*Italica* is a design student who recently acquired an appetite for intuitive illustration of Mathematical concepts. Regula is a graduate student in Machine Learning and a regular coffee buddy of *Italica*. Today they chat about Linear Algebra while striding leisurely along the sunny beach of Quy Nhon.

<center><b>1. Vectors</b></center>


<style type="text/css">
.js {
  font-size: 12.5;
  color: #696969;
}
</style>

Here is a bunch of vectors.

<center class='js'>
<svg width="300" height="250" id="svg_lone_vector"></svg>
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
<svg width="300" height="250" id="svg_point_coord_lines2d"></svg> <svg width="300" height="250" id="svg_point_coord_lines"></svg>
<br/> 
Drag or <button id='reset_point_coord_lines'>shuffle</button>
</center>

<script src="/assets/js/linear_algebra/point_coord_lines2d.js">
</script>
<script src="/assets/js/linear_algebra/point_coord_lines.js">
</script>

<script>
d3.selectAll('#reset_point_coord_lines')
  .on('click', function(){
      point_coord_lines.init();
      point_coord_lines2d.init();
  })
</script>

*Does the coordinate axes here acting like rulers on a map?*

Yes! By measuring distance in different directions, this set of rulers (which we named \\(x, y,\\) and \\(z\\)) can assign any point living in space a location as you suggested:


<center class='js'>
<svg width="300" height="250" id="svg_point_location2d"></svg><svg width="300" height="250" id="svg_point_location"></svg> 
<br/>
Rotate the space, drag individual point, or click
<button id='but_point_location'>shuffle</button>.
</center>

<script src="/assets/js/linear_algebra/point_location.js"></script>
<script src="/assets/js/linear_algebra/point_location2d.js"></script>
<script>
d3.selectAll('#but_point_location')
  .on('click', function(){
      point_location.init();
      point_location2d.init();
  });
</script>

*Is this why sometimes people refer to a list of numbers as a "vector"?*

Exactly. People also refer to a vector as an arrow pointing from the origin to the location. This arrow, the point living in a space, or the list of numbers are essentially three sides of the same coin. They are 3 different ways to refer to the same thing that we call "vector".

<center class='js'>
<svg width="300" height="250" id="svg_point_arrow_location2d"></svg><svg width="300" height="250" id="svg_point_arrow_location"></svg> 
<br/>
Here we use round-headed arrows and simplify the coordinates by assuming the order \(x\rightarrow y\rightarrow z\).
<br/>
Rotate the space, move individual point, or click
<button id='but_point_arrow_location'>shuffle</button>.
</center>

<script src="/assets/js/linear_algebra/point_arrow_location2d.js"></script>
<script src="/assets/js/linear_algebra/point_arrow_location.js"></script>
<script>
d3.selectAll('#but_point_arrow_location')
  .on('click', function(){
      point_arrow_location2d.init();
      point_arrow_location.init();
  });
</script>

<center><b>2. Dot Product as Projection</b></center>

*Right, so now what do I do with a vector?*

You don't do much with a vector. You start to have fun when there is more than one :) Dot product between two vectors is a simple and important concept. Below, you can see the dot product of two vectors \\(u\\) and \\(v\\) is the **length of the projection** of \\(u\\) onto \\(v\\).


<center class='js'>
<svg width="300" height="250" id="svg_dot_product_project2d"></svg><svg width="300" height="250" id="svg_dot_product_project"></svg> 
<br/>
The coordinate system is now fixed. Rotate all, move individual point, or click
<button id='but_dot_product_project'>shuffle</button>.
</center>

<script src="/assets/js/linear_algebra/dot_product_project2d.js"></script>
<script src="/assets/js/linear_algebra/dot_product_project.js"></script>
<script>
d3.selectAll('#but_dot_product_project')
  .on('click', function(){
      dot_product_project2d.init();
      dot_product_project.init();
  });
</script>

*So why don't we call it the projection, isn't that a more intuitive name?*

You are right. The name "dot product" here stands for a very simple formula for the projection. That is, we should take the product of corresponding coordinates between \\(u\\) and \\(v\\) and then add them up!

*Oh, that's a very nice coincidence.*

Indeed it is. Here is a diagram showing how two vectors \\(u\\) and \\(v\\) collapsing into a single number (their dot product \\(uv\\)). This "collapsing" diagram of dot product is very useful and we will see it again soon.

*So since this operation is symmetric between \\(u\\) and \\(v\\), should it give the same result as projecting v onto u?*

Well I cheated a bit in the explanation so far :) "Projection of \\(u\\) onto \\(v\\)" is almost, but not quite, the correct interpretation of dot product! The correct formula 
here takes into account length of \\(v\\) besides its direction: 

$$\textrm{dot product}(u, v) = \textrm{Projection of}\ u\ \textrm{onto}\ v \times \textrm{length of}\ v$$

The calculations done so far is correct only because I sneakily set the length of \\(v\\) to be \\(1\\). Now to answer your question, with this correct formular:

$$u \cdot v = v \cdot u  = \textrm{Projection of}\ u\ \textrm{onto}\ v \times \textrm{length of}\ v = \textrm{Projection of}\ v\ \textrm{onto}\ u \times \textrm{length of}\ u$$

*So, if \\(v\\) is hold fixed and \\(u\\) is moving around, then you are suggesting that dot product can be think of as a measurement of the projection of \\(u\\) onto \\(v\\) right?*

That's the right way to think about it :) The dot product here is simply the projection times a fixed constant (length of \\(v\\)). So to compare the projection of \\(u_1\\) and \\(u_2\\) onto \\(v\\), we can just compare \\(u_1\cdot v\\) and \\(u_2\cdot v\\).

<center><b>3. Changing in persepective</b></center>

*Okay, that makes sense. But why do we care about projections of vectors onto each other anyway?*

That's a good question. One of the understanding here is that projecting \\(u\\) onto \\(v\\) is essentially applying a **change in perspective**.

In the current space and coordinate system, \\(u\\) is a vector of certain direction and length. The question is, what does \\(u\\) look like in *another space and coordinate system?* In particular, how does \\(u\\) look like from \\(v\\)'s perspective? A reasonable answer is just projecting \\(u\\) onto \\(v\\).

*Maybe I am seeing why. The projection will be larger when the two is more aligned, and shrinks to zero when the two vectors are not aligned at all (perpendicular).*

Bingo. **Changing in perspective** is the recurring theme in Linear Algebra. Much of Linear Algebra is concerned with studying how a certain object of interest (represented by a point) looks like under different perspectives (different spaces and coordinate systems).

*So what are the specific applications?*

There are many, Linear Algebra is truly ubiquitous! As a student in Machine Learning, I can vouch for its application in this field.

In certain branches of Machine Learning, the goal is to learn *How to change the perspective so that an object appear in a certain way.* For example, we want to find what changes of perspective that turn the pixels of a photo of my cat into the caption text \\(\texttt{"my cat"}\\).

*Cool, so we should first somehow represent the photo as a vector \\(u\\), then we try to find \\(v\\) such that the dot product \\(u\cdot v= u'\\) is the vector that represents the caption text?*

That is the spirit. The devil is in the detail though: How do we represent photo/text as vectors? How do we figure out the appropriate \\(v\\)? And so on :)

Consider writing this tutorial. All the visualizations of 3D spaces done here will be displayed on your screen, a 2D surface. This requires a perspective change between the two spaces. The code that I wrote for the visualizations must therefore handle this change using Linear Algebra. 

More broadly, computer games in 3D or softwares that involve 3D manipulation rely heavily on this specific change to display stuff on your 2D screen.

*I found [this answer](https://math.stackexchange.com/a/256695) on Math Stack Exchange. Seems like a fun read.*

Better yet, reach for Chapter 10 in the classic [Introduction to Linear Algebra](https://math.mit.edu/~gs/linearalgebra/) from Gilbert Strang. You'll find there a list of Linear Algebra applications, from Graph Theory to Cryptography, Economics, and Google's PageRank algorithm. 

<center><b>4. Basis</b></center>

For the moment, let us not digress too far and get back to our main discussion.

As we have seen, projecting \\(u\\) onto \\(v\\) reduces \\(u\\) into one single number (called a scalar). In practice, we usually project \\(u\\) onto a bunch of vectors, e.g. three vectors \\( \\{ v_1, v_2, v_3 \\} \\), and thereby obtaining a list of numbers instead of just one number.

*OK, this list of numbers is three different views of \\(u\\) from three different \\(v\\) vectors. But if \\(v_1 = v_2\\), we are obtaining the same view twice. If \\(v_1\\) and \\(v_2\\) are almost aligned, the two views are also almost identical.*

*So I guess my question is, if we are taking more than one view, shouldn't we select \\( \\{ v_1, v_2, v_3 \\} \\) such that these views don't correlate with each other as much as possible?*

Absolutely, setting aside what we really mean by "correlation" mathematically, this set of vectors needs to be pair-wise perpendicular for the views to not correlate. For example, when \\(v_1 = [1, 0, 0]\\), \\(v_2 = [0, 1, 0]\\), and \\(v_3 = [0, 0, 1]\\). In this case, projecting \\(u\\) on \\( \\{ v_1, v_2, v_3 \\} \\) will, surprise surprise, give you back the list of three coordinates of \\(u\\).

*It looks like \\(v_1, v_2, v_3\\) as defined above is acting as the coordinate system, because they are measuring \\(u\\) in three perpendicular directions.*

Nice observation. In fact with this observation, now you can forget about coordinate systems. Instead, think of space as being "measured" by this set of vectors. 

*In other words, this set of vectors is what gives any of the vectors living in space a coordinate?*

Exactly. Be aware that there can be many such sets, as long as they satisfy the following two conditions:

* The chosen \\( \\{ v_1, v_2, v_3 \\} \\) is pairwise perpendicular. 

* Each of \\( v_1, v_2, v_3 \\) has length 1.

Such a set of vectors are *orthonormal* ("othor"= "perpendicular", "normal" = length of 1). Any orthonormal set acting as a coordinate system is called a *basis*. To get the position (coordinates) of a point with respect to any basis, simply project the vector onto this set as shown earlier with \\(u\\) and \\( \\{ v_1, v_2, v_3 \\} \\):

<center><b>5. Matrix multiplication</b></center>

*What if the set \\( \\{ v_1, v_2, v_3 \\} \\) is not orthonormal? What does the resulting vector after projecting \\(u\\) onto this set look like?*

You have just asked *The Question* of Linear Algebra. Earlier we see that if \\( \\{ v_1, v_2, v_3 \\} \\) is orthonormal, the result looks like \\(u\\), except rotated by an angle.

The answer to the more general question is a fascinating journey we'll now embark on, uncovering it one step at a time! The list of numbers \\([u\cdot v_1, u\cdot v_2, u\cdot v_3]\\) is a new vector \\(u^\*\\). This new vector is what \\(u\\) looks like in the perspective of the skewed "coordinate system" \\( \\{ v_1, v_2, v_3 \\} \\). First, let's visualize it:

Notation wise, if we stack \\( \\{ v_1, v_2, v_3 \\} \\) horizontally into a rectangle of numbers, we have just reinvented the matrix-vector multiplication using the "collapsing" diagram:


And so, the meaning of matrix-vector multiplication is really just projecting a vector onto the matrix rows. Let's go ahead and simultaneously project a bunch of vectors \\( \\{ u_1, u_2, u_3, u_4 \\} \\) onto the set \\( \\{ v_1, v_2, v_3 \\} \\):

And there it is, we reinvent the matrix-matrix multiplication!

*Ah, that's very neat. So multiplying matrices is essentially looking at a bunch of vectors from a new perspective?*

Exactly. With matrix multiplication, we now have the power to look at vectors from many different perspectives. So far we have been transforming vectors in 3 dimensional space into another 3 dimensional space. But that does not have to be the case. Let's try something else:

Here we have just turned a 3-dimensional vectors into a 2-dimensional vector.

*So we have just discarded some information from \\(u\\) by turning a list of 3 numbers into a list of 2 numbers right? I wonder if, in a reversed manner, we can add more information?*

Of course, we can certainly do so by projecting \\(u\\), living in 2 dimensional space, onto a set of three vectors \\(v_1, v_2, v_3\\):

*That looks cool! It seems to me these transformations done by matrix-vector mulitpication are stretching/squashing space uniformly throughout across all positions. Is it true?*

Yes that's true. Equivalently speaking, if two chunks of space before the transformation are equal in volume, they are also equal in volume *after* the transformation. 

*Oh that's an interesting way to describe it! This raises the question: how much bigger or smaller does the space get after a given transformation?*

You are asking the all the right questions! The point of Linear Algebra is really studying these transformations inside-out, characterizing them, breaking them apart. Volume contraction or expansion is just one of these studies. The keyword for your question here is *Determinant of a Matrix*. But let's take a break here and grab a coffee? We'll come back with many more interesting findings :)