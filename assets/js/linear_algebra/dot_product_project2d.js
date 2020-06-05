var dot_product_project2d = (function() {

var origin = [150, 140], 
  scatter = [], 
  axis = [],
  expectedAxis = [],
  startAngleX = Math.PI,
  startAngleY = 0.,
  startAngleZ = 0.;

let scale = 60;
let axis_len = 2;
let unit = axis_len/10.;

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

function compute_uvv(u, v) {
  let uv = lib.dot_product(u, v);
  return {
      x: v.x * uv,
      y: v.y * uv,
      z: 0.,
      color: 0
  };
}


function plot(scatter, axis, tt){

  basis = {
      ex: lib.normalize(axis[axis_len/unit * 0][1]), 
      ey: lib.normalize(axis[axis_len/unit * 1][1]),
      ez: 0.
  };

  lib.plot_lines(axis);

  let u = scatter[0];
  let v = scatter[1];
  let uv = lib.dot_product(u, v);
  let uvv = compute_uvv(u, v);

  scatter.forEach(function(d){
    var coord = lib.dot_basis(d, basis);
    d.text = '['.concat(
        coord.x.toFixed(2),
        ', ',
        coord.y.toFixed(2),
        ']');
  })

  u.text = 'u = ' + u.text;
  v.text = 'v = ' + v.text;
  uvv.text = '';
  uvv.r = 0;

  scatter = [u, v, uvv];

  var lines = [];
  // scatter.forEach(function(d){
  //   lines.push(...lib.create_segments(d));
  // })
  
  scatter.forEach(function(d){
    lines.push([
        {x: 0., y: 0., z: 0.},
        {x: d.x, y: d.y, z: d.z, 
         color: d.color, tt: true}
    ]);
  })

  arrow_uvv = lines[2];
  arrow_uvv.text = 'uv = ' + uv.toFixed(3);
  arrow_uvv.text_color = arrow_uvv[1].color;

  dash_segment = [
      {x: u.x, y: u.y, z: u.z},
      {x: uvv.x, y: uvv.y, z: uvv.z}
  ];
  dash_segment.dash = true;
  lines.push(dash_segment);

  lib.plot_lines(lines, tt, 'arrow');
  lib.plot_points(scatter, tt,
                    drag_point_fn=function(d, i){dragged_point(i)},
                    drag_start_fn=drag_start,
                    drag_end_fn=drag_end);
  lib.sort();
}


function init(){
  scatter = [];

  let u = {
      x: -1.0,
      y: -4.0/3.,
      z: 0.,
      color: 1
  };

  let v = {
      x: 1./Math.sqrt(3.),
      y: -Math.sqrt(2./3.),
      z: 0.,
      color: 2
  };

  let uvv = compute_uvv(u, v);

  scatter = [u, v, uvv]

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

function dragged(rotateAxes=true){
  angle_z = lib.get_drag_angle_2d();

  expectedScatter = lib.rotate_points(scatter, 0, 0, angle_z);
  if (rotateAxes) {
    expectedAxis = lib.rotate_lines(axis, 0, 0, angle_z);
  };
  
  plot(expectedScatter, 
       expectedAxis, 
       0);
}

function dragged_point(i){
  if (i > 0){
    dragged(rotateAxes=false);
    return;
  }

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