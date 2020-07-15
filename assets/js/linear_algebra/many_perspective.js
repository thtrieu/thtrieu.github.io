let many_perspective = (function() {

let origin = [150, 140], 
  origin2 = [450, 140],
  scale = 60, 
  scatter = [], 
  axis = [],
  expectedAxis = [],
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
    is_2d=false)

  svg = svg.call(d3.drag()
           .on('start', drag_start)
           .on('drag', dragged)
           .on('end', drag_end))
           .append('g'); 
}

function plot_project_u_onto_v(u, v, tt, name) {
  let lines = [];
  let uTv = lib.dot_product(u, v)/lib.norm2(v);
  let uTvv = {x: v.x * uTv,
              y: v.y * uTv,
              z: v.z * uTv};

  let uTvv_line = [
      {x: 0, y: 0, z: 0},
      {x: uTvv.x, y: uTvv.y, z: uTvv.z}
  ]
  uTvv_line.color = v.color-1;
  uTvv_line.centroid_z = 1000;

  lines.push(uTvv_line);
  lib.create_dash_segments(u, uTvv).forEach(
      function(d) {
        d.color = 'grey';
        lines.push(d);
      }
  );
  lib.plot_lines(lines, tt, name)
}


function plot(scatter, axis, tt){
  let lines = [], points = [];

  scatter.forEach(function(d){
    lines.push(...lib.create_segments(d));
  })

  let u = Object.assign({}, scatter[0]),
      v1 = Object.assign({}, scatter[1]),
      v2 = Object.assign({}, scatter[2]),
      v3 = Object.assign({}, scatter[3]);

  plot_project_u_onto_v(u, v1, tt, 'v1')
  plot_project_u_onto_v(u, v2, tt, 'v2')
  plot_project_u_onto_v(u, v3, tt, 'v3')

  u.text = 'u';
  v1.text = 'v\u2081';
  v2.text = 'v\u2082';
  v3.text = 'v\u2083';
  points = [u, v1, v2, v3];

  lib.plot_lines(lines, tt, 'arrow');

  lib.plot_points(points, tt,
                  drag_point_fn=dragged_point,
                  drag_start_fn=drag_start,
                  drag_end_fn=drag_end);

  plot_v_perspective(
      u, v1, 
      -1, 3,
      'v\u2081',
      tt, 'v1');
  plot_v_perspective(
      u, v2,
      0, 19,
      'v\u2082',
      tt, 'v2');
  plot_v_perspective(
      u, v3,
      1, 9,
      'v\u2083',
      tt, 'v3');
  lib.sort();
}

function plot_v_perspective(u, v, y, line_color, v_name, tt, name){
  // console.log(uTv);
  let uTv = lib.dot_product(u, v) / lib.norm2(v);
  let lines = [], texts = [];
  for (let i = -axis_len; i < axis_len; i += unit) {
    let seg = [{x: i, y: y, z: 0},
                {x: i+unit, y: y, z: 0}];
    seg.color = line_color;
    seg.opacity = 1.0;
    seg.text_opacity = 1.0;
    lines.push(seg);
  }

  let uTv_line = [
      {x:0, y:y, z:0},
      {x:uTv, y:y, z:0}
  ];
  uTv_line.color = v.color-1;
  uTv_line.centroid_z = 1000;
  uTv_line.opacity = 1.0;
  lines.push(uTv_line);

  for (let i = -axis_len; i <= axis_len; i += 0.5) {
    texts.push({text: i.toFixed(1),
                x: i-0.2,
                y: y+0.2,
                z: 0,
                color: 'grey',
                font_size: 12,
                text_opacity: 1.0});
  }
  texts.push({text: 'u\u1d40' + v_name,
              x: uTv-0.28,
              y: y-0.2,
              z: 0,
              font_size: 14,
              text_opacity: 1.0});

  let u_on_v = {
    x: uTv,
    y: y,
    z: 0,
    color: 4,
    centroid_z: 1001,
    opacity: 1.0
  };

  lib.plot_lines(lines, tt, name+'lines2', null, null, null, origin2);
  lib.plot_points([u_on_v], tt, null, null, null, name+'points2', origin2);
  lib.plot_texts(texts, tt, name+'text2', origin2);
}


function init(tt){
  axis = lib.init_float_axis(axis_len=axis_len, unit=unit);
  let u = {
      x: 1,
      y: 1, 
      z: -1,
      color: 4
  },
      v1 = {
      x: Math.sqrt(13/14)*1.5,
      y: Math.sqrt(.5/14)*1.5, 
      z: Math.sqrt(.5/14)*1.5, 
      color: 3,
  },
      v2 = {
      x: -Math.sqrt(0.0)*1.5, 
      y: -Math.sqrt(1.0)*1.5, 
      z: -Math.sqrt(0.0)*1.5, 
      color: 19,
  },
      v3 = {
      x: Math.sqrt(0.5/14)*1.5, 
      y: Math.sqrt(0.5/14)*1.5,  
      z: Math.sqrt(13/14)*1.5,  
      color: 9,
  };

  scatter = [u, v1, v2, v3];

  expectedScatter = lib.rotate_points(
      scatter, startAngleX, startAngleY, startAngleZ);
  expectedAxis = lib.rotate_lines(
      axis, startAngleX, startAngleY, startAngleZ);
  plot(expectedScatter, 
       expectedAxis, 
       tt);
  drag_end();
}


let drag_on_left = true;


function drag_start(){
  lib.drag_start();
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
  [angle_x, angle_y] = lib.get_drag_angles();

  expectedScatter = lib.rotate_points(scatter, angle_x, angle_y);
  expectedAxis = lib.rotate_lines(axis, angle_x, angle_y);
  
  plot(expectedScatter, 
       expectedAxis, 
       0);
}


function dragged_v_only(){
  if (!drag_on_left) {
    return;
  }
  [angle_x, angle_y] = lib.get_drag_angles();

  expectedScatter = lib.rotate_points(scatter, angle_x, angle_y);
  expectedScatter[0] = scatter[0];

  plot(expectedScatter, 
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

  expectedScatter = [];
  scatter.forEach(function(d, j){
      if (j == i) {
        expectedScatter.push(lib.shift_point_accord_to_mouse(d));
      } else {
        expectedScatter.push(d);
      }
  });
  
  plot(expectedScatter, 
       expectedAxis, 
       0);
}

function drag_end(){
  if (!drag_on_left) {
    return;
  }
  scatter = expectedScatter;
  axis = expectedAxis;
}


return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);}
};

})();



