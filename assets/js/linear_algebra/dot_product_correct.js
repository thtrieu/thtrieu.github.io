let dot_product_correct = (function() {

let origin = [300, 140], 
  scale = 60, 
  scatter = [], 
  axis = [],
  expectedAxis = [],
  startAngleX = Math.PI/8 * 2.65,
  startAngleY = -Math.PI/8,
  startAngleZ = Math.PI/8 * 0.6,
  axis_len = 2,
  unit = axis_len/10,
  svg = null,
  lib = null;


function select_svg(svg_id) {
  svg = d3.select(svg_id);

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
      ex: axis[1/unit - 1 + axis_len/unit * 0][1], 
      ey: axis[1/unit - 1 + axis_len/unit * 1][1], 
      ez: axis[1/unit - 1 + axis_len/unit * 2][1],
  };

  let u = Object.assign({}, scatter[0]),
      v = Object.assign({}, scatter[1]);
  let v_norm = Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);

  let v_ = lib.normalize(v);
  v_.size_factor = 1.5;
  v_.opacity_factor = 0.5;
  v_.z -= 1/scale;
  v_.centroid_z = -1000;
  v_.text = '|v| = 1';
  v_.text_opacity = 0.5;

  let uTv = lib.dot_product(u, v);
  let uTvv = {x: v_.x * uTv,
              y: v_.y * uTv,
              z: v_.z * uTv};

  let uTvv_line = [
      {x: 0, y: 0, z: 0},
      {x: uTvv.x, y: uTvv.y, z: uTvv.z}
  ]
  uTvv_line.color = 0;
  uTvv_line.centroid_z = 1000;
  uTvv_line.text = 'u\u1d40v';
  uTvv_line.text_color = 0;
  uTvv_line.font_size = 14;
  uTvv_line.text_opacity = 1.0;


  let uTv_ = lib.dot_product(u, v_);
  let uTvv_ = {x: v_.x * uTv_,
               y: v_.y * uTv_,
               z: v_.z * uTv_};

  let uTvv__line = [
      {x: 0, y: 0, z: 0},
      {x: uTvv_.x, y: uTvv_.y, z: uTvv_.z}
  ]
  uTvv__line.color = 0;
  uTvv__line.stroke_width = 5;
  uTvv__line.opacity = 0.5;

  lines.push(uTvv_line);
  lines.push(uTvv__line);
  lib.create_dash_segments(u, uTvv_).forEach(
      function(d) {
        d.color = 'grey';
        lines.push(d);
      }
  );

  u.text = 'u';
  v.text = '|v| = ' + v_norm.toFixed(2);
  points = [u, v, v_];

  lib.plot_lines(lines, tt, 'arrow');
  lib.plot_points(points, tt,
                  drag_point_fn=dragged_point,
                  drag_start_fn=drag_start,
                  drag_end_fn=drag_end);
  lib.sort();
}


function init(tt){
  axis = lib.init_float_axis(axis_len=axis_len, unit=unit);
  let u = {
      x: 0.8,
      y: 0.8, 
      z: -0.8,
      color: 4
  },
      v = {
      x: 1/Math.sqrt(14),
      y: -2/Math.sqrt(14), 
      z: 3/Math.sqrt(14),
      color: 3,
  };

  scatter = [u, v];

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

function dragged_point_only(){
  [angle_x, angle_y] = lib.get_drag_angles();

  expectedScatter = lib.rotate_points(scatter, angle_x, angle_y);
  
  plot(expectedScatter, 
       expectedAxis, 
       0);
}


function stretch_point(d, i){
  let d_2d = {x: d.x, y: d.y, z: 0.},
      d_2d_ = lib.normalize(d_2d),
      m = lib.mouse_to_point_position(),
      d_2d_Tm = lib.dot_product(d_2d_, m),
      r = d_2d_Tm / lib.norm(d_2d);

  let p = {
    x: d.x * r,
    y: d.y * r,
    z: d.z * r,
  }
  expectedScatter = [];
  scatter.forEach(function(d, j){
      if (j == i) {
        d.x = p.x;
        d.y = p.y;
        d.z = p.z;
      }
      expectedScatter.push(d);
  });

  plot(expectedScatter, 
       expectedAxis, 
       0);
}


function dragged_point(d, i){
  if (i == 1) {
    stretch_point(d, i);
    return;
  } else if (i == 2) {
    dragged_point_only();
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
}


return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);}
};

})();



