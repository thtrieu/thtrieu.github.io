let v_perspective2d = (function() {

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


function plot(scatter, axis, tt){

  basis = {
      ex: lib.normalize(axis[axis_len/unit * 0][1]), 
      ey: lib.normalize(axis[axis_len/unit * 1][1]), 
      ez: lib.normalize(axis[axis_len/unit * 2][1]), 
  };

  let u = scatter[0];
  let v = scatter[1];
  v.centroid_z = 1000;

  let v_norm = Math.sqrt(v.x*v.x + v.y*v.y);
  let v_ = {
      x: v.x/v_norm,
      y: v.y/v_norm,
      z: 0.0,
      color: 3,
      opacity_factor: 0.5,
      centroid_z: -1000,
      text_opacity: 0.5
  }

  let points = [];
  scatter.forEach(function(d, i){
    let coord = lib.dot_basis(d, basis);
    let p = Object.assign({}, d);
    if (i == 0) {
      p.text = 'u';
    } else {
      p.text = 'v';
    }

    p.text += ' = ['.concat(
        coord.x.toFixed(1), ',',
        coord.y.toFixed(1), ']'
    )
    points.push(p);
  })

  lib.plot_lines(axis, tt);

  let lines = [];
  scatter.forEach(function(d,i){
    lines.push(...lib.create_segments(d));
  });


  let uTv = lib.dot_product(u, v);
  let uTvv = {
      x: v_.x * uTv,
      y: v_.y * uTv,
      z: 0,
      color: 0,
      tt: true
  }

  let proj_len = lib.dot_product(u, v_);
  let uTvv_ = {
      x: v_.x * proj_len,
      y: v_.y * proj_len,
      z: 0,
      color: 4,
      tt: true
  }

  let uTvv_line = [
      {x: 0, y: 0, z: 0},
      uTvv
  ];
  uTvv_line.text = 'u\u1d40v = ' + uTv.toFixed(3);
  uTvv_line.text_color = 0;
  uTvv_line.font_size = 15;
  uTvv_line.stroke_width = 2.0
  uTvv_line.centroid_z = 1000;

  let uTvv__line = [
      {x: 0, y: 0, z: 0},
      uTvv_
  ];
  // uTvv__line[1].text = 'p';
  uTvv__line.opacity = 0.6;
  uTvv__line.stroke_width = 5.0;
  uTvv__line.color = 0;

  lines.push(uTvv_line);
  lines.push(uTvv__line);
  points.push(v_);

  lib.create_dash_segments(u, uTvv_).forEach(
      function(d) {
        d.color = 'grey';
        lines.push(d);
      }
  );

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
    lines.push(seg);
  }

  let uTv_line = [
      {x:0, y:0, z:0},
      {x:uTv, y:0, z:0}
  ];
  uTv_line.color = 0;
  uTv_line.centroid_z = 1000;
  lines.push(uTv_line);

  for (let i = -axis_len; i <= axis_len; i += 0.5) {
    texts.push({text: i.toFixed(1),
                x: i-0.2,
                y: 0.2,
                z: 0,
                color: 'grey',
                font_size: 12});
  }

  texts.push({text: 'u\'',
              x: uTv-0.4,
              y: -0.5,
              z: 0,
              font_size: 14});
  texts.push({text: '= u\u1d40v',
              x: uTv-0.2,
              y: -0.5,
              z: 0,
              font_size: 14});
  texts.push({text: uTv.toFixed(3),
              x: uTv-0.35,
              y: -0.2,
              z: 0,
              font_size: 14});
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
    centroid_z: 1001
  };

  lib.plot_lines(lines, tt, 'lines2', null, null, null, origin2);
  lib.plot_points([u_on_v], tt, null, null, null, 'points2', origin2);
  lib.plot_texts(texts, tt, 'text2', origin2);
}


function init(tt){
  axis = lib.init_float_axis(axis_len=axis_len, unit=unit);
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


  alpha = startAngleX;
  beta = startAngleY;

  expectedScatter = lib.rotate_points(scatter, alpha, beta, startAngleZ);
  expectedAxis = lib.rotate_lines(axis, alpha, beta, startAngleZ);
  plot(expectedScatter, 
       expectedAxis, 
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
  expectedAxis = lib.rotate_lines(axis, 0, 0, angle_z);
  
  plot(expectedScatter, 
       expectedAxis, 
       0);
}

let is_rotating_points = false;

function dragged_point_only(){
  if (!drag_on_left) {
    return;
  }
  expectedScatter = lib.cp_list(scatter);
  expectedScatter[1] = lib.update_point_position_from_mouse(scatter[1]);
  
  plot(expectedScatter, 
       expectedAxis, 
       0);
}

function stretch_point(d, i){
  let d_ = lib.normalize(d);
      m = lib.mouse_to_point_position();
  let d_Tm = lib.dot_product(d_, m);
  let p = {
    x: d_.x * d_Tm,
    y: d_.y * d_Tm,
    z: 0,
  }
  let diff = Math.sqrt((p.x-m.x)*(p.x-m.x) +
                       (p.y-m.y)*(p.y-m.y));
  if (diff > 0.2) {
    drag_end();
    is_rotating_points = true;
    lib.drag_start2d();
    return; 
  }
  expectedScatter = [];
  scatter.forEach(function(d, j){
      if (j == i) {
        d.x = Math.min(p.x, (300-origin[0])/scale);
        d.y = p.y;
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
    if (is_rotating_points) {
      dragged_point_only();
    } else {
      stretch_point(d, i);
    }
    return;
  } else if (i == 2) {
    dragged_point_only();
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
       expectedAxis, 
       0);
}


function drag_end(){
  if (!drag_on_left) {
    return;
  }
  scatter = expectedScatter;
  axis = expectedAxis;
  is_rotating_points = false;
}


return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);}
};

})();