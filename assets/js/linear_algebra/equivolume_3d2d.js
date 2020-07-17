let equivolume_3d2d = (function() {

let origin = [150, 140], 
  origin2 = [450, 140],
  scale = 60, 
  scatter = [], 
  axis3d = [],
  axis2d = [],
  polys = [],
  expectedScatter = [],
  expectedAxis3d = [],
  expectedAxis2d = [],
  expectedPolys = [],
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
    is_2d=false);

  svg = svg.call(d3.drag()
           .on('drag', dragged)
           .on('start', drag_start)
           .on('end', drag_end))
           .append('g');  
}


function plot(scatter, axis3d, axis2d, polys, tt){
  polys.forEach(function(d, i) {
    d.opacity_factor = 0.5 + Math.floor((i % 6)/2)/7.;
  })
  lib._plot_polygons({
      data: polys,
      drag_poly_fn: dragged_polygon,
      drag_start_fn: drag_start,
      drag_end_fn: drag_end,
      tt: tt
  });

  lib.plot_lines(axis3d, tt, 'axis3d');

  let points = [];
  scatter.forEach(function(d){
    points.push(Object.assign({}, d));
  });
  let [v1, v2, v3] = points;

  points.forEach(function(p, i){
    if (i == 0) {
      p.text = 'v\u2081';
    } else if (i == 1) {
      p.text = 'v\u2082';
    } else if (i == 2) {
      p.text = 'v\u2083';
    }
  })
  lib.plot_points(points, tt,
                  drag_point_fn=dragged_point,
                  drag_start_fn=drag_start,
                  drag_end_fn=drag_end);
  plot_v_perspective(polys, v1, v2, v3, axis2d, tt);
  lib.sort();
}


function transform(u, basis, v1, v2, v3) {
  let uTv1 = lib.dot_product(u, v1),
      uTv2 = lib.dot_product(u, v2),
      uTv3 = 0.0;

  let components = [
      lib.times(basis.x, uTv1),
      lib.times(basis.y, uTv2),
      lib.times(basis.z, uTv3),
  ]
  let r = lib.add(components);
  return r;
}


function plot_v_perspective(polys, v1, v2, v3, axis2d, tt) {
  lib.plot_lines(axis2d, tt, 'axis2d', null, null, null, origin2);

  basis = {
    x: lib.normalize(axis2d[axis_len/unit * 0][1]),
    y: lib.normalize(axis2d[axis_len/unit * 1][1]),
    z: lib.normalize(axis2d[axis_len/unit * 2][1]),
  };

  let polys_ = [];
  polys.forEach(function(p, i) {
    let p_ = p.map(function(u){return transform(u, basis, v1, v2, v3);});
    p_.color = p.color;
    p_.opacity = 0.5;
    p_.centroid_z = -1000;
    polys_.push(p_);
  })
  lib._plot_polygons({data: polys_,
                      tt: tt, 
                      with_origin: origin2, 
                      name: 'polygons2'});
}


function shift(poly, v) {
  return poly.reduce(function(sum, d) {
    // shift poly 1 by `shift`.
    sum.push(lib.add([d, v]));
    return sum;
  }, []);
}


function init(tt){
  axis3d = lib.init_float_axis(axis_len=axis_len, unit=unit);
  axis2d = lib.init_float_axis(axis_len=axis_len, unit=unit);
  axis2d.forEach(function(d, i) {
    if (i >= axis_len/unit*2) {
      d.opacity = 0.0;
      d.text_opacity = 0.0;
      d.font_size = 14;
    } else {
      d.opacity = 1.0;
      d.text_opacity = 1.0;
      d.stroke_width = 1.5;
    }
  })

  scatter = [];

  let v1 = lib.normalize({
      x: 1,
      y: 0, 
      z: 0, 
      color: 3,
  }),
      v2 = lib.normalize({
      x: 0, 
      y: 1, 
      z: 0, 
      color: 19,
  }),
      v3 = lib.normalize({
      x: 0, 
      y: 0,  
      z: 1,
      color: 9,
      opacity: 0.0,
      text_opacity: 0.0,
  });

  scatter = [v1, v2, v3];


  alpha = startAngleX;
  beta = startAngleY;


  let w = 0.5;
  let shift_v = {x: 2.5*w, y: -2*w, z: 0.5*w};
  let poly1 = [
      [{x: 0, y: 0, z: 0}, 
      {x: w, y: 0, z: 0}, 
      {x: w, y: w, z: 0}, 
      {x: 0, y: w, z: 0}],
      [{x: 0, y: 0, z: w}, 
      {x: w, y: 0, z: w}, 
      {x: w, y: w, z: w}, 
      {x: 0, y: w, z: w}],
      [{x: 0, z: 0, y: 0}, 
      {x: w, z: 0, y: 0}, 
      {x: w, z: w, y: 0}, 
      {x: 0, z: w, y: 0}],
      [{x: 0, z: 0, y: w}, 
      {x: w, z: 0, y: w}, 
      {x: w, z: w, y: w}, 
      {x: 0, z: w, y: w}],
      [{z: 0, y: 0, x: 0}, 
      {z: w, y: 0, x: 0}, 
      {z: w, y: w, x: 0}, 
      {z: 0, y: w, x: 0}],
      [{z: 0, y: 0, x: w}, 
      {z: w, y: 0, x: w}, 
      {z: w, y: w, x: w}, 
      {z: 0, y: w, x: w}],
  ];
  let poly2 = [];
  poly1.forEach(function(d) {
    let p = lib.cp_list(d);
    // p = lib.rotate_polygon(p, Math.PI/3);
    poly2.push(shift(p, shift_v));
  })

  polys = poly1.concat(poly2);
  polys.forEach(function(d) {
    d.color = 1;
  })

  scatter = lib.rotate_points(scatter, startAngleX, startAngleY, startAngleZ);
  axis3d = lib.rotate_lines(axis3d, startAngleX, startAngleY, startAngleZ);
  axis2d = lib.rotate_lines(axis2d, Math.PI, 0, 0);
  polys = lib.rotate_polygons(polys, startAngleX, startAngleY, startAngleZ);
  plot(scatter,
       axis3d,
       axis2d,
       polys,
       tt);
}


let drag_on_left = true;
let mouse_start = null;


function drag_start(){
  mouse_start = lib.get_mouse_position();
  if (lib.get_mouse_position().x < 300) {
    drag_on_left = true;
    lib.drag_start();
  } else {
    drag_on_left = false;
    lib.drag_start2d(origin2);
  }
}


function dragged() {
  if (drag_on_left) {
    dragged_3d();
  } else {
    dragged_2d();
  }
}


function dragged_2d(){
  let angle_z = lib.get_drag_angle_2d(origin2);

  expectedScatter = scatter;
  expectedAxis3d = axis3d;
  expectedAxis2d = lib.rotate_lines(axis2d, 0, 0, angle_z);
  expectedPolys = polys;
  
  plot(expectedScatter, 
       expectedAxis3d,
       expectedAxis2d,
       expectedPolys,
       0);
}


function dragged_3d(){
  let [angle_x, angle_y] = lib.get_drag_angles(origin);

  expectedScatter = lib.rotate_points(scatter, angle_x, angle_y);
  expectedAxis3d = lib.rotate_lines(axis3d, angle_x, angle_y);
  expectedAxis2d = axis2d;
  expectedPolys = lib.rotate_polygons(polys, angle_x, angle_y);
  
  plot(expectedScatter, 
       expectedAxis3d,
       expectedAxis2d,
       expectedPolys,
       0);
}


function dragged_polygon(d, i){

  let new_mouse = lib.get_mouse_position();
  let diff = {x: (new_mouse.x - mouse_start.x)/scale,
              y: (new_mouse.y - mouse_start.y)/scale,
              z: 0};

  expectedScatter = scatter;
  expectedPolys = [];
  polys.forEach(function(d, j){
      if (Math.floor(j/6) == Math.floor(i/6)) {
        let r = shift(d, diff);
        r.color = d.color;
        expectedPolys.push(r);
        // expectedPolys.push(lib.rotate_polygon(d, angle_x, angle_y));
      } else {
        expectedPolys.push(d);
      }
  });
  expectedAxis3d = axis3d;
  expectedAxis2d = axis2d;

  plot(expectedScatter, 
       expectedAxis3d, 
       expectedAxis2d,
       expectedPolys,
       0);
}


function dragged_point(d, i){
  if (!drag_on_left) {
    return;
  }

  let new_mouse = lib.get_mouse_position();
  let diff = {x: (new_mouse.x - mouse_start.x)/scale,
              y: (new_mouse.y - mouse_start.y)/scale,
              z: 0};

  expectedScatter = [];
  scatter.forEach(function(d, j){
      if (j == i) {
        let r = lib.cp_item(d);
        r.x += diff.x;
        r.y += diff.y;
        expectedScatter.push(r);
      } else {
        expectedScatter.push(d);
      }
  });
  expectedAxis3d = axis3d;
  expectedAxis2d = axis2d;
  expectedPolys = polys;

  plot(expectedScatter,
       expectedAxis3d, 
       expectedAxis2d,
       expectedPolys,
       0);
}


function drag_end(){
  scatter = expectedScatter;
  axis3d = expectedAxis3d;
  axis2d = expectedAxis2d;
  polys = expectedPolys;
}


return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);},
};

})();