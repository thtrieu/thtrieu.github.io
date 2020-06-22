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

let w_unit = 1.0, h_unit = 1.0,
    dws_array = [0.4, 0.7, 0.7, 0.7],
    dhs_array = [0.4, 0.4, 0.4, 0.4];

let start_coord_x=(375 - origin[0])/scale, 
    start_coord_y=(75 - origin[1])/scale;

let bot_right_x = start_coord_x + dws_array.reduce(
    function(total, d) {return total + d * w_unit;}, 0),
    bot_right_y = start_coord_y + dhs_array.reduce(
    function(total, d) {return total + d * h_unit;}, 0);


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
                  drag_start_fn=drag_start,
                  drag_end_fn=drag_end);

  // Step 2: Plot the non-computed uTvv_line_text.
  let uTvv_line_text = [{text: 'u\u1d40v',
                         x: v.x * uTv/2, 
                         y: v.y * uTv/2,
                         z: v.z * uTv/2,
                         text_opacity: 1,
                         color: 0}];
  lib.plot_texts(uTvv_line_text, tt=tt, name='uTvv_line_text');

  // Step 3: Plot the uT and v tables.
  let texts_to_show = [
      [
          {text: ''}, {text: ''}, {text: ''}, 
          {text: ''}, {text: 'v', text_opacity: 0.7, tt: tt, key: 'v'},
      ], [
          {text: ''}, {text: ''}, {text: ''}, {text: ''},
          {text: v.coord.x.toFixed(2), text_opacity: 0.7, tt: tt, key: 'xv'},
      ], [
          {text: ''}, {text: ''}, {text: ''}, {text: ''},
          {text: v.coord.y.toFixed(2), text_opacity: 0.7, tt: tt, key: 'yv'},
      ], [
          {text: ''}, {text: ''}, {text: ''}, {text: ''},
          {text: v.coord.z.toFixed(2), text_opacity: 0.7, tt: tt, key: 'zv'},
      ], [
          {text: 'u\u1d40', text_opacity: 0.7, tt: tt, key: 'u'},
          {text: u.coord.x.toFixed(2), text_opacity: 0.7, tt: tt, key: 'xu'},
          {text: u.coord.y.toFixed(2), text_opacity: 0.7, tt: tt, key: 'yu'},
          {text: u.coord.z.toFixed(2), text_opacity: 0.7, tt: tt, key: 'zu'},
          {text: ''}
      ]
  ];
  lib.plot_texts(lib.text_table_to_list(
      texts_to_show,
      start_coord_x=start_coord_x, start_coord_y=start_coord_y,
      w_unit=w_unit, h_unit=h_unit,
      dws_array=dws_array,
      dhs_array=dhs_array), tt=0, name='transition'
  );

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
       color: 0, text_opacity: uTvv_opacity,
       key: 'uTv_texts'},
      {text: uTv.toFixed(3), color: 0, 
       x: bot_right_x, y: bot_right_y,
       text_opacity: uTvv_opacity,
       font_size: uTv_font_size,
       key: 'uTv'}
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
  [angle_x, angle_y] = lib.get_drag_angles();

  expectedScatter = [];
  scatter.forEach(function(d, j){
      if (j == i) {
        expectedScatter.push(lib.rotate_point(d, angle_x, angle_y));
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
  let animation_begin = [
      [
          {text: ''}, {text: ''}, {text: ''}, 
          {text: ''}, {text: 'v', text_opacity: 0.7, key: 'vv'},
      ], [
          {text: ''}, {text: ''}, {text: ''}, {text: ''},
          {text: v.coord.x.toFixed(2), text_opacity: 0.7, key: 'xvv'},
      ], [
          {text: ''}, {text: ''}, {text: ''}, {text: ''},
          {text: v.coord.y.toFixed(2), text_opacity: 0.7, key: 'yvv'},
      ], [
          {text: ''}, {text: ''}, {text: ''}, {text: ''},
          {text: v.coord.z.toFixed(2), text_opacity: 0.7, key: 'zvv'},
      ], [
          {text: 'u\u1d40', text_opacity: 0.7, key: 'uu'},
          {text: u.coord.x.toFixed(2), text_opacity: 0.7, key: 'xuu'},
          {text: u.coord.y.toFixed(2), text_opacity: 0.7, key: 'yuu'},
          {text: u.coord.z.toFixed(2), text_opacity: 0.7, key: 'zuu'},
          {text: ''}
      ]
  ];
  lib.plot_texts(lib.text_table_to_list(
      animation_begin,
      start_coord_x=start_coord_x, 
      start_coord_y=start_coord_y,
      w_unit=w_unit, h_unit=h_unit,
      dws_array=dws_array,
      dhs_array=dhs_array), tt=0, name='animation'
  );

  let animation_end = [
          {text: v.coord.x.toFixed(2), text_opacity: 0, tt: 900, key: 'xvv'},
          {text: v.coord.y.toFixed(2), text_opacity: 0, tt: 600, key: 'yvv'},
          {text: v.coord.z.toFixed(2), text_opacity: 0, tt: 300, key: 'zvv'},
          {text: u.coord.x.toFixed(2), text_opacity: 0, tt: 900, key: 'xuu'},
          {text: u.coord.y.toFixed(2), text_opacity: 0, tt: 600, key: 'yuu'},
          {text: u.coord.z.toFixed(2), text_opacity: 0, tt: 300, key: 'zuu'},
  ];
  
  for (i = 0; i < animation_end.length; i++) {
      animation_end[i].x = bot_right_x;
      animation_end[i].y = bot_right_y;
  };
  lib.plot_texts(animation_end, tt=0, name='animation');

  // Step 4: plot computed uTvv_line's text and uTv value 
  let uTv_texts = [
      {text:'u\u1d40v = '.concat(uTv.toFixed(3)),
       x: v.x * uTv/2,
       y: v.y * uTv/2,
       z: v.z * uTv/2,
       color: 0, text_opacity: 1.0,
       key: 'uTv_texts'},
      {text: uTv.toFixed(3), color: 0, 
       x: bot_right_x, y: bot_right_y,
       text_opacity: 1.0, 
       font_size: 15,
       key: 'uTv'}
  ];

  lib.plot_texts(uTv_texts, tt=1200, name='uTv_texts');
  
  uTvv_opacity = 1;
};

return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);},
  compute: function(){compute(scatter[0], scatter[1]);}
};


})();



