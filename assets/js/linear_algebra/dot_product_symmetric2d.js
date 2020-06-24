let dot_product_symmetric2d = (function(position) {

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
    position_state = 0;

let row_width = 0.35,
    col_width = 0.6,
    w_unit = 1.0, h_unit = 1.0;

    // dws_array = [0.5, 0.7, 0., 0.7],
    // dhs_array = [0.4, 0.4, 0., 0.4];

let start_coord_x=(340 - origin[0])/scale + 0.6 * w_unit,
    start_coord_y=(75 - origin[1])/scale + 0.2 * h_unit,
    last_col_coord = start_coord_x + 1.2 * w_unit,
    last_row_coord = start_coord_y + 0.7 * h_unit;

let v_name = {text: 'v =', x: last_col_coord,
              y: start_coord_y - 0.4 * h_unit, key: 'v'},
    u_name = {text: 'u =', x: last_col_coord,
              y: start_coord_y - 0.4 * h_unit, key: 'u'},
    vT_name = {text: 'v\u1d40 =', x: start_coord_x - 0.6 * w_unit,
               y: last_row_coord + 0.05, key: 'v' },
    uT_name = {text: 'u\u1d40 =', x: start_coord_x - 0.6 * w_unit,
               y: last_row_coord + 0.05, key: 'u' };
               

function text_matrix_to_list(coord_texts, coord,
                                        size, coord_keys, brack_key) {
    // print vector u: vec_texts = ['u =', 'v =', ...], coord_texts = [[u.x, u.y], [v.x, v.y],
                   //  keys = [[xu, yu,], [xv, yv] ...], 
                  // coord = [x, y] coord to start printing, size = font_size;

  let size_of_space = coord_texts[0].length,
      numb_of_vector =  coord_texts.length,
      matrix_w = 0.62 * size/14 * numb_of_vector * w_unit,
      matrix_h = 0.36 * size/14 * size_of_space  * h_unit,

      texts_list = [],
      lines_list = [],
      
      cols_list = [],
      rows_list = [];
  
  // text
  cols_list.push(coord[0]);
  for (i = 1; i < numb_of_vector; i++) {
    cols_list.push(cols_list[0] + 0.6 * size/14 * i * w_unit);
  }

  rows_list.push(coord[1] - matrix_h/2 + 0.225 * size/14 * h_unit);
  for (i = 1; i < size_of_space; i++) {
    rows_list.push(rows_list[0] + 0.36 * size/14 * i * h_unit);
  }

  for (i = 0; i < numb_of_vector; i++) {
    for (j = 0; j < size_of_space; j++) {
      texts_list.push({text: coord_texts[i][j], x: cols_list[i],
                       y: rows_list[j], font_size: size,
                       text_opacity: 1.0, key: coord_keys[i][j]});
    }
  }; 
  console.log(texts_list);
  
  lines_list = [
      [
        {x: coord[0], y: coord[1] - matrix_h/2, z: 0},
        {x: coord[0] + 0.1 * size/14 * w_unit, y: coord[1] - matrix_h/2,
         z: 0, color: 'grey', tt: true}],
      [
        {x: coord[0], y: coord[1] -matrix_h/2, z: 0},
        {x: coord[0], y: coord[1] + matrix_h/2,
         z: 0, color: 'grey', tt: true}],
      [
        {x: coord[0], y: coord[1] + matrix_h/2, z: 0},
        {x: coord[0] + 0.1 * size/14 * w_unit,
         y: coord[1] + matrix_h/2, z: 0, color: 'grey', tt: true}],
      [
        {x: coord[0] + matrix_w - 0.1 * size/14 * w_unit,
         y: coord[1] - matrix_h/2, z: 0},
        {x: coord[0] + matrix_w,
         y: coord[1] - matrix_h/2, z: 0, color: 'grey', tt: true}],
      [
        {x: coord[0] + matrix_w, y: coord[1] - matrix_h/2, z: 0},
        {x: coord[0] + matrix_w,
         y: coord[1] + matrix_h/2, z: 0, color: 'grey', tt: true}],
      [
        {x: coord[0] + matrix_w, y: coord[1] + matrix_h/2, z: 0},
        {x: coord[0] + matrix_w - 0.1 * size/14 * w_unit,
         y: coord[1] + matrix_h/2, z: 0, color: 'grey', tt: true}]
  ];

  for (i = 0; i < lines_list.length; i++) {
    lines_list[i].key = 'bracket'.concat(brack_key - i);
    lines_list[i].stroke_width = size/14;
  }
  
  return [lines_list, texts_list];
};


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
  };

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
  );

  lib.plot_lines(lines, tt, 'arrow');
  lib.plot_points(points, tt,
                  drag_point_fn=function(d, i){
                    if (i == 0) {
                      dragged_point(i);
                    } else {
                      dragged_point_only();
                    }
                  },
                  drag_staSameSitert_fn=drag_start,
                  drag_end_fn=drag_end
                  );

  let [lines_vector_u, texts_vector_u] = text_matrix_to_list(
          [[u.coord.x.toFixed(2), u.coord.y.toFixed(2)]],
          [last_col_coord, start_coord_y],
          14, [['xu', 'yu']], 5
          ),
      [lines_vector_v, texts_vector_v] = text_matrix_to_list(
          [[v.coord.x.toFixed(2), v.coord.y.toFixed(2)]],
          [last_col_coord, start_coord_y],
          14, [['xv', 'yv']], 15
          ),
      [lines_uT, texts_uT] = text_matrix_to_list(
          [[u.coord.x.toFixed(2)], [u.coord.y.toFixed(2)]],
          [start_coord_x, last_row_coord],
          14, [['xu'], ['yu']], 5
          ),
      [lines_vT, texts_vT] = text_matrix_to_list(
          [[v.coord.x.toFixed(2)],[v.coord.y.toFixed(2)]],
          [start_coord_x, last_row_coord],
          14, [['xv'], ['yv']], 15
          );

  
  let uTv_texts = [],
      uTv_lines = [],
      vTu_texts = [],
      vTu_lines = [];

  let zv_text = {text: '', x: last_col_coord,
                 y: start_coord_y + 0.525 * h_unit, text_opacity: 0, key: 'zv'
                },
      zu_text = {text: '', x: last_col_coord,
                  y: start_coord_y + 0.525 * h_unit, text_opacity: 0, key: 'zu'
                },
      zvT_text = {text: '', x: start_coord_x + 0.6 * w_unit,
                  y: last_row_coord, text_opacity: 0, key: 'zv'
                },
      zuT_text = {text: '', x: start_coord_x + 0.6 * w_unit,
                  y: last_row_coord, text_opacity: 0, key: 'zu'
                };

  uTv_texts.push(...texts_uT);
  uTv_texts.push(...texts_vector_v);
  uTv_texts.push(uT_name, v_name, zuT_text, zv_text);

  uTv_lines.push(...lines_uT);
  uTv_lines.push(...lines_vector_v);

  vTu_texts.push(...texts_vT);
  vTu_texts.push(...texts_vector_u);
  vTu_texts.push(vT_name, u_name, zvT_text, zu_text);

  vTu_lines.push(...lines_vT);
  vTu_lines.push(...lines_vector_u);

  if (position_state == 0) {
    lib.plot_texts(uTv_texts, tt, 'transition');
    lib.plot_lines(uTv_lines, tt, 'bracket');
  } else {
    lib.plot_texts(vTu_texts, tt, 'transition');
    lib.plot_lines(vTu_lines, tt, 'bracket');
  }

  let dot_product_texts_at_bot = [
      {text: uTv.toFixed(3),
       x: last_col_coord,
       y: last_row_coord + 0.05 * h_unit,
       text_color: 0, text_opacity: 1,
       font_size: 14, tt: 0, key: 'text_at_bot'}
  ];

  lib.plot_texts(dot_product_texts_at_bot, tt, 'text_at_bot');


  let dot_product_texts = [
      {text:'u\u1d40v = '.concat(uTv.toFixed(3)),
       x: (v.x * uTv/2).toFixed(2),
       y: (v.y * uTv/2).toFixed(2),
       text_color: 0, text_opacity: 1,
       font_size: 15, tt: 0, key: 'texts_in_blue_line'}
  ];

  lib.plot_texts(dot_product_texts, tt, 'texts_in_blue_line');
  // let [lines_k, texts_k] = text_matrix_to_list([[1],[2]], [1, 1], 14, [['x'],['y']], 3);
  // lib.plot_texts(texts_k, tt, 'test');
  // lib.plot_lines(lines_k, tt, 'test');
  lib.sort();
}


// why isn't it a function??

function init(tt){
  axis = lib.init_float_axis(axis_len=axis_len, unit=unit);

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
      color: 2,
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
  lib.drag_start2d();
  if (lib.get_mouse_position().x < 300) {
    drag_on_left = true;
  } else {
    drag_on_left = false;
  }
}


function dragged(){
  if (!drag_on_left){
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
  if (!drag_on_left){
    return;
  }

  angle_z = lib.get_drag_angle_2d();

  expectedScatter = lib.rotate_points(scatter, 0, 0, angle_z);
  plot(expectedScatter, 
       expectedAxis, 
         0);
}


function dragged_point(i){
  if (!drag_on_left){
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

function get_position() {
  return position_state;
}


function set_position(pos){
  position_state = pos;
}


function swap(u, v){
  let uTv = lib.dot_product(u, v);
      

  let [lines_vector_u, texts_vector_u] = text_matrix_to_list(
          [[u.coord.x.toFixed(2), u.coord.y.toFixed(2)]],
          [last_col_coord, start_coord_y],
          14, [['xu', 'yu']], 5
          ),
      [lines_vector_v, texts_vector_v] = text_matrix_to_list(
          [[v.coord.x.toFixed(2), v.coord.y.toFixed(2)]],
          [last_col_coord, start_coord_y],
          14, [['xv', 'yv']], 15
          ),
      [lines_uT, texts_uT] = text_matrix_to_list(
          [[u.coord.x.toFixed(2)], [u.coord.y.toFixed(2)]],
          [start_coord_x, last_row_coord],
          14, [['xu'], ['yu']], 5
          ),
      [lines_vT, texts_vT] = text_matrix_to_list(
          [[v.coord.x.toFixed(2)], [v.coord.y.toFixed(2)]],
          [start_coord_x, last_row_coord],
          14, [['xv'], ['yv']], 15
          ),
      
      uTv_texts = [],
      uTv_lines = [],
      vTu_texts = [],
      vTu_lines = [];

  let zv_text = {text: v.coord.z.toFixed(2), x: last_col_coord,
                 y: start_coord_y + 0.525 * h_unit, text_opacity: 0, key: 'zv'
                },
      zu_text =  {text: u.coord.z.toFixed(2), x: last_col_coord,
                  y: start_coord_y + 0.525 * h_unit, text_opacity: 0, key: 'zu'
                },
      zvT_text = {text: v.coord.z.toFixed(2), x: start_coord_x + 0.6 * w_unit,
                  y: last_row_coord, text_opacity: 0, key: 'zv'
                },
      zuT_text = {text: u.coord.z.toFixed(2), x: start_coord_x + 0.6 * w_unit,
                  y: last_row_coord, text_opacity: 0, key: 'zu'
                };

  uTv_texts.push(...texts_uT);
  uTv_texts.push(...texts_vector_v);
  uTv_texts.push(uT_name, v_name, zuT_text, zv_text);
  uTv_lines.push(...lines_uT);
  uTv_lines.push(...lines_vector_v);
  
  vTu_texts.push(...texts_vT);
  vTu_texts.push(...texts_vector_u);
  vTu_texts.push(vT_name, u_name, zvT_text, zu_text);
  vTu_lines.push(...lines_vT);
  vTu_lines.push(...lines_vector_u);
  

  if (position_state == 0) {
    lib.plot_texts(vTu_texts, 1000, 'transition');
    lib.plot_lines(vTu_lines, 1000, 'bracket');
    
    position_state = 1;
  } else {
    lib.plot_texts(uTv_texts, 1000, 'transition');
    lib.plot_lines(uTv_lines, 1000, 'bracket');

    position_state = 0;
  }
}


return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);},
  get_position: function(){return get_position();},
  set_position: function(pos){set_position(pos);},
  swap: function(){swap(scatter[0], scatter[1]);}
}

}) ();