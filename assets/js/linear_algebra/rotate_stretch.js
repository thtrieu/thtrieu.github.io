let rotate_stretch = (function() {

let origin = [150, 140], 
    origin2 = [480, 140],
    scale = 100, 
    sphere_shadow = null,
    u_sphere = null,
    scatter = [],
    cloud = [],
    axis = [], 
    grid = [],
    expectedGrid = [],
    expectedScatter = [],
    expectedCloud = [],
    expectedAxis = [],
    startAngleX = Math.PI/8 * 2.65,
    startAngleY = -Math.PI/8,
    startAngleZ = Math.PI/8 * 0.6,
    axis_len = 1.2,
    unit = axis_len/10,
    radius = 0.5,
    svg = null,
    lib = null;


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


function round_to(x, n, tol=0.02) {
  if (Math.abs(x - 0.0) < tol) {
    return 0;
  }
  if (Math.abs(x - 1.0) < tol) {
    return 1;
  }
  return x.toFixed(n);
}



function plot(scatter, grid, axis, tt, delay=0){
  lib._plot_lines({data: grid, 
                   tt: tt, 
                   delay: delay,
                   name: 'grid'});

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
  lib._plot_lines({data: lines, tt: tt, delay: delay, name: 'arrow'});

  let [u, v1, v2, v3] = points;

  let transform = circle_to_ellipse_shadow_map(
      lib.times(basis.ex, 1./lib.norm(v1)),
      lib.times(basis.ey, 1./lib.norm(v2)),
      lib.times(basis.ez, 1./lib.norm(v3)),
      radius);
  lib._plot_polygons({
      data: transform.surface_polygons,
      name: 'ellipse_surface',
      with_origin: origin2
  })

  let ellipse_shadow = [];
  sphere_shadow.forEach(function(d, i) {
    let seg = [transform.map(d[0]), 
               transform.map(d[1])];
    seg.color = 'grey';
    seg.stroke_width_factor = 1.2;
    seg.opacity_factor = 0.9;
    ellipse_shadow.push(seg);
  })
  lib._plot_lines({data: ellipse_shadow, 
                   tt: tt, delay: delay, name: 'ellipse_shadow', 
                   with_origin: origin2});

  points.forEach(function(p, i){
    let txt = lib.norm(p).toFixed(2);
    if (i == 0) {
      p.name = 'u';
    } else if (i == 1) {
      p.name = '|v\u2081|';
    } else if (i == 2) {
      p.name = '|v\u2082|';
    } else if (i == 3) {
      p.name = '|v\u2083|';
    }
    p.text = p.name;
    if (i > 0) {
      p.text += ' = ' + txt;
    }
  });

  [v1, v2, v3].forEach(function(v) {
    let v_ = lib.normalize(v);
    v_.text = '';
    v_.text_opacity_factor = 0.5;
    v_.z -= 1/scale;
    v_.opacity_factor = 0.5;
    points.push(v_);
  });

  lib._plot_points({data: points, tt: tt, delay: delay,
                    drag_point_fn: dragged_point,
                    drag_start_fn: drag_start,
                    drag_end_fn: drag_end});
  
  plot_v_perspective(u, grid, v1, v2, v3, axis, tt, delay);
  lib.sort();
}


function compute_transformation(u, v1, v2, v3, basis) {
  let uTv1 = lib.dot_product(u, v1),
      uTv2 = lib.dot_product(u, v2),
      uTv3 = lib.dot_product(u, v3);

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


function compute_transformation_grid(grid, v1, v2, v3, basis) {
  let lines = [];
  grid.forEach(function(d) {
    let l = [compute_transformation(d[0], v1, v2, v3, basis),
             compute_transformation(d[1], v1, v2, v3, basis)];
    lines.push(l);
  })
  return lines;
}


function plot_v_perspective(u, grid, v1, v2, v3, axis, tt, delay) {
  let basis = {
      x: lib.normalize(axis[axis_len/unit * 0][1]),
      y: lib.normalize(axis[axis_len/unit * 1][1]),
      z: lib.normalize(axis[axis_len/unit * 2][1]),
  };

  u = compute_transformation(u, v1, v2, v3, basis);
  u.color = 4;
  u.text = 'u\'';
  lib._plot_points({data: [u], tt: tt, delay: delay,
                    name: 'u2', with_origin: origin2});

  let grid2 = compute_transformation_grid(grid, v1, v2, v3, basis);
  lib._plot_lines({data: grid2, tt: tt, delay: delay, name: 'grid2', 
                   with_origin: origin2});


  basis.x.color = v1.color;
  basis.x.text = '[1, 0, 0]';

  basis.y.color = v2.color;
  basis.y.text = '[0, 1, 0]';

  basis.z.color = v3.color;
  basis.z.text = '[0, 0, 1]';

  let unit_marks = [basis.x, basis.y, basis.z] 
  lib._plot_points({data: unit_marks, 
                    tt: tt, 
                    delay: delay, 
                    name: 'basis2', 
                    with_origin: origin2,
                    dblclick_fn: dblclick});

  let lines = [];
  [basis.x, basis.y, basis.z].forEach(function(d) {
    let color = d.color;
    d = lib.strip(d);
    d.color = color;
    lines.push(...lib.create_segments(d));
  })
  lib._plot_lines({data: lines, 
                   tt: tt, 
                   delay: delay,
                   name: 'axis2', 
                   with_origin: origin2});
}


function sphere_grid(radius, n=2) {
  let lines = [];
  for (let i = 0; i < n; i++) {
    let circle_lines = lib.create_circle_lines(radius);
    if (i == n-1) {
      circle_lines = lib.rotate_lines(
          circle_lines, Math.PI/2, 0, 0);
    } else {
      circle_lines = lib.rotate_lines(
          circle_lines, 0, Math.PI/(n-1)*i, 0);
    }
    lines.push(...circle_lines);
  }

  return lines;
}


function inv_up_triangle(m) {
  let [[a, b], [o, c]] = m;
  return [
      [1/a, -b/a/c],
      [0, 1/c]
  ];
}


function init(tt, previous_data){

  tt = 750;
  if (previous_data == null && axis.length > 0) {
    previous_data = {scatter: scatter, axis: axis};
    tt = 0;
  }

  axis = lib.init_float_axis(axis_len=axis_len, unit=unit);
  scatter = [];

  let u = {
      x: radius + 1/scale,
      y: 0.,
      z: 0.,
  }
  grid = sphere_grid(radius);

  u = lib.rotate_point(u, Math.PI/8, -Math.PI/4.5, Math.PI/8);
  grid = lib.rotate_lines(grid, Math.PI/8, -Math.PI/4.5, Math.PI/8);
  
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

  if (previous_data == null) {
    old_axis = axis; 
  } else {
    old_axis = previous_data.axis;
  }

  // u sphere & its shadow is a constant.
  sphere_shadow = lib.create_circle_lines(radius*0.99);
  sphere_shadow.forEach(function(d) {
    d.color = 'grey';
  });
  u_sphere = circle_to_ellipse_shadow_map(
      {x: 1, y: 0, z: 0},
      {x: 0, y: 1, z: 0},
      {x: 0, y: 0, z: 1},
      radius);

  lib._plot_lines({data: sphere_shadow, tt: tt,
                   name: 'circle_shadow'});
  lib._plot_polygons({
      data: u_sphere.surface_polygons,
      name: 'u_sphere'
  });

  // init_rotate(
  //     tt,
  //     old_axis, 
  //     startAngleX, 
  //     startAngleY, 
  //     startAngleZ);


  scatter = lib.rotate_points(scatter, startAngleX, startAngleY, startAngleZ);
  grid = lib.rotate_lines(grid, startAngleX, startAngleY, startAngleZ);
  axis = lib.rotate_lines(axis, startAngleX, startAngleY, startAngleZ);
  plot(scatter,
       grid,
       axis,
       time);
}


drag_lock = false;


async function init_rotate(tt, old_axis, ax, ay, az, n=15) {
  drag_lock = true;

  let basis = [
      lib.normalize(old_axis[axis_len/unit * 0][1]),
      lib.normalize(old_axis[axis_len/unit * 1][1]),
      lib.normalize(old_axis[axis_len/unit * 2][1]),
  ];
  let r1T = [
      [basis[0].x, basis[1].x, basis[2].x],
      [basis[0].y, basis[1].y, basis[2].y],
      [basis[0].z, basis[1].z, basis[2].z],
  ];

  let [ax1, ay1, az1] = euler_angles(r1T),
      [dax, day, daz] = [ax-ax1, ay-ay1, az-az1];

  if (dax > Math.PI) {
    dax -= 2 * Math.PI;
  }
  if (day > Math.PI) {
    day -= 2 * Math.PI;
  }
  if (daz > Math.PI) {
    daz -= 2 * Math.PI;
  }

  [dax, day, daz] = [dax/n, day/n, daz/n];

  for (let i = 0; i <= n; i++) {
    expectedScatter = lib.rotate_points(scatter, ax1+dax*i, ay1+day*i, az1+daz*i);
    expectedGrid = lib.rotate_lines(grid, ax1+dax*i, ay1+day*i, az1+daz*i);
    expectedAxis = lib.rotate_lines(axis, ax1+dax*i, ay1+day*i, az1+daz*i);
    let time = (i == 0) ? tt : 0
    plot(expectedScatter,
         expectedGrid,
         expectedAxis,
         time);
    await lib.wait(time);
  }

  scatter = expectedScatter;
  axis = expectedAxis;
  grid = expectedGrid;
  drag_lock = false;
}


async function dblclick(d, i) { 
  drag_lock = true;
  let n = 20;
  let [ax, ay, az] = get_angles_from_default(axis, i);
  let [dax, day, daz] = [-ax/n, -ay/n, -az/n];
  for (let i = 1; i <= n; i++) {
    expectedScatter = lib.rotate_points(scatter, dax*i, day*i, daz*i, true);
    expectedGrid = lib.rotate_lines(grid, dax*i, day*i, daz*i, true);
    expectedAxis = lib.rotate_lines(axis, dax*i, day*i, daz*i, true);
    plot(expectedScatter,
         expectedGrid,
         expectedAxis,
         0);
    await lib.wait(0);
  }
  scatter = expectedScatter;
  axis = expectedAxis;
  grid = expectedGrid;
  drag_lock = false;
}


function euler_angles(r) {
  let ax = null,
      ay = null,
      az = null;
  if (r[3-1][1-1] != 1 && r[3-1][1-1] != -1) {
    ay = -Math.asin(r[3-1][1-1]);
    cay = Math.cos(ay);
    ax = Math.atan2(r[3-1][2-1]/cay, 
                    r[3-1][3-1]/cay);
    az = Math.atan2(r[2-1][1-1]/cay, 
                    r[1-1][1-1]/cay);
  } else {
    az = 0;
    if (r[3-1][1-1] == -1) {
      ay = Math.PI/2;
      ax = Math.atan2(r[1-1][2-1], r[1-1][3-1]);
    } else {
      ay = -Math.PI/2;
      ax = Math.atan2(-r[1-1][2-1], -r[1-1][3-1]);
    }
  }
  return [ax, ay, az];
}


function rT_from_euler_angles(ax, ay, az) {
  let cx = Math.cos(ax),
      sx = Math.sin(ax),
      cy = Math.cos(ay),
      sy = Math.sin(ay),
      cz = Math.cos(az),
      sz = Math.sin(az);
  return [[cz*cy, sz*cy, -sy],
          [cz*sy*sx-sz*cx, sz*sy*sx+cz*cx, cy*sx],
          [cz*sy*cx+sz*sx, sz*sy*cx-cz*sx, cy*cx]];
}


function dp(a, b) {
  return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
}


function matmul_3x3_ABT(A, B) {
    return [[dp(A[0], B[0]), dp(A[0], B[1]), dp(A[0], B[2])],
            [dp(A[1], B[0]), dp(A[1], B[1]), dp(A[1], B[2])],
            [dp(A[2], B[0]), dp(A[2], B[1]), dp(A[2], B[2])]];
}


function get_euler_angles(r1T, r2T) {
    return euler_angles(matmul_3x3_ABT(r2T, r1T));
}


function get_angles_from_default(axis, i) {
  let basis = [
      lib.normalize(axis[axis_len/unit * 0][1]),
      lib.normalize(axis[axis_len/unit * 1][1]),
      lib.normalize(axis[axis_len/unit * 2][1]),
  ];

  function mod3(x) {
    return ((x%3)+3)%3;
  }

  basis = [basis[mod3(i-2)], 
           basis[mod3(i-1)], 
           basis[mod3(i)]];
  r2T = [
      [basis[0].x, basis[1].x, basis[2].x],
      [basis[0].y, basis[1].y, basis[2].y],
      [basis[0].z, basis[1].z, basis[2].z],
  ];
  r1T = [[1, 0, 0],
         [0, -1, 0],
         [0, 0, -1]];

  return get_euler_angles(r1T, r2T);
}


let drag_on_left = true;


function drag_start(){
  if (drag_lock) {
    return;
  }
  if (lib.get_mouse_position().x < 300) {
    drag_on_left = true;
    lib.drag_start();
  } else {
    drag_on_left = false;
    lib.drag_start(origin2);
  }
}

function dragged(){
  if (drag_lock) {
    return;
  }
  if (drag_on_left) {
    [angle_x, angle_y] = lib.get_drag_angles();  
  } else {
    [angle_x, angle_y] = lib.get_drag_angles(origin2);
  }  
  expectedScatter = lib.rotate_points(scatter, angle_x, angle_y);
  expectedAxis = lib.rotate_lines(axis, angle_x, angle_y);
  expectedGrid = lib.rotate_lines(grid, angle_x, angle_y);
  
  plot(expectedScatter,
       expectedGrid,
       expectedAxis,
       0);
}


function dragged_v_only() {
  if (drag_lock) {
    return;
  }
  let [angle_x, angle_y] = lib.get_drag_angles();

  expectedScatter = lib.rotate_points(scatter, angle_x, angle_y);
  expectedScatter[0] = scatter[0];
  expectedGrid = grid;
  expectedAxis = axis;
  
  plot(expectedScatter,
       expectedGrid,
       expectedAxis, 
       0);
}



let is_rotating_v = false;


function stretch_point(d, i){
  if (drag_lock) {
    return;
  }
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

  let diff = Math.sqrt((p.x-m.x)*(p.x-m.x) +
                       (p.y-m.y)*(p.y-m.y));
  if (diff > 0.1) {
    drag_end();
    is_rotating_v = true;
    lib.drag_start();
    return; 
  }

  expectedScatter = [];
  scatter.forEach(function(d, j){
      if (j == i) {
        d.x = p.x;
        d.y = p.y;
        d.z = p.z;
      }
      if (lib.norm(d) > 1.5) {
        d = lib.times(d, 1.5/lib.norm(d));
      }
      expectedScatter.push(d);
  });

  expectedGrid = grid;
  expectedAxis = axis;
  plot(expectedScatter, 
       expectedGrid,
       expectedAxis, 
       0);
}


function dragged_point(d, i){
  if (drag_lock) {
    return;
  }
  if (1 <= i && i <= 3) {
    if (!is_rotating_v) {
      stretch_point(d, i);
    } else {
      dragged_v_only();
    }
    return;
  } else if (i >= 4) {
    dragged_v_only();
    return;
  }

  let [angle_x, angle_y] = lib.get_drag_angles(
      drag_on_left ? origin : origin2);
  expectedScatter = [];
  scatter.forEach(function(d, j){
      if (j == i) {
        r = lib.rotate_point(d, angle_x, angle_y);
        expectedScatter.push(r);
      } else {
        expectedScatter.push(d);
      }
  });
  expectedGrid = lib.rotate_lines(grid, angle_x, angle_y);
  expectedAxis = axis;

  plot(expectedScatter,
       expectedGrid,
       expectedAxis, 
       0);
}


function drag_end(){
  if (drag_lock) {
    return;
  }
  scatter = expectedScatter;
  axis = expectedAxis;
  grid = expectedGrid;
  is_rotating_v = false;
}


return {
  data: function(){return {scatter: scatter, axis: axis};},
  init: function(tt=0, data=null){init(tt, data);},
  select_svg: function(svg_id){select_svg(svg_id);},
};

})();