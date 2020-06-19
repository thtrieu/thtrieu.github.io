let point_arrow_location2d = (function() {

let origin = [300, 140], 
  scale = 10, 
  scatter = [], 
  axis = [],
  expectedAxis = [],
  startAngleX = Math.PI,
  startAngleY = 0.,
  startAngleZ = 0.,
  axis_len = 13,
  svg = null,
  lib = null;


function select_svg(svg_id) {
  svg = d3.select(svg_id);

  lib = space_plot_lib(
    svg,
    origin, 
    scale,
    is_2d=true);

  svg = svg.call(d3.drag()
           .on('drag', dragged)
           .on('start', drag_start)
           .on('end', drag_end))
           .append('g');
}


function plot(scatter, axis, tt){

  let lines = [], points = [];

  basis = {
      ex: axis[axis_len * 0][1], 
      ey: axis[axis_len * 1][1],
      ez: axis[axis_len * 2][1]
  };
  scatter.forEach(function(d){
    lines.push(...lib.create_segments(d));
  })

  scatter.forEach(function(d){
    let coord = lib.dot_basis(d, basis);
    let point = Object.assign({}, d);
    point.text = '['.concat(
        coord.x.toFixed(1),
        ', ',
        coord.y.toFixed(1),
        ']');
    points.push(point);
  })

  lib.plot_lines(axis, tt);

  lib.plot_lines(lines, tt, 'arrow');
  lib.plot_points(points, tt,
                  drag_point_fn=function(d, i){dragged_point(i)},
                  drag_start_fn=drag_start,
                  drag_end_fn=drag_end);
  svg.selectAll('._3d').sort(lib.sort_centroid_z);
}


function init(tt){
  axis = lib.init_axis(axis_len=axis_len);

  scatter = [];

  for (let i=0; i < 3; i++){
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
       tt);
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
}


return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);}
};

})();