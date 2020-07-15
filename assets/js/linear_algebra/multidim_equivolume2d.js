let multidim_equivolume2d = (function() {

let origin = [150, 140], 
  origin2 = [450, 140],
  scale = 60, 
  scatter = [],
  axis = [], 
  polys = [],
  expectedScatter = [],
  expectedAxis = [],
  expectedPolys = [],
  startAngleX = Math.PI,
  startAngleY = 0.,
  startAngleZ = 0.,
  axis_len = 2,
  unit = axis_len/10,
  svg = null,
  lib = null,
  show_proj = false;


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


function plot(scatter, axis, polys_original, tt){
  let polys = [];
  for (let i = 0; i < 12; ++i) {
    let p = polys_original[Math.floor(i/6)];
    let p_ = lib.cp_list(p);
    p_.centroid_z = -100;
    p_.color = p.color;
    if (![0, 6].includes(i)) {
      p_.opacity = 0.0;
      p_.centroid_z -= 100;
    }
    polys.push(p_);
  }
  lib._plot_polygons({
      data: polys,
      drag_poly_fn: dragged_polygon,
      drag_start_fn: drag_start,
      drag_end_fn: drag_end,
      tt: tt
  })

  // Copy axis into two copies.
  let axis1 = lib.cp_list(axis),
      axis2 = lib.cp_list(axis);
  lib.plot_lines(axis1, tt, 'axis');

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
  

  let [v1, v2, v3] = points;
  points.forEach(function(p, i){
    if (i == 0) {
      p.text = 'v\u2081';
    } else if (i == 1) {
      p.text = 'v\u2082';
    } else if (i == 2) {
      p.text = 'v\u2083';
      p.text_opacity = 0.0;
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
      uTv3 = 1.0;

  let components = [
      lib.times(basis.x, uTv1),
      lib.times(basis.y, uTv2),
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
    p_.opacity = p.opacity;
    p_.centroid_z = -100;
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

  scatter.push({
    x: 1,
    y: 0, 
    z: 0.,
    centroid_z: 100,
    color: 3,
  })

  scatter.push({
    x: 0,
    y: 1, 
    z: 0.,
    centroid_z: 100,
    color: 19,
  })

  let w = 0.5
  let poly1 = [{x: 0, y: 0, z: 0}, 
               {x: w, y: 0, z: 0}, 
               {x: w, y: w, z: 0}, 
               {x: 0, y: w, z: 0}];
  let poly2 = shift(poly1, {x: 2*w, y: 1.5*w, z: 0.0});
  poly1.color = 1;
  poly2.color = 1;

  // poly2 = lib.rotate_polygon(poly2, 0, 0, Math.PI/3);
  polys = [poly1, poly2];

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
  if (mouse_start.x < 300) {
    drag_on_left = true;
    lib.drag_start2d();
  } else {
    drag_on_left = false;
    lib.drag_start2d(origin2);
  }
}

function dragged(){
  angle_z = lib.get_drag_angle_2d(drag_on_left ? origin : origin2);

  expectedScatter = lib.rotate_points(scatter, 0, 0, angle_z);
  expectedAxis = lib.rotate_lines(axis, 0, 0, angle_z);
  expectedPolys = lib.rotate_polygons(polys, 0, 0, angle_z);

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
      if (j == Math.floor(i/6)) {
        let r = shift(d, diff);
        r.color = d.color;
        expectedPolys.push(r);
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