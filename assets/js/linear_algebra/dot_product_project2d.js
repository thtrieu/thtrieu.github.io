var dot_product_project2d = (function() {



var origin = [150, 140], 
  scale = 60, 
  scatter = [], 
  axis = [],
  expectedAxis = [],
  startAngleX = Math.PI,
  startAngleY = 0.,
  startAngleZ = 0.
  axis_len = 2;

let unit = axis_len/10;

var svg = d3.select("#svg_dot_product_project2d");


var lib = space_plot_lib(
  svg,
  origin, 
  scale,
  is_2d=true);


svg = svg.call(d3.drag()
         .on('drag', dragged)
         .on('start', drag_start)
         .on('end', drag_end))
         .append('g');

axis = lib.init_float_axis(axis_len=axis_len, unit=unit);


function plot(scatter, axis, tt){

  basis = {
      ex: axis[4][1], 
      ey: axis[14][1],
      // ex: axis[axis_len/unit*4 * 0][1], 
      // ey: axis[axis_len/unit*14 * 1][1],
      ez: 0.
  };

  scatter.forEach(function(d, i){
    var coord = lib.dot_basis(d, basis);
    if (i == 0) {
      d.text = 'u = ';
    } else {
      d.text = 'v = ';
    }
    d.text += '['.concat(
      coord.x.toFixed(2),
      ', ',
      coord.y.toFixed(2),
      ']');
    
    d.text_color = d.color;

  })

  lib.plot_lines(axis);

  var lines = [];
  scatter.forEach(function(d){
    lines.push([
        {x: 0., y: 0., z: 0.},
        {x: d.x, y: d.y, z: d.z, 
         color: d.color, tt: true}
    ]);
  });

  let mult_vec = scatter[0].x * scatter[1].x +
                 scatter[0].y * scatter[1].y;
  let projectionx = scatter[1].x * mult_vec;
  let projectiony = scatter[1].y * mult_vec;

  lines.push([
    {x: 0, y: 0, z: 0},
    {x: projectionx, y: projectiony, z: 0,
     color: 0, tt:true}
    ]);
  lines[2].text = 'u\u1d40v = '.concat(mult_vec.toFixed(3));
  lines[2].text_color = lines[2].color;
  lines[2].font_size = 15;

  lines.push([
    {x: scatter[0].x, y: scatter[0].y, z: scatter[0].z},
    {x: projectionx, y: projectiony, z: 0,
     tt:true}
    ]);

  lines[3].dash = true;

  lib.plot_lines(lines, tt, 'arrow');
  lib.plot_points(scatter, tt,
                    drag_point_fn=function(d, i){
                      if (i == 0) {
                        dragged_point(i);
                      } else {
                        dragged_point_only();
                      }
                    },
                    drag_start_fn=drag_start,
                    drag_end_fn=drag_end);
  lib.sort();
}


function init(){
  scatter = [];

  scatter.push({
    x: -1.0,
    y: -4.0/3, 
    z: 0.,
    color: 4,
  });

  scatter.push({
    x: 1/Math.sqrt(3),
    y: -Math.sqrt(2/3), 
    z: 0.,
    color: 2,
  })


  alpha = startAngleX;
  beta = startAngleY;

  expectedScatter = lib.rotate_points(scatter, alpha, beta, startAngleZ);
  expectedAxis = lib.rotate_lines(axis, alpha, beta, startAngleZ);
  plot(expectedScatter, 
       expectedAxis, 
       1000);
  drag_end();
}


function drag_start(){
  lib.drag_start2d();
}

function dragged(){
  angle_z = lib.get_drag_angle_2d();

  expectedScatter = lib.rotate_points(scatter, 0, 0, angle_z);
  expectedAxis = lib.rotate_lines(axis, 0, 0, angle_z);
  
  plot(expectedScatter, 
       expectedAxis, 
       0);
}

function dragged_point_only(){
  angle_z = lib.get_drag_angle_2d();

  expectedScatter = lib.rotate_points(scatter, 0, 0, angle_z);
  // expectedAxis = lib.rotate_lines(axis, 0, 0, angle_z);
  
  plot(expectedScatter, 
       expectedAxis, 
       0);
}

function dragged_point(i){
  expectedScatter = [];
  scatter.forEach(function(d, j){
      if (j == i) {
        expectedScatter.push(
            lib.update_point_position_from_mouse(d));
      } else {
        expectedScatter.push(d);
      }
  });

  plot(expectedScatter, 
       expectedAxis, 
       0);
}


function drag_end(){
  scatter = expectedScatter;
  axis = expectedAxis;
  startAngleX = 0;
  startAngleY = 0;
  startAngleZ = 0;
}

init();

return {
  init: function(){init();}
};

})();