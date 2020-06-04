var point_coord_lines2d = (function() {



var origin = [150, 130], 
  scale = 10, 
  scatter = [], 
  axis = [],
  expectedAxis = [],
  startAngleX = Math.PI,
  startAngleY = 0.,
  startAngleZ = 0.
  axis_len = 13;

var svg = d3.select("#svg_point_coord_lines2d");


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

  lib.plot_lines(axis);
  lib.plot_points(scatter, tt,
                    drag_point_fn=function(d, i){dragged_point(i)},
                    drag_start_fn=drag_start,
                    drag_end_fn=drag_end);
  svg.selectAll('._3d').sort(lib.sort_centroid_z);
}


function init(){
  scatter = [];

  for (var i=0; i < 5; i++){
    scatter.push({
        x: d3.randomUniform(-axis_len+3, axis_len-3)(),
        y: d3.randomUniform(-axis_len+3, axis_len-3)(), 
        z: 0.,
        color: i,
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