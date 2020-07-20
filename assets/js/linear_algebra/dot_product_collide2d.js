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
    vTuv_opacity = 0;

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

  let vTu = lib.dot_product(u, v);
  
  let vTuv = {
      x: v.x * vTu,
      y: v.y * vTu,
      z: v.z * vTu,
      r: 1.8,
      color: 'grey'
  }

  points.push(vTuv);
  vTuv.centroid_z = 1000;

  let vTuv_line = [
      {x: 0, y: 0, z: 0},
      {x: vTuv.x, y: vTuv.y, z: 0,
       tt:true}
  ];
  vTuv_line.color = 0;
  vTuv_line.centroid_z = 1000;

  lines.push(vTuv_line);

  lib.create_dash_segments(u, vTuv).forEach(
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

  // Plot vTuv_line's non computed text "vTu":
  let vTuv_line_text = [{text: 'v\u1d40u',
                         x: v.x * vTu/2, 
                         y: v.y * vTu/2,
                         tt: tt,
                         text_color: 0}];
  lib.plot_texts(vTuv_line_text, tt, 'vTuv_line_text');

  // First we plot uT and v
  let [lines_u, texts_u] = lib.text_matrix_to_list(
          [[{text: u.coord.x.toFixed(2), key: 'xu'}],
           [{text: u.coord.y.toFixed(2), key: 'yu'}]],
          [last_col_coord, start_coord_y], 14
          ),
      [lines_vT, texts_vT] = lib.text_matrix_to_list(
          [[{text: v.coord.x.toFixed(2), key: 'xv'},
            {text: v.coord.y.toFixed(2), key: 'yv'}]],
          [start_coord_x, last_row_coord], 14
          );

  let texts_to_show = [],
      lines_to_show = [];

  let zu_text = {text: '', x: last_col_coord,
                 y: start_coord_y + row_unit,
                 text_opacity: 0, key: 'zu'
                },
      zvT_text = {text: '', x: start_coord_x + col_unit,
                  y: last_row_coord + differ,
                  text_opacity: 0, key: 'zv'
                };

  texts_to_show.push(...texts_u);
  texts_to_show.push(...texts_vT);
  texts_to_show.push(vT_cell, u_cell, zvT_text, zu_text);

  lines_to_show.push(...lines_vT);
  lines_to_show.push(...lines_u);

  lib.plot_texts(texts_to_show, tt, 'texts_to_show');
  lib.plot_lines(lines_to_show, tt, 'lines_to_show');

  // Finally we plot vTu and vTuv_line's computed text "vTu = ..."
  // Both share the same opacity vTuv_opacity. 
  let vTu_font_size = 15;
  if (vTuv_opacity == 0) {
    vTu_font_size = 10;
  }
  let vTu_texts = [
      {text:'v\u1d40u = '.concat(vTu.toFixed(3)),
       x: v.x * vTu/2,
       y: v.y * vTu/2,
       text_color: 0, text_opacity: vTuv_opacity,
       key: 'vTu_texts'},
      {text: vTu.toFixed(3), text_color: 0,
       x: last_col_coord,
       y: last_row_coord + differ,
       text_opacity: vTuv_opacity, font_size: vTu_font_size, 
       key: 'vTu'}
  ];
  lib.plot_texts(vTu_texts, 0, 'vTu_texts');

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
  vTuv_opacity = 0;

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
        r = lib.update_point_position_from_mouse(d);
        r.x = Math.min(r.x, (300-origin[0])/scale);
        expectedScatter.push(r);
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

  // We make a copy of uT and v table
  // Then we plot them at the same place as the original text
  // with opacity 1.0
  
  let [lines_u, texts_u] = lib.text_matrix_to_list(
          [[{text: u.coord.x.toFixed(2), key: 'xuu'}],
           [{text: u.coord.y.toFixed(2), key: 'yuu'}]],
          [last_col_coord, start_coord_y], 14
          ),
      [lines_vT, texts_vT] = lib.text_matrix_to_list(
          [[{text: v.coord.x.toFixed(2), key: 'xvv'},
            {text: v.coord.y.toFixed(2), key: 'yvv'}]],
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

  // Finally plot the vTuv_line's computed text & vTu value
  // both share the same opacity 1.0
  let vTu_texts = [{text:'v\u1d40u = '.concat(vTu.toFixed(3)), 
                    x: v.x * vTu/2, 
                    y: v.y * vTu/2,
                    text_opacity: 1, text_color: 0,
                    key: 'vTu_texts'},
                   {text: vTu.toFixed(3), text_color: 0, 
                    x: last_col_coord, y: last_row_coord + differ,
                    text_opacity: 1, font_size: 15, 
                    key: 'vTu'}];

  lib.plot_texts(vTu_texts, 900, 'vTu_texts');

  // Set the global variable
  vTuv_opacity = 1.0;
};


return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);},
  compute: function(){compute(scatter[0], scatter[1]);}
};


})();
