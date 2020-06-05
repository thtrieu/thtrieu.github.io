var dot_product_project = (function() {

var origin = [150, 140], 
  scatter = [], 
  axis = [],
  basis = {},
  expectedAxis = [],
  startAngleX = Math.PI/8. * 2,
  startAngleY = -Math.PI/8.,
  startAngleZ = Math.PI/8.;

let scale = 60;
let axis_len = 2.3;
let unit = axis_len/10.;

var svg = d3.select("#svg_dot_product_project");


var lib = space_plot_lib(
  svg,
  origin, 
  scale,
  is_2d=false);


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
  // Plot the axis
  lib.plot_lines(axis);

  // Prepare lines and points
  var points = [];
  var lines = [];
  for (var i = 0; i < 2; ++i) {
    d = scatter[i];
    points.push(Object.assign({}, d));
    lines.push(...lib.create_segments(d));
  }

  // Plot the points
  basis = {
      ex: lib.normalize(axis[axis_len/unit * 0][1]), 
      ey: lib.normalize(axis[axis_len/unit * 1][1]),
      ez: lib.normalize(axis[axis_len/unit * 2][1])
  };

  points.forEach(function(d){
    var coord = lib.dot_basis(d, basis);
    d.text = '['.concat(
        coord.x.toFixed(2),
        ', ',
        coord.y.toFixed(2),
        ', ',
        coord.z.toFixed(2),
        ']');
  })

  let u = points[0];
  let v = points[1];
  let uv = lib.dot_product(u, v);
  let uvv = compute_uvv(u, v);

  u.text = 'u = ' + u.text;
  v.text = 'v = ' + v.text;
  uvv.text = '';
  uvv.r = 0;

  points = [u, v, uvv];
  lib.plot_points(points, tt,
                  drag_point_fn=function(d, i){dragged_point(i)},
                  drag_start_fn=drag_start,
                  drag_end_fn=drag_end);

  // Plot the lines
  // lines.push([{x:0, y:0, }])
  dash_segment = [
      {x: u.x, y: u.y, z: u.z},
      {x: uvv.x, y: uvv.y, z: uvv.z}
  ];
  dash_segment.dash = true;
  lines.push(dash_segment);

  arrow_uvv = [
    {x: 0, y: 0, z: 0},
    {x: uvv.x, y: uvv.y, z: uvv.z, color: 0}
  ];
  arrow_uvv.text = 'uv = ' + uv.toFixed(3);
  arrow_uvv.text_color = 0;
  arrow_uvv.centroid_z = 1000;
  arrow_uvv.stroke_width = 2.0;
  // arrow_uvv.opacity = 1.0;
  arrow_uvv.text_opacity = 1.0;
  arrow_uvv.font_size = 13;

  lines.push(arrow_uvv);

  lib.plot_lines(lines, tt, 'arrow');
  lib.sort();
}


function init(){
  scatter = [];

  let u = {
      x: 1.0,
      y: 1.0,
      z: -1.0,
      color: 1
  };

  let v = {
      x: 1./Math.sqrt(14.),
      y: -2./Math.sqrt(14.),
      z: 3./Math.sqrt(14.),
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
  lib.drag_start();
}

function dragged(rotateAxes=true){
  [angle_x, angle_y] = lib.get_drag_angles();

  expectedScatter = lib.rotate_points(scatter, angle_x, angle_y);
  if (rotateAxes) {
    expectedAxis = lib.rotate_lines(axis, angle_x, angle_y);
  }
  
  plot(expectedScatter, 
       expectedAxis, 
       0);
}

function dragged_point(i){
  if (i > 0){
    dragged(rotateAxes=false);
    return;
  }

  [angle_x, angle_y] = lib.get_drag_angles();

  expectedScatter = [];
  scatter.forEach(function(d, j){
      if (j == i) {
        expectedScatter.push(lib.rotate_point(d, angle_x, angle_y));
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