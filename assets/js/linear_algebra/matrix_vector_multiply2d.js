let matrix_vector_multiply2d = (function() {

let origin = [150, 140], 
    scale = 60, 
    scatter = [],
    axis = [],
    expectedAxis = [],
    expectedScatter = [],
    startAngleX = Math.PI,
    startAngleY = 0,
    startAngleZ = 0,
    axis_len = 2,
    unit = axis_len/10,
    uTvv_opacity = 0,
    lib = null,
    svg = null;

let differ = 0.09,
    size = 14,
    text_from_matrix = 0.55,
    matrix_above_matrix = 1 - (0.155* 2 * size/14);

let start_coord_x = (origin[0] + 50) /scale + 0.6 * size/14,
    start_coord_y = (origin[1] - 140) /scale - 0.155 * size/14,
    last_col_coord = start_coord_x + (2 - 0.6 * size/14),
    u_cell = {text: 'u =', x: last_col_coord - text_from_matrix,
              y: start_coord_y - matrix_above_matrix + differ,
              font_size: size, key: 'u'},
    V_cell = {text: 'V =',
              x: start_coord_x - text_from_matrix,
              y: start_coord_y + differ, font_size: size, key: 'V' };


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
  // Step 1: Plot the coordinate.
  lib.plot_lines(axis, tt, 'axis');

  let u = scatter[0],
      v0 = scatter[1],
      v1 = scatter[2],
      v2 = scatter[3],

      basis = {
          ex: axis[1/unit - 1 + axis_len/unit * 0][1], 
          ey: axis[1/unit - 1 + axis_len/unit * 1][1], 
          ez: axis[1/unit - 1 + axis_len/unit * 2][1],
      },
      points = [];

  scatter.forEach(function(d, i){
    let coord = lib.dot_basis(d, basis);
    d.coord = coord;
    let point = Object.assign({}, d);
    if (i == 0) {
      point.text = 'u';
    } else if (i == 1) {
      point.text = 'v\u2081';
    } else if (i == 2) {
      point.text = 'v\u2082';
    } else if (i == 3) {
      point.text = 'v\u2083';
      point.text_opacity = 0;
    }
    points.push(point);
  })
  
  lib.plot_points(points, tt,
                  drag_point_fn=function(d, i){
                    dragged_point(i);
                  },
                  drag_start, drag_end);
  
  // Step 2: Plot the V and u tables.
  let [lines_u, texts_u] = lib.text_matrix_to_list(
          [[{text: u.coord.x.toFixed(2), key: 'xu'}],
           [{text: u.coord.y.toFixed(2), key: 'yu'}]
          ],
          [last_col_coord, start_coord_y - matrix_above_matrix],
          size),

      [lines_V, texts_V] = lib.text_matrix_to_list(
          [
            [{text: v0.coord.x.toFixed(2), key: 'xv0'},
             {text: v0.coord.y.toFixed(2), key: 'yv0'}],

            [{text: v1.coord.x.toFixed(2), key: 'xv1'},
             {text: v1.coord.y.toFixed(2), key: 'yv1'}]
          ],
          [start_coord_x, start_coord_y], size),
  
      texts_zV = [{text: ' ', text_opacity: 0, key: 'zv0'},
                  {text: ' ', text_opacity: 0, key: 'zv1'}],
  
      texts_zu = {text: ' ', text_opacity: 0, key: 'zu'},

      texts_v2 = [{text: ' ', text_opacity: 0, key: 'xv2'},
                  {text: ' ', text_opacity: 0, key: 'yv2'},
                  {text: ' ', text_opacity: 0, key: 'zv2'}];
  
  texts_zV.forEach(function(d, i){
    d.x = texts_V[i * 2 + 1].x;
    d.y = texts_V[i * 2 + 1].y;
  });

  texts_zu.x = texts_u[texts_u.length-1].x;
  texts_zu.y = texts_u[texts_u.length-1].y;

  for (i = 0; i < texts_v2.length - 1; i++) {
    texts_v2[i].x = texts_V[i + 2].x;
    texts_v2[i].y = texts_V[i + 2].y;
  };
  texts_v2[texts_v2.length-1].x = texts_V[texts_V.length-1].x;
  texts_v2[texts_v2.length-1].y = texts_V[texts_V.length-1].y;
  
  texts_v2.forEach(function(d, i){
    d.text_opacity = 0;
    d.font_size =  1;
  })
  

  let texts_to_show = [],
      lines_to_show = [];

  texts_to_show.push(...texts_u);
  texts_to_show.push(...texts_V);
  texts_to_show.push(...texts_zV);
  texts_to_show.push(...texts_v2);
  texts_to_show.push(texts_zu, u_cell, V_cell);

  lines_to_show.push(...lines_V);
  lines_to_show.push(...lines_u);

  lib.plot_texts(texts_to_show, tt, 'texts_to_show');
  lib.plot_lines(lines_to_show, tt, 'lines_to_show');

  // Step 3: plot vector result with opacity = 0
  let uTv0 = lib.dot_product(u, v0),
      uTv1 = lib.dot_product(u, v1),
      uTv2 = lib.dot_product(u, v2),

      [lines_result, texts_result] = lib.text_matrix_to_list(
          [[{text: uTv0.toFixed(2), text_opacity: 0, key: 'uTv0'}],
           [{text: uTv1.toFixed(2), text_opacity: 0, key: 'uTv1'}]],
          [last_col_coord, start_coord_y], size),
      texts_uTv2 = {text: uTv2.toFixed(2), text_opacity: 0, key: 'uTv2'};

  texts_uTv2.x = texts_result[1].x;
  texts_uTv2.y = texts_result[1].y;

  lines_result.forEach(function(d){
    d.color = 'white';
  })
  texts_result.forEach(function(d){
    d.font_size = 1;
  })
  if (uTvv_opacity == 1) {
    texts_result.forEach(function(d){
    d.font_size = size;
    d.text_opacity = 1;
    d.text_color = 0;
    })
    lines_result.forEach(function(d){
      d.color = 'grey';
    })
  }

  texts_result.push(texts_uTv2);

  lib.plot_texts(texts_result, 0, 'texts_result');
  lib.plot_lines(lines_result, 0, 'lines_result');
  lib.sort();
}


function init(tt){
  axis = lib.init_float_axis(axis_len, unit);

  let u = {x: d3.randomUniform(-axis_len, axis_len)() * 0.8,
           y: d3.randomUniform(-axis_len, axis_len)() * 0.8,
           z: 0, color: 0, r: 5},
      v0 = {x: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            y: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            z: 0, color: 'grey', r: 5},
      v1 = {x: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            y: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            z: 0, color: 'grey', r: 5},
      v2 = {x: 0, y: 0,
            z: 0, color: 'grey', r: 0};

  scatter = [u, v0, v1, v2];

  expectedScatter = lib.rotate_points(
      scatter, startAngleX, startAngleY, startAngleZ);
  expectedAxis = lib.rotate_lines(
      axis, startAngleX, startAngleY, startAngleZ);

  uTvv_opacity = 0;

  plot(expectedScatter, 
       expectedAxis, 
       tt);
  drag_end();
};


let drag_on_left = true;


function drag_start(){
  lib.drag_start();
  if (lib.get_mouse_position().x < 400) {
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

function dragged_point(i){
  if (!drag_on_left) {
    return;
  }

  expectedScatter = [];
  scatter.forEach(function(d, j){
      if (j == i) {
        r = lib.shift_point_accord_to_mouse(d);
        if (r.x > 3) {
          r.x = 3;
        }
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


function compute(u, v0, v1){
  let uTv0 = lib.dot_product(u, v0),
      uTv1 = lib.dot_product(u, v1),
      time_unit = 300;

  // // Step 1: Plot the copy of V and u tables.

  let [lines_uu, texts_uu] = lib.text_matrix_to_list(
        [[{text: u.coord.x.toFixed(2), key: 'xuu'}],
         [{text: u.coord.y.toFixed(2), key: 'yuu'}],],
        [last_col_coord, start_coord_y - matrix_above_matrix], size
        ),
      [lines_V, texts_V] = lib.text_matrix_to_list(
        [[{text: v0.coord.x.toFixed(2), key: 'xvv0'},
          {text: v0.coord.y.toFixed(2), key: 'yvv0'}],
         [{text: v1.coord.x.toFixed(2), key: 'xvv1'},
          {text: v1.coord.y.toFixed(2), key: 'yvv1'}]
        ],

        [start_coord_x, start_coord_y], size
        );

  let [lines_result, texts_result] = lib.text_matrix_to_list(
        [[{text: uTv0.toFixed(2), text_opacity: 1, tt: time_unit * 3, text_color: 0, key: 'uTv0'}],
         [{text: uTv1.toFixed(2), text_opacity: 1, tt: time_unit * 4, text_color: 0, key: 'uTv1'}]],
        [last_col_coord, start_coord_y], size,
      ),
      result_points = [];

  for (i = 0; i < texts_result.length; i++) {
    result_points.push(
    {x: texts_result[i].x,
     y: texts_result[i].y});
  }

  let animation_begin0 = [],
      animation_begin1 = [];

  for (i = 0; i < 2; i ++) {
    animation_begin0.push(texts_V[0*2+i]);
    animation_begin1.push(texts_V[1*2+i]);
  }

  lib.plot_texts(animation_begin0, 0, 'animation0');
  lib.plot_texts(animation_begin1, 0, 'animation1');
  lib.plot_texts(texts_uu, 0, 'texts_uu');

  // step 2: moving the copy to the result place:

  let animation_end0 = [
          {text: v0.coord.x.toFixed(2), text_opacity: 1, tt: time_unit * 2, font_size: size, key: 'xvv0'},
          {text: v0.coord.y.toFixed(2), text_opacity: 1, tt: time_unit * 1, font_size: size, key: 'yvv0'}
  ];
  
  animation_end0.forEach(function(d){
    d.x = result_points[0].x;
    d.y = result_points[0].y;
  });
  
  texts_uu.forEach(function(d){
    d.x = result_points[1].x;
    d.y = result_points[1].y;
  })

  texts_uu[0].tt =  time_unit * 3;
  texts_uu[1].tt =  time_unit * 2;

  lib.plot_lines(lines_result, 0, 'lines_result');

  function delay_plotting (given_data, given_name) {
    lib._plot_texts({data: given_data, ease: d3.easeLinear, name: given_name});
    given_data.forEach(function(d){
        d.delay = d.tt;
        d.tt = 0;
        d.text_opacity = 0;
      });
    lib._plot_texts({data: given_data, name: given_name});
  }

  delay_plotting(animation_end0, 'animation0');
  delay_plotting(texts_uu, 'texts_uu');

  let animation_end1 = [
          {text: v1.coord.x.toFixed(2), text_opacity: 1, tt: time_unit * 3, font_size: size, key: 'xvv1'},
          {text: v1.coord.y.toFixed(2), text_opacity: 1, tt: time_unit * 2, font_size: size, key: 'yvv1'}
  ];
  animation_end1.forEach(function(d){
    d.x = result_points[1].x;
    d.y = result_points[1].y;
  });
  animation_end1.forEach(function(d){
      d.delay = time_unit;
    });

  delay_plotting(animation_end1, 'animation1');

  // // Step 4: plot compute uTvv_line's text and uTv value 
  texts_result.forEach(function(d){
      d.delay = d.tt - time_unit*2.5;
      d.tt = time_unit*3;
      d.text_opacity = 1;
    });
  lib._plot_texts({data: texts_result, name:'texts_result'});

  uTvv_opacity = 1;
};

return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);},
  compute: function(){compute(scatter[0], scatter[1],
                              scatter[2]);}
};


})();
