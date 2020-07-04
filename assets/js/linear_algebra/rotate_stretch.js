let rotate_stretch = (function() {

let origin = [150, 140], 
    origin2 = [480, 140],
    scale = 100, 
    scatter = [],
    cloud = [],
    axis = [], 
    grid = [],
    expectedGrid = [],
    expectedScatter = [],
    expectedCloud = [],
    expectedAxis = [],
    startAngleX = Math.PI/8 * 1.7,
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


function plot(scatter, grid, axis, tt){
  lib.plot_lines(grid, tt, 'grid');

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

  // A constant:
  let circle_shadow = lib.create_circle_lines(radius);
  circle_shadow.forEach(function(d) {
    d.color = 1;
  })
  lib.plot_lines(circle_shadow, tt, 'circle_shadow');

  let map = circle_to_ellipse_shadow_map(
      lib.times(basis.ex, 1./lib.norm(v1)),
      lib.times(basis.ey, 1./lib.norm(v2)),
      lib.times(basis.ez, 1./lib.norm(v3)));

  let ellipse_shadow = [];
  circle_shadow.forEach(function(d, i) {
    let seg = [map.map(d[0]), 
               map.map(d[1])];
    seg.color = 1;
    ellipse_shadow.push(seg);
  })
  lib.plot_lines(ellipse_shadow, tt, 'ellipse_shadow', 
                 null, null, null, origin2);

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
    v_.text_opacity = 0.5;
    v_.text = v.name + ' = 1'; 
    v_.text_opacity_factor = 0.5;
    v_.z -= 1/scale;
    v_.opacity_factor = 0.5;
    points.push(v_);
  });

  lib.plot_points(points, tt,
                  drag_point_fn=dragged_point,
                  drag_start_fn=drag_start,
                  drag_end_fn=drag_end);
  
  plot_v_perspective(u, grid, v1, v2, v3, axis, tt);
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
    lines.push([compute_transformation(d[0], v1, v2, v3, basis),
                compute_transformation(d[1], v1, v2, v3, basis)]);
  })
  return lines;
}


function plot_v_perspective(u, grid, v1, v2, v3, axis, tt) {
  let basis = {
    x: lib.normalize(axis[axis_len/unit * 0][1]),
    y: lib.normalize(axis[axis_len/unit * 1][1]),
    z: lib.normalize(axis[axis_len/unit * 2][1]),
  };

  u = compute_transformation(u, v1, v2, v3, basis);
  u.color = 4;
  u.text = 'u\'';
  lib.plot_points([u], tt, null, null, null, 'u2', origin2);

  let grid2 = compute_transformation_grid(grid, v1, v2, v3, basis);
  lib.plot_lines(grid2, tt, 'grid2', 
                 null, null, null, origin2);


  basis.x.color = v1.color;
  basis.x.text = '[1, 0, 0]';

  basis.y.color = v2.color;
  basis.y.text = '[0, 1, 0]';

  basis.z.color = v3.color;
  basis.z.text = '[0, 0, 1]';

  let unit_marks = [basis.x, basis.y, basis.z] 
  lib.plot_points(unit_marks, 
                  tt, null, null, null, 'basis2', origin2);

  let lines = [];
  [basis.x, basis.y, basis.z].forEach(function(d) {
    let color = d.color;
    d = lib.strip(d);
    d.color = color;
    lines.push(...lib.create_segments(d));
  })
  lib.plot_lines(lines, 
                 tt, 'axis2', null, null, null, origin2);
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

function cholesky_U(m) {
  let [[a, b], [b_copy, c]] = m;
  return [
      [Math.sqrt(a), b/Math.sqrt(a)],
      [0, Math.sqrt(c - b*b/a)]
  ];
}


function schur_2_3(v1, v2, v3) {
  let k = v1.z*v1.z+v2.z*v2.z+v3.z*v3.z;
  let l = [
      v1.x*v1.z + v2.x*v2.z + v3.x*v3.z,
      v1.y*v1.z + v2.y*v2.z + v3.y*v3.z,
  ];
  let S = [
    [v1.x*v1.x+v2.x*v2.x+v3.x*v3.x - l[0]*l[0]/k, 
     v1.x*v1.y+v2.x*v2.y+v3.x*v3.y - l[0]*l[1]/k],
    [v1.y*v1.x+v2.y*v2.x+v3.y*v3.x - l[1]*l[0]/k, 
     v1.y*v1.y+v2.y*v2.y+v3.y*v3.y - l[1]*l[1]/k]
  ];
  return {
    S: S,
    k: k,
    l: l,
  };
}


function circle_to_ellipse_shadow_map(v01, v02, v03) {
  let schur = schur_2_3(v01, v02, v03);
  let U = cholesky_U(schur.S);
  let w = inv_up_triangle(U);

  function map(v) {
    let r = Object.assign({}, v);
    r.x = w[0][0] * v.x + w[0][1] * v.y;
    r.y = w[1][0] * v.x + w[1][1] * v.y;
    r.z = -(schur.l[0] * r.x + 
            schur.l[1] * r.y) / schur.k;
    return r;
  }

  return {
    map: function(v) {return map(v);},
  };
}


function init(tt){
  axis = lib.init_float_axis(axis_len=axis_len, unit=unit);
  scatter = [];

  let u = {
      x: radius + 4/scale,
      y: 0.,
      z: 0.,
  }
  grid = sphere_grid(radius);

  u = lib.rotate_point(u, startAngleX, 2*startAngleY, 2*startAngleZ);
  grid = lib.rotate_lines(grid, startAngleX, 2*startAngleY, 2*startAngleZ);
  
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

  scatter = lib.rotate_points(scatter, startAngleX, startAngleY, startAngleZ);
  grid = lib.rotate_lines(grid, startAngleX, startAngleY, startAngleZ);
  axis = lib.rotate_lines(axis, startAngleX, startAngleY, startAngleZ);

  plot(scatter,
       grid,
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
  expectedAxis = lib.rotate_lines(axis, angle_x, angle_y);
  expectedGrid = lib.rotate_lines(grid, angle_x, angle_y);
  
  plot(expectedScatter,
       expectedGrid,
       expectedAxis,
       0);
}


function dragged_v_only() {
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
  scatter = expectedScatter;
  axis = expectedAxis;
  grid = expectedGrid;
  is_rotating_v = false;
}


return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);},
};

})();