var point_cloud = (function() {


var origin = [150, 130], 
  scale = 10, 
  scatter = [], 
  axis = [],
  expectedAxis = [],
  beta = 0, alpha = 0, 
  startAngleX = Math.PI/8. * 2,
  startAngleY = -Math.PI/8.,
  startAngleZ = Math.PI/8.
  axis_len = 13;


var svg = d3.select("#svg_point_cloud");

var lib = space_plot_lib(
  svg,
  origin,
  scale,
  is_2d=false)


svg = svg.call(d3.drag()
         .on('drag', dragged)
         .on('start', drag_start)
         .on('end', drag_end))
         .append('g');



axis = lib.init_axis(axis_len=axis_len);


function plot(scatter, axis, tt){

  var lines = [], points = [];
  lib.plot_points(scatter, tt,
                  drag_point_fn=function(d, i){dragged_point(i)},
                  drag_start_fn=drag_start,
                  drag_end_fn=drag_end);
  lib.sort();
}


function init(){
  scatter = [];

  for (var i=0; i < 15; i++){
    scatter.push({
        x: d3.randomUniform(-axis_len+3, axis_len-3)(),
        y: d3.randomUniform(-axis_len+3, axis_len-3)(), 
        z: d3.randomUniform(-axis_len+3, axis_len-3)(),
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