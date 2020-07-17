let matrix_vector_multiply = (function() {

let origin = [70, 80], 
    scale = 60, 
    scatter = [],
    lib = null,
    svg = null;

let differ = 0.09,
    size = 18,
    text_above_matrix = 0.7;

let start_coord_x = origin[0]/scale, 
    start_coord_y = origin[1]/scale,
    last_col_coord = start_coord_x + 2.75,
    last_row_coord = start_coord_y + 0.775;

let u_cell = {text: 'u =', x: last_col_coord,
              y: start_coord_y - 0.8 * 3 , key: 'u'},
    V_cell = {text: 'V =', x: start_coord_x - 0.6,
               y: start_coord_y + differ, key: 'V' };


function select_svg(svg_id) {  
  svg = d3.select(svg_id);

  lib = space_plot_lib(
    svg,
    origin,
    scale,
    is_2d=true); 
}


function plot(scatter, tt){
  let u = scatter[0],
      v0 = scatter[1],
      v1 = scatter[2],
      v2 = scatter[3];

  // Step 1: Plot the V and u tables.
  let [lines_u, texts_u] = lib.text_matrix_to_list(
          [[{text: u.x.toFixed(2), text_color: u.color, key: 'xu'}],
           [{text: u.y.toFixed(2), text_color: u.color, key: 'yu'}],
           [{text: u.z.toFixed(2), text_color: u.color, key: 'zu'}]],
          [last_col_coord, start_coord_y - 1.5], size
          ),
      [lines_V, texts_V] = lib.text_matrix_to_list(
          [
            [{text: v0.x.toFixed(2), text_color: v0.color, key: 'xv0'},
            {text: v0.y.toFixed(2), text_color: v0.color, key: 'yv0'},
            {text: v0.z.toFixed(2), text_color: v0.color, key: 'zv0'}],

            [{text: v1.x.toFixed(2), text_color: v1.color, key: 'xv1'},
            {text: v1.y.toFixed(2), text_color: v1.color, key: 'yv1'},
            {text: v1.z.toFixed(2), text_color: v1.color, key: 'zv1'}],
            
            [{text: v2.x.toFixed(2), text_color: v2.color, key: 'xv2'},
            {text: v2.y.toFixed(2), text_color: v2.color, key: 'yv2'},
            {text: v2.z.toFixed(2), text_color: v2.color, key: 'zv2'}], 
          ],
          [start_coord_x, start_coord_y], size
          );

  let texts_to_show = [],
      lines_to_show = [];

  texts_to_show.push(...texts_u);
  texts_to_show.push(...texts_V);
  texts_to_show.push(u_cell, V_cell);

  lines_to_show.push(...lines_V);
  lines_to_show.push(...lines_u);

  lib.plot_texts(texts_to_show, tt, name='texts_to_show');
  lib.plot_lines(lines_to_show, tt, name='lines_to_show');

  // Step 3: plot vector result with opacity = 0
  let uTv0 = lib.dot_product(u, v0),
      uTv1 = lib.dot_product(u, v1),
      uTv2 = lib.dot_product(u, v2),

      [lines_result, texts_result] = lib.text_matrix_to_list(
          [[{text: uTv0.toFixed(3), text_opacity: 0, text_color: 0, key: 'uTv0'}],
           [{text: uTv1.toFixed(3), text_opacity: 0, text_color: 0, key: 'uTv1'}],
           [{text: uTv2.toFixed(3), text_opacity: 0, text_color: 0, key: 'uTv2'}]],
          [last_col_coord, start_coord_y], size);

  lines_result.forEach(function(d){
    d.color = 'white';
  })

  lib.plot_texts(texts_result, 0, name='texts_result');
  // lib.plot_texts([texts_result[0]], 0, name='texts_result0');
  // lib.plot_texts([texts_result[1]], 0, name='texts_result1');
  // lib.plot_texts([texts_result[2]], 0, name='texts_result2');
  lib.plot_lines(lines_result, name='lines_result');
  lib.sort();
}

function init(tt){
  // axis = lib.init_float_axis(axis_len, unit);
  let u = {x: 2/3, y: 1/2, z: 1/5,
           color: 4},
      v0 = {x: 1/3, y: -1/4, z: 3/5,
            color: 8},
      v1 = {x: 2/5, y: -2/3, z: 0,
            color: 10,},
      v2 = {x: 4/7, y: 2/7, z: 1/2,
            color: 6};

  scatter = [u, v0, v1, v2];

  plot(scatter, tt);
};


function compute(u, v0, v1, v2){
  let uTv0 = lib.dot_product(u, v0),
      uTv1 = lib.dot_product(u, v1),
      uTv2 = lib.dot_product(u, v2);

  // // Step 1: Plot the copy of V and u tables.

  let [lines_uu0, texts_uu0] = lib.text_matrix_to_list(
        [[{text: u.x.toFixed(2), text_color: u.color, key: 'xuu0'}],
         [{text: u.y.toFixed(2), text_color: u.color, key: 'yuu0'}],
         [{text: u.z.toFixed(2), text_color: u.color, key: 'zuu0'}]],
        [last_col_coord, start_coord_y - 1.5], size
        ),
      // [lines_uu1, texts_uu1] = lib.text_matrix_to_list(
      //   [[{text: u.x.toFixed(2), text_color: u.color, key: 'xuu1'}],
      //    [{text: u.y.toFixed(2), text_color: u.color, key: 'yuu1'}],
      //    [{text: u.z.toFixed(2), text_color: u.color, key: 'zuu1'}]],
      //   [last_col_coord, start_coord_y - 1.5], size
      //   ),
      // [lines_uu2, texts_uu2] = lib.text_matrix_to_list(
      //   [[{text: u.x.toFixed(2), text_color: u.color, key: 'xuu2'}],
      //    [{text: u.y.toFixed(2), text_color: u.color, key: 'yuu2'}],
      //    [{text: u.z.toFixed(2), text_color: u.color, key: 'zuu2'}]],
      //   [last_col_coord, start_coord_y - 1.5], size
      //   ),
    [lines_V, texts_V] = lib.text_matrix_to_list(
        [[{text: v0.x.toFixed(2), text_color: v0.color, key: 'xvv0'},
          {text: v0.y.toFixed(2), text_color: v0.color, key: 'yvv0'},
          {text: v0.z.toFixed(2), text_color: v0.color, key: 'zvv0'}
         ],
          [{text: v1.x.toFixed(2), text_color: v1.color, key: 'xvv1'},
          {text: v1.y.toFixed(2), text_color: v1.color, key: 'yvv1'},
          {text: v1.z.toFixed(2), text_color: v1.color, key: 'zvv1'}
         ],
          [{text: v2.x.toFixed(2), text_color: v2.color, key: 'xvv2'},
          {text: v2.y.toFixed(2), text_color: v2.color, key: 'yvv2'},
          {text: v2.z.toFixed(2), text_color: v2.color, key: 'zvv2'}]
        ],

        [start_coord_x, start_coord_y], size
        );

  let [lines_result, texts_result] = lib.text_matrix_to_list(
        [[{text: uTv0.toFixed(3), text_opacity: 1, text_color: 0, tt: 600, key: 'uTv0'}],
         [{text: uTv1.toFixed(3), text_opacity: 1, text_color: 0, tt: 1200, key: 'uTv1'}],
         [{text: uTv2.toFixed(3), text_opacity: 1, text_color: 0, tt: 1800, key: 'uTv2'}]],
        [last_col_coord, start_coord_y], size, 0.35
      ),
      result_points = [];

  for (i = 0; i < texts_result.length; i++) {
    result_points.push(
    {x: texts_result[i].x,
     y: texts_result[i].y});
  }

  let animation_begin0 = [],
      animation_begin1 = [],
      animation_begin2 = [];

  for (i = 0; i < 3; i ++) {
    animation_begin0.push(texts_V[0*3+i]);
    animation_begin1.push(texts_V[1*3+i]);
    animation_begin2.push(texts_V[2*3+i]);
  }

  lib.plot_texts(animation_begin0, 0, name='animation0');
  lib.plot_texts(animation_begin1, 0, name='animation1');
  lib.plot_texts(animation_begin2, 0, name='animation2');
  lib.plot_texts(texts_uu0, 0, 'texts_uu0');

  // step 2: moving the copy to the result place:

  let animation_end0 = [
          {text: v0.x.toFixed(2), text_opacity: 0, tt: 600, key: 'xvv0'},
          {text: v0.y.toFixed(2), text_opacity: 0, tt: 500, key: 'yvv0'},
          {text: v0.z.toFixed(2), text_opacity: 0, tt: 400, key: 'zvv0'},
  ];
  
  for (i = 0; i < animation_end0.length; i++) {
      animation_end0[i].x = result_points[0].x;
      animation_end0[i].y = result_points[0].y;

  };
  for (i = 0; i < texts_uu0.length; i++) {
      texts_uu0[i].x = result_points[2].x;
      texts_uu0[i].y = result_points[2].y;
      texts_uu0[i].text_opacity = 0;

  };
  texts_uu0[0].tt =  600;
  texts_uu0[1].tt =  1200;
  texts_uu0[2].tt =  1800;


  lib.plot_lines(lines_result, name='lines_result');
  lib.plot_texts(animation_end0, 0, name='animation0');
  lib.plot_texts(texts_uu0, 0, 'texts_uu0');

  let animation_end1 = [
          {text: v1.x.toFixed(2), text_opacity: 0, tt: 1200, key: 'xvv1'},
          {text: v1.y.toFixed(2), text_opacity: 0, tt: 1100, key: 'yvv1'},
          {text: v1.z.toFixed(2), text_opacity: 0, tt: 1000, key: 'zvv1'}
  ];

  for (i = 0; i < animation_end1.length; i++) {
      animation_end1[i].x = result_points[1].x;
      animation_end1[i].y = result_points[1].y;
  };

  lib.plot_texts(animation_end1, 0, name='animation1');
  
  let animation_end2 = [
          {text: v2.x.toFixed(2), text_opacity: 0, tt: 1800, key: 'xvv2'},
          {text: v2.y.toFixed(2), text_opacity: 0, tt: 1700, key: 'yvv2'},
          {text: v2.z.toFixed(2), text_opacity: 0, tt: 1600, key: 'zvv2'},
  ];

  for (i = 0; i < animation_end2.length; i++) {
      animation_end2[i].x = result_points[2].x;
      animation_end2[i].y = result_points[2].y;
  };

  lib.plot_texts(animation_end2, 0, name='animation2');

  // // Step 4: plot compute uTvv_line's text and uTv value 
  lib.plot_texts(texts_result, 0, name='texts_result');

};

return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);},
  compute: function(){compute(scatter[0], scatter[1],
                              scatter[2], scatter[3]);}
};


})();



