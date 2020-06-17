let point_arrow_location = (function() {


let origin = [300, 140], 
  scale = 10, 
  scatter = [], 
  axis = [],
  expectedAxis = [],
  beta = 0, alpha = 0, 
  startAngleX = Math.PI/8. * 2,
  startAngleY = -Math.PI/8.,
  startAngleZ = Math.PI/8.,
  axis_len = 13,
  svg = null,
  lib = null;


function select_svg(svg_id) {
  svg = d3.select("#svg_point_arrow_location");

  lib = space_plot_lib(
    svg,
    origin,
    scale,
    is_2d=false)

  svg = svg.call(d3.drag()
           .on('start', drag_start)
           .on('drag', dragged)
           .on('end', drag_end))
           .append('g');
}


function plot(scatter, axis, tt){

  let lines = [], points = [];

  lib.plot_lines(axis, tt);

  scatter.forEach(function(d){
    lines.push(...lib.create_segments(d));
  })

  basis = {
      ex: axis[axis_len * 0][1], 
      ey: axis[axis_len * 1][1], 
      ez: axis[axis_len * 2][1],
  };

  scatter.forEach(function(d){
    let coord = lib.dot_basis(d, basis);
    let point = Object.assign({}, d);
    point.text = '['.concat(
        coord.x.toFixed(1),
        ', ',
        coord.y.toFixed(1),
        ', ',
        coord.z.toFixed(1),
        ']');
    points.push(point);
  })


  lib.plot_lines(lines, tt, 'arrow');
  lib.plot_points(points, tt,
                  drag_point_fn=function(d, i){dragged_point(i)},
                  drag_start_fn=drag_start,
                  drag_end_fn=drag_end);
  lib.sort();
}


function init(tt){
  axis = lib.init_axis(axis_len=axis_len);
  scatter = [];

  for (let i=0; i < 3; i++){
    scatter.push({
        x: d3.randomUniform(-axis_len+3, axis_len-3)(),
        y: d3.randomUniform(-axis_len+3, axis_len-3)(), 
        z: d3.randomUniform(-axis_len+3, axis_len-3)(),
        color: i*2,
    });
  }

  expectedScatter = lib.rotate_points(
      scatter, startAngleX, startAngleY, startAngleZ);
  expectedAxis = lib.rotate_lines(
      axis, startAngleX, startAngleY, startAngleZ);
  plot(expectedScatter, 
       expectedAxis, 
       tt);
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
}


return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);}
};

})();



