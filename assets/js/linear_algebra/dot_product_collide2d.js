let dot_product_collide2d = (function() {

let origin = [150, 140], 
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
    lib = null,
    uTvv_opacity = 0;

let differ = 0.09,
    text_above_matrix = 0.4,
    w_unit = 0.22,
    h_unit = 0.13,
    size = 14,
    col_unit = 0.6,
    row_unit = 0.3;

let start_coord_x=(380 - origin[0])/scale + 0.57,
    start_coord_y=(75 - origin[1])/scale + 0.155,
    last_col_coord = start_coord_x + 1.22,
    last_row_coord = start_coord_y + 0.515;

let v_cell = {text: 'v =', x: last_col_coord,
              y: start_coord_y - text_above_matrix, key: 'v'},
    u_cell = {text: 'u =', x: last_col_coord,
              y: start_coord_y - text_above_matrix, key: 'u'},
    vT_cell = {text: 'v\u1d40 =', x: start_coord_x - col_unit,
               y: last_row_coord + differ, key: 'v' },
    uT_cell = {text: 'u\u1d40 =', x: start_coord_x - col_unit,
               y: last_row_coord + differ, key: 'u' };


function select_svg(svg_id){
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
  // Plot the figure.
  let u = scatter[0],
      v = scatter[1];

  basis = {
      ex: axis[1/unit - 1 + axis_len/unit * 0][1], 
      ey: axis[1/unit - 1 + axis_len/unit * 1][1],
      ez: axis[1/unit - 1 + axis_len/unit * 2][1]
  };

  lib.plot_lines(axis, tt);

  let lines = [];

  scatter.forEach(function(d, i){
    lines.push(...lib.create_segments(d));
    if (i == 0) {
      lines.centroid_z = 900;
    }
  });

  let points = [];
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
        ']');
    points.push(point);
  })

  let uTv = lib.dot_product(u, v);
  
  let uTvv = {
      x: v.x * uTv,
      y: v.y * uTv,
      z: v.z * uTv,
      r: 1.8,
      color: 'grey'
  }

  points.push(uTvv);
  uTvv.centroid_z = 1000;

  let uTvv_line = [
      {x: 0, y: 0, z: 0},
      {x: uTvv.x, y: uTvv.y, z: 0,
       tt:true}
  ];
  uTvv_line.color = 0;
  uTvv_line.centroid_z = 1000;

  lines.push(uTvv_line);

  lib.create_dash_segments(u, uTvv).forEach(
      function(d) {
        d.centroid_z = -900;
        lines.push(d);
      }
  )

  lib.plot_lines(lines, tt, 'arrow');
  lib.plot_points(points, tt,
                  drag_point_fn=function(d, i){
                    if (i == 0) {
                      dragged_point(i);
                    } else {
                      dragged_point_only();
                    }
                  },
                  drag_start_fn=drag_start,
                  drag_end_fn=drag_end);

  // Plot uTvv_line's non computed text "uTv":
  let uTvv_line_text = [{text: 'u\u1d40v',
                         x: v.x * uTv/2, 
                         y: v.y * uTv/2,
                         tt: tt,
                         text_color: 0}];
  lib.plot_texts(uTvv_line_text, tt, 'uTvv_line_text');

  // First we plot uT and v
  let [lines_v, texts_v] = lib.text_matrix_to_list(
          [[{text: v.coord.x.toFixed(2), key: 'xv'}],
           [{text: v.coord.y.toFixed(2), key: 'yv'}]],
          [last_col_coord, start_coord_y], size, w_unit, h_unit
          ),
      [lines_uT, texts_uT] = lib.text_matrix_to_list(
          [[{text: u.coord.x.toFixed(2), key: 'xu'},
            {text: u.coord.y.toFixed(2), key: 'yu'}]],
          [start_coord_x, last_row_coord], size, w_unit, h_unit
          );

  let texts_to_show = [],
      lines_to_show = [];

  let zv_text = {text: '', x: last_col_coord,
                 y: start_coord_y + row_unit,
                 text_opacity: 0, key: 'zv'
                },
      zuT_text = {text: '', x: start_coord_x + col_unit,
                  y: last_row_coord + differ,
                  text_opacity: 0, key: 'zu'
                };

  texts_to_show.push(...texts_uT);
  texts_to_show.push(...texts_v);
  texts_to_show.push(uT_cell, v_cell, zuT_text, zv_text);

  lines_to_show.push(...lines_uT);
  lines_to_show.push(...lines_v);

  lib.plot_texts(texts_to_show, tt, 'texts_to_show');
  lib.plot_lines(lines_to_show, tt, 'lines_to_show');

  // Finally we plot uTv and uTvv_line's computed text "uTv = ..."
  // Both share the same opacity uTvv_opacity. 
  let uTv_font_size = 15;
  if (uTvv_opacity == 0) {
    uTv_font_size = 10;
  }
  let uTv_texts = [
      {text:'u\u1d40v = '.concat(uTv.toFixed(3)),
       x: v.x * uTv/2,
       y: v.y * uTv/2,
       text_color: 0, text_opacity: uTvv_opacity,
       key: 'uTv_texts'},
      {text: uTv.toFixed(3), text_color: 0,
       x: last_col_coord,
       y: last_row_coord + differ,
       text_opacity: uTvv_opacity, font_size: uTv_font_size, 
       key: 'uTv'}
  ];
  lib.plot_texts(uTv_texts, 0, 'uTv_texts');

  lib.sort();
}

function init(tt){
  axis = lib.init_float_axis(axis_len, unit);

  let u = {
      x: -1.0,
      y: -4.0/3, 
      z: 0.,
      color: 4,
  };

  let v = {
      x: 1/Math.sqrt(3),
      y: -Math.sqrt(2/3), 
      z: 0.,
      color: 3,
  };

  scatter = [u, v];
  uTvv_opacity = 0;

  expectedScatter = lib.rotate_points(scatter, startAngleX,
                                      startAngleY, startAngleZ);
  expectedAxis = lib.rotate_lines(axis, startAngleX,
                                  startAngleY, startAngleZ);
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
};


function dragged_point_only(){
  if (!drag_on_left) {
    return;
  }
  angle_z = lib.get_drag_angle_2d();

  expectedScatter = lib.rotate_points(scatter, 0, 0, angle_z);

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
        r = lib.update_point_position_from_mouse(d);
        r.x = Math.min(r.x, (300-origin[0])/scale);
        expectedScatter.push(r);
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

  // We make a copy of uT and v table
  // Then we plot them at the same place as the original text
  // with opacity 1.0
  
  let [lines_v, texts_v] = lib.text_matrix_to_list(
          [[{text: v.coord.x.toFixed(2), key: 'xvv'}],
           [{text: v.coord.y.toFixed(2), key: 'yvv'}]],
          [last_col_coord, start_coord_y], size, w_unit, h_unit
          ),
      [lines_uT, texts_uT] = lib.text_matrix_to_list(
          [[{text: u.coord.x.toFixed(2), key: 'xuu'},
            {text: u.coord.y.toFixed(2), key: 'yuu'}]],
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
  lib.plot_lines(lines_to_show, 0, 'lines_to_show')

  // Immediately after that, plot them at the bottom right corner
  // with the same name & key, now with opacity 0.0
  let animation_end = [
          {text: v.coord.x.toFixed(2), text_opacity: 0.5, tt: 600, key: 'xvv'},
          {text: v.coord.y.toFixed(2), text_opacity: 0.5, tt: 300, key: 'yvv'},
          {text: u.coord.x.toFixed(2), text_opacity: 0.5, tt: 600, key: 'xuu'},
          {text: u.coord.y.toFixed(2), text_opacity: 0.5, tt: 300, key: 'yuu'},
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

  // Finally plot the uTvv_line's computed text & uTv value
  // both share the same opacity 1.0
  let uTv_texts = [{text:'u\u1d40v = '.concat(uTv.toFixed(3)), 
                    x: v.x * uTv/2, 
                    y: v.y * uTv/2,
                    text_opacity: 1, text_color: 0,
                    key: 'uTv_texts'},
                   {text: uTv.toFixed(3), text_color: 0, 
                    x: last_col_coord, y: last_row_coord + differ,
                    text_opacity: 1, font_size: 15, 
                    key: 'uTv'}];

  lib.plot_texts(uTv_texts, 600, 'uTv_texts');

  // Set the global variable
  uTvv_opacity = 1.0;
};


return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);},
  compute: function(){compute(scatter[0], scatter[1]);}
};


})();
