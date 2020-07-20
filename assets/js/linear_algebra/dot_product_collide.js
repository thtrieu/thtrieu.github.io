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
    vTuv_opacity = 0;

let w_unit = 0.22,
    h_unit = 0.13,
    size = 14,
    differ = 0.09,
    text_above_matrix = 0.7;

let start_coord_x=(380 - origin[0])/scale, 
    start_coord_y=(75 - origin[1])/scale,
    last_col_coord = start_coord_x + 1.79,
    last_row_coord = start_coord_y + 0.67;

let u_cell = {text: 'u =', x: last_col_coord,
              y: start_coord_y - text_above_matrix, key: 'u'},
    vT_cell = {text: 'v\u1d40 =', x: start_coord_x - 0.6,
               y: last_row_coord + differ, key: 'v' };


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

  let vTu = lib.dot_product(u, v);
  
  let vTuv = {
      x: v.x * vTu,
      y: v.y * vTu,
      z: v.z * vTu,
      r: 1.8,
      color: 'grey'
  }

  let vTuv_line = [
      {x: 0, y: 0, z: 0},
      {x: vTuv.x, y: vTuv.y, z: vTuv.z,
       tt: true}
  ]
  vTuv_line.color = 0
  vTuv_line.centroid_z = 1000;

  lines.push(vTuv_line);

  lib.create_dash_segments(u, vTuv).forEach(
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

  points.push(vTuv);

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

  // Step 2: Plot the non-computed vTuv_line_text.
  let vTuv_line_text = [{text: 'v\u1d40u',
                         x: v.x * vTu/2, 
                         y: v.y * vTu/2,
                         z: v.z * vTu/2,
                         text_opacity: 1,
                         text_color: 0}];
  lib.plot_texts(vTuv_line_text, tt, 'vTuv_line_text');

  // Step 3: Plot the uT and v tables.
  let [lines_u, texts_u] = lib.text_matrix_to_list(
          [[{text: u.coord.x.toFixed(2), key: 'xu'}],
           [{text: u.coord.y.toFixed(2), key: 'yu'}],
           [{text: u.coord.z.toFixed(2), key: 'zu'}]],
          [last_col_coord, start_coord_y], 14
          ),
      [lines_vT, texts_vT] = lib.text_matrix_to_list(
          [[{text: v.coord.x.toFixed(2), key: 'xv'},
            {text: v.coord.y.toFixed(2), key: 'yv'},
            {text: v.coord.z.toFixed(2), key: 'zv'}]],
          [start_coord_x, last_row_coord], 14
          );

  let texts_to_show = [],
      lines_to_show = [];

  texts_to_show.push(...texts_vT);
  texts_to_show.push(...texts_u);
  texts_to_show.push(vT_cell, u_cell);

  lines_to_show.push(...lines_vT);
  lines_to_show.push(...lines_u);

  lib.plot_texts(texts_to_show, tt, 'texts_to_show');
  lib.plot_lines(lines_to_show, tt, 'lines_to_show');

  // Step 4: plot computed vTuv_line's text and vTu value 
  let vTu_font_size = 15;
  if (vTuv_opacity == 0) {
    vTu_font_size = 10;
  }
  let vTu_texts = [
      {text:'v\u1d40u = '.concat(vTu.toFixed(3)),
       x: v.x * vTu/2,
       y: v.y * vTu/2,
       z: v.z * vTu/2,
       text_color: 0, text_opacity: vTuv_opacity,
       key: 'vTu_texts'},
      {text: vTu.toFixed(3), text_color: 0, 
       x: last_col_coord,
       y: last_row_coord + differ,
       text_opacity: vTuv_opacity,
       font_size: vTu_font_size,
       key: 'vTu'}
  ];

  lib.plot_texts(vTu_texts, 0, name='vTu_texts');
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

  vTuv_opacity = 0;

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
  
  vTuv_opacity = 0;
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

  vTuv_opacity = 0;
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
  let vTu = lib.dot_product(u, v);

  // Step 3: Plot the uT and v tables.
  let [lines_u, texts_u] = lib.text_matrix_to_list(
          [[{text: u.coord.x.toFixed(2), key: 'xuu'}],
           [{text: u.coord.y.toFixed(2), key: 'yuu'}],
           [{text: u.coord.z.toFixed(2), key: 'zuu'}]],
          [last_col_coord, start_coord_y], 14
          ),
      [lines_vT, texts_vT] = lib.text_matrix_to_list(
          [[{text: v.coord.x.toFixed(2), key: 'xvv'},
            {text: v.coord.y.toFixed(2), key: 'yvv'},
            {text: v.coord.z.toFixed(2), key: 'zvv'}]],
          [start_coord_x, last_row_coord], 14
          );

  let animation_begin = [],
      lines_to_show = [];

  animation_begin.push(...texts_vT);
  animation_begin.push(...texts_u);
  animation_begin.push(vT_cell, u_cell);

  lines_to_show.push(...lines_vT);
  lines_to_show.push(...lines_u);

  lib.plot_texts(animation_begin, 0, 'animation');
  lib.plot_lines(lines_to_show, 0, 'lines_to_show');


  let animation_end = [
          {text: v.coord.x.toFixed(2), text_opacity: 0.5, tt: 900, key: 'xuu'},
          {text: v.coord.y.toFixed(2), text_opacity: 0.5, tt: 600, key: 'yuu'},
          {text: v.coord.z.toFixed(2), text_opacity: 0.5, tt: 300, key: 'zuu'},
          {text: u.coord.x.toFixed(2), text_opacity: 0.5, tt: 900, key: 'xvv'},
          {text: u.coord.y.toFixed(2), text_opacity: 0.5, tt: 600, key: 'yvv'},
          {text: u.coord.z.toFixed(2), text_opacity: 0.5, tt: 300, key: 'zvv'},
  ];
  
  for (i = 0; i < animation_end.length; i++) {
      animation_end[i].x = last_col_coord;
      animation_end[i].y = last_row_coord + differ;

  };
  lib._plot_texts({data: animation_end, ease: d3.easeLinear, name:'animation'});

  animation_end.forEach(function(t){
    t.delay = t.tt;
    t.tt = 0;
    t.text_opacity = 0;
  })
  lib._plot_texts({data: animation_end, name: 'animation'});

  // Step 4: plot computed vTuv_line's text and vTu value 
  let vTu_texts = [
      {text:'v\u1d40u = '.concat(vTu.toFixed(3)),
       x: v.x * vTu/2,
       y: v.y * vTu/2,
       z: v.z * vTu/2,
       text_color: 0, text_opacity: 1.0,
       key: 'vTu_texts'},
      {text: vTu.toFixed(3), text_color: 0, 
       x: last_col_coord,
       y: last_row_coord + differ,
       text_opacity: 1.0, 
       font_size: 15,
       key: 'vTu'}
  ];

  lib.plot_texts(vTu_texts, 1200, 'vTu_texts');
  
  vTuv_opacity = 1;
};

return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);},
  compute: function(){compute(scatter[0], scatter[1]);}
};


})();



