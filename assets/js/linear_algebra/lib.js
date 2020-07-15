space_plot_lib = function(svg, 
                          origin, 
                          scale, 
                          is_2d) {

let 
  mx = 0,
  my = 0,
  atan0 = 0,
  atan1 = 0;

let domain = [-9, 9];


function _create_axis(axis, name, ord, 
                      axis_len=13) {
  d3.range(0, axis_len, 1).forEach(
      function(d){
        let text = '';
        if (d % 5 == 0) {
          text = d;
        } else if (d == axis_len-1) {
          text = name
        }
        let p1 = [0, 0, 0],
            p2 = [0, 0, 0];
        p1[ord] = d;
        p2[ord] = d+1;
        let segment = [
          {x: p1[0], y:p1[1], z:p1[2]},
          {x: p2[0], y:p2[1], z:p2[2]}
        ];
        if (is_2d && ord == 2) {
          text = '';
          segment.opacity = 0.0;
          segment.text_opacity = 0.0;
        }
        // segment.key = 'axis' + name + d;
        axis.push(segment); 
        if (text == '') {
          return;
        }
        if (d == axis_len-1) {
          segment[1].text = text;
        }
        else {
          segment[0].text = text
        }
      }
  );
}


function init_axis(axis_len=13) {
  set_ranges(axis_len);
  let axis = [];
  _create_axis(axis, 'x', 0, axis_len);
  _create_axis(axis, 'y', 1, axis_len);
  _create_axis(axis, 'z', 2, axis_len);
  return axis;
}

function _create_axis_float(
    axis, name, ord, axis_len=2, unit=0.2) {
  d3.range(0, axis_len, unit).forEach(
      function(d){
        let text = '';
        if (d == axis_len-unit) {
          text = name
        }
        let p1 = [0, 0, 0],
            p2 = [0, 0, 0];
        p1[ord] = d;
        p2[ord] = d+unit;
        let segment = [
          {x: p1[0], y:p1[1], z:p1[2]},
          {x: p2[0], y:p2[1], z:p2[2]}
        ]
        if (is_2d && ord == 2) {
          text = '';
          segment.opacity = 0.0;
          segment.text_opacity = 0.0;
        }
        axis.push(segment); 
        if (text == '') {
          return;
        }
        if (d == axis_len-unit) {
          segment[1].text = text;
        }
        else {
          segment[0].text = text
        }
      }
  );
}

function init_float_axis(axis_len=2.0, unit=0.2) {
  set_ranges(axis_len)
  let axis = [];
  _create_axis_float(axis, 'x', 0, axis_len, unit);
  _create_axis_float(axis, 'y', 1, axis_len, unit);
  _create_axis_float(axis, 'z', 2, axis_len, unit);
  return axis;
}


function norm(v) {
  return Math.sqrt(dot_product(v, v));
}


function norm2(v) {
  return dot_product(v, v);
}

function normalize(v) {
  let v_norm = norm(v);
  let r = Object.assign({}, v);
  r.x = v.x/v_norm;
  r.y = v.y/v_norm;
  r.z = v.z/v_norm;
  return r;
}

function normalize3d(v) {
  let v_norm = Math.sqrt(v.x*v.x+v.y*v.y+v.z*v.z);
  let r = Object.assign({}, v);
  r.x = v.x/v_norm;
  r.y = v.y/v_norm;
  r.z = v.z/v_norm;
  return r;
}


function get_delay(delay) {
  function duration(d) {
    if (d.hasOwnProperty('delay')) {
      return d.delay;
    }
    return delay;
  }
  return delay;
}


function get_duration(tt) {
  function duration(d) {
    if (d.hasOwnProperty('tt')) {
      return d.tt;
    }
    return tt;
  }
  return duration;
}


let  color  = d3.scaleOrdinal()
             .domain(d3.range(0, 20))
             .range(d3.schemeCategory20);


let z_to_size_scale,
    z_to_txt_size_scale,
    z_to_txt_opacity_scale,
    z_to_opacity_scale,
    z_to_stroke_width_scale;



function linear_scale_positive_range(domain, range) {
  let f = function(z) {
    let [db, de] = domain;
    let [rb, re] = range;
    t = (z - db) / (de - db);
    return Math.max(0.0, t * (re - rb) + rb);
  }
  return f;
}




function set_ranges(axis_len) {
  domain = [-axis_len, axis_len];
  z_to_size_scale = linear_scale_positive_range(domain, [4, 5.5]);
  z_to_txt_size_scale = linear_scale_positive_range(domain, [11, 16]);
  z_to_txt_opacity_scale = linear_scale_positive_range(domain, [0.2, 1.0]);
  z_to_opacity_scale = linear_scale_positive_range(domain, [0.5, 1.0]);
  z_to_stroke_width_scale = linear_scale_positive_range(domain, [0.5, 3.0]);
}


function get_size(d) {
  let r = 4.5;
  if (d.hasOwnProperty('r')) {
    r = d.r;
  } else if (is_2d) {
  } else if (d.centroid.z != undefined) {
    r = z_to_size_scale(d.centroid.z);
  }
  if (d.hasOwnProperty('size_factor')) {
    r *= d.size_factor;
  }
  return r;
}


function get_txt_size(d) {
  r = 14;
  if (d.hasOwnProperty('font_size')) {
    return d.font_size + 'px';
  } else if (is_2d) {
  } else if (d.centroid.z != undefined) {
    r = z_to_txt_size_scale(d.centroid.z);
  }
  if (d.hasOwnProperty('font_size_factor')) {
    r *= d.font_size_factor;
  }
  return r + 'px';
}


function get_font_family(d) {
  if (d.hasOwnProperty('font_family')) {
    return d.font_family;
  }
}


function get_txt_opacity(d) {
  r = 1.0;
  if (d.hasOwnProperty('text_opacity')){
    r = d.text_opacity;
  } else if (is_2d) {
  } else if (d.centroid.z != undefined) {
    r = z_to_txt_opacity_scale(d.centroid.z);
  }
  if (d.hasOwnProperty('text_opacity_factor')) {
    r *= d.text_opacity_factor;
  }
  return r;
}

function get_opacity(d) {
  r = 1.0;
  if (d.hasOwnProperty('opacity')) {
    r = d.opacity;
  } else if (is_2d) {
  } else if (d.centroid.z != undefined) {
    r = z_to_opacity_scale(d.centroid.z)
  }
  if (d.hasOwnProperty('opacity_factor')) {
    r *= d.opacity_factor;
  }
  return r;
}


function get_stroke_width(d){
  let r = 1.5;
  if (d.hasOwnProperty('stroke_width')) {
    r = d.stroke_width;
  } else if (is_2d) {
  } else if (d.centroid.z != undefined) {
    r = z_to_stroke_width_scale(d.centroid.z)
  }
  if (d.hasOwnProperty('stroke_width_factor')) {
    r *= d.stroke_width_factor;
  }
  return r;
}


function get_stroke_color(d) {
  if (d.hasOwnProperty('stroke_color')) {
    return d.stroke_color;
  }
}


function get_width(d) {
  if (d.hasOwnProperty('width')) {
    return d.width;
  }
  return;
}


function get_height(d) {
  if (d.hasOwnProperty('height')) {
    return d.height;
  }
  return;
}


function project(d, with_origin){
  if (with_origin == null) {
    with_origin = origin;
  }
  return {
      x: with_origin[0] + scale * d.x,
      y: with_origin[1] + scale * d.y
  };
}

function get_color(default_color='black'){
  function get_color_fn(d) {
    if (!d.hasOwnProperty('color')) {
      return default_color;
    }
    if (typeof d.color == 'number') {
      return color(d.color);
    }
    return d.color;
  }
  return get_color_fn;
}

function get_txt_color(d) {
  if (!d.hasOwnProperty('text_color')) {
    return 'black';
  }
  if (typeof d.text_color == 'number') {
    return color(d.text_color);
  }
  return d.text_color;
}


function get_line_color(d) {
  if (!d[1].hasOwnProperty('color')) {
    return 'grey';
  }
  if (typeof d[1].color == 'number') {
    return color(d[1].color);
  }
  return d[1].color;
}


function add_keys(name, data) {
  data.forEach(function(d, j){
    if (!d.hasOwnProperty('key')){
      d.key = name + j.toString();
    }
  })
}


function sort_centroid_z(a, b){
  let 
    _a = a.hasOwnProperty('centroid_z') ? a.centroid_z : a.centroid.z,
    _b = b.hasOwnProperty('centroid_z') ? b.centroid_z : b.centroid.z;
  return _a < _b ? -1 : _a > _b ? 1 : _a >= _b ? 0 : NaN;
}


function plot_lines(data,
                    tt,
                    name='line',
                    drag_line_fn=null,
                    drag_start_fn=null,
                    drag_end_fn=null,
                    with_origin=null){
  _plot_lines({
      data: data,
      tt: tt,
      name: name,
      drag_line_fn: drag_line_fn,
      drag_start_fn: drag_start_fn,
      drag_end_fn: drag_end_fn,
      with_origin: with_origin
  })
}


function _plot_lines({data,
                      delay=0,
                      tt=0,
                      name='line',
                      drag_line_fn=null,
                      drag_start_fn=null,
                      drag_end_fn=null,
                      with_origin=null}={}) {
  add_keys(name, data);

  let lines = svg
      .selectAll('line.' + name)
      .data(data, function(d){ return d.key; })
      .each(function(d){})
      .call(d3.drag()
              .on('drag', drag_line_fn)
              .on('start', drag_start_fn)
              .on('end', drag_end_fn));
  lines
      .enter()
      .append('line')
      .attr('class', '_3d ' + name)
      .merge(lines)
      .transition()
      .delay(get_delay(delay))
      .duration(get_duration(tt))
      .each(function(d){
        d.centroid = {
          x: (d[1].x+d[0].x)/2.,
          y: (d[1].y+d[0].y)/2.,
          z: (d[1].z+d[0].z)/2.
        };
        if (!d.hasOwnProperty('color')) {
          if (d[1].hasOwnProperty('color')) {
            d.color = d[1].color;
          } else if (d[0].hasOwnProperty('color')) {
            d.color = d[0].color;
          }
        }
      })
      .style('stroke-dasharray', function(d) {
        if (d.hasOwnProperty('dash')) {
          return ('3, 3');
        }
      })
      .attr('x1', function(d){ return project(d[0], with_origin).x; })
      .attr('y1', function(d){ return project(d[0], with_origin).y; })
      .attr('x2', function(d){ return project(d[1], with_origin).x; })
      .attr('y2', function(d){ return project(d[1], with_origin).y; })
      .attr('fill', get_color('grey'))
      .attr('stroke', get_color('grey'))
      .attr('stroke-width', get_stroke_width)
      .attr('opacity', get_opacity);
  lines.exit().remove();

  let text = svg
      .selectAll('text.' + name)
      .data(data, function(d){ return d.key; });

  text
      .enter()
      .append('text')
      .attr('class', '_3d ' + name)
      .attr('dx', '.1em')
      .merge(text)
      .each(function(d){
        d.centroid = {
          x: (d[1].x+d[0].x)/2.,
          y: (d[1].y+d[0].y)/2.,
          z: (d[1].z+d[0].z)/2.
        };
        if (d.hasOwnProperty('text')) {
          d.text_position = project(d.centroid, with_origin);
        } else if (d[0].hasOwnProperty('text')) {
          d.text_position = project(d[0], with_origin);
        }
        else {
          d.text_position = project(d[1], with_origin);
        }
      })
      .transition()
      .delay(get_delay(delay))
      .duration(get_duration(tt))
      .style('font-size', get_txt_size)
      .style('fill', get_txt_color)
      .attr('font-family', get_font_family)
      .attr('x', function(d){ return d.text_position.x+3; })
      .attr('y', function(d){ return d.text_position.y-3; })
      .text(function(d){
        if (d.hasOwnProperty('text')) {
          return d.text;
        } else if (d[0].hasOwnProperty('text')) {
          return d[0].text;
        } else if (d[1].hasOwnProperty('text')){
          return d[1].text;
        }
      })
      .attr('opacity', get_txt_opacity);
  text.exit().remove();
}


function plot_points(data, 
                     tt,
                     drag_point_fn=null,
                     drag_start_fn=null,
                     drag_end_fn=null,
                     name='point',
                     with_origin=null){
  _plot_points({data: data,
                tt: tt,
                drag_point_fn: drag_point_fn,
                drag_start_fn: drag_start_fn,
                drag_end_fn: drag_end_fn,
                name: name,
                with_origin: with_origin
              });
}


function _plot_points({data, 
                       tt=0,
                       delay=0,
                       drag_point_fn=null,
                       drag_start_fn=null,
                       drag_end_fn=null,
                       dblclick_fn=null,
                       name='point',
                       with_origin=null,

                      }={}){
  add_keys(name, data);

  let points = svg.selectAll('circle.' + name)
                  .data(data, function(d){ return d.key; })
                  .each(function(d){})
                  .call(d3.drag()
                          .on('drag', drag_point_fn)
                          .on('start', drag_start_fn)
                          .on('end', drag_end_fn))
                  .on('dblclick', function(d, i) {dblclick_fn(i);});

  points
    .enter()
    .append('circle')
    .attr('class', '_3d ' + name)
    .merge(points)
    .transition()
    .delay(get_delay(delay))
    .duration(get_duration(tt))
    .each(function(d){
        d.centroid = {x: d.x, 
                      y: d.y, 
                      z: d.z};
    })
    .attr('cx', function(d){return project(d, with_origin).x})
    .attr('cy', function(d){return project(d, with_origin).y})
    .attr('r', get_size)
    .attr('fill', get_color())
    .attr('stroke', get_stroke_color)
    .attr('stroke-width', get_stroke_width)
    .attr('opacity', get_opacity);
  points.exit().remove();

  let text = svg
      .selectAll('text.' + name)
      .data(data, function(d){ return d.key; });
  text
      .enter()
      .append('text')
      .attr('class', '_3d ' + name)
      .attr('dx', '.4em')
      .merge(text)
      .transition()
      .delay(get_delay(delay))
      .duration(get_duration(tt))
      .each(function(d){
          d.centroid = {x: d.x, 
                        y: d.y, 
                        z: d.z};
      })
      .style('font-size', get_txt_size)
      .style('fill', get_txt_color)
      .attr('font-family', get_font_family)
      .attr('x', function(d){ return project(d, with_origin).x; })
      .attr('y', function(d){ return project(d, with_origin).y+3; })
      .attr('opacity', get_txt_opacity)
      .text(function(d){ return d.text; });
  text.exit().remove();
}


function _plot_polygons({data, 
                         tt=0,
                         delay=0,
                         drag_poly_fn=null,
                         drag_start_fn=null,
                         drag_end_fn=null,
                         dblclick_fn=null,
                         name='polygon',
                         with_origin=null,
                        }={}){
  add_keys(name, data);

  let polys = svg.selectAll('polygon.' + name)
                 .data(data, function(d){ return d.key; })
                 .each(function(d){})
                 .call(d3.drag()
                         .on('drag', drag_poly_fn)
                         .on('start', drag_start_fn)
                         .on('end', drag_end_fn))
                 .on('dblclick', function(d, i) {dblclick_fn(i);});

  polys
    .enter()
    .append('polygon')
    .attr('class', '_3d ' + name)
    .merge(polys)
    .transition()
    .delay(get_delay(delay))
    .duration(get_duration(tt))
    .each(function(d){
      let p = d.reduce(function(sum, m) {
        return add([sum, m]);
      }, {x:0, y:0, z:0});
      d.centroid = {x: p.x/d.length, 
                    y: p.y/d.length, 
                    z: p.z/d.length};
    })
    .attr('points', function(d) { 
      return d.map(function(d) {
        let p = project(d, with_origin);
        return [p.x, p.y].join(',');
      }).join(' ');
    })
    .attr('fill', get_color())
    .attr('stroke', get_stroke_color)
    .attr('stroke-width', get_stroke_width)
    .attr('opacity', get_opacity);
  polys.exit().remove();
}



function plot_texts(data, tt, name='text', with_origin=null){
  add_keys(name, data);

  let text = svg
      .selectAll('text.'+name+'Text')
      .data(data, function(d){ return d.key; });
  text
      .enter()
      .append('text')
      .attr('class', '_3d '+name+'Text')
      .attr('dx', '.4em')
      .merge(text)
      .each(function(d){
          d.centroid = {x: d.x, 
                        y: d.y,
                        z: d.z};
      })
      .transition().duration(get_duration(tt))
      .style('font-size', get_txt_size)
      .style('fill', get_txt_color)
      .attr('font-family', get_font_family)
      .attr('x', function(d){ return project(d, with_origin).x; })
      .attr('y', function(d){ return project(d, with_origin).y; })
      .attr('opacity', get_txt_opacity)
      .text(function(d){ return d.text; });
  text.exit().remove();
}


function plot_images(data, tt, name='image', with_origin=null){
  add_keys(name, data);

  let image = svg
      .selectAll('image.'+name+'Image')
      .data(data, function(d){ return d.key; });
  image
      .enter()
      .append('image')
      .attr('class', '_3d '+name+'Image')
      .merge(image)
      .each(function(d){
          d.centroid = {x: d.x, 
                        y: d.y,
                        z: d.z};
      })
      .transition().duration(get_duration(tt))
      .style('font-size', get_txt_size)
      .attr('x', function(d){ return project(d, with_origin).x; })
      .attr('y', function(d){ return project(d, with_origin).y; })
      .attr('opacity', get_opacity)
      .attr('xlink:href', function(d) {return d.path;})
      .attr('width', get_width)
      .attr('height', get_height)
  image.exit().remove();
}


function sort(){
  svg.selectAll('._3d').sort(sort_centroid_z);
}


function dot_product(u, v){
  let uTv = u.x*v.x + u.y*v.y;
  if (!is_2d) {
    uTv += u.z * v.z;
  } 
  return uTv;
}


function dot_basis(d, basis){
  return {
      x: dot_product(d, basis.ex),
      y: dot_product(d, basis.ey),
      z: dot_product(d, basis.ez),
  };
}


function rotate_lines(l, rx=0, ry=0, rz=0, reverse=false){
  let result = [];
  l.forEach(function(d){
    let s = Object.assign({}, d);
    s[0] = rotate_point(d[0], rx, ry, rz, reverse);
    s[1] = rotate_point(d[1], rx, ry, rz, reverse);
    result.push(s);
  })
  return result;
}


function rotate_polygon(d, rx=0, ry=0, rz=0, reverse=false){
  let s = [];
  for (let k in d) {
    s[k] = d[k];
  }
  d.forEach(function(x, i) {
    s[i] = rotate_point(x, rx, ry, rz, reverse);
  });
  return s;
}


function rotate_polygons(p, rx=0, ry=0, rz=0, reverse=false){
  let result = [];
  p.forEach(function(d){
    result.push(rotate_polygon(d, rx, ry, rz, reverse));
  })
  return result;
}


function rotate_points(g, rx=0, ry=0, rz=0, reverse=false){
  let result = [];
  g.forEach(function(d){
    result.push(rotate_point(d, rx, ry, rz, reverse));
  })
  return result;
}


function rotate_point(p, rx=0, ry=0, rz=0, reverse=false){
  if (!reverse) {
    p = rotate_x(p, rx);
    p = rotate_y(p, ry);
    p = rotate_z(p, rz);
  } else {
    p = rotate_z(p, rz);
    p = rotate_y(p, ry);
    p = rotate_x(p, rx);
  }
  return p;
}


function rotate_x(p, a){
    let sa = Math.sin(a), ca = Math.cos(a);
    let r = Object.assign({}, p)
    r.x = p.x;
    r.y = p.y * ca - p.z * sa;
    r.z = p.y * sa + p.z * ca;
    return r;
}


function rotate_y(p, a){
    let sa = Math.sin(a), ca = Math.cos(a);
    let r = Object.assign({}, p)
    r.x = p.z * sa + p.x * ca;
    r.y = p.y;
    r.z = p.z * ca - p.x * sa;
    return r;
}


function rotate_z(p, a){
    let sa = Math.sin(a), ca = Math.cos(a);
    let r = Object.assign({}, p)
    r.x = p.x * ca - p.y * sa;
    r.y = p.x * sa + p.y * ca;
    r.z = p.z;
    return r;
}


function drag_start(){
  mx = d3.event.x;
  my = d3.event.y;
}


function shift_point_accord_to_mouse(p) {
  let r = cp_item(p);
  r.x += (d3.event.x - mx)/scale;
  r.y += (d3.event.y - my)/scale;
  return r;
}


function get_drag_angles(){
  dx = d3.event.x - mx;
  dy = d3.event.y - my;

  alpha  = -dy * Math.PI / 230;
  beta   = dx * Math.PI / 230;
  return [alpha, beta];
}


function getMouse(){
  let [x, y] = d3.mouse(svg.node());
  return {x: x, y: y, z: 0.};
}


function getMouseAtan2(with_origin){
  if (with_origin == null) {
    with_origin = origin;
  }
  let m = getMouse();
  return Math.atan2(m.y - with_origin[1],
                    m.x - with_origin[0]);
}


function drag_start2d(with_origin=null){
  atan0 = getMouseAtan2(with_origin);
}


function get_drag_angle_2d(with_origin=null){
  return getMouseAtan2(with_origin) - atan0;
}


function mouse_to_point_position(with_origin=null){
  if (with_origin == null) {
    with_origin = origin;
  }
  m = getMouse();
  [x, y] = [m.x - with_origin[0], m.y - with_origin[1]];
  [x, y] = [x/scale, y/scale];
  return {x: x, y: y, z:0.};
}


function update_point_position_from_mouse(d, with_origin=null){
  mouse_pos = mouse_to_point_position(with_origin);
  let r = Object.assign({}, d)
  r.x = mouse_pos.x;
  r.y = mouse_pos.y;
  r.z = 0.
  return r
}


function distance(from, to) {
  let d = {
          x: to.x - from.x,
          y: to.y - from.y,
          z: to.z - from.z,
      };
  return Math.sqrt(dot_product(d, d));
}

function create_dash_segments(from, to, unit=0.07) {
  let r = [];
      d = {
          x: to.x - from.x,
          y: to.y - from.y,
          z: to.z - from.z,
      };

  let norm = Math.sqrt(dot_product(d, d));
  let n = Math.floor(norm/unit);

  let dx = d.x*unit/norm,
      dy = d.y*unit/norm,
      dz = d.z*unit/norm;

  for (let i = 0; i < n; i++) {
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
  let r = [];
  for (let i = 0; i < k; i++) {
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


function text_table_to_list(texts, 
                            start_coord_x, start_coord_y,
                            w_unit, h_unit,
                            dws_array, dhs_array){
  let nrow = texts.length,
      ncol = dws_array.length + 1,
      col_coords = [start_coord_x],
      row_coords = [start_coord_y];

  for (let j = 1; j < ncol; j++) {
    col_coords.push(col_coords[j-1] +
                    w_unit * dws_array[j-1]);
  };

  for (let i = 1; i < nrow; i++) {
      row_coords.push(row_coords[i-1] +
                      h_unit * dhs_array[i-1]);
  }

  let list_of_texts = [];

  for (let i = 0; i < nrow; i++) {
    for (let j = 0; j < ncol; j++) {
      text_to_plot = texts[i][j];
      text_to_plot.x = col_coords[j];
      text_to_plot.y = row_coords[i];
      list_of_texts.push(text_to_plot);
    };
  }

  return list_of_texts;
}


function text_matrix_to_list(coord_texts, coord, size=14,
                             w_unit=0.6 , h_unit=0.23) {

  let size_of_space = coord_texts.length,
      numb_of_vector =  coord_texts[0].length,
      bot_margin = 0.08 * size/14,
      side_margin = 0.03 * size/14,
      between_rows = 0.12 * size/14,
      w_col = w_unit * size/14,
      h_row = h_unit * size/14,
      bracket_wings = 0.1 * size/14,

      matrix_w = side_margin * 2 + w_col * numb_of_vector,

      matrix_h = bot_margin + h_row * size_of_space +
                  between_rows * (size_of_space - 1),
      cols_list = [],
      rows_list = [],
      texts_list = [],
      lines_list = [];

  // build texts list:
  if (size_of_space > 1){
    for (i = 1; i < size_of_space; i++) {
      rows_list.push((h_row + between_rows) * size/14);
    }
  };
  
  if (numb_of_vector > 1) {
    for (i = 1; i < numb_of_vector; i++) {
    cols_list.push(w_col * size/14);
    }
  };
   
  texts_list = text_table_to_list(
      coord_texts, coord[0],
      coord[1] - matrix_h/2 + h_row,
      1, 1, cols_list, rows_list);

  // build lines list:
  lines_list = [
      [
        {x: coord[0], y: coord[1] - matrix_h/2},
        {x: coord[0] + bracket_wings,
         y: coord[1] - matrix_h/2}],
      [
        {x: coord[0], y: coord[1] - matrix_h/2},
        {x: coord[0], y: coord[1] + matrix_h/2}],
      [
        {x: coord[0], y: coord[1] + matrix_h/2},
        {x: coord[0] + bracket_wings,
         y: coord[1] + matrix_h/2}],
      [
        {x: coord[0] + matrix_w - bracket_wings,
         y: coord[1] - matrix_h/2},
        {x: coord[0] + matrix_w,
         y: coord[1] - matrix_h/2}],
      [
        {x: coord[0] + matrix_w,
         y: coord[1] - matrix_h/2},
        {x: coord[0] + matrix_w,
         y: coord[1] + matrix_h/2}],
      [
        {x: coord[0] + matrix_w,
         y: coord[1] + matrix_h/2},
        {x: coord[0] + matrix_w - bracket_wings,
         y: coord[1] + matrix_h/2}]
  ];

  for (i = 0; i < lines_list.length; i++) {
    lines_list[i].stroke_width = 1.2 * size/14;
  }

  return [lines_list, texts_list];
};


function create_circle_lines(radius, n=40) {
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
  let lines = [];
  for (let j = 0; j < points.length-1; j++) {
    lines.push([points[j], 
                points[j+1]]);
  }
  lines.push([
      points[points.length-1],
      points[0]
  ]);
  return lines;
}


function _add(v1, v2) {
  let r = Object.assign({}, v1);
  r.x += v2.x;
  r.y += v2.y;
  r.z += v2.z;
  return r;
}

function add(vs) {
  let r = vs[0];
  vs.forEach(function(v, i) {
    if (i > 0) {
      r = _add(r, v);
    }
  })
  return r;
}

function times(v, c) {
  let r = Object.assign({}, v);
  r.x *= c;
  r.y *= c;
  r.z *= c;
  return r;
}

function strip(v) {
  return {
      x: v.x,
      y: v.y,
      z: v.z
  }
}


function cp_item(i) {
  return Object.assign({}, i);
}


function cp_list(l) {
  let r = [];
  l.forEach(function(i) {r.push(cp_item(i));});
  return r;
}


function wait(time) {
  return new Promise(resolve => {
    setTimeout(() => {
        resolve();
    }, time);
  });
}


return {
  set_ranges: set_ranges,
  sort: sort,
  color: color,
  plot_points: plot_points,
  _plot_points: _plot_points,
  plot_lines: plot_lines,
  _plot_lines: _plot_lines,
  plot_texts: plot_texts,
  _plot_polygons: _plot_polygons,
  plot_images: plot_images,
  dot_product: dot_product,
  dot_basis: dot_basis,
  rotate_x: rotate_x,
  rotate_y: rotate_y,
  rotate_z: rotate_z,
  rotate_point: rotate_point,
  rotate_points: rotate_points,
  rotate_polygon: rotate_polygon,
  rotate_polygons: rotate_polygons,
  rotate_lines: rotate_lines,
  init_axis: init_axis,
  init_float_axis: init_float_axis,
  drag_start: drag_start,
  get_drag_angles: get_drag_angles,
  drag_start2d: drag_start2d,
  get_drag_angle_2d: get_drag_angle_2d,
  get_mouse_position: getMouse,
  shift_point_accord_to_mouse: shift_point_accord_to_mouse,
  update_point_position_from_mouse: update_point_position_from_mouse,
  mouse_to_point_position: mouse_to_point_position,
  create_segments: create_segments,
  create_dash_segments: create_dash_segments,
  text_table_to_list: text_table_to_list,
  text_matrix_to_list: text_matrix_to_list,
  normalize: normalize,
  normalize3d: normalize3d,
  norm: norm,
  norm2: norm2,
  distance: distance,
  add: add,
  times: times,
  strip: strip,
  cp_list: cp_list,
  cp_item: cp_item,
  create_circle_lines: create_circle_lines,
  wait: wait,
}

};