let many_perspective2d = (function() {

let origin = [150, 140], 
  origin2 = [450, 140],
  scale = 60, 
  scatter = [], 
  axis = [],
  expectedAxis = [],
  startAngleX = Math.PI,
  startAngleY = 0.,
  startAngleZ = 0.,
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
    is_2d=true);

  svg = svg.call(d3.drag()
           .on('drag', dragged)
           .on('start', drag_start)
           .on('end', drag_end))
           .append('g');  
}


function plot_project_u_onto_v(u, v, tt, name, visible=true) {
  let lines = [];
  v.centroid_z = 1000;
  let uTv = lib.dot_product(u, v);
  let uTvv = {
      x: v.x * uTv,
      y: v.y * uTv,
      z: 0,
      color: v.color-1,
      tt: true
  }

  let uTvv_line = [
      {x: 0, y: 0, z: 0},
      uTvv
  ];
  // uTvv_line.text = 'u\u1d40v\u2081';
  uTvv_line.text_color = 0;
  uTvv_line.font_size = 15;
  uTvv_line.stroke_width = 2.0
  uTvv_line.centroid_z = 1000;
  if (!visible) {
    uTvv_line.opacity = 0;
  }

  lines.push(uTvv_line);

  lib.create_dash_segments(u, uTvv).forEach(
      function(d) {
        d.color = 'grey';
        if (!visible) {
          d.opacity = 0.;
        }
        lines.push(d);
      }
  );

  lib.plot_lines(lines, tt, name);
}


function plot(scatter, axis, tt){

  let points = [];
  scatter.forEach(function(d){
    points.push(Object.assign({}, d));
  });

  points.push({
    x: 0,
    y: 0,
    z: 1,
    opacity: 0,
  });
  
  let lines = [];
  points.forEach(function(d, i){
    lines.push(...lib.create_segments(d));
  });
  lib.plot_lines(lines, tt, 'arrow');


  let [u, v1, v2, v3] = points;

  plot_project_u_onto_v(u, v1, tt, 'v1');
  plot_project_u_onto_v(u, v2, tt, 'v2');
  plot_project_u_onto_v(u, v3, tt, 'v3', visible=false);

  points.forEach(function(p, i){
    if (i == 0) {
      p.text = 'u';
    } else if (i == 1) {
      p.text = 'v\u2081';
    } else if (i == 2) {
      p.text = 'v\u2082';
    } else if (i == 3) {
      p.text = 'v\u2083';
      p.text_opacity = 0.0;
    }
  })

  // lib.plot_lines(axis, tt);

  lib.plot_points(points, tt,
                  drag_point_fn=dragged_point,
                  drag_start_fn=drag_start,
                  drag_end_fn=drag_end);

  plot_v_perspective(
      u, v1, 
      -0.5, 3,
      'v\u2081',
      tt, 'v1');
  plot_v_perspective(
      u, v2,
      0.5, 19,
      'v\u2082',
      tt, 'v2');
  plot_v_perspective(
      u, v3,
      3, 9,
      'v\u2083',
      tt, 'v3');
  lib.sort();
}


function plot_v_perspective(u, v, y, line_color, v_name, tt, name){
  let uTv = lib.dot_product(u, v)/lib.norm2(v);
  if (lib.norm2(v) == 0) {
    uTv = 1.0
  }
  let lines = [], texts = [];
  for (let i = -axis_len; i < axis_len; i += unit) {
    let seg = [{x: i, y: y, z: 0},
                {x: i+unit, y: y, z: 0}];
    seg.color = line_color;
    lines.push(seg);
  }

  let uTv_line = [
      {x:0, y:y, z:0},
      {x:uTv, y:y, z:0}
  ];
  uTv_line.color = v.color-1;
  uTv_line.centroid_z = 1000;
  lines.push(uTv_line);

  for (let i = -axis_len; i <= axis_len; i += 0.5) {
    texts.push({text: i.toFixed(1),
                x: i-0.2,
                y: y+0.2,
                z: 0,
                color: 'grey',
                font_size: 12});
  }

  texts.push({text: 'u\u1d40'+v_name,
              x: uTv-0.28,
              y: y-0.2,
              z: 0,
              font_size: 14});

  let u_on_v = {
    x: uTv,
    y: y,
    z: 0,
    color: 4,
    centroid_z: 1001
  };

  lib.plot_lines(lines, tt, name+'lines2', null, null, null, origin2);
  lib.plot_points([u_on_v], tt, null, null, null, name+'points2', origin2);
  lib.plot_texts(texts, tt, name+'text2', origin2);
}


function init(tt){
  // axis = lib.init_float_axis(axis_len=axis_len, unit=unit);
  scatter = [];

  scatter.push({
    x: -1.0,
    y: -4.0/3, 
    z: 0.,
    color: 4,
  });

  scatter.push({
    x: 1/Math.sqrt(3),
    y: -Math.sqrt(2/3), 
    z: 0.,
    color: 3,
  })

  scatter.push({
    x: Math.sqrt(13/14),
    y: Math.sqrt(1/14), 
    z: 0.,
    color: 19,
  })


  alpha = startAngleX;
  beta = startAngleY;

  expectedScatter = lib.rotate_points(scatter, alpha, beta, startAngleZ);
  // expectedAxis = lib.rotate_lines(axis, alpha, beta, startAngleZ);
  plot(expectedScatter,
       [],  // expectedAxis, 
       tt);
  drag_end();
}


let drag_on_left = true;


function drag_start(){
  lib.drag_start2d();
  if (lib.get_mouse_position().x < 300) {
    drag_on_left = true;
  } else {
    drag_on_left = false;
  }
}

function dragged(){
  if (!drag_on_left) {
    return;
  }
  angle_z = lib.get_drag_angle_2d();

  expectedScatter = lib.rotate_points(scatter, 0, 0, angle_z);
  // expectedAxis = lib.rotate_lines(axis, 0, 0, angle_z);
  
  plot(expectedScatter, 
       [],  // expectedAxis, 
       0);
}


function dragged_v_only(){
  if (!drag_on_left) {
    return;
  }
  angle_z = lib.get_drag_angle_2d();

  expectedScatter = lib.rotate_points(scatter, 0, 0, angle_z);
  expectedScatter[0] = scatter[0];
  
  plot(expectedScatter, 
       [],  // expectedAxis, 
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

  plot(expectedScatter, 
       [],  // expectedAxis, 
       0);
}


function drag_end(){
  if (!drag_on_left) {
    return;
  }
  scatter = expectedScatter;
  // axis = expectedAxis;
}


return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);}
};

})();