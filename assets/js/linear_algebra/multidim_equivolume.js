let multidim_equivolume = (function() {

let origin = [150, 140], 
  origin2 = [450, 140],
  scale = 60, 
  scatter = [], 
  axis = [],
  polys = [],
  expectedScatter = [],
  expectedAxis = [],
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


function plot(scatter, axis, polys, tt){
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

  let axis1 = lib.cp_list(axis),
      axis2 = lib.cp_list(axis);
  lib.plot_lines(axis1, tt, 'axis');

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
  plot_v_perspective(polys, v1, v2, v3, axis2, tt);
  lib.sort();
}


function transform(u, basis, v1, v2, v3) {
  let uTv1 = lib.dot_product(u, v1),
      uTv2 = lib.dot_product(u, v2),
      uTv3 = lib.dot_product(u, v3);

  let components = [
      lib.times(basis.x, uTv1),
      lib.times(basis.y, uTv2),
      lib.times(basis.z, uTv3),
  ]
  let r = lib.add(components);
  return r;
}


function plot_v_perspective(polys, v1, v2, v3, axis2, tt) {
  axis2.forEach(function(d, i) {
    let axis_ord = Math.floor(i / (axis_len/unit));
    let v = [v1, v2, v3][axis_ord];
    d.color = 'grey';
  });

  lib.plot_lines(axis2, tt, 'axis2', null, null, null, origin2);
  basis = {
    x: lib.normalize(axis2[axis_len/unit * 0][1]),
    y: lib.normalize(axis2[axis_len/unit * 1][1]),
    z: lib.normalize(axis2[axis_len/unit * 2][1]),
  };

  let polys_ = [];
  polys.forEach(function(p, i) {
    let p_ = p.map(function(u){return transform(u, basis, v1, v2, v3);});
    p_.color = p.color;
    p_.opacity_factor = p.opacity_factor;
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
  axis = lib.init_float_axis(axis_len=axis_len, unit=unit);
  scatter = [];

  let v1 = lib.normalize({
      x: Math.sqrt(13/14)*1.5,
      y: Math.sqrt(.5/14)*1.5, 
      z: Math.sqrt(.5/14)*1.5, 
      color: 3,
  }),
      v2 = lib.normalize({
      x: -Math.sqrt(0.0)*1.5, 
      y: -Math.sqrt(1.0)*1.5, 
      z: -Math.sqrt(0.0)*1.5, 
      color: 19,
  }),
      v3 = lib.normalize({
      x: Math.sqrt(0.5/14)*1.5, 
      y: Math.sqrt(0.5/14)*1.5,  
      z: Math.sqrt(13/14)*1.5,  
      color: 9,
  });

  scatter = [v1, v2, v3];


  alpha = startAngleX;
  beta = startAngleY;


  let w = 0.5;
  let shift_v = {x: w, y: -2*w, z: 0.5*w};
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
  let poly2 = [
      shift(poly1[0], shift_v),
      shift(poly1[1], shift_v),
      shift(poly1[2], shift_v),
      shift(poly1[3], shift_v),
      shift(poly1[4], shift_v),
      shift(poly1[5], shift_v),
  ];

  polys = poly1.concat(poly2);
  polys.forEach(function(d) {
    d.color = 1;
  })

  scatter = lib.rotate_points(scatter, startAngleX, startAngleY, startAngleZ);
  axis = lib.rotate_lines(axis, startAngleX, startAngleY, startAngleZ);
  polys = lib.rotate_polygons(polys, startAngleX, startAngleY, startAngleZ);
  plot(scatter,
       axis,
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
    lib.drag_start(origin2);
  }
}


function dragged(){
  let [angle_x, angle_y] = lib.get_drag_angles(
      drag_on_left ? origin : origin2);

  expectedScatter = lib.rotate_points(scatter, angle_x, angle_y);
  expectedAxis = lib.rotate_lines(axis, angle_x, angle_y);
  expectedPolys = lib.rotate_polygons(polys, angle_x, angle_y);
  
  plot(expectedScatter, 
       expectedAxis,
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
  expectedAxis = axis;

  plot(expectedScatter, 
       expectedAxis,
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
  expectedAxis = axis;
  expectedPolys = polys;

  plot(expectedScatter,
       expectedAxis, 
       expectedPolys,
       0);
}


function drag_end(){
  scatter = expectedScatter;
  axis = expectedAxis;
  polys = expectedPolys;
}


return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);},
};

})();