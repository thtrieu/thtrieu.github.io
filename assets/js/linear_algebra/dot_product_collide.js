let dot_product_collide = (function() {

let origin = [150, 140], 
    scale = 60, 
    scatter = [], 
    axis = [],
    expectedAxis = [],
    beta = 0, alpha = 0, 
    startAngleX = Math.PI/8 * 2.65,
    startAngleY = -Math.PI/8,
    startAngleZ = Math.PI/8 * 0.6,
    axis_len = 2,
    unit = axis_len/10,
    lib = null,
    svg = null,
    uTvv_opacity = 0;

let w_unit = 0.22,
    h_unit = 0.13,
    size = 14,
    differ = 0.09,
    text_above_matrix = 0.7;

let start_coord_x=(380 - origin[0])/scale, 
    start_coord_y=(75 - origin[1])/scale,
    last_col_coord = start_coord_x + 1.79,
    last_row_coord = start_coord_y + 0.67;

let v_cell = {text: 'v =', x: last_col_coord,
              y: start_coord_y - text_above_matrix, key: 'v'},
    uT_cell = {text: 'u\u1d40 =', x: start_coord_x - 0.6,
               y: last_row_coord + differ, key: 'u' };


function select_svg(svg_id) {  
  svg = d3.select(svg_id);

  lib = space_plot_lib(
    svg,
    origin,
    scale,
    is_2d=false);

  svg = svg.call(d3.drag()
           .on('start', drag_start)
           .on('drag', dragged)
           .on('end', drag_end))
           .append('g'); 
}


function plot(scatter, axis, tt){
  // Step 1: Plot the figure.
  let u = scatter[0],
      v = scatter[1];

  let lines = [], points = [];

  lib.plot_lines(axis, tt);

  scatter.forEach(function(d){
    lines.push(...lib.create_segments(d));
  })

  basis = {
      ex: axis[1/unit - 1 + axis_len/unit * 0][1], 
      ey: axis[1/unit - 1 + axis_len/unit * 1][1], 
      ez: axis[1/unit - 1 + axis_len/unit * 2][1],
  };

  let uTv = lib.dot_product(u, v);
  
  let uTvv = {
      x: v.x * uTv,
      y: v.y * uTv,
      z: v.z * uTv,
      r: 1.8,
      color: 'grey'
  }

  let uTvv_line = [
      {x: 0, y: 0, z: 0},
      {x: uTvv.x, y: uTvv.y, z: uTvv.z,
       tt: true}
  ]
  uTvv_line.color = 0
  uTvv_line.centroid_z = 1000;

  lines.push(uTvv_line);

  lib.create_dash_segments(u, uTvv).forEach(
      function(d) {
        d.centroid_z = -900;
        lines.push(d);
      }
  )

  scatter.forEach(function(d, i){
    let coord = lib.dot_basis(d, basis);
    d.coord = coord;
    let point = Object.assign({}, d);
    if (i == 0) {
      point.text = 'u = ';
    } else {
      point.text = 'v = ';
    }
    point.text += '['.concat(
        coord.x.toFixed(2),
        ', ',
        coord.y.toFixed(2),
        ', ',
        coord.z.toFixed(2),
        ']');
    points.push(point);
  })

  points.push(uTvv);

  lib.plot_lines(lines, tt, 'arrow');
  lib.plot_points(points, tt,
                  drag_point_fn=function(d, i){
                    if (i == 0) {
                      dragged_point(i);
                    } else {
                      dragged_point_only();
                    }
                  },
                  drag_start, drag_end);

  // Step 2: Plot the non-computed uTvv_line_text.
  let uTvv_line_text = [{text: 'u\u1d40v',
                         x: v.x * uTv/2, 
                         y: v.y * uTv/2,
                         z: v.z * uTv/2,
                         text_opacity: 1,
                         text_color: 0}];
  lib.plot_texts(uTvv_line_text, tt, 'uTvv_line_text');

  // Step 3: Plot the uT and v tables.
  let [lines_v, texts_v] = lib.text_matrix_to_list(
          [[{text: v.coord.x.toFixed(2), key: 'xv'}],
           [{text: v.coord.y.toFixed(2), key: 'yv'}],
           [{text: v.coord.z.toFixed(2), key: 'zv'}]],
          [last_col_coord, start_coord_y], size, w_unit, h_unit
          ),
      [lines_uT, texts_uT] = lib.text_matrix_to_list(
          [[{text: u.coord.x.toFixed(2), key: 'xu'},
            {text: u.coord.y.toFixed(2), key: 'yu'},
            {text: u.coord.z.toFixed(2), key: 'zu'}]],
          [start_coord_x, last_row_coord], size, w_unit, h_unit
          );

  let texts_to_show = [],
      lines_to_show = [];

  texts_to_show.push(...texts_uT);
  texts_to_show.push(...texts_v);
  texts_to_show.push(uT_cell, v_cell);

  lines_to_show.push(...lines_uT);
  lines_to_show.push(...lines_v);

  lib.plot_texts(texts_to_show, tt, 'texts_to_show');
  lib.plot_lines(lines_to_show, tt, 'lines_to_show');

  // Step 4: plot computed uTvv_line's text and uTv value 
  let uTv_font_size = 15;
  if (uTvv_opacity == 0) {
    uTv_font_size = 10;
  }
  let uTv_texts = [
      {text:'u\u1d40v = '.concat(uTv.toFixed(3)),
       x: v.x * uTv/2,
       y: v.y * uTv/2,
       z: v.z * uTv/2,
       text_color: 0, text_opacity: uTvv_opacity,
       key: 'uTv_texts'},
      {text: uTv.toFixed(3), text_color: 0, 
       x: last_col_coord,
       y: last_row_coord + differ,
       text_opacity: uTvv_opacity,
       font_size: uTv_font_size,
       key: 'uTv'}
  ];

  lib.plot_texts(uTv_texts, 0, name='uTv_texts');
  lib.sort();
}

function init(tt){
  axis = lib.init_float_axis(axis_len, unit);
  let u = {
      x: 0.8,
      y: 0.8, 
      z: -0.8,
      color: 4,
  };

  let v = {
      x: 1/Math.sqrt(14),
      y: -2/Math.sqrt(14), 
      z: 3/Math.sqrt(14),
      color: 3,
  };

  scatter = [u, v];

  uTvv_opacity = 0;

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
  
  uTvv_opacity = 0;
  plot(expectedScatter, 
       expectedAxis, 
       0);
}

function dragged_point(i){
  if (!drag_on_left) {
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

  uTvv_opacity = 0;
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


function compute(u, v){
  let uTv = lib.dot_product(u, v);

  // Step 3: Plot the uT and v tables.

  let [lines_v, texts_v] = lib.text_matrix_to_list(
          [[{text: v.coord.x.toFixed(2), key: 'xvv'}],
           [{text: v.coord.y.toFixed(2), key: 'yvv'}],
           [{text: v.coord.z.toFixed(2), key: 'zvv'}]],
          [last_col_coord, start_coord_y], size, w_unit, h_unit
          ),
      [lines_uT, texts_uT] = lib.text_matrix_to_list(
          [[{text: u.coord.x.toFixed(2), key: 'xuu'},
            {text: u.coord.y.toFixed(2), key: 'yuu'},
            {text: u.coord.z.toFixed(2), key: 'zuu'}]],
          [start_coord_x, last_row_coord], size, w_unit, h_unit
          );

  let animation_begin = [],
      lines_to_show = [];

  animation_begin.push(...texts_uT);
  animation_begin.push(...texts_v);
  animation_begin.push(uT_cell, v_cell);

  lines_to_show.push(...lines_uT);
  lines_to_show.push(...lines_v);

  lib.plot_texts(animation_begin, 0, 'animation');
  lib.plot_lines(lines_to_show, 0, 'lines_to_show');


  let animation_end = [
          {text: v.coord.x.toFixed(2), text_opacity: 0, tt: 900, key: 'xvv'},
          {text: v.coord.y.toFixed(2), text_opacity: 0, tt: 600, key: 'yvv'},
          {text: v.coord.z.toFixed(2), text_opacity: 0, tt: 300, key: 'zvv'},
          {text: u.coord.x.toFixed(2), text_opacity: 0, tt: 900, key: 'xuu'},
          {text: u.coord.y.toFixed(2), text_opacity: 0, tt: 600, key: 'yuu'},
          {text: u.coord.z.toFixed(2), text_opacity: 0, tt: 300, key: 'zuu'},
  ];
  
  for (i = 0; i < animation_end.length; i++) {
      animation_end[i].x = last_col_coord;
      animation_end[i].y = last_row_coord + differ;

  };
  lib.plot_texts(animation_end, 0, 'animation');

  // Step 4: plot computed uTvv_line's text and uTv value 
  let uTv_texts = [
      {text:'u\u1d40v = '.concat(uTv.toFixed(3)),
       x: v.x * uTv/2,
       y: v.y * uTv/2,
       z: v.z * uTv/2,
       text_color: 0, text_opacity: 1.0,
       key: 'uTv_texts'},
      {text: uTv.toFixed(3), text_color: 0, 
       x: last_col_coord,
       y: last_row_coord + differ,
       text_opacity: 1.0, 
       font_size: 15,
       key: 'uTv'}
  ];

  lib.plot_texts(uTv_texts, 1200, 'uTv_texts');
  
  uTvv_opacity = 1;
};

return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);},
  compute: function(){compute(scatter[0], scatter[1]);}
};


})();



