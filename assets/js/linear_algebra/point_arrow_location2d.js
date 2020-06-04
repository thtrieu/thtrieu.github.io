var point_arrow_location2d = (function() {



var origin = [150, 130], 
  scale = 10, 
  scatter = [], 
  axis = [],
  expectedAxis = [],
  startAngleX = Math.PI,
  startAngleY = 0.,
  startAngleZ = 0.
  axis_len = 13;

var svg = d3.select("#svg_point_arrow_location2d");


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

axis = lib.init_axis(axis_len=axis_len);


function plot(scatter, axis, tt){

  basis = {
      ex: axis[axis_len * 0][1], 
      ey: axis[axis_len * 1][1],
      ez: 0.
  };

  scatter.forEach(function(d){
    var coord = lib.dot_basis(d, basis);
    d.text = '['.concat(
        coord.x.toFixed(1),
        ', ',
        coord.y.toFixed(1),
        ']');
  })

  lib.plot_lines(axis);

  var lines = [];
  scatter.forEach(function(d){
    lines.push([
        {x: 0., y: 0., z: 0.},
        {x: d.x, y: d.y, z: d.z, 
         color: d.color, tt: true}
    ]);
  })


  lib.plot_lines(lines, tt, 'arrow');
  lib.plot_points(scatter, tt,
                    drag_point_fn=function(d, i){dragged_point(i)},
                    drag_start_fn=drag_start,
                    drag_end_fn=drag_end);
  svg.selectAll('._3d').sort(lib.sort_centroid_z);
}


function init(){
  scatter = [];

  for (var i=0; i < 3; i++){
    scatter.push({
        x: d3.randomUniform(-axis_len+3, axis_len-3)(),
        y: d3.randomUniform(-axis_len+3, axis_len-3)(), 
        z: 0.,
        color: i*2,
    });
  }

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