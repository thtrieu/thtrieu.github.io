let basis_rotate = (function() {

let origin = [150, 140], 
  origin2 = [450, 140],
  scale = 120, 
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

  points.forEach(function(p, i){
    let coord = lib.dot_basis(p, basis);
    let txt = ' = ['.concat(
        round_to(coord.x, 1), ', ',
        round_to(coord.y, 1), ', ',
        round_to(coord.z, 1), ']',
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
  basis.ex.size_factor = 1.4;
  basis.ex.opacity_factor = 0.5;

  basis.ey.color = v2.color;
  basis.ey.size_factor = 1.4;
  basis.ey.opacity_factor = 0.5;

  basis.ez.color = v3.color;
  basis.ez.size_factor = 1.4;
  basis.ez.opacity_factor = 0.5;

  points.push(...[basis.ex, basis.ey, basis.ez]);
  lib.plot_points(points, tt,
                  drag_point_fn=dragged_point,
                  drag_start_fn=drag_start,
                  drag_end_fn=drag_end);
  
  plot_v_perspective(u, grid, v1, v2, v3, axis, tt);
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



function round_cloud(radius, n=40) {
  let points = [];
  let a = Math.PI * 2 / n;
  for (let i = 1; i <= n; i++) {
    points.push({
        x: Math.cos(a * i) * radius,
        y: Math.sin(a * i) * radius,
        z: 0,
        opacity: 0.2,
        centroid_z: -1000,
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
      x: 0.35,
      y: 0.,
      z: 0.,
  }
  grid = sphere_grid(0.34);

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


  static_circle = {
    x: 0, y: 0, z: 0,
    r: 0.34 * scale,
    color: 'none',
    stroke_color: 'grey',
    centroid_z: -1000
  };
  lib.plot_points([static_circle], tt, null, null, null, 'cloud');
  lib.plot_points([static_circle], tt, null, null, null, 'cloud2', origin2);

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


function dragged_v_only(){
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
}


return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);},
  set_show_proj: function(s){show_proj = s;},
  replot: function(){
    plot(scatter, 
         grid,
         axis,
         1000);
  },
};

})();