let dot_product_formula2d = (function() {

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
    lib = null;

let differ = 0.09,
    text_above_matrix = 0.45,
    w_unit = 0.22,
    h_unit = 0.13, 
    size = 14, 
    col_unit = 0.6,
    row_unit = 0.3;

let start_coord_x=(400 - origin[0])/scale,
    start_coord_y=(125 - origin[1])/scale;
    end_matrix_y = start_coord_y + 0.3;

let u_cell = {text: 'u =', x: start_coord_x,
              y: start_coord_y - text_above_matrix, key: 'u'},
    v_cell = {text: 'v =', x: start_coord_x + col_unit * 1.5,
              y: start_coord_y - text_above_matrix, key: 'v'};
               

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
  let points = [], lines = [];
  let u = scatter[0],
      v = scatter[1];

  basis = {
      ex: axis[1/unit - 1 + axis_len/unit * 0][1], 
      ey: axis[1/unit - 1 + axis_len/unit * 1][1],
      ez: axis[1/unit - 1 + axis_len/unit * 2][1]
  };

  scatter.forEach(function(d, i){
    lines.push(...lib.create_segments(d));
    if (i == 0) {
      lines.centroid_z = 900;
    }
  });

  lib.plot_lines(axis, tt);

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
  uTvv_line.text = 'v\u1d40u = '.concat(uTv.toFixed(3));
  uTvv_line.text_color = 0;
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

  let [lines_u, texts_u] = lib.text_matrix_to_list(
          [[{text: u.coord.x.toFixed(2), key: 'xu'}],
           [{text: u.coord.y.toFixed(2), key: 'yu'}]], 
          [start_coord_x, start_coord_y], size, w_unit, h_unit
          ),
      [lines_plus, texts_plus] = lib.text_matrix_to_list(
          [[{text: '+', text_color: 0, key: 'fplus'}]],
          [start_coord_x - col_unit * 0.5, start_coord_y], size, w_unit, h_unit
          ),
      [lines_multi, texts_multi] = lib.text_matrix_to_list(
          [[{text: '\u00D7', text_color: 0, key: 'fmulti'}],
           [{text: '\u00D7', text_color: 0, key: 'smulti'}]], 
          [start_coord_x + col_unit, start_coord_y], size, w_unit, h_unit
          ),
      [lines_v, texts_v] =  lib.text_matrix_to_list(
          [[{text: v.coord.x.toFixed(2), key: 'xv'}],
           [{text: v.coord.y.toFixed(2), key: 'yv'}]], 
          [start_coord_x + col_unit * 1.5, start_coord_y], size, w_unit, h_unit
          );

  let big_line = [{x: start_coord_x - 0.1,
                   y: end_matrix_y + row_unit * 2/5},
                  {x: start_coord_x + col_unit * 2.65,
                   y: end_matrix_y + row_unit * 2/5,
                   color: 0}
                 ],
      uTv_texts = [{text: 'v\u1d40u =',
                    x: start_coord_x - col_unit,
                    y: end_matrix_y + row_unit * 1.25,
                    text_color: 0, key: 'uTv_text'},
                   {text: uTv.toFixed(3),
                    x: start_coord_x + col_unit * 2/3,
                    y: end_matrix_y + row_unit * 1.25,
                    text_color: 0, key: 'uTv_numb'}
                  ],
      hide_z_texts = [{text: '', x: start_coord_x,
                       y: start_coord_y + row_unit,
                       text_opacity: 0, key: 'zu'},
                      {text: '',
                       x: start_coord_x + col_unit * 1.5,
                       y: start_coord_y + row_unit,
                       text_opacity: 0, key: 'zv'}
                     ],
      hide_sign_texts = [{text:'+',
                          x: start_coord_x - col_unit * 0.5,
                          y: start_coord_y + row_unit,
                          text_color: 0, text_opacity: 0, key: 'splus'},
                         {text:'\u00D7',
                          x: start_coord_x + col_unit,
                          y: start_coord_y + row_unit,
                          text_color: 0, text_opacity: 0, key: 'tmulti'}
                        ];

  big_line.stroke_width = 0.7;

  let texts_to_show = [];
  texts_to_show.push(...texts_u);
  texts_to_show.push(...texts_v);
  texts_to_show.push(...texts_plus);
  texts_to_show.push(...texts_multi);
  texts_to_show.push(...hide_z_texts);
  texts_to_show.push(...hide_sign_texts);
  texts_to_show.push(...uTv_texts);
  texts_to_show.push(u_cell, v_cell);

  let lines_to_show = [];  
  lines_to_show.push(...lines_u);
  lines_to_show.push(...lines_v);
  lines_to_show.push(big_line);

  lib.plot_texts(texts_to_show, tt, 'texts');
  lib.plot_lines(lines_to_show, tt, 'lines');

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

  expectedScatter = lib.rotate_points(scatter, startAngleX, startAngleY, startAngleZ);
  expectedAxis = lib.rotate_lines(axis, startAngleX, startAngleY, startAngleZ);
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
}

function dragged_point_only(){
  if (!drag_on_left) {
    return;
  }

  angle_z = lib.get_drag_angle_2d();

  expectedScatter = lib.rotate_points(scatter, 0, 0, angle_z);
  
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

return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);}
};

})();