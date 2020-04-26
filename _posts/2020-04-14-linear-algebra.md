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

Yes! Soon we'll see the coordinate system is really just a bunch of other vectors, but more on that later. Now because there is a coordinate system, each vector will have a list of numbers indicating its location in the space as you suggested:


<center class='js'>
<svg width="300" height="250" id="svg_point_location2d"></svg><svg width="300" height="250" id="svg_point_location"></svg> 
<br/>
Drag individual point or the whole space, or
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

var toggle = d3.select('#toggle1')
               .selectAll('input')
               .on('change', function(d){
                    point_location.toggle(this.value);
                    point_location2d.toggle(this.value);
               })
</script>

*Is this why sometimes people refer to a list of numbers as a "vector"?*

Exactly! People also refer to a vector as an arrow pointing from the origin to the location of the point. This arrow, the point living in a space, or the list of numbers are essentially three sides of the same coin. They are 3 different ways to refer to the same thing that we call "vector".

<center><b>2. Dot Product as Projection</b></center>

*Right, so now what do I do with a vector?*

You don't do much with a vector. You start to have fun when there is more than one :) 

Dot product between two vectors is a simple and important concept. In fact, **it is the only concept besides "vector" that we care about from here on out**. Below, you can see the dot product of two vectors \\(u\\) and \\(v\\) is the **length of the projection** of \\(u\\) onto \\(v\\).

*So why don't we call it the projection, isn't that a more suiting name?*

That name is indeed very intuitive. The reason for the name "dot product" is that there is a very simple formula to it. That is, we should take the product of corresponding coordinates between \\(u\\) and \\(v\\) and then add them up!

Here is a diagram showing how two vectors \\(u\\) and \\(v\\) collapsing into a single number (their dot product \\(uv\\)). This "collapsing" diagram of dot product is very useful and we will see it again soon.

*Oh, that's a nice result. So since this collapsing is symmetric between \\(u\\) and \\(v\\), should it give the same result as projecting v onto u?*

Well I cheated a bit in the explanation so far :) "Projection of \\(u\\) onto \\(v\\)" is almost, but not quite, the correct interpretation of dot product! The correct formula 
here takes into account length of \\(v\\) besides its direction: 

$$\textrm{dot product}(u, v) = \textrm{Projection of}\ u\ \textrm{onto}\ v \times \textrm{length of}\ v$$

The calculations done so far is correct only because I sneakily set the length of \\(v\\) to be \\(1\\). Now to answer your question, with this correct formular:

$$u \cdot v = v \cdot u  = \textrm{Projection of}\ u\ \textrm{onto}\ v \times \textrm{length of}\ v = \textrm{Projection of}\ v\ \textrm{onto}\ u \times \textrm{length of}\ u$$

*So, if \\(v\\) is hold fixed and \\(u\\) is moving around, then you are suggesting that dot product can be think of as a measurement of the projection of \\(u\\) onto \\(v\\) right?*

That's the right way to think about it :) The dot product here is simply the projection times a fixed constant. So to compare the projection of \\(u_1\\) and \\(u_2\\) onto \\(v\\), we can just compare \\(u_1\cdot v\\) and \\(u_2\cdot v\\).

<center><b>3. Changing in persepective</b></center>

*Okay, that makes sense. But why do we care about projections of vectors onto each other anyway?*

That's a good question. One of the understanding here is that projecting \\(u\\) onto \\(v\\) is essentially applying a **change in perspective**.

In the current space and coordinate system, \\(u\\) is a vector of certain direction and length. The question is, what does \\(u\\) look like in *another space and coordinate system?* In particular, how does \\(u\\) look like from \\(v\\)'s perspective? A reasonable answer is just projecting \\(u\\) onto \\(v\\).

*That is reasonable. The projection will be larger when the two is more aligned, and shrinks to zero when the two vectors are not aligned at all (perpendicular).*

Bingo. **Changing in perspective** is the recurring theme in Linear Algebra. Much of Linear Algebra is concerned with studying how a certain object of interest (represented by a point) looks like under different perspectives (different spaces and coordinate systems).

*I have heard Machine Learning uses a lot of Linear Algebra, does that have anything to do with what you are saying?*

Yes it does. 

In certain applications of Machine Learning, the goal is to learn *How to change the perspective so that an object appear in a certain way.* For example, we want to find what changes of perspective that turn the pixels in a photo of my cat into the caption text \\(\texttt{"my cat"}\\).

*Cool, so we should first somehow represent the photo as a vector \\(u\\), then we try to find \\(v\\) such that the dot product \\(u\cdot v= u'\\) is the vector that represents the caption text?*

That is the spirit. The devil is in the detail though: How do we represent photo/text using vectors? How do we figure out the appropriate \\(v\\)? :)

<center><b>4. Basis</b></center>

For the moment, let us not digress too far and get back to our discussion about Linear Algebra.

As we have seen, projecting \\(u\\) onto \\(v\\) reduces \\(u\\) into one single number (called a scalar). In practice, we usually project \\(u\\) onto a bunch of vectors, e.g. three vectors \\( \\{ v_1, v_2, v_3 \\} \\), and thereby obtaining a list of numbers instead of just one number.

*OK, this list of numbers is three different views of \\(u\\) from three different \\(v\\) vectors. But if \\(v_1 = v_2\\), we are obtaining the same view twice. If \\(v_1\\) and \\(v_2\\) is almost aligned, the two views are also almost identical. So I guess my question is, do people tend to select \\( \\{ v_1, v_2, v_3 \\} \\) such that these three views don't "overlap" with each other?*

To answer your question, we will get back to the earlier point about how coordinate systems are just a bunch of vectors. Suppose \\(v_1 = [1, 0, 0]\\), \\(v_2 = [0, 1, 0]\\), \\(v_3 = [0, 0, 1]\\). Projecting \\(u\\) on \\( \\{ v_1, v_2, v_3 \\} \\) will give you the list of three coordinates of \\(u\\).

As can be seen, the resulting list of numbers **is** the vector \\(u\\) itself. 

*Oh wait, so the result of projecting a vector onto a bunch of vectors is a list of numbers, which can also be seen as a vector as well?*

Correct. In our case, the resulting vector is precisely \\(u\\). This is because of two reasons:

* The chosen \\( \\{ v_1, v_2, v_3 \\} \\) is pairwise "non-overlapping" as you suggested earlier. Precisely, this means the projection of \\(v_1\\) and \\(v_2\\) onto each other is exactly 0, the same is true for the other two pairs (\\(v_1, v_3\\)) and (\\(v_2, v_3\\)) as well. 

* Each of \\( v_1, v_2, v_3 \\) has length 1.

Such a set of vectors are called "orthonormal" ("othor"= "perpendicular", "normal" = length of 1). 

Now you can forget about coordinate systems! Instead, think of space as being spanned by this set of orthonormal vectors, called the basis. Then the "locations of a point in space" is now simply its projection onto this set of vectors.

*Okay, so by saying a vector has some "coordinates" in space, we are implicitly introducing the basis \\(v_1 = [1, 0, 0]\\), \\(v_2 = [0, 1, 0]\\), \\(v_3 = [0, 0, 1]\\)?*

That's right. As long as the set of vectors is orthonormal, it is a valid basis. Explore other bases and how a vector \\(u\\) in the default basis looks like in the new basis below:

<center><b>5. Matrix multiplication</b></center>

*What if the set \\( \\{ v_1, v_2, v_3 \\} \\) is not orthonormal? What does the resulting vector after projecting \\(u\\) onto this set look like?*

You have just asked *The Question* of Linear Algebra. The answer is a fascinating journey we'll now embark on, uncovering it one step at a time! The list of numbers \\([u\cdot v_1, u\cdot v_2, u\cdot v_3]\\) is a new vector \\(u^\*\\). This new vector is what \\(u\\) looks like in the perspective of the skewed "coordinate system" \\( \\{ v_1, v_2, v_3 \\} \\). First, let's visualize it:

Notation wise, if we stack \\( \\{ v_1, v_2, v_3 \\} \\) horizontally into a rectangle of numbers, we have just reinvent the matrix-vector multiplication:


And so, the meaning of matrix-vector multiplication is really just projecting a vector onto the matrix rows. Let's go ahead and simultaneously project a bunch of vectors \\( \\{ u_1, u_2, u_3, u_4 \\} \\) onto the set \\( \\{ v_1, v_2, v_3 \\} \\):

And there it is, we reinvent the matrix-matrix multiplication!

*Ah, that's very neat! So multiplying matrices is essentially looking at a bunch of vectors from a new perspective?*

Exactly. With matrix multiplication, we now have the power to look at vectors from many different perspectives. So far we have been transforming vectors in 3 dimensional space into another 3 dimensional space. But that does not have to be the case. Let's try something else:

Here we have just turned a 3-dimensional vectors into a 2-dimensional vector.

*So we have just discarded some information from \\(u\\) by turning a list of 3 numbers into a list of 2 numbers right? I wonder if, in a reversed manner, we can add more information?*

Of course, we can certainly do so by projecting \\(u\\), living in 2 dimensional space, onto a set of three vectors \\(v_1, v_2, v_3\\):

*That looks cool! It seems to me these transformations done by matrix-vector mulitpication are stretching/squashing space uniformly throughout across all positions. Is it true?*

Yes that's true. Equivalently speaking, if two chunks of space before the transformation are equal in volume, they are also equal in volume *after* the transformation. By "volume", I meant the measurement of how much space is in the chunk of space. We have different names for this measurement: in 1-D it is length, in 2-D it is area and in 3-D it is volume. To make it simple, let's agree to use "volume" for all 1-D, 2-D, 3-D, 4-D, and beyond.

*Oh that's an interesting way to describe it! This raises the question: how much bigger or smaller does a volume get after a given transformation?*

You are asking the all the right questions! The point of Linear Algebra is really studying these transformations inside-out, characterizing them, breaking them apart, revealing their innermost thoughts and desires, curing their illnesses or even undoing them entirely. 

Volume contraction or expansion is just one of these studies. The keyword for your question here is *Determinant of a Matrix*. But let's take a break here and grab a coffee? We'll come back with many more interesting findings :)