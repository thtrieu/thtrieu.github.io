let matrices_multiply2d = (function() {

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
  let [lines_U, texts_U] = lib.text_matrix_to_list(
          [[{text: u0.coord.x.toFixed(2), key: 'xu0'},
            {text: u1.coord.x.toFixed(2), key: 'xu1'},
            {text: u2.coord.x.toFixed(2), key: 'xu2'},
            {text: u3.coord.x.toFixed(2), key: 'xu3'}
           ],
           [{text: u0.coord.y.toFixed(2), key: 'yu0'},
            {text: u1.coord.y.toFixed(2), key: 'yu1'},
            {text: u2.coord.y.toFixed(2), key: 'yu2'},
            {text: u3.coord.y.toFixed(2), key: 'yu3'}
           ]
          ],  
          [last_col_coord, start_coord_y - matrix_above_matrix], size
          ),
  
      [lines_V, texts_V] = lib.text_matrix_to_list(
          [
            [{text: v0.coord.x.toFixed(2), key: 'xv0'},
             {text: v0.coord.y.toFixed(2), key: 'yv0'}],

            [{text: v1.coord.x.toFixed(2), key: 'xv1'},
             {text: v1.coord.y.toFixed(2), key: 'yv1'}], 
          ],
          [start_coord_x, start_coord_y], size
          ),
      
      texts_zU = [{text: ' ', key: 'zu0'},
                  {text: ' ', key: 'zu1'},
                  {text: ' ', key: 'zu2'},
                  {text: ' ', key: 'zu3'}
      ],
      texts_zV = [{text: ' ', key: 'zv0'},
                  {text: ' ', key: 'zv1'}
      ],
      texts_v2 = [{text: ' ', key: 'xv2'},
                  {text: ' ', key: 'yv2'},
                  {text: ' ', key: 'zv2'}
      ];

  texts_zU.forEach(function(d, i){
    d.x = texts_U[texts_zU.length + i].x;
    d.y = texts_U[texts_zU.length + i].y;
    d.text_opacity = 0;
  });  

  texts_zV.forEach(function(d, i){
    d.x = texts_V[i * texts_zV.length + 1].x;
    d.y = texts_V[i * texts_zV.length + 1].y;
    d.text_opacity = 0;
  });
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

  texts_to_show.push(...texts_U);
  texts_to_show.push(...texts_V);
  texts_to_show.push(...texts_zV);
  texts_to_show.push(...texts_v2);
  texts_to_show.push(...texts_zU);
  texts_to_show.push(U_cell, V_cell);

  lines_to_show.push(...lines_V);
  lines_to_show.push(...lines_U);

  lib.plot_texts(texts_to_show, tt, 'texts_to_show');
  lib.plot_lines(lines_to_show, tt, 'lines_to_show');

  // Step 3: plot result matrix with opacity = 0
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
             {text: v0Tu3.toFixed(2), key: 'v0Tu3'},
            ],
            [{text: v1Tu0.toFixed(2), key: 'v1Tu0'},
             {text: v1Tu1.toFixed(2), key: 'v1Tu1'},
             {text: v1Tu2.toFixed(2), key: 'v1Tu2'},
             {text: v1Tu3.toFixed(2), key: 'v1Tu3'},
            ]
          ],
          [last_col_coord, start_coord_y], size),
      
      dot_product_for3d = [
          {text: v2Tu0.toFixed(2), key: 'v2Tu0'},
          {text: v2Tu1.toFixed(2), key: 'v2Tu1'},
          {text: v2Tu2.toFixed(2), key: 'v2Tu2'},
          {text: v2Tu3.toFixed(2), key: 'v2Tu3'}];

  for (i = 0; i < dot_product_for3d.length; i++) {
    dot_product_for3d[i].x = texts_result[i + dot_product_for3d.length].x;
    dot_product_for3d[i].y = texts_result[i + dot_product_for3d.length].y;
  }
  dot_product_for3d.forEach(function(d){
    d.font_size = 1;
    d.text_opacity = 0;
    d.text_color = 0;
  })

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

  texts_result.push(dot_product_for3d);

  lib.plot_texts(texts_result, 0, 'texts_result');
  lib.plot_lines(lines_result, 0, 'lines_result');
  lib.sort();
}


function init(tt){
  axis = lib.init_float_axis(axis_len, unit);

  let u0 = {x: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            y: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            z: 0, color: 0, r: 5},
      u1 = {x: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            y: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            z: 0, color: 1, r: 5},
      u2 = {x: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            y: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            z: 0, color: 2, r: 5},
      u3 = {x: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            y: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            z: 0, color: 3, r: 5},
      v0 = {x: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            y: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            z: 0, color: 'grey', r: 5},
      v1 = {x: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            y: d3.randomUniform(-axis_len, axis_len)() * 0.8,
            z: 0, color: 'grey', r: 5},
      v2 = {x: 0, y: 0,
            z: 0, color: 'grey', r: 0};

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
  lib.drag_start2d();
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


function compute(u0, u1, u2, u3, v0, v1){
  let v0Tu0 = lib.dot_product(u0, v0),
      v1Tu0 = lib.dot_product(u0, v1),
      v0Tu1 = lib.dot_product(u1, v0),
      v1Tu1 = lib.dot_product(u1, v1),
      v0Tu2 = lib.dot_product(u2, v0),
      v1Tu2 = lib.dot_product(u2, v1),
      v0Tu3 = lib.dot_product(u3, v0),
      v1Tu3 = lib.dot_product(u3, v1),
      time_unit = 300;

  // // Step 1: Plot the copy of V and U tables.

  let [lines_U, texts_U] = lib.text_matrix_to_list(
      [
        [{text: u0.coord.x.toFixed(2), key: 'xuu0'},
         {text: u1.coord.x.toFixed(2), key: 'xuu1'},
         {text: u2.coord.x.toFixed(2), key: 'xuu2'},
         {text: u3.coord.x.toFixed(2), key: 'xuu3'}],

        [{text: u0.coord.y.toFixed(2), key: 'yuu0'},
         {text: u1.coord.y.toFixed(2), key: 'yuu1'},
         {text: u2.coord.y.toFixed(2), key: 'yuu2'},
         {text: u3.coord.y.toFixed(2), key: 'yuu3'}],

      ],
      [last_col_coord, start_coord_y - matrix_above_matrix], size
      ),

    [lines_V, texts_V] = lib.text_matrix_to_list(
    [
      [{text: v0.coord.x.toFixed(2), key: 'xvv0'},
       {text: v0.coord.y.toFixed(2), key: 'yvv0'}],
      
      [{text: v1.coord.x.toFixed(2), key: 'xvv1'},
       {text: v1.coord.y.toFixed(2), key: 'yvv1'}]
    ],

    [start_coord_x, start_coord_y], size
    );

  let [lines_result, texts_result] = lib.text_matrix_to_list(
      [
        [{text: v0Tu0.toFixed(2), tt: time_unit * 1, key: 'v0Tu0'},
         {text: v0Tu1.toFixed(2), tt: time_unit * 2, key: 'v0Tu1'},
         {text: v0Tu2.toFixed(2), tt: time_unit * 3, key: 'v0Tu2'},
         {text: v0Tu3.toFixed(2), tt: time_unit * 4, key: 'v0Tu3'}
        ],
        [{text: v1Tu0.toFixed(2), tt: time_unit * 2, key: 'v1Tu0'},
         {text: v1Tu1.toFixed(2), tt: time_unit * 3, key: 'v1Tu1'},
         {text: v1Tu2.toFixed(2), tt: time_unit * 4, key: 'v1Tu2'},
         {text: v1Tu3.toFixed(2), tt: time_unit * 5, key: 'v1Tu3'}
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
      texts_Ubegin0 = [],
      texts_Ubegin1 = [],
      texts_Ubegin2 = [],
      texts_Ubegin3 = [];

  for (i = 0; i < 2; i ++) {
    texts_Vbegin0.push(texts_V[0*2+i]);
    texts_Vbegin1.push(texts_V[1*2+i]);

    texts_Ubegin0.push(texts_U[i*4+0]);
    texts_Ubegin1.push(texts_U[i*4+1]);
    texts_Ubegin2.push(texts_U[i*4+2]);
    texts_Ubegin3.push(texts_U[i*4+3]);
  }

  lib.plot_texts(texts_Vbegin0, 0, 'texts_V0');
  lib.plot_texts(texts_Vbegin1, 0, 'texts_V1');

  lib.plot_texts(texts_Ubegin0, 0, 'texts_U0');
  lib.plot_texts(texts_Ubegin1, 0, 'texts_U1');
  lib.plot_texts(texts_Ubegin2, 0, 'texts_U2');
  lib.plot_texts(texts_Ubegin3, 0, 'texts_U3');

  // step 2: moving the copy to the result place:

  let texts_Vend0 = [
          {text: v0.coord.x.toFixed(2), key: 'xvv0'},
          {text: v0.coord.y.toFixed(2), key: 'yvv0'}
      ],
      texts_Uend0 = [
          {text: u0.coord.x.toFixed(2), key: 'xuu0'},
          {text: u0.coord.y.toFixed(2), key: 'yuu0'}
  ];
  
  texts_Vend0.forEach(function(d, i){
    d.x = result_points[0*4+3].x;
    d.y = result_points[0*4+3].y;
    d.tt = time_unit * (4 - i);
    d.font_size = size;
    d.text_opacity = 1;
  });
  
  texts_Uend0.forEach(function(d, i){
    d.x = result_points[1*4+0].x;
    d.y = result_points[1*4+0].y;
    d.tt = time_unit * (2 - i);
    d.font_size = size;
  })

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

  delay_plotting(texts_Vend0, 'texts_V0');
  delay_plotting(texts_Uend0, 'texts_U0');

  let texts_Vend1 = [
          {text: v1.coord.x.toFixed(2), key: 'xvv1'},
          {text: v1.coord.y.toFixed(2), key: 'yvv1'}
      ],
      texts_Uend1 = [
          {text: u1.coord.x.toFixed(2), key: 'xuu1'},
          {text: u1.coord.y.toFixed(2), key: 'yuu1'}
      ],
      texts_Uend2 = [
          {text: u2.coord.x.toFixed(2), key: 'xuu2'},
          {text: u2.coord.y.toFixed(2), key: 'yuu2'}
      ],
      texts_Uend3 = [
          {text: u3.coord.x.toFixed(2), key: 'xuu3'},
          {text: u3.coord.y.toFixed(2), key: 'yuu3'}
  ];

  texts_Vend1.forEach(function(d, i){
    d.x = result_points[1*4+3].x;
    d.y = result_points[1*4+3].y;
    d.tt = time_unit * (5 - i);
    d.font_size = size;
  });

  texts_Uend1.forEach(function(d, i){
    d.x = result_points[1*4+1].x;
    d.y = result_points[1*4+1].y;
    d.tt = time_unit * (3 - i);
    d.font_size = size;
  })

  texts_Uend2.forEach(function(d, i){
    d.x = result_points[1*4+2].x;
    d.y = result_points[1*4+2].y;
    d.tt = time_unit * (4 - i);
    d.font_size = size;
  })

  texts_Uend3.forEach(function(d, i){
    d.x = result_points[1*4+3].x;
    d.y = result_points[1*4+3].y;
    d.tt = time_unit * (5 - i);
    d.font_size = size;
  })

  texts_Vend1.forEach(function(d){
      d.delay = time_unit/3;
    });
  delay_plotting(texts_Vend1, 'texts_V1');  

  texts_Uend1.forEach(function(d){
      d.delay = time_unit/3;
    });
  delay_plotting(texts_Uend1, 'texts_U1');

  texts_Uend2.forEach(function(d){
      d.delay = time_unit/4;
    });
  delay_plotting(texts_Uend2, 'texts_U2');

  texts_Uend3.forEach(function(d){
      d.delay = time_unit/5;
    });
  delay_plotting(texts_Uend3, 'texts_U3');
  
  // // Step 4: plot compute uTvv_line's text and uTv value 
  texts_result.forEach(function(d){
      d.delay = d.tt - 30;
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
                              scatter[4], scatter[5]);}
};


})();
