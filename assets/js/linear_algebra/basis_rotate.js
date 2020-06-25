let basis_rotate = (function() {

let origin = [150, 140], 
  origin2 = [450, 140],
  scale = 120, 
  scatter = [],
  cloud = [],
  axis = [], 
  expectedScatter = [],
  expectedCloud = [],
  expectedAxis = [],
  startAngleX = Math.PI/8 * 1.7,
  startAngleY = -Math.PI/8,
  startAngleZ = Math.PI/8 * 0.6,
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
    is_2d=false);

  svg = svg.call(d3.drag()
           .on('drag', dragged)
           .on('start', drag_start)
           .on('end', drag_end))
           .append('g');  
}


function plot(scatter, cloud, axis, tt){

  let basis = {
    ex: lib.normalize(axis[axis_len/unit * 0][1]),
    ey: lib.normalize(axis[axis_len/unit * 1][1]),
    ez: lib.normalize(axis[axis_len/unit * 2][1]),
  };

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
  lib.plot_lines(lines, tt, 'arrow');

  let [u, v1, v2, v3] = points;

  points.forEach(function(p, i){
    let coord = lib.dot_basis(p, basis);
    let txt = ' = ['.concat(
        coord.x.toFixed(1), ', ',
        coord.y.toFixed(1), ', ',
        coord.z.toFixed(1), ']',
    );
    if (i == 0) {
      p.text = 'u';
    } else if (i == 1) {
      p.text = 'v\u2081';
    } else if (i == 2) {
      p.text = 'v\u2082';
    } else if (i == 3) {
      p.text = 'v\u2083';
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
  basis.ez.opacity = 0.5;

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
      uTv3 = lib.dot_product(u, v3) / lib.norm2(v3);

  let r = Object.assign({}, u);
  r.x = 0;
  r.y = 0;
  r.z = 0;
  let components = [
      r,
      lib.times(basis.x, uTv1),
      lib.times(basis.y, uTv2),
      lib.times(basis.z, uTv3),
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
  u.color = 4;
  u.text = 'u\' = [u\u1d40v\u2081, u\u1d40v\u2082, u\u1d40v\u2083]';
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
  basis.x.text = '[1, 0, 0]';

  basis.y.color = v2.color;
  basis.y.r = 4;
  basis.y.text = '[0, 1, 0]';

  basis.z.color = v3.color;
  basis.z.r = 4;
  basis.z.text = '[0, 0, 1]';

  let unit_marks = [basis.x, basis.y, basis.z] 
  lib.plot_points(unit_marks, 
                  tt, null, null, null, 'basis2', origin2);
}


function fibonacci_sphere(radius, n=50) {
  let points = [];
  let phi = Math.PI * (3 - Math.sqrt(5));

  for (let i = 0; i < n; i++) {
    let y = 1 - (i / (n-1)) * 2
    let r = Math.sqrt(1 - y*y);

    let theta = phi * i;
    points.push({
      x: Math.cos(theta) * r * radius,
      y: y * radius,
      z: Math.sin(theta) * r * radius,
      color: 'grey'
    });
  }

  return points;
}


function init(tt){
  axis = lib.init_float_axis(axis_len=axis_len, unit=unit);
  scatter = [];

  let u = null;
  let u_i = 24;
  cloud = [];
  fibonacci_sphere(0.5).forEach(function(p, i){
    if (i == u_i) {
      u = p;
    } else {
      cloud.push(p);
    }
  })
  
  u.color = 4;
  let v1 = {
      x: 1.0,
      y: 0.0, 
      z: 0.0, 
      color: 0,
  },
      v2 = {
      x: 0.0, 
      y: 1.0, 
      z: 0.0, 
      color: 3,
  },
      v3 = {
      x: 0.0, 
      y: 0.0,  
      z: 1.0,  
      color: 9,
  };

  scatter = [u, v1, v2, v3];

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
    lib.drag_start();
  } else {
    drag_on_left = false;
    lib.drag_start(origin2);
  }
}

function dragged(){
  if (drag_on_left) {
    [angle_x, angle_y] = lib.get_drag_angles();  
  } else {
    [angle_x, angle_y] = lib.get_drag_angles(origin2);
  }  
  expectedScatter = lib.rotate_points(scatter, angle_x, angle_y);
  expectedCloud = lib.rotate_points(cloud, angle_x, angle_y);
  expectedAxis = lib.rotate_lines(axis, angle_x, angle_y);
  
  plot(expectedScatter,
       expectedCloud,
       expectedAxis,
       0);
}


function dragged_v_only(){
  let [angle_x, angle_y] = lib.get_drag_angles();

  expectedScatter = lib.rotate_points(scatter, angle_x, angle_y);
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
  expectedCloud = lib.rotate_points(cloud, angle_x, angle_y);
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