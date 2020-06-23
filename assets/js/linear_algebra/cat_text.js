let cat_text = (function() {

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
  cat_uTv = null,
  u_norm = null,
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


function get_text(uTv) {
  let cat_txt = '"my cat"';
  let diff = uTv - cat_uTv
  if (Math.abs(diff) < 0.02) {
    return cat_txt;
  }

  let dog_uTv = Math.sqrt(
      u_norm*u_norm - cat_uTv*cat_uTv);
  if (Math.abs(uTv - dog_uTv) < 0.02) {
    return '"your dog"';
  }

  let r = '"';
  for (let i = 0; i < cat_txt.length; i++) {
    c = cat_txt[i];
    r += String.fromCharCode(
        Math.floor(c.charCodeAt(0) + 
                   diff * 32
                   )
    );
  }
  return r + '"';
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
      x: v.x * uTv,
      y: v.y * uTv,
      z: 0,
      color: 0,
      tt: true
  }

  let uTvv_line = [
      {x: 0, y: 0, z: 0},
      uTvv
  ];
  uTvv_line.stroke_width = 2.0
  // uTvv_line.centroid_z = 1000;

  lines.push(uTvv_line);

  lib.create_dash_segments(u, uTvv).forEach(
      function(d) {
        d.color = 'grey';
        lines.push(d);
      }
  );

  points[0].text = '\u2190';
  points[0].font_size = 18;

  points[1].text = 'v';
  let [img_w, img_h] = [70, 70];
  let t = 1 + u.z / (axis_len * 9 / 2.5);
  img_w = img_w * t;
  
  lib.plot_images([{
      path: '/assets/cat.jpg',
      x: u.x + (27/scale),
      y: u.y - img_w/2/scale,
      z: u.z-1,
      opacity: 0.8 * t,
      width: img_w,
  }], tt, 'cat')

  lib.plot_lines(lines, tt, 'arrow');
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
                text_opacity: 1.0,
                color: 'grey',
                font_size: 12});
  }

  texts.push({text: get_text(uTv),
              x: uTv-0.2,
              y: -0.5,
              z: 0,
              text_opacity: 1.0,
              font_size: 14,
              font_family: 'monospace'});
  texts.push({text: '\u2193',
              x: uTv-0.18,
              y: -0.2,
              z: 0,
              text_opacity: 1.0,
              font_size: 17});

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

  cat_uTv = lib.dot_product(u, v);
  u_norm = lib.norm(u);

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


function dragged_point(d, i){
  if (i == 0) {
    return;
  }
  [angle_x, angle_y] = lib.get_drag_angles();

  expectedScatter = [scatter[0],
                     lib.rotate_point(scatter[1], angle_x, angle_y)];
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


select_svg('#svg_cat_text');
init();


return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);}
};

})();