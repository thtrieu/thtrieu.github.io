space_plot_lib = function(svg, origin, scale, is_2d) {

var 
  mx = 0,
  my = 0,
  atan0 = 0,
  atan1 = 0;


function _create_axis(axis, name, ord, axis_len=13) {
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
        axis.push([
            {x: p1[0], y:p1[1], z:p1[2]},
            {x: p2[0], y:p2[1], z:p2[2], text:text}
        ]); 
      }
  );
}

function init_axis(axis_len=13) {
  var axis = [];
  _create_axis(axis, 'x', 0, axis_len);
  _create_axis(axis, 'y', 1, axis_len);
  if (!is_2d) {
    _create_axis(axis, 'z', 2, axis_len);
  }
  return axis;
}


var color  = d3.scaleOrdinal()
               .domain(d3.range(0, 20))
               .range(d3.schemeCategory20);


var z_to_size_scale = d3.scaleLinear()
                        .domain([-9, 9])
                        .range([4, 5.5]);

var z_to_txt_size_scale = d3.scaleLinear()
                            .domain([-9, 9])
                            .range([9, 14]);

var z_to_txt_opacity_scale = d3.scaleLinear()
                               .domain([-9, 9])
                               .range([0.2, 1.0]);

var z_to_opacity_scale = d3.scaleLinear()
                           .domain([-9, 9])
                           .range([0.5, 1.0]);

var z_to_stroke_width_scale = d3.scaleLinear()
                                .domain([-9, 9])
                                .range([1.0, 2.7]);


function z_to_size(z){
  if (is_2d) {
    return 4;
  }
  return z_to_size_scale(z)
}


function z_to_txt_size(z){
  if (is_2d) {
    return 12;
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
  var lines = svg
      .selectAll('line.' + name)
      .data(data);
  lines
      .enter()
      .append('line')
      .attr('class', '_3d ' + name)
      .merge(lines)
      .each(function(d){
        d.centroid = {
          x: (d[1].x+d[0].x)/2,
          y: (d[1].y+d[0].y)/2,
          z: (d[1].z+d[0].z)/2
        }
      })
      .transition().duration(tt)
      .attr('x1', function(d){ return project(d[0]).x; })
      .attr('y1', function(d){ return project(d[0]).y; })
      .attr('x2', function(d){ return project(d[1]).x; })
      .attr('y2', function(d){ return project(d[1]).y; })
      .attr('fill', get_line_color)
      .attr('stroke', get_line_color)
      .attr('stroke-width', function(d){ return z_to_stroke_width(d.centroid.z);})
      .attr('opacity', function(d){
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
          d.centroid = {x: d[1].x, 
                        y: d[1].y, 
                        z: d[1].z};
      })
      .transition().duration(tt)
      .style('font-size', function(d){
        return z_to_txt_size(d[1].z)
                  .toString()
                  .concat('px');
      })
      .attr('x', function(d){ return project(d[0]).x; })
      .attr('y', function(d){ return project(d[0]).y; })
      .text(function(d){
        return d[1].text;
      })
      .attr('opacity', function(d){
          return z_to_txt_opacity(d[1].z);
      });
  text.exit().remove();
}


function sort_centroid_z(a, b){
    var _a = a.centroid.z, _b = b.centroid.z;
    return _a < _b ? -1 : _a > _b ? 1 : _a >= _b ? 0 : NaN;
}


function plot_points(data, 
                     tt,
                     drag_point_fn,
                     drag_start_fn,
                     drag_end_fn){

  var points = svg.selectAll('circle').data(data)
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
    .each(function(d){
      d.centroid = {x: d.x, y: d.y, z: d.z};
    })
    .attr('r', function(d){
        return z_to_size(d.z);
    })
    .attr('fill', function(d){ return color(d.color); })
    .attr('opacity', function(d){
        return z_to_opacity(d.z);
    });
  points.exit().remove();

  var text = svg
      .selectAll('text.pText')
      .data(data);
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
      .text(function(d){ return d.text; })
      .attr('opacity', function(d){
          return z_to_txt_opacity(d.z);
      });

  text.exit().remove();
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


function create_segments(d, k=10) {
  var r = [];
  for (var i = 0; i < k; i++) {
    let j = i + 1;
    let r1 = Object.assign({}, d);
    let r2 = Object.assign({}, d);
    r1.x = i * d.x / 10.
    r1.y = i * d.y / 10.
    r1.z = i * d.z / 10.
    r2.x = j * d.x / 10.
    r2.y = j * d.y / 10.
    r2.z = j * d.z / 10.
    r.push([r1, r2]);
  };
  return r;
}


return {
  plot_points: plot_points,
  plot_lines: plot_lines,
  dot_basis: dot_basis,
  sort_centroid_z: sort_centroid_z,
  rotate_point: rotate_point,
  rotate_points: rotate_points,
  rotate_lines: rotate_lines,
  init_axis: init_axis,
  drag_start: drag_start,
  get_drag_angles: get_drag_angles,
  drag_start2d: drag_start2d,
  get_drag_angle_2d: get_drag_angle_2d,
  update_point_position_from_mouse: update_point_position_from_mouse,
  create_segments: create_segments,
}

};