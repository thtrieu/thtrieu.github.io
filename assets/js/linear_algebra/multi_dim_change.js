let multi_dim_change = (function() {

let origin = [150, 140], 
  origin2 = [450, 140],
  scale = 60, 
  scatter = [], 
  axis = [],
  expectedAxis = [],
  axis2 = [],
  expectedAxis2 = [],
  startAngleX = Math.PI/8 * 2.65,
  startAngleY = -Math.PI/8,
  startAngleZ = Math.PI/8 * 0.6,
  axis_len = 2,
  unit = axis_len/10,
  svg = null,
  lib = null,
  show_proj = true;


function select_svg(svg_id) {
  svg = d3.select(svg_id);

  lib = space_plot_lib(
    svg,
    origin, 
    scale,
    is_2d=false);

  svg = svg.call(d3.drag()
           .on('drag', dragged)
           .on('start', drag_start)
           .on('end', drag_end))
           .append('g');  
}


function plot_project_u_onto_v(u, v, tt, name, visible=true) {
  let lines = [];
  let uTv = lib.dot_product(u, v)/lib.norm2(v);
  let uTvv = {
      x: v.x * uTv,
      y: v.y * uTv,
      z: v.z * uTv,
      color: v.color-1,
      tt: true
  }

  let uTvv_line = [
      {x: 0, y: 0, z: 0},
      uTvv
  ];
  uTvv_line.text_color = 0;
  uTvv_line.font_size = 15;
  uTvv_line.stroke_width = 2.0
  uTvv_line.centroid_z = 1000;
  if (!visible) {
    uTvv_line.opacity = 0;
  }

  lines.push(uTvv_line);

  lib.create_dash_segments(u, uTvv).forEach(
      function(d) {
        d.color = 'grey';
        if (!visible) {
          d.opacity = 0.;
        }
        lines.push(d);
      }
  );

  if (!show_proj) {
    lines = hide(lines);
  }
  lib.plot_lines(lines, tt, name);
}


function hide(objs, op=0.0) {
  let r = [];
  objs.forEach(function(d) {
    let d_ = Object.assign({}, d);
    d_.opacity = op;
    d_.text_opacity = op;
    r.push(d_);
  })
  return r;
}


function plot(scatter, axis, axis2, tt, show_proj){
  let axis_cp = axis;
  if (show_proj) {
    axis_cp = hide(axis_cp, 0.2);
  }
  lib.plot_lines(axis_cp, tt, 'axis');

  let points = [];
  scatter.forEach(function(d){
    points.push(Object.assign({}, d));
  });
  
  let lines = [];
  points.forEach(function(d, i){
    if (i == 0) {
      return;
    }
    lines.push(...lib.create_segments(d));
  });
  if (!show_proj) {
    lines = hide(lines);
  }
  lib.plot_lines(lines, tt, 'arrow');

  let [u, v1, v2, v3] = points;

  plot_project_u_onto_v(u, v1, tt, 'v1', true, show_proj);
  plot_project_u_onto_v(u, v2, tt, 'v2', true, show_proj);
  plot_project_u_onto_v(u, v3, tt, 'v3', true, show_proj);

  points.forEach(function(p, i){
    if (i == 0) {
      p.text = 'u';
    } else if (i == 1) {
      p.text = 'v\u2081';
    } else if (i == 2) {
      p.text = 'v\u2082';
    } else if (i == 3) {
      p.text = 'v\u2083';
    }
  })
  lib.plot_points(points, tt,
                  drag_point_fn=dragged_point,
                  drag_start_fn=drag_start,
                  drag_end_fn=drag_end);
  plot_v_perspective(u, v1, v2, v3, axis2, tt, show_proj);
  lib.sort();
}


function plot_v_perspective(u, v1, v2, v3, axis2, tt, show_proj) {
  axis2.forEach(function(d, i) {
    let axis_ord = Math.floor(i / (axis_len/unit));
    let v = [v1, v2, v3][axis_ord];
    if (show_proj) {
      d.color = v.color;
    } else {
      d.color = 'grey';
    }
  });

  lib.plot_lines(axis2, tt, 'axis2', null, null, null, origin2);
  basis = {
    x: lib.normalize(axis2[axis_len/unit * 0][1]),
    y: lib.normalize(axis2[axis_len/unit * 1][1]),
    z: lib.normalize(axis2[axis_len/unit * 2][1]),
  };

  let uTv1 = lib.dot_product(u, v1) / lib.norm2(v1),
      uTv2 = lib.dot_product(u, v2) / lib.norm2(v2),
      uTv3 = lib.dot_product(u, v3) / lib.norm2(v3);

  let components = [
      lib.times(basis.x, uTv1),
      lib.times(basis.y, uTv2),
      lib.times(basis.z, uTv3),
  ]
  let u_ = lib.add(components);
  u_.color = 4
  u_.text = 'u\' = [u\u1d40v\u2081, u\u1d40v\u2082, u\u1d40v\u2083]';
  lib.plot_points([u_], tt, null, null, null, 'u2', origin2);

  basis.x.color = v1.color;
  basis.x.r = 3;
  basis.x.text = 1;

  basis.y.color = v2.color;
  basis.y.r = 3;
  basis.y.text = 1;

  basis.z.color = v3.color;
  basis.z.r = 3;
  basis.z.text = 1;

  let unit_marks = [basis.x, basis.y, basis.z] 
  if (!show_proj) {
    unit_marks = hide(unit_marks);
  }
  lib.plot_points(unit_marks, 
                  tt, null, null, null, 'basis2', origin2);

  let lines = [];
  let ux_line = [{x:0, y:0, z:0}, components[0]],
      uy_line = [{x:0, y:0, z:0}, components[1]],
      uz_line = [{x:0, y:0, z:0}, components[2]];

  ux_line.color = v1.color-1;
  uy_line.color = v2.color-1;
  uz_line.color = v3.color-1;

  let u_lines = [ux_line, uy_line, uz_line];
  if (!show_proj) {
    u_lines = hide(u_lines);
  }
  lib.plot_lines(
      u_lines,
      tt, 'u_lines', null, null, null, origin2);

  let x_dash_lines = lib.create_dash_segments(
      lib.strip(u), lib.strip(components[0]), 0.05);
  if (!show_proj) {
    x_dash_lines = hide(x_dash_lines);
  }
  lib.plot_lines(
      x_dash_lines,
      tt, 'x_dash_lines', null, null, null, origin2);

  let y_dash_lines = lib.create_dash_segments(
      lib.strip(u), lib.strip(components[1]), 0.05);
  if (!show_proj) {
    y_dash_lines = hide(y_dash_lines);
  }
  lib.plot_lines(
      y_dash_lines,
      tt, 'y_dash_lines', null, null, null, origin2);

  let z_dash_lines = lib.create_dash_segments(
          lib.strip(u), lib.strip(components[2]), 0.05);
  if (!show_proj) {
    z_dash_lines = hide(z_dash_lines);
  }
  lib.plot_lines(
      z_dash_lines,
      tt, 'z_dash_lines', null, null, null, origin2);
}


function init(tt){
  axis = lib.init_float_axis(axis_len=axis_len, unit=unit);
  axis2 = lib.init_float_axis(axis_len=axis_len, unit=unit);
  scatter = [];

  let u = {
      x: 1,
      y: 1, 
      z: 0.8,
      color: 4
  },
      v1 = {
      x: Math.sqrt(13/14)*1.5,
      y: Math.sqrt(.5/14)*1.5, 
      z: Math.sqrt(.5/14)*1.5, 
      color: 3,
  },
      v2 = {
      x: -Math.sqrt(0.0)*1.5, 
      y: -Math.sqrt(1.0)*1.5, 
      z: -Math.sqrt(0.0)*1.5, 
      color: 19,
  },
      v3 = {
      x: Math.sqrt(0.5/14)*1.5, 
      y: Math.sqrt(0.5/14)*1.5,  
      z: Math.sqrt(13/14)*1.5,  
      color: 9,
  };

  scatter = [u, v1, v2, v3];


  alpha = startAngleX;
  beta = startAngleY;

  scatter = lib.rotate_points(scatter, alpha, beta, startAngleZ);
  axis = lib.rotate_lines(axis2, alpha, beta, startAngleZ);
  axis2 = lib.rotate_lines(axis2, alpha, beta, startAngleZ);
  plot(scatter,
       axis,
       axis2, 
       tt,
       show_proj);
}


let drag_on_left = true;


function drag_start(){
  if (lib.get_mouse_position().x < 300) {
    drag_on_left = true;
    lib.drag_start();
  } else {
    drag_on_left = false;
    lib.drag_start(origin2);
  }
}

function dragged(){
  if (drag_on_left) {
    dragged_left();
  } else {
    dragged_right();
  }
}


function dragged_right(){
  let [angle_x, angle_y] = lib.get_drag_angles(origin2);
  expectedAxis2 = lib.rotate_lines(axis2, angle_x, angle_y);
  
  plot(scatter, 
       axis,
       expectedAxis2, 
       0,
       show_proj);
}


function dragged_left(){
  let [angle_x, angle_y] = lib.get_drag_angles();

  expectedScatter = lib.rotate_points(scatter, angle_x, angle_y);
  expectedAxis = lib.rotate_lines(axis, angle_x, angle_y);
  
  plot(expectedScatter, 
       expectedAxis,
       axis2, 
       0,
       show_proj);
}


function dragged_v_only(){
  if (!drag_on_left) {
    return;
  }
  let [angle_x, angle_y] = lib.get_drag_angles();

  expectedScatter = lib.rotate_points(scatter, angle_x, angle_y);
  expectedScatter[0] = scatter[0];
  expectedAxis = axis;
  
  plot(expectedScatter,
       expectedAxis, 
       axis2, 
       0,
       show_proj);
}


function dragged_point(d, i){
  if (!drag_on_left) {
    return;
  }
  if (i > 0) {
    dragged_v_only();
    return;
  }

  let [angle_x, angle_y] = lib.get_drag_angles();
  expectedScatter = [];
  scatter.forEach(function(d, j){
      if (j == i) {
        r = lib.rotate_point(d, angle_x, angle_y);
        expectedScatter.push(r);
      } else {
        expectedScatter.push(d);
      }
  });
  expectedAxis = axis;

  plot(expectedScatter,
       expectedAxis, 
       axis2, 
       0,
       show_proj);
}


function drag_end(){
  if (drag_on_left) {
    scatter = expectedScatter;
    axis = expectedAxis;
  } else {
    axis2 = expectedAxis2;
  }
}


return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);},
  set_show_proj: function(s){show_proj = s;},
  replot: function(){
    plot(scatter, 
         axis,
         axis2, 
         1000,
         show_proj);
  },
};

})();