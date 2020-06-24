let v_perspective = (function() {

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


function plot(scatter, axis, tt){
  let lines = [], points = [];

  lib.plot_lines(axis, tt);

  scatter.forEach(function(d){
    lines.push(...lib.create_segments(d));
  })

  let u = Object.assign({}, scatter[0]),
      v = Object.assign({}, scatter[1]);
  let v_norm = Math.sqrt(v.x*v.x + v.y*v.y + v.z*v.z);

  let v_ = lib.normalize(v);
  v_.r = 7;
  v_.opacity = 0.5;
  v_.centroid_z = -1000;
  v_.text_opacity = 0.5;

  let uTv = lib.dot_product(u, v);
  let uTvv = {x: v_.x * uTv,
              y: v_.y * uTv,
              z: v_.z * uTv};

  let uTvv_line = [
      {x: 0, y: 0, z: 0},
      {x: uTvv.x, y: uTvv.y, z: uTvv.z}
  ]
  uTvv_line.color = 0;
  uTvv_line.centroid_z = 1000;
  uTvv_line.text = 'u\u1d40v = ' + uTv.toFixed(3);
  uTvv_line.text_color = 0;
  uTvv_line.font_size = 14;
  uTvv_line.text_opacity = 1.0;


  let uTv_ = lib.dot_product(u, v_);
  let uTvv_ = {x: v_.x * uTv_,
               y: v_.y * uTv_,
               z: v_.z * uTv_};

  let uTvv__line = [
      {x: 0, y: 0, z: 0},
      {x: uTvv_.x, y: uTvv_.y, z: uTvv_.z}
  ]
  uTvv__line.color = 0;
  uTvv__line.stroke_width = 5;
  uTvv__line.opacity = 0.5;

  lines.push(uTvv_line);
  lines.push(uTvv__line);
  lib.create_dash_segments(u, uTvv_).forEach(
      function(d) {
        d.color = 'grey';
        lines.push(d);
      }
  );

  points = [u, v, v_];

  basis = {
      ex: lib.normalize(axis[axis_len/unit * 0][1]), 
      ey: lib.normalize(axis[axis_len/unit * 1][1]), 
      ez: lib.normalize(axis[axis_len/unit * 2][1]), 
  };

  points.forEach(function(d, i) {
    let coord = lib.dot_basis(d, basis);
    if (i == 0) {
      d.text = 'u';
    } else if (i == 1) {
      d.text = 'v';
    } else {
      return;
    }
    d.text += ' = ['.concat(
        coord.x.toFixed(1), ',',
        coord.y.toFixed(1), ',',
        coord.z.toFixed(1), ']'
    )
  })

  lib.plot_lines(lines, tt, 'arrow',
                 drag_line_fn=dragged_point_only,
                 drag_start_fn=drag_start,
                 drag_end_fn=drag_end);

  lib.plot_points(points, tt,
                  drag_point_fn=dragged_point,
                  drag_start_fn=drag_start,
                  drag_end_fn=drag_end);
  plot_v_perspective(uTv, tt);
  lib.sort();
}

function plot_v_perspective(uTv, tt){

  let lines = [], texts = [];
  for (let i = -axis_len; i < axis_len; i += unit) {
    let seg = [{x: i, y: 0, z: 0},
                {x: i+unit, y: 0, z: 0}];
    seg.color = 3;
    seg.opacity = 1.0;
    seg.text_opacity = 1.0;
    lines.push(seg);
  }

  let uTv_line = [
      {x:0, y:0, z:0},
      {x:uTv, y:0, z:0}
  ];
  uTv_line.color = 0;
  uTv_line.centroid_z = 1000;
  uTv_line.opacity = 1.0;
  lines.push(uTv_line);

  for (let i = -axis_len; i <= axis_len; i += 0.5) {
    texts.push({text: i.toFixed(1),
                x: i-0.2,
                y: 0.2,
                z: 0,
                color: 'grey',
                font_size: 12,
                text_opacity: 1.0});
  }

  texts.push({text: 'u\'',
              x: uTv-0.4,
              y: -0.5,
              z: 0,
              font_size: 14,
              text_opacity: 1.0});
  texts.push({text: '= u\u1d40v',
              x: uTv-0.2,
              y: -0.5,
              z: 0,
              font_size: 14,
              text_opacity: 1.0});
  texts.push({text: uTv.toFixed(3),
              x: uTv-0.35,
              y: -0.2,
              z: 0,
              font_size: 14,
              text_opacity: 1.0});
  texts.push({text: 'v\'s world view:',
              x: -0.8,
              y: -2,
              z: 0,
              font_size: 15,
              text_opacity: 0.8
             });

  let u_on_v = {
    x: uTv,
    y: 0,
    z: 0,
    color: 4,
    centroid_z: 1001,
    opacity: 1.0
  };

  lib.plot_lines(lines, tt, 'lines2', null, null, null, origin2);
  lib.plot_points([u_on_v], tt, null, null, null, 'points2', origin2);
  lib.plot_texts(texts, tt, 'text2', origin2);
}


function init(tt){
  axis = lib.init_float_axis(axis_len=axis_len, unit=unit);
  let u = {
      x: 0.8,
      y: 0.8, 
      z: -0.8,
      color: 4
  },
      v = {
      x: 1/Math.sqrt(14),
      y: -2/Math.sqrt(14), 
      z: 3/Math.sqrt(14),
      color: 3,
  };

  scatter = [u, v];

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


function dragged_point_only(){
  if (!drag_on_left) {
    return;
  }
  [angle_x, angle_y] = lib.get_drag_angles();

  expectedScatter = lib.rotate_points(scatter, angle_x, angle_y);
  
  plot(expectedScatter, 
       expectedAxis, 
       0);
}


function stretch_point(d, i){
  let d_2d = {x: d.x, y: d.y, z: 0.},
      d_2d_ = lib.normalize(d_2d),
      m = lib.mouse_to_point_position(),
      d_2d_Tm = lib.dot_product(d_2d_, m),
      r = d_2d_Tm / lib.norm(d_2d);

  let p = {
    x: d.x * r,
    y: d.y * r,
    z: d.z * r,
  }
  expectedScatter = [];
  scatter.forEach(function(d, j){
      if (j == i) {
        d.x = Math.min(p.x, (300-origin[0])/scale);
        d.y = p.y;
        d.z = p.z;
      }
      expectedScatter.push(d);
  });

  plot(expectedScatter, 
       expectedAxis, 
       0);
}


function dragged_point(d, i){
  if (!drag_on_left) {
    return;
  }
  if (i == 1) {
    stretch_point(d, i);
    return;
  } else if (i == 2) {
    dragged_point_only();
    return;
  }
  [angle_x, angle_y] = lib.get_drag_angles();

  expectedScatter = [];
  scatter.forEach(function(d, j){
      if (j == i) {
        expectedScatter.push(lib.rotate_point(d, angle_x, angle_y));
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



