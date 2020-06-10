space_plot_lib = function(svg, origin, scale, is_2d) {

var 
  mx = 0,
  my = 0,
  atan0 = 0,
  atan1 = 0;

let domain = [-9, 9];


function _create_axis(axis, name, ord, 
                      axis_len=13) {
  d3.range(0, axis_len, 1).forEach(
      function(d){
        var text = '';
        if (d % 5 == 0) {
          text = d;
        } else if (d == axis_len-1) {
          text = name
        }
        var p1 = [0, 0, 0],
            p2 = [0, 0, 0];
        p1[ord] = d;
        p2[ord] = d+1;
        var segment = [
          {x: p1[0], y:p1[1], z:p1[2]},
          {x: p2[0], y:p2[1], z:p2[2]}
        ]
        if (d == axis_len-1) {
          segment[1].text = text;
        }
        else {
          segment[0].text = text
        }
        axis.push(segment); 
      }
  );
}


function init_axis(axis_len=13) {
  set_ranges(axis_len);
  var axis = [];
  _create_axis(axis, 'x', 0, axis_len);
  _create_axis(axis, 'y', 1, axis_len);
  if (!is_2d) {
    _create_axis(axis, 'z', 2, axis_len);
  }
  return axis;
}

function _create_axis_float(
    axis, name, ord, axis_len=2, unit=0.2) {
  d3.range(0, axis_len, unit).forEach(
      function(d){
        var text = '';
        if (d == axis_len-unit) {
          text = name
        }
        var p1 = [0, 0, 0],
            p2 = [0, 0, 0];
        p1[ord] = d;
        p2[ord] = d+unit;
        var segment = [
          {x: p1[0], y:p1[1], z:p1[2]},
          {x: p2[0], y:p2[1], z:p2[2]}
        ]
        if (d == axis_len-unit) {
          segment[1].text = text;
        }
        else {
          segment[0].text = text
        }
        axis.push(segment); 
      }
  );
}

function init_float_axis(axis_len=2.0, unit=0.2) {
  set_ranges(axis_len)
  var axis = [];
  _create_axis_float(axis, 'x', 0, axis_len, unit);
  _create_axis_float(axis, 'y', 1, axis_len, unit);
  if (!is_2d) {
    _create_axis_float(axis, 'z', 2, axis_len, unit);
  }
  return axis;
}

function normalize(v) {
  let norm = Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);
  let r = Object.assign({}, v);
  r.x = v.x/norm;
  r.y = v.y/norm;
  r.z = v.z/norm;
  return r;
}



var  color  = d3.scaleOrdinal()
             .domain(d3.range(0, 20))
             .range(d3.schemeCategory20);


var z_to_size_scale,
    z_to_txt_size_scale,
    z_to_txt_opacity_scale,
    z_to_opacity_scale,
    z_to_stroke_width_scale;



function set_ranges(axis_len) {
  domain = [-axis_len, axis_len];

  z_to_size_scale = d3.scaleLinear()
                      .domain(domain)
                      .range([4, 5.5]);

  z_to_txt_size_scale = d3.scaleLinear()
                          .domain(domain)
                          .range([9, 14]);

  z_to_txt_opacity_scale = d3.scaleLinear()
                             .domain(domain)
                             .range([0.2, 1.0]);

  z_to_opacity_scale = d3.scaleLinear()
                         .domain(domain)
                         .range([0.5, 1.0]);

  z_to_stroke_width_scale = d3.scaleLinear()
                              .domain(domain)
                              .range([1.0, 2.7]);
}




function z_to_size(z){
  if (is_2d) {
    return 4.5;
  }
  return z_to_size_scale(z)
}


function z_to_txt_size(z){
  if (is_2d) {
    return 14;
  }
  return z_to_txt_size_scale(z)
}


function z_to_txt_opacity(z){
  if (is_2d) {
    return 1.0;
  }
  return z_to_txt_opacity_scale(z)
}


function z_to_opacity(z){
  if (is_2d) {
    return 1.0;
  }
  return z_to_opacity_scale(z)
}


function z_to_stroke_width(z){
  if (is_2d) {
    return 1.5;
  }
  return z_to_stroke_width_scale(z)
}


function project(d){
  return {
      x: origin[0] + scale * d.x,
      y: origin[1] + scale * d.y
  };
}

function get_line_color(d){
  if (d[1].hasOwnProperty('color')) {
    return color(d[1].color);
  }
  return 'grey';
}


function plot_lines(data, tt, name='none'){

  data.forEach(function(d, j){
    d.key = name + j.toString();
  })

  var lines = svg
      .selectAll('line.' + name)
      .data(data, function(d){ return d.key; });
  lines
      .enter()
      .append('line')
      .attr('class', '_3d ' + name)
      .merge(lines)
      .transition().duration(tt)
      .each(function(d){
        d.centroid = {
          x: (d[1].x+d[0].x)/2.,
          y: (d[1].y+d[0].y)/2.,
          z: (d[1].z+d[0].z)/2.
        };
      })
      .style('stroke-dasharray', function(d) {
        if (d.hasOwnProperty('dash')) {
          return ('3, 3');
        }
        return;
      })
      .attr('x1', function(d){ return project(d[0]).x; })
      .attr('y1', function(d){ return project(d[0]).y; })
      .attr('x2', function(d){ return project(d[1]).x; })
      .attr('y2', function(d){ return project(d[1]).y; })
      .attr('fill', get_line_color)
      .attr('stroke', get_line_color)
      .attr('stroke-width', function(d){
        if (d.hasOwnProperty('stroke_width')) {
          return d.stroke_width;
        }
        return z_to_stroke_width(d.centroid.z);
      })
      .attr('opacity', function(d){
        if (d.hasOwnProperty('opacity')) {
          return d.opacity;
        }
        return z_to_opacity(d[1].z);
      });
  lines.exit().remove();

  var text = svg
      .selectAll('text.' + name)
      .data(data);

  text
      .enter()
      .append('text')
      .attr('class', '_3d ' + name)
      .attr('dx', '.1em')
      .merge(text)
      .each(function(d){
        if (d.hasOwnProperty('text')) {
          d.text_position = project(d.centroid);
        } else if (d[0].hasOwnProperty('text')) {
          d.text_position = project(d[0]);
        }
        else {
          d.text_position = project(d[1]);
        }
      })
      .transition().duration(tt)
      .style('font-size', function(d){
        if (d.hasOwnProperty('font_size')) {
          return d.font_size + 'px';
        }
        return z_to_txt_size(d[1].z)
                  .toString()
                  .concat('px');
      })
      .style('fill', function(d) {
        if (!d.hasOwnProperty('text_color')) {
          return 'black';
        }
        return color(d.text_color);
      })
      .attr('x', function(d){ return d.text_position.x; })
      .attr('y', function(d){ return d.text_position.y; })
      .text(function(d){
        if (d.hasOwnProperty('text')) {
          return d.text;
        } else if (d[0].hasOwnProperty('text')) {
          return d[0].text;
        }
        else {
          return d[1].text;
        }
      })
      .attr('opacity', function(d){
        if (d.hasOwnProperty('text_opacity')){
          return d.text_opacity;
        }
        return z_to_txt_opacity(d[1].z);
      });
  text.exit().remove();
}


function sort_centroid_z(a, b){

  // var _a = a.centroid.z, _b = b.centroid.z;
  var 
    _a = a.hasOwnProperty('centroid_z') ? a.centroid_z : a.centroid.z,
    _b = b.hasOwnProperty('centroid_z') ? b.centroid_z : b.centroid.z;
  return _a < _b ? -1 : _a > _b ? 1 : _a >= _b ? 0 : NaN;
}


function plot_points(data, 
                     tt,
                     drag_point_fn,
                     drag_start_fn,
                     drag_end_fn,
                     name='none'){

  data.forEach(function(d, j){
    d.key = name + j.toString();
  })

  var points = svg.selectAll('circle')
                  .data(data, function(d){ return d.key; })
                  .each(function(d){})
                  .call(d3.drag()
                          .on('drag', drag_point_fn)
                          .on('start', drag_start_fn)
                          .on('end', drag_end_fn));

  points
    .enter()
    .append('circle')
    .attr('class', '_3d point')
    .merge(points)
    .transition().duration(tt)
    .each(function(d){
        d.centroid = {x: d.x, 
                      y: d.y, 
                      z: d.z};
    })
    .attr('cx', function(d){return project(d).x})
    .attr('cy', function(d){return project(d).y})
    // .each(function(d){
    //   d.centroid = {x: d.x, y: d.y, z: d.z};
    // })
    .attr('r', function(d){
      if (d.hasOwnProperty('r')) {
        return d.r;
      }
      return z_to_size(d.z);
    })
    .attr('fill', function(d){ return color(d.color); })
    .attr('opacity', function(d){
        return z_to_opacity(d.z);
    });
  points.exit().remove();

  var text = svg
      .selectAll('text.pText')
      .data(data, function(d){ return d.key; });
  text
      .enter()
      .append('text')
      .attr('class', '_3d pText')
      .attr('dx', '.4em')
      .merge(text)
      .transition().duration(tt)
      .each(function(d){
          d.centroid = {x: d.x, 
                        y: d.y, 
                        z: d.z};
      })
      .style('font-size', function(d){
        return z_to_txt_size(d.z)
                  .toString()
                  .concat('px');
      })
      .attr('x', function(d){ return project(d).x+3; })
      .attr('y', function(d){ return project(d).y; })
      .attr('opacity', function(d){
          return z_to_txt_opacity(d.z);
      })
      .text(function(d){ return d.text; });
  text.exit().remove();
}

function plot_texts(data, name='text', tt){

  data.forEach(function(d, j){
    d.key = name + j.toString();
  })

  var text = svg
      .selectAll('text.tText')
      .data(data, function(d){ return d.key; });
  text
      .enter()
      .append('text')
      .attr('class', '_3d tText')
      .attr('dx', '.4em')
      .merge(text)
      .transition().duration(tt)
      .each(function(d){
          d.centroid = {x: d.x, 
                        y: d.y,
                        z: 0.};
      })
      .style('font-size', function(d){
        return z_to_txt_size(d.z)
                  .toString()
                  .concat('px');
      })
      .style('fill', function(d) {
        if (!d.hasOwnProperty('color')) {
          return 'black';
        }
        return color(d.color);
      })
      .attr('x', function(d){ return project(d).x; })
      .attr('y', function(d){ return project(d).y; })
      .attr('opacity', function(d){
          return z_to_txt_opacity(d.z);
      })
      .text(function(d){ return d.text; });
  text.exit().remove();
}


function sort(){
  svg.selectAll('._3d').sort(sort_centroid_z);
}


function dot_product(u, v){
  return u.x*v.x + u.y*v.y + u.z*v.z;
}


function dot_basis(d, basis){
  return {
      x: dot_product(d, basis.ex),
      y: dot_product(d, basis.ey),
      z: dot_product(d, basis.ez),
  };
}


function rotate_lines(l, rx=0, ry=0, rz=0){
  var result = [];
  l.forEach(function(d){
    var p1 = Object.assign({}, d[0]);
    var p2 = Object.assign({}, d[1]);
    result.push([rotate_point(p1, rx, ry, rz), 
                 rotate_point(p2, rx, ry, rz)
                ]);
  })
  return result;
}


function rotate_points(g, rx=0, ry=0, rz=0){
  var result = [];
  g.forEach(function(d){
    result.push(rotate_point(d, rx, ry, rz));
  })
  return result;
}


function rotate_point(p, rx=0, ry=0, rz=0){
  p = rotate_x(p, rx);
  p = rotate_y(p, ry);
  p = rotate_z(p, rz);
  return p;
}


function rotate_x(p, a){
    var sa = Math.sin(a), ca = Math.cos(a);
    var r = Object.assign({}, p)
    r.x = p.x;
    r.y = p.y * ca - p.z * sa;
    r.z = p.y * sa + p.z * ca;
    return r;
}


function rotate_y(p, a){
    var sa = Math.sin(a), ca = Math.cos(a);
    var r = Object.assign({}, p)
    r.x = p.z * sa + p.x * ca;
    r.y = p.y;
    r.z = p.z * ca - p.x * sa;
    return r;
}


function rotate_z(p, a){
    var sa = Math.sin(a), ca = Math.cos(a);
    var r = Object.assign({}, p)
    r.x = p.x * ca - p.y * sa;
    r.y = p.x * sa + p.y * ca;
    r.z = p.z;
    return r;
}


function drag_start(){
  mx = d3.event.x;
  my = d3.event.y;
}


function get_drag_angles(){
  dx = d3.event.x - mx;
  dy = d3.event.y - my;

  alpha  = - dy * Math.PI / 230;
  beta   = dx * Math.PI / 230;
  return [alpha, beta];
}


function getMouse(){
  return d3.mouse(svg.node());
}


function getMouseAtan2(){
  mouse = getMouse(svg);
  return Math.atan2(mouse[1] - origin[1],
                    mouse[0] - origin[0]);
}


function drag_start2d(){
  atan0 = getMouseAtan2();
}


function get_drag_angle_2d(){
  atan1 = getMouseAtan2();
  return atan1 - atan0;
}


function update_point_position_from_mouse(d){
  mouse = getMouse();
  mouse = [mouse[0] - origin[0], mouse[1] - origin[1]];
  mouse = [mouse[0]/scale, mouse[1]/scale];
  var r = Object.assign({}, d)
  r.x = mouse[0];
  r.y = mouse[1];
  r.z = 0.
  return r
}


function distance(u, v) {
  let dx = u.x - v.x,
      dy = u.y - v.y,
      dz = u.z - v.z;
  return Math.sqrt(dx*dx + dy*dy + dz*dz);
}

function create_dash_segments(from, to, unit=0.07) {
  let r = [];
      dx = to.x - from.x,
      dy = to.y - from.y,
      dz = to.z - from.z;

  let norm = Math.sqrt(dx*dx + dy*dy + dz*dz);
  let n = Math.floor(norm/unit);

  dx = dx*unit/norm;
  dy = dy*unit/norm;
  dz = dz*unit/norm;

  for (var i = 0; i < n; i++) {
    if (i % 2 == 0) {
      continue;
    }
    let r1 = Object.assign({}, from);
    let r2 = Object.assign({}, to);
    r1.x = from.x + i * dx;
    r1.y = from.y + i * dy;
    r1.z = from.z + i * dz;
    r2.x = r1.x + dx;
    r2.y = r1.y + dy;
    r2.z = r1.z + dz;
    r.push([r1, r2]);
  };
  return r;
}

function create_segments(d, k=10) {
  var r = [];
  for (var i = 0; i < k; i++) {
    let j = i + 1;
    let r1 = Object.assign({}, d);
    let r2 = Object.assign({}, d);
    r1.x = i * d.x / k
    r1.y = i * d.y / k
    r1.z = i * d.z / k
    r2.x = j * d.x / k
    r2.y = j * d.y / k
    r2.z = j * d.z / k
    r.push([r1, r2]);
  };
  return r;
}


return {
  color: color,
  normalize: normalize,
  dot_product: dot_product,
  plot_points: plot_points,
  plot_lines: plot_lines,
  dot_basis: dot_basis,
  rotate_point: rotate_point,
  rotate_points: rotate_points,
  rotate_lines: rotate_lines,
  init_axis: init_axis,
  init_float_axis: init_float_axis,
  drag_start: drag_start,
  get_drag_angles: get_drag_angles,
  drag_start2d: drag_start2d,
  get_drag_angle_2d: get_drag_angle_2d,
  update_point_position_from_mouse: update_point_position_from_mouse,
  create_segments: create_segments,
  create_dash_segments: create_dash_segments,
  distance: distance,
  plot_texts: plot_texts,
  sort: sort,
}

};