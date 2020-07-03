let rotate_stretch2d = (function() {

let origin = [150, 140], 
    origin2 = [480, 140],
    scale = 100, 
    scatter = [],
    axis = [], 
    expectedScatter = [],
    expectedAxis = [],
    startAngleX = Math.PI,
    startAngleY = 0.,
    startAngleZ = 0.,
    axis_len = 1.2,
    radius = 0.5,
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


function round_to(x, n, tol=0.02) {
  if (Math.abs(x - 0.0) < tol) {
    return 0;
  }
  if (Math.abs(x - 1.0) < tol) {
    return 1;
  }
  return x.toFixed(n);
}


function plot(scatter, axis, tt){

  let basis = {
    ex: lib.normalize(axis[axis_len/unit * 0][1]),
    ey: lib.normalize(axis[axis_len/unit * 1][1]),
    ez: lib.normalize(axis[axis_len/unit * 2][1]),
  };

  let points = [];
  scatter.forEach(function(d){
    points.push(Object.assign({}, d));
  });

  let v3_ = lib.cp_item(basis.ez);
  v3_.opacity = 0.0;
  v3_.color = 9;
  points.push(v3_);
  
  let lines = [];
  points.forEach(function(d, i){
    if (i == 0) {
      return;
    }
    if (i < 3) {
      lines.push(...lib.create_segments(d));
    } else {
      lib.create_segments(d).forEach(function(s) {
        s.opacity = 0.0;
        lines.push(s);
      })
    }
  });
  lib.plot_lines(lines, tt, 'arrow');

  let [u, v1, v2, v3] = points;
  u.centroid_z = 1000;

  let circle_shadow = lib.create_circle_lines(lib.norm(u));
  circle_shadow.forEach(function(d) {
    d.color = 6;
  })

  let ellipse_shadow = [];
  circle_shadow.forEach(function(d) {
    let seg = Object.assign({}, d);
    seg[0] = compute_transformation(
        seg[0], v1, v2, v3, basis);
    seg[1] = compute_transformation(
        seg[1], v1, v2, v3, basis);
    ellipse_shadow.push(seg);
  })
  lib.plot_lines(circle_shadow, tt, 'circle_shadow');
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
      p.text_opacity = 0.0
    }
    p.text = p.name;
    if (0 < i && i < 4) {
      p.text += ' = ' + txt;
    }
  });

  [v1, v2, v3].forEach(function(v, i) {
    let v_ = lib.normalize(v);
    v_.r = 6;
    v_.text = v.name + ' = 1'; 
    v_.text_opacity_factor = 0.5;
    if (i == 2) {
      v_.opacity = 0.0;
      v_.text_opacity = 0.0;
    }
    v_.z -= 1/scale;
    v_.size_factor = 1.2;
    v_.opacity_factor = 0.5;
    points.push(v_);
  })

  lib.plot_points(points, tt,
                  drag_point_fn=dragged_point,
                  drag_start_fn=drag_start,
                  drag_end_fn=drag_end);

  plot_v_perspective(u, v1, v2, v3, axis, tt);
  lib.sort();
}


function compute_transformation(u, v1, v2, v3, basis) {
  let uTv1 = lib.dot_product(u, v1),
      uTv2 = lib.dot_product(u, v2),
      uTv3 = 1.0;

  let r = Object.assign({}, u);
  r.x = 0;
  r.y = 0;
  r.z = 0;
  let components = [
      r,
      lib.times(basis.ex, uTv1),
      lib.times(basis.ey, uTv2),
  ]
  return lib.add(components);
}


function plot_v_perspective(u, v1, v2, v3, axis, tt) {
  let basis = {
    ex: lib.normalize(axis[axis_len/unit * 0][1]),
    ey: lib.normalize(axis[axis_len/unit * 1][1]),
    ez: lib.normalize(axis[axis_len/unit * 2][1]),
  };

  u = compute_transformation(u, v1, v2, v3, basis);
  u.color = 4
  u.text = 'u\'';
  lib.plot_points([u], tt, null, null, null, 'u2', origin2);

  basis.ex.color = v1.color;
  basis.ex.text = '[1, 0]';

  basis.ey.color = v2.color;
  basis.ey.text = '[0, 1]';

  basis.ez.color = v3.color;
  basis.ez.text = '';
  basis.ez.opacity = 0;

  let unit_marks = [basis.ex, basis.ey, basis.ez] 
  lib.plot_points(unit_marks, 
                  tt, null, null, null, 'basis2', origin2);

  let lines = [];
  [basis.ex, basis.ey, basis.ez].forEach(function(d, i) {
    let color = d.color;
    d = lib.strip(d);
    d.color = color;
    if (i == 2) {
      d.opacity = 0;
    }
    lines.push(...lib.create_segments(d));
  })
  lib.plot_lines(lines, 
                 tt, 'axis2', null, null, null, origin2);
}


function round_cloud(radius, n=40) {
  let points = [];
  let a = Math.PI * 2 / n;
  for (let i = 1; i <= n; i++) {
    points.push({
        x: Math.cos(a * i) * radius,
        y: Math.sin(a * i) * radius,
        z: 0,
    });
  }
  return points;
}


function sphere_grid(radius, n=2) {
  let lines = [];
  for (let i = 0; i < n; i++) {
    let circle_points = round_cloud(radius);
    let circle_lines = [];
    for (let j = 0; j < circle_points.length-1; j++) {
      circle_lines.push([circle_points[j], 
                         circle_points[j+1]]);
    }
    circle_lines.push([
        circle_points[circle_points.length-1],
        circle_points[0]
    ]);
    circle_lines.forEach(function(d) {
      d.opacity = 0.0;
    })
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


function init(tt){
  axis = lib.init_float_axis(axis_len=axis_len, unit=unit);
  scatter = [];

  let u = {
    x: -0.3,
    y: -0.3, 
    z: 0.,
    color: 4,
  };

  let v1 = {
    x: 1.,
    y: 0., 
    z: 0.,
    color: 0,
  };

  let v2 = {
    x: 0.,
    y: 1., 
    z: 0.,
    color: 3,
  };

  let grid = lib.create_circle_lines(0.5);
  grid.push(...lib.create_circle_lines(0.5));
  grid = hide(grid);
  let grid2 = lib.cp_list(grid);
  lib.plot_lines(grid, tt, 'grid');
  lib.plot_lines(grid2, tt, 'grid2',
                 null, null, null, origin2);
  scatter = [u, v1, v2];

  alpha = startAngleX;
  beta = startAngleY;

  scatter = lib.rotate_points(scatter, alpha, beta, startAngleZ);
  axis = lib.rotate_lines(axis, alpha, beta, startAngleZ);
  plot(scatter,
       axis,
       tt);
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
  expectedAxis = lib.rotate_lines(axis, 0, 0, angle_z);
  
  plot(expectedScatter,
       expectedAxis,
       0);
}


function dragged_v_only(){
  angle_z = lib.get_drag_angle_2d();

  expectedScatter = lib.rotate_points(scatter, 0, 0, angle_z);
  expectedScatter[0] = scatter[0];
  expectedAxis = axis;

  plot(expectedScatter, 
       expectedAxis,
       0);
}


function stretch_point(d, i){
  let d_ = lib.normalize(d);
      m = lib.mouse_to_point_position();
  let d_Tm = lib.dot_product(d_, m);
  let p = {
    x: d_.x * d_Tm,
    y: d_.y * d_Tm,
    z: 0,
  }
  expectedScatter = [];
  scatter.forEach(function(d, j){
      if (j == i) {
        d.x = p.x;
        d.y = p.y;
      }
      if (lib.norm(d) > 1.5) {
        d = lib.times(d, 1.5/lib.norm(d));
      }
      expectedScatter.push(d);
  });

  expectedAxis = axis;

  plot(expectedScatter, 
       expectedAxis, 
       0);
}


function dragged_point(d, i){
  if (0 < i && i < 3) {
    stretch_point(d, i);
    return;
  }
  else if (i > 2) {
    dragged_v_only();
    return;
  }

  expectedScatter = [];
  scatter.forEach(function(d, j){
      if (j == i) {
        let r = lib.update_point_position_from_mouse(d);
        let norm = lib.norm(r);
        if (norm > 1.2) {
          r = lib.times(r, 1.2/norm);
        }
        expectedScatter.push(r);
      } else {
        expectedScatter.push(d);
      }
  });
  expectedAxis = axis;

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