let basis_rotate2d = (function() {

let origin = [150, 140], 
  origin2 = [450, 140],
  scale = 100, 
  scatter = [],
  cloud = [],
  axis = [], 
  expectedScatter = [],
  expectedCloud = [],
  expectedAxis = [],
  startAngleX = Math.PI,
  startAngleY = 0.,
  startAngleZ = 0.,
  axis_len = 1.2,
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
    is_2d=true);

  svg = svg.call(d3.drag()
           .on('drag', dragged)
           .on('start', drag_start)
           .on('end', drag_end))
           .append('g');  
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


function plot(scatter, cloud, axis, tt){

  let basis = {
    ex: lib.normalize(axis[axis_len/unit * 0][1]),
    ey: lib.normalize(axis[axis_len/unit * 1][1]),
    ez: lib.normalize(axis[axis_len/unit * 1][1]),
  };

  let points = [];
  scatter.forEach(function(d){
    points.push(Object.assign({}, d));
  });

  points.push({
    x: 0,
    y: 0,
    z: 1,
    opacity: 0,
    color: 9
  });
  
  let lines = [];
  points.forEach(function(d, i){
    if (i == 0) {
      return;
    }
    lines.push(...lib.create_segments(d));
  });
  lib.plot_lines(lines, tt, 'arrow');

  let [u, v1, v2, v3] = points;

  points.forEach(function(p, i){
    let coord = lib.dot_basis(p, basis);
    let txt = ' = ['.concat(
        coord.x.toFixed(1), ', ',
        coord.y.toFixed(1), ']'
    );
    if (i == 0) {
      p.text = 'u';
    } else if (i == 1) {
      p.text = 'v\u2081';
    } else if (i == 2) {
      p.text = 'v\u2082';
    } else if (i == 3) {
      p.text = 'v\u2083';
      p.text_opacity = 0.0;
    }

    if (i > 0) {
      p.text += txt;
    }
  })

  basis.ex.color = v1.color;
  basis.ex.r = 6;
  basis.ex.opacity = 0.5;

  basis.ey.color = v2.color;
  basis.ey.r = 6;
  basis.ey.opacity = 0.5;

  basis.ez.color = v3.color;
  basis.ez.r = 6;
  basis.ez.opacity = 0.0;


  points.push(...[basis.ex, basis.ey, basis.ez]);
  lib.plot_points(points, tt,
                  drag_point_fn=dragged_point,
                  drag_start_fn=drag_start,
                  drag_end_fn=drag_end);
  lib.plot_points(cloud, tt, null, null, null, 'cloud');

  plot_v_perspective(u, cloud, v1, v2, v3, axis, tt);
  lib.sort();
}


function compute_transformation(u, v1, v2, v3, basis) {
  let uTv1 = lib.dot_product(u, v1) / lib.norm2(v1),
      uTv2 = lib.dot_product(u, v2) / lib.norm2(v2),
      uTv3 = 1.0;

  let r = Object.assign({}, u);
  r.x = 0;
  r.y = 0;
  r.z = 0;
  let components = [
      r,
      lib.times(basis.x, uTv1),
      lib.times(basis.y, uTv2),
  ]
  return lib.add(components);
}


function plot_v_perspective(u, cloud, v1, v2, v3, axis, tt) {
  let basis = {
    x: lib.normalize(axis[axis_len/unit * 0][1]),
    y: lib.normalize(axis[axis_len/unit * 1][1]),
    z: lib.normalize(axis[axis_len/unit * 2][1]),
  };

  u = compute_transformation(u, v1, v2, v3, basis);
  u.color = 4
  u.text = 'u\' = [u\u1d40v\u2081, u\u1d40v\u2082]';
  lib.plot_points([u], tt, null, null, null, 'u2', origin2);

  let cloud_rotated = [];
  cloud.forEach(function(d){
    cloud_rotated.push(
        compute_transformation(d, v1, v2, v3, basis));
  })
  lib.plot_points(cloud_rotated, 
                  tt, null, null, null, 'cloud2', origin2);

  basis.x.color = v1.color;
  basis.x.r = 4;
  basis.x.text = '[1, 0]';

  basis.y.color = v2.color;
  basis.y.r = 4;
  basis.y.text = '[0, 1]';

  basis.z.color = v3.color;
  basis.z.r = 4;
  basis.z.text = '';
  basis.z.opacity = 0;

  let unit_marks = [basis.x, basis.y, basis.z] 
  lib.plot_points(unit_marks, 
                  tt, null, null, null, 'basis2', origin2);
}


function init(tt){
  axis = lib.init_float_axis(axis_len=axis_len, unit=unit);
  scatter = [];

  scatter.push({
    x: -0.5,
    y: -0.5, 
    z: 0.,
    color: 4,
  });

  scatter.push({
    x: 1.,
    y: 0., 
    z: 0.,
    color: 3,
  })

  scatter.push({
    x: 0.,
    y: 1., 
    z: 0.,
    color: 19,
  })

  cloud = [];
  for (let i = 0; i < 10; i ++) {
    cloud.push({
      x: d3.randomUniform(-0.5, 0.5)(),
      y: d3.randomUniform(-0.5, 0.5)(),
      z: d3.randomUniform(-0.5, 0.5)(),
      color: i * 2,
      opacity: 0.5,
      r: 4,
    })
  }

  alpha = startAngleX;
  beta = startAngleY;

  scatter = lib.rotate_points(scatter, alpha, beta, startAngleZ);
  cloud = lib.rotate_points(cloud, alpha, beta, startAngleZ);
  axis = lib.rotate_lines(axis, alpha, beta, startAngleZ);
  plot(scatter,
       cloud,
       axis,
       tt);
}


let drag_on_left = true;


function drag_start(){
  if (lib.get_mouse_position().x < 300) {
    drag_on_left = true;
    lib.drag_start2d();
  } else {
    drag_on_left = false;
    lib.drag_start2d(origin2);
  }
}

function dragged(){
  if (drag_on_left) {
    angle_z = lib.get_drag_angle_2d();  
  } else {
    angle_z = lib.get_drag_angle_2d(origin2);  
  }
  
  expectedScatter = lib.rotate_points(scatter, 0, 0, angle_z);
  expectedCloud = lib.rotate_points(cloud, 0, 0, angle_z);
  expectedAxis = lib.rotate_lines(axis, 0, 0, angle_z);
  
  plot(expectedScatter,
       expectedCloud, 
       expectedAxis,
       0);
}


function dragged_v_only(){
  angle_z = lib.get_drag_angle_2d();

  expectedScatter = lib.rotate_points(scatter, 0, 0, angle_z);
  expectedScatter[0] = scatter[0];
  expectedCloud = cloud;
  expectedAxis = axis;

  plot(expectedScatter, 
       expectedCloud,
       expectedAxis,
       0);
}


function dragged_point(d, i){
  if (!drag_on_left) {
    return;
  }
  if (i > 0) {
    dragged_v_only();
    return;
  }

  expectedScatter = [];
  scatter.forEach(function(d, j){
      if (j == i) {
        let r = lib.update_point_position_from_mouse(d);
        r.x = Math.min(r.x, (300-origin[0])/scale);
        expectedScatter.push(r);
      } else {
        expectedScatter.push(d);
      }
  });
  expectedCloud = cloud;
  expectedAxis = axis;

  plot(expectedScatter,
       expectedCloud, 
       expectedAxis, 
       0);
}


function drag_end(){
  scatter = expectedScatter;
  cloud = expectedCloud;
  axis = expectedAxis;
}


return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);},
  set_show_proj: function(s){show_proj = s;},
  replot: function(){
    plot(scatter, 
         cloud,
         axis,
         1000);
  },
};

})();