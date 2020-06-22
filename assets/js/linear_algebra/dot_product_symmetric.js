let dot_product_symmetric = (function(position) {

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
    position_state = 0;

let w_unit = 1.0, h_unit = 1.0,
    dws_array = [0.4, 0.7, 0.7, 0.7],
    dhs_array = [0.4, 0.4, 0.4, 0.4];

let start_coord_x=(375 - origin[0])/scale, 
    start_coord_y=(75 - origin[1])/scale;
    

function texts_to_show(u, v){
  let uTv = lib.dot_product(u, v);
  return [
    [
        [
            {text: ''}, {text: ''}, {text: ''}, {text: ''}, 
            {text: 'v', text_opacity: 0.7, key: 'v'},
        ], [
            {text: ''}, {text: ''}, {text: ''}, {text: ''}, 
            {text: v.coord.x.toFixed(2), text_opacity: 0.7, key: 'xv'},
        ], [
            {text: ''}, {text: ''}, {text: ''}, {text: ''}, 
            {text: v.coord.y.toFixed(2), text_opacity: 0.7, key: 'yv'},

        ], [
            {text: ''}, {text: ''}, {text: ''}, {text: ''}, 
            {text: v.coord.z.toFixed(2), text_opacity: 0.7, key: 'zv'}
        ], [
            {text: 'u\u1d40', text_opacity: 0.7, key: 'u'},
            {text: u.coord.x.toFixed(2), text_opacity: 0.7, key: 'xu'},
            {text: u.coord.y.toFixed(2), text_opacity: 0.7, key: 'yu'},
            {text: u.coord.z.toFixed(2), text_opacity: 0.7, key: 'zu'},
            {text: uTv.toFixed(3), font_size: 15, color: 0,
             text_opacity: 1, key:'uTv'}
        ]
    ], [
        [
            {text: ''}, {text: ''}, {text: ''}, {text: ''}, 
            {text: 'u', text_opacity: 0.7, key: 'u'}
        ], [
            {text: ''}, {text: ''}, {text: ''}, {text: ''}, 
            {text: u.coord.x.toFixed(2), text_opacity: 0.7, key: 'xu'}
        ], [
            {text: ''}, {text: ''}, {text: ''}, {text: ''}, 
            {text: u.coord.y.toFixed(2), text_opacity: 0.7, key: 'yu'}
        ], [
            {text: ''}, {text: ''}, {text: ''}, {text: ''}, 
            {text: u.coord.z.toFixed(2), text_opacity: 0.7, key: 'zu'},
        ], [
            {text: 'v\u1d40', text_opacity: 0.7, key: 'v'},
            {text: v.coord.x.toFixed(2), text_opacity: 0.7, key: 'xv'},
            {text: v.coord.y.toFixed(2), text_opacity: 0.7, key: 'yv'},
            {text: v.coord.z.toFixed(2), text_opacity: 0.7, key: 'zv'},
            {text: uTv.toFixed(3), font_size: 15, color: 0,
             text_opacity: 1, key:'uTv'}
        ]
        ]
  ]
}


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
                  drag_start_fn=drag_start,
                  drag_end_fn=drag_end);

  let texts_for_table = texts_to_show(u, v),
      uTv_text_table = texts_for_table[0],
      vTu_text_table = texts_for_table[1];

  if (position_state == 0) {
    lib.plot_texts(lib.text_table_to_list(
      uTv_text_table,
      start_coord_x=start_coord_x, start_coord_y=start_coord_y,
      w_unit=w_unit, h_unit=h_unit,
      dws_array=dws_array, dhs_array=dhs_array),
    tt=1000, name='transition');

  } else {
    lib.plot_texts(lib.text_table_to_list(
      vTu_text_table,
      start_coord_x=start_coord_x, start_coord_y=start_coord_y,
      w_unit=w_unit, h_unit=h_unit,
      dws_array=dws_array, dhs_array=dhs_array),
    tt=1000, name='transition');
  };

  let uTv_texts = [     
    {text:'u\u1d40v = '.concat(uTv.toFixed(3)),
     x: (v.x * uTv/2).toFixed(2),
     y: (v.y * uTv/2).toFixed(2),
     color: 0, text_opacity: 1,
     font_size: 15, tt: 0, key: 'uTv_texts'}
  ];
  
  lib.plot_texts(uTv_texts, tt=0, name='uTv_texts');

  lib.sort();
}

function init(tt){
  axis = lib.init_float_axis(axis_len=axis_len, unit=unit);

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


function dragged_point(i){
  if (!drag_on_left) {
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


function get_position() {
  return position_state;
}


function set_position(pos){
  position_state = pos;
}


function swap(u, v){
  let uTv = lib.dot_product(u, v),
      texts_for_table = texts_to_show(u, v),
      uTv_text_table = texts_for_table[0],
      vTu_text_table = texts_for_table[1];

  let uTv_texts = [
      {text:'u\u1d40v = '.concat(uTv.toFixed(3)),
       x: (v.x * uTv/2).toFixed(2),
       y: (v.y * uTv/2).toFixed(2),
       color: 0, text_opacity: 1,
       font_size: 15, tt: 0, key: 'uTv_texts'}
  ];

  lib.plot_texts(uTv_texts, tt=0, name='uTv_texts');

  if (position_state == 0) {
    lib.plot_texts(lib.text_table_to_list(
      vTu_text_table,
      start_coord_x=start_coord_x, start_coord_y=start_coord_y,
      w_unit=w_unit, h_unit=h_unit,
      dws_array=dws_array, dhs_array=dhs_array),
      tt=1000, name='transition');
    position_state = 1;

  } else {
    lib.plot_texts(lib.text_table_to_list(
      uTv_text_table,
      start_coord_x=start_coord_x, start_coord_y=start_coord_y,
      w_unit=w_unit, h_unit=h_unit,
      dws_array=dws_array, dhs_array=dhs_array),
    tt=1000, name='transition');
    position_state = 0;
  };

};

return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);},
  get_position: function(){return get_position();},
  set_position: function(pos){set_position(pos);},
  swap: function(){swap(scatter[0], scatter[1]);},
};


})();



