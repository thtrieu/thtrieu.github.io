let dot_product_project2d = (function() {

let origin = [150, 140], 
    scale = 60, 
    scatter = [], 
    axis = [],
    expectedAxis = [],

    startAngleX = Math.PI,
    startAngleY = 0.,
    startAngleZ = 0.,
    
    axis_len = 2,
    unit = axis_len/10,
    
    svg = d3.select("#svg_dot_product_project2d");

let lib = space_plot_lib(
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
  let u = scatter[0],
      v = scatter[1];

  basis = {
      ex: axis[1/unit - 1 + axis_len * 0][1], 
      ey: axis[1/unit - 1 + axis_len * 1][1],
      ez: {x: 0, y: 0, z: 0}, // dummy 
  };

  scatter.forEach(function(d, i){
    let coord = lib.dot_basis(d, basis);
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

  let lines = [];
  scatter.forEach(function(d, i){
    lines.push([
        {x: 0., y: 0., z: 0.},
        {x: d.x, y: d.y, z: d.z, 
         color: d.color, tt: true}
    ]);
    if (i == 0) {
      lines.centroid_z = 900;
    }
  });

  let uTv = lib.dot_product(u, v);
  let points = [];
  scatter.forEach(function(d){
    points.push(d)
  })
  let uTvv = {
      x: v.x * uTv,
      y: v.y * uTv,
      z: v.z * uTv,
      r: 1.8,
      color: 'grey'
  };
  uTvv.centroid_z = 1000;
  points.push(uTvv);

  let uTvv_line = [
      {x: 0, y: 0, z: 0},
      {x: uTvv.x, y: uTvv.y, z: 0,
       tt:true}
  ];
  uTvv_line.color = 0;
  uTvv_line.text = 'u\u1d40v = '.concat(uTv.toFixed(3));
  uTvv_line.text_color = 0;
  uTvv_line.font_size = 15;

  lines.push(uTvv_line);

  let dash_line = [
      {x: u.x, y: u.y, z: u.z},
      {x: uTvv.x, y: uTvv.y, z: 0,
       tt:true}];
  
  dash_line.dash = true;
  dash_line.centroid_z = -5;
  lines.push(dash_line);

  lib.plot_lines(lines, tt, 'arrow');
  lib.plot_points(points, tt,
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
  let u = {
      x: -1.0,
      y: -4.0/3, 
      z: 0.,
      color: 4,
  };

  let v = {
      x: 1/Math.sqrt(3),
      y: -Math.sqrt(2/3), 
      z: 0.,
      color: 2,
  };

  scatter = [u, v]

  expectedScatter = lib.rotate_points(scatter, startAngleX, startAngleY, startAngleZ);
  expectedAxis = lib.rotate_lines(axis, startAngleX, startAngleY, startAngleZ);
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