let matrices_multiply = (function() {

let origin = [150, 140], 
    scale = 60, 
    scatter = [],
    axis = [],
    expectedAxis = [],
    expectedScatter = [],
    startAngleX = Math.PI/8 * 2.65,
    startAngleY = -Math.PI/8,
    startAngleZ = Math.PI/8 * 0.6,
    axis_len = 2,
    unit = axis_len/10,
    uTvv_opacity = 0,
    lib = null,
    svg = null;

let differ = 0.09,
    size = 14,
    text_from_matrix = 0.55,
    matrix_above_matrix = 1;

let start_coord_x = (origin[0] + 50) /scale,
    start_coord_y = (origin[1] - 140) /scale,
    last_col_coord = start_coord_x + 2,
    U_cell = {text: 'U =',
              x: last_col_coord - text_from_matrix,
              y: start_coord_y - matrix_above_matrix + differ,
              font_size: size, key: 'u'},
    V_cell = {text: 'V =',
              x: start_coord_x - text_from_matrix,
              y: start_coord_y + differ,
              font_size: size, key: 'V' };


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


function plot(scatter, axis, tt){
  // Step 1: Plot the coordinate.
  lib.plot_lines(axis, tt, 'axis');

  let u0 = scatter[0],
      u1 = scatter[1],
      u2 = scatter[2],
      u3 = scatter[3],

      v0 = scatter[4],
      v1 = scatter[5],
      v2 = scatter[6],

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
      point.text = 'u\u2081';
    } else if (i == 1) {
      point.text = 'u\u2082';
    } else if (i == 2) {
      point.text = 'u\u2083';
    } else if (i == 3) {
      point.text = 'u\u2084';
    } else if (i == 4) {
      point.text = 'v\u2081';
    } else if (i == 5) {
      point.text = 'v\u2082';
    } else if (i == 6) {
      point.text = 'v\u2083';
    }
    points.push(point);
  })
  
  lib.plot_points(points, tt,
                  drag_point_fn=function(d, i){
                    dragged_point(i);
                  },
                  drag_start, drag_end);
  
  // Step 2: Plot the V and u tables.
  let [lines_U, texts_U] = lib.text_matrix_to_list(
      [[{text: u0.coord.x.toFixed(2), key: 'xu0'},
        {text: u1.coord.x.toFixed(2), key: 'xu1'},
        {text: u2.coord.x.toFixed(2), key: 'xu2'},
        {text: u3.coord.x.toFixed(2), key: 'xu3'}
       ], [
        {text: u0.coord.y.toFixed(2), key: 'yu0'},
        {text: u1.coord.y.toFixed(2), key: 'yu1'},
        {text: u2.coord.y.toFixed(2), key: 'yu2'},
        {text: u3.coord.y.toFixed(2), key: 'yu3'}
       ], [
        {text: u0.coord.z.toFixed(2), key: 'zu0'},
        {text: u1.coord.z.toFixed(2), key: 'zu1'},
        {text: u2.coord.z.toFixed(2), key: 'zu2'},
        {text: u3.coord.z.toFixed(2), key: 'zu3'}]
      ],
      [last_col_coord, start_coord_y - matrix_above_matrix], size
      ),
  
      [lines_V, texts_V] = lib.text_matrix_to_list(
      [
        [{text: v0.coord.x.toFixed(2), key: 'xv0'},
         {text: v0.coord.y.toFixed(2), key: 'yv0'},
         {text: v0.coord.z.toFixed(2), key: 'zv0'}],

        [{text: v1.coord.x.toFixed(2), key: 'xv1'},
         {text: v1.coord.y.toFixed(2), key: 'yv1'},
         {text: v1.coord.z.toFixed(2), key: 'zv1'}],
        
        [{text: v2.coord.x.toFixed(2), key: 'xv2'},
         {text: v2.coord.y.toFixed(2), key: 'yv2'},
         {text: v2.coord.z.toFixed(2), key: 'zv2'}], 
      ],
      [start_coord_x, start_coord_y], size
      );

  let texts_to_show = [],
      lines_to_show = [];

  texts_to_show.push(...texts_U);
  texts_to_show.push(...texts_V);
  texts_to_show.push(U_cell, V_cell);

  lines_to_show.push(...lines_V);
  lines_to_show.push(...lines_U);

  lib.plot_texts(texts_to_show, tt, 'texts_to_show');
  lib.plot_lines(lines_to_show, tt, 'lines_to_show');

  // Step 3: plot vector result with opacity = 0
  let v0Tu0 = lib.dot_product(u0, v0),
      v1Tu0 = lib.dot_product(u0, v1),
      v2Tu0 = lib.dot_product(u0, v2),
      v0Tu1 = lib.dot_product(u1, v0),
      v1Tu1 = lib.dot_product(u1, v1),
      v2Tu1 = lib.dot_product(u1, v2),
      v0Tu2 = lib.dot_product(u2, v0),
      v1Tu2 = lib.dot_product(u2, v1),
      v2Tu2 = lib.dot_product(u2, v2),
      v0Tu3 = lib.dot_product(u3, v0),
      v1Tu3 = lib.dot_product(u3, v1),
      v2Tu3 = lib.dot_product(u3, v2),

      [lines_result, texts_result] = lib.text_matrix_to_list(
          [
            [{text: v0Tu0.toFixed(2), key: 'v0Tu0'},
             {text: v0Tu1.toFixed(2), key: 'v0Tu1'},
             {text: v0Tu2.toFixed(2), key: 'v0Tu2'},
             {text: v0Tu3.toFixed(2), key: 'v0Tu3'}
            ],
            [{text: v1Tu0.toFixed(2), key: 'v1Tu0'},
             {text: v1Tu1.toFixed(2), key: 'v1Tu1'},
             {text: v1Tu2.toFixed(2), key: 'v1Tu2'},
             {text: v1Tu3.toFixed(2), key: 'v1Tu3'}
            ],
            [{text: v2Tu0.toFixed(2), key: 'v2Tu0'},
             {text: v2Tu1.toFixed(2), key: 'v2Tu1'},
             {text: v2Tu2.toFixed(2), key: 'v2Tu2'},
             {text: v2Tu3.toFixed(2), key: 'v2Tu3'}
            ]
          ],
          [last_col_coord, start_coord_y], size,
        );

  lines_result.forEach(function(d){
    d.color = 'white';
  })
  texts_result.forEach(function(d){
    d.font_size = 1;
    d.text_opacity = 0;
    d.text_color = 0;
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

  lib.plot_texts(texts_result, 0, 'texts_result');
  lib.plot_lines(lines_result, 0, 'lines_result');
  lib.sort();
}


function init(tt){
  axis = lib.init_float_axis(axis_len, unit);

  let u0 = {x: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            y: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            z: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            color: 0, r: 5},
      u1 = {x: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            y: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            z: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            color: 1, r: 5},
      u2 = {x: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            y: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            z: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            color: 2, r: 5},
      u3 = {x: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            y: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            z: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            color: 3, r: 5},
      v0 = {x: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            y: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            z: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            color: 'grey', r: 5},
      v1 = {x: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            y: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            z: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            color: 'grey', r: 5},
      v2 = {x: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            y: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            z: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            color: 'grey', r: 5};

  scatter = [u0, u1, u2, u3, v0, v1, v2];

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


function compute(u0, u1, u2, u3, v0, v1, v2){
  let v0Tu0 = lib.dot_product(u0, v0),
      v1Tu0 = lib.dot_product(u0, v1),
      v2Tu0 = lib.dot_product(u0, v2),
      v0Tu1 = lib.dot_product(u1, v0),
      v1Tu1 = lib.dot_product(u1, v1),
      v2Tu1 = lib.dot_product(u1, v2),
      v0Tu2 = lib.dot_product(u2, v0),
      v1Tu2 = lib.dot_product(u2, v1),
      v2Tu2 = lib.dot_product(u2, v2),
      v0Tu3 = lib.dot_product(u3, v0),
      v1Tu3 = lib.dot_product(u3, v1),
      v2Tu3 = lib.dot_product(u3, v2),
      time_unit = 200;

  // // Step 1: Plot the copy of V and u tables.

  let [lines_U, texts_U] = lib.text_matrix_to_list(
          [[{text: u0.coord.x.toFixed(2), key: 'xuu0'},
            {text: u1.coord.x.toFixed(2), key: 'xuu1'},
            {text: u2.coord.x.toFixed(2), key: 'xuu2'},
            {text: u3.coord.x.toFixed(2), key: 'xuu3'}
           ],
           [{text: u0.coord.y.toFixed(2), key: 'yuu0'},
            {text: u1.coord.y.toFixed(2), key: 'yuu1'},
            {text: u2.coord.y.toFixed(2), key: 'yuu2'},
            {text: u3.coord.y.toFixed(2), key: 'yuu3'}
           ],
           [{text: u0.coord.z.toFixed(2), key: 'zuu0'},
            {text: u1.coord.z.toFixed(2), key: 'zuu1'},
            {text: u2.coord.z.toFixed(2), key: 'zuu2'},
            {text: u3.coord.z.toFixed(2), key: 'zuu3'}]
          ],
          [last_col_coord, start_coord_y - matrix_above_matrix], size
          ),

      [lines_V, texts_V] = lib.text_matrix_to_list(
        [[{text: v0.coord.x.toFixed(2), key: 'xvv0'},
          {text: v0.coord.y.toFixed(2), key: 'yvv0'},
          {text: v0.coord.z.toFixed(2), key: 'zvv0'}
         ],
          [{text: v1.coord.x.toFixed(2), key: 'xvv1'},
          {text: v1.coord.y.toFixed(2), key: 'yvv1'},
          {text: v1.coord.z.toFixed(2), key: 'zvv1'}
         ],
          [{text: v2.coord.x.toFixed(2), key: 'xvv2'},
          {text: v2.coord.y.toFixed(2), key: 'yvv2'},
          {text: v2.coord.z.toFixed(2), key: 'zvv2'}]
        ],

        [start_coord_x, start_coord_y], size
        );

  let [lines_result, texts_result] = lib.text_matrix_to_list(
          [
            [{text: v0Tu0.toFixed(2), tt: time_unit * 3, key: 'v0Tu0'},
             {text: v0Tu1.toFixed(2), tt: time_unit * 4, key: 'v0Tu1'},
             {text: v0Tu2.toFixed(2), tt: time_unit * 5, key: 'v0Tu2'},
             {text: v0Tu3.toFixed(2), tt: time_unit * 6, key: 'v0Tu3'}
            ], [
             {text: v1Tu0.toFixed(2), tt: time_unit * 4, key: 'v1Tu0'},
             {text: v1Tu1.toFixed(2), tt: time_unit * 5, key: 'v1Tu1'},
             {text: v1Tu2.toFixed(2), tt: time_unit * 6, key: 'v1Tu2'},
             {text: v1Tu3.toFixed(2), tt: time_unit * 7, key: 'v1Tu3'}
            ], [
             {text: v2Tu0.toFixed(2), tt: time_unit * 5, key: 'v2Tu0'},
             {text: v2Tu1.toFixed(2), tt: time_unit * 6, key: 'v2Tu1'},
             {text: v2Tu2.toFixed(2), tt: time_unit * 7, key: 'v2Tu2'},
             {text: v2Tu3.toFixed(2), tt: time_unit * 8, key: 'v2Tu3'}
            ]
          ],
          [last_col_coord, start_coord_y], size,
        ),

      result_points = [];

  for (i = 0; i < texts_result.length; i++) {
    result_points.push(
    {x: texts_result[i].x,
     y: texts_result[i].y});
  }

  texts_result.forEach(function(d, i){
    d.text_opacity = 0;
    d.text_color = 0;
  })

  let texts_Vbegin0 = [],
      texts_Vbegin1 = [],
      texts_Vbegin2 = [],
      texts_Ubegin0 = [],
      texts_Ubegin1 = [],
      texts_Ubegin2 = [],
      texts_Ubegin3 = [];

  for (i = 0; i < 3; i ++) {
    texts_Vbegin0.push(texts_V[0*3+i]);
    texts_Vbegin1.push(texts_V[1*3+i]);
    texts_Vbegin2.push(texts_V[2*3+i]);

    texts_Ubegin0.push(texts_U[i*4+0]);
    texts_Ubegin1.push(texts_U[i*4+1]);
    texts_Ubegin2.push(texts_U[i*4+2]);
    texts_Ubegin3.push(texts_U[i*4+3]);
  }

  lib.plot_texts(texts_Vbegin0, 0, 'texts_V0');
  lib.plot_texts(texts_Vbegin1, 0, 'texts_V1');
  lib.plot_texts(texts_Vbegin2, 0, 'texts_V2');
  lib.plot_texts(texts_Ubegin0, 0, 'texts_U0');
  lib.plot_texts(texts_Ubegin1, 0, 'texts_U1');
  lib.plot_texts(texts_Ubegin2, 0, 'texts_U2');
  lib.plot_texts(texts_Ubegin3, 0, 'texts_U3');

  // step 2: moving the copy to the result place, then let them disappear:

  let texts_Vend0 = [
          {text: v0.coord.x.toFixed(2), key: 'xvv0'},
          {text: v0.coord.y.toFixed(2), key: 'yvv0'},
          {text: v0.coord.z.toFixed(2), key: 'zvv0'},
      ],
      texts_Uend0 = [
          {text: u0.coord.x.toFixed(2), key: 'xuu0'},
          {text: u0.coord.y.toFixed(2), key: 'yuu0'},
          {text: u0.coord.z.toFixed(2), key: 'zuu0'}
  ];
      
  texts_Vend0.forEach(function(d, i){
    d.x = result_points[0*4+3].x;
    d.y = result_points[0*4+3].y;
    d.tt = time_unit * (6 - i);
    d.font_size = size;
  })
  texts_Uend0.forEach(function(d, i){
    d.x = result_points[2*4+0].x;
    d.y = result_points[2*4+0].y;
    d.tt = time_unit * (5 - i);
    d.font_size = size;
  })

  lib.plot_lines(lines_result, 100, 'lines_result');

  function delay_plotting (given_data, given_name) {
    lib._plot_texts({data: given_data, ease: d3.easeLinear, name: given_name});
    given_data.forEach(function(d){
        d.delay = d.tt;
        d.tt = 0;
        d.text_opacity = 0;
      });
    lib._plot_texts({data: given_data, name: given_name});
  }
  delay_plotting(texts_Vend0, 'texts_V0');
  delay_plotting(texts_Uend0, 'texts_U0');

  let texts_Vend1 = [
          {text: v1.coord.x.toFixed(2), key: 'xvv1'},
          {text: v1.coord.y.toFixed(2), key: 'yvv1'},
          {text: v1.coord.z.toFixed(2), key: 'zvv1'}
      ],
      texts_Uend1 = [
          {text: u1.coord.x.toFixed(2), key: 'xuu1'},
          {text: u1.coord.y.toFixed(2), key: 'yuu1'},
          {text: u1.coord.z.toFixed(2), key: 'zuu1'}
  ];

  texts_Vend1.forEach(function(d, i){
    d.x = result_points[1*4+3].x;
    d.y = result_points[1*4+3].y;
    d.tt = time_unit * (7 - i);
    d.font_size = size;
  })
  texts_Uend1.forEach(function(d, i){
    d.x = result_points[2*4+1].x;
    d.y = result_points[2*4+1].y;
    d.tt = time_unit * (6 - i);
    d.font_size = size;
  })

  delay_plotting(texts_Vend1, 'texts_V1');
  delay_plotting(texts_Uend1, 'texts_U1');

  let texts_Vend2 = [
          {text: v2.coord.x.toFixed(2), key: 'xvv2'},
          {text: v2.coord.y.toFixed(2), key: 'yvv2'},
          {text: v2.coord.z.toFixed(2), key: 'zvv2'},
      ],
      texts_Uend2 = [
          {text: u2.coord.x.toFixed(2), key: 'xuu2'},
          {text: u2.coord.y.toFixed(2), key: 'yuu2'},
          {text: u2.coord.z.toFixed(2), key: 'zuu2'}
      ],
      texts_Uend3 = [
          {text: u3.coord.x.toFixed(2), key: 'xuu3'},
          {text: u3.coord.y.toFixed(2), key: 'yuu3'},
          {text: u3.coord.z.toFixed(2), key: 'zuu3'}
  ];

  texts_Vend2.forEach(function(d, i){
    d.x = result_points[2*4+3].x;
    d.y = result_points[2*4+3].y;
    d.tt = time_unit * (8 - i);
    d.font_size = size;
  })
  texts_Uend2.forEach(function(d, i){
    d.x = result_points[2*4+2].x;
    d.y = result_points[2*4+2].y;
    d.tt = time_unit * (7 - i);
    d.font_size = size;
  })
  texts_Uend3.forEach(function(d, i){
    d.x = result_points[2*4+3].x;
    d.y = result_points[2*4+3].y;
    d.tt = time_unit * (8 - i);
    d.font_size = size;
  })

  texts_Vend2.forEach(function(d){
      d.delay = time_unit/3;
    });
  lib._plot_texts({data: texts_Vend2, ease: d3.easeLinear, name:'texts_V2'});
  delay_plotting(texts_Vend2, 'texts_V2');

  texts_Uend2.forEach(function(d){
      d.delay = time_unit/3;
    });
  
  delay_plotting(texts_Uend2, 'texts_U2');

  texts_Uend3.forEach(function(d){
      d.delay = time_unit/4;
    });
  delay_plotting(texts_Uend3, 'texts_U3');

  // // Step 4: plot compute uTvv_line's text and uTv value 

  texts_result.forEach(function(d){
      d.delay = d.tt - 50;
      d.tt = 200;
      d.text_opacity = 1;
    });
  lib._plot_texts({data: texts_result, name:'texts_result'});
  uTvv_opacity = 1;
};

return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);},
  compute: function(){compute(scatter[0], scatter[1],
                              scatter[2], scatter[3],
                              scatter[4], scatter[5],
                              scatter[6]
                              );}
};


})();