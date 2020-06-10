var dot_product_project = (function() {


var origin = [150, 130], 
  scale = 70, 
  scatter = [], 
  axis = [],
  expectedAxis = [],
  beta = 0, alpha = 0, 

  startAngleX = Math.PI/8 * 2.65,
  startAngleY = -Math.PI/8,
  startAngleZ = Math.PI/8 * 0.6

  axis_len = 2;
  unit = axis_len/10;

var svg = d3.select("#svg_dot_product_project");

var lib = space_plot_lib(
  svg,
  origin,
  scale,
  is_2d=false)


svg = svg.call(d3.drag()
         .on('start', drag_start)
         .on('drag', dragged)
         .on('end', drag_end))
         .append('g');


axis = lib.init_float_axis(axis_len=axis_len, unit=unit);


function plot(scatter, axis, tt){

  var lines = [], points = [];

  lib.plot_lines(axis);

  scatter.forEach(function(d){
    lines.push(...lib.create_segments(d));
  })

  basis = {
      ex: axis[1/unit - 1 + axis_len/unit * 0][1], 
      ey: axis[1/unit - 1 + axis_len/unit * 1][1], 
      ez: axis[1/unit - 1 + axis_len/unit * 2][1],
  };

  let dot_product = scatter[0].x * scatter[1].x +
                    scatter[0].y * scatter[1].y +
                    scatter[0].z * scatter[1].z;

  let projectionx = scatter[1].x * dot_product;
      projectiony = scatter[1].y * dot_product;
      projectionz = scatter[1].z * dot_product;

  let projection_line = [
      {x: 0, y: 0, z: 0},
      {x: projectionx, y: projectiony, z: projectionz,
       color: 0, tt: true}
  ]
  projection_line.centroid_z = 1000;
  projection_line.text = 'u\u1d40v = ' + dot_product.toFixed(3);
  projection_line.text_color = 0;
  projection_line.font_size = 14;
  projection_line.text_opacity = 1.0;

  lines.push(projection_line);

  let dash_line_x_unit = (projectionx - scatter[0].x)/10,
      dash_line_y_unit = (projectiony - scatter[0].y)/10,
      dash_line_z_unit = (projectionz - scatter[0].z)/10;
  for ( i = 0; i < 10; i++) {
    lines.push([
        {x: scatter[0].x + dash_line_x_unit * i,
         y: scatter[0].y + dash_line_y_unit * i,
         z: scatter[0].z + dash_line_z_unit * i},

        {x: scatter[0].x + dash_line_x_unit * (i+1/2),
         y: scatter[0].y + dash_line_y_unit * (i+1/2),
         z: scatter[0].z + dash_line_z_unit * (i+1/2),
         tt: true}
    ])
  };


  scatter.forEach(function(d,i){
    var coord = lib.dot_basis(d, basis);
    var point = Object.assign({}, d);
    if (i == 0) {
      point.text = 'u = ';
    } else {
      point.text = 'v = ';
    }
    point.text += '['.concat(
        coord.x.toFixed(2),
        ', ',
        coord.y.toFixed(2),
        ', ',
        coord.z.toFixed(2),
        ']');
    points.push(point);
  })


  lib.plot_lines(lines, tt, 'arrow');
  lib.plot_points(points, tt,
                  drag_point_fn=function(d, i){
                    if ( i == 0) {
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
      x: 0.8,
      y: 0.8, 
      z: -0.8,
      color: 4,
  });

  scatter.push({
      x: 1/Math.sqrt(14),
      y: -2/Math.sqrt(14), 
      z: 3/Math.sqrt(14),
      color: 2,
  });

  expectedScatter = lib.rotate_points(
      scatter, startAngleX, startAngleY, startAngleZ);
  expectedAxis = lib.rotate_lines(
      axis, startAngleX, startAngleY, startAngleZ);
  plot(expectedScatter, 
       expectedAxis, 
       1000);
  drag_end();
}


function drag_start(){
  lib.drag_start();
}

function dragged(){
  [angle_x, angle_y] = lib.get_drag_angles();

  expectedScatter = lib.rotate_points(scatter, angle_x, angle_y);
  expectedAxis = lib.rotate_lines(axis, angle_x, angle_y);
  
  plot(expectedScatter, 
       expectedAxis, 
       0);
}

function dragged_point_only(){
  [angle_x, angle_y] = lib.get_drag_angles();

  expectedScatter = lib.rotate_points(scatter, angle_x, angle_y);
  
  plot(expectedScatter, 
       expectedAxis, 
       0);
}

function dragged_point(i){
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



