let dot_product_collide = (function() {

let origin = [300, 140], 
    scale = 70, 
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
                    if ( i == 0) {
                      dragged_point(i);
                    } else {
                      dragged_point_only();
                    }
                  },
                  drag_start_fn=drag_start,
                  drag_end_fn=drag_end);

  let acopy_of_texts_to_show = [
      [
          {text: ''}, {text: ''}, {text: ''}, 
          {text: ''}, {text: 'v', text_opacity:0, key: 'vv'},
      ], [
          {text: ''}, {text: ''}, {text: ''}, {text: ''},
          {text: v.coord.x.toFixed(2), text_opacity:0, key: 'xvv'},
      ], [
          {text: ''}, {text: ''}, {text: ''}, {text: ''},
          {text: v.coord.y.toFixed(2), text_opacity:0, key: 'yvv'},
      ], [
          {text: ''}, {text: ''}, {text: ''}, {text: ''},
          {text: v.coord.z.toFixed(2), text_opacity:0, key: 'zvv'},
      ], [
          {text: 'u\u1d40', text_opacity:0, key: 'uu'},
          {text: u.coord.x.toFixed(2), text_opacity:0, key: 'xuu'},
          {text: u.coord.y.toFixed(2), text_opacity:0, key: 'yuu'},
          {text: u.coord.z.toFixed(2), text_opacity:0, key: 'zuu'},
          {text: uTv.toFixed(3), text_opacity: 0, key: 'uTv'}
      ]
  ],
      texts_to_show = [
      [
          {text: ''}, {text: ''}, {text: ''}, 
          {text: ''}, {text: 'v', text_opacity: 1, key: 'v'},
      ], [
          {text: ''}, {text: ''}, {text: ''}, {text: ''},
          {text: v.coord.x.toFixed(2), text_opacity: 1, key: 'xv'},
      ], [
          {text: ''}, {text: ''}, {text: ''}, {text: ''},
          {text: v.coord.y.toFixed(2), text_opacity: 1, key: 'yv'},
      ], [
          {text: ''}, {text: ''}, {text: ''}, {text: ''},
          {text: v.coord.z.toFixed(2), text_opacity: 1, key: 'zv'},
      ], [
          {text: 'u\u1d40', text_opacity: 1, key: 'u'},
          {text: u.coord.x.toFixed(2), text_opacity: 1, key: 'xu'},
          {text: u.coord.y.toFixed(2), text_opacity: 1, key: 'yu'},
          {text: u.coord.z.toFixed(2), text_opacity: 1, key: 'zu'},
          {text: uTv.toFixed(3), color: 0, key: 'uTv', text_opacity: uTvv_opacity}
      ]
  ];

  let uTv_texts = [
      {text:'u\u1d40v = '.concat(uTv.toFixed(3)),
       x: (v.x * uTv/2).toFixed(2),
       y: (v.y * uTv/2).toFixed(2),
       color: 0,
       font_size: 15, tt: 0, key: 'uTv_texts'}
  ];
  
  uTv_texts[0].text_opacity = uTvv_opacity;

  let uTvv_line_text = [{text: 'u\u1d40v',
                         x: v.x * uTv/2, y: v.y * uTv/2,
                         text_opacity: 1,
                         color: 0, font_size: 15, key: 'uTvv_line_text'}];

  lib.plot_texts(uTv_texts, tt=0, name='uTv_texts');
  lib.plot_texts(uTvv_line_text, tt=0, name='uTvv_line_text');

  lib.plot_texts(lib.text_table_to_list(
      acopy_of_texts_to_show,
      start_coord_x=-2, start_coord_y=1.5,
      w_unit=0.26, h_unit=0.3,
      dws_array=[1.5, 2.0, 2.0, 2.0],
      dhs_array=[1.2, 1.2, 1.2, 1.2]), tt=0, name='acopy'
  );

  lib.plot_texts(lib.text_table_to_list(
      texts_to_show,
      start_coord_x=-2, start_coord_y=1.5,
      w_unit=0.26, h_unit=0.3,
      dws_array=[1.5, 2.0, 2.0, 2.0],
      dhs_array=[1.2, 1.2, 1.2, 1.2]), tt=0, name='transition'
  );

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

function drag_start(){
  lib.drag_start();
}

function dragged(){
  [angle_x, angle_y] = lib.get_drag_angles();

  expectedScatter = lib.rotate_points(scatter, angle_x, angle_y);
  expectedAxis = lib.rotate_lines(axis, angle_x, angle_y);
  
  plot(expectedScatter, 
       expectedAxis, 
       0);
}

function dragged_point_only(){
  [angle_x, angle_y] = lib.get_drag_angles();

  expectedScatter = lib.rotate_points(scatter, angle_x, angle_y);
  
  uTvv_opacity = 0;
  plot(expectedScatter, 
       expectedAxis, 
       0);
}

function dragged_point(i){
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
  scatter = expectedScatter;
  axis = expectedAxis;
}

function compute(u, v){
  let uTv = lib.dot_product(u, v);

  let texts_to_show = [
          {text: v.coord.x.toFixed(2), text_opacity: 0, tt: 900, key: 'xv'},
          {text: v.coord.y.toFixed(2), text_opacity: 0, tt: 600, key: 'yv'},
          {text: v.coord.z.toFixed(2), text_opacity: 0, tt: 300, key: 'zv'},
          {text: u.coord.x.toFixed(2), text_opacity: 0, tt: 900, key: 'xu'},
          {text: u.coord.y.toFixed(2), text_opacity: 0, tt: 600, key: 'yu'},
          {text: u.coord.z.toFixed(2), text_opacity: 0, tt: 300, key: 'zu'},
  ];
  
  for (i = 0; i < texts_to_show.length; i++) {
      texts_to_show[i].x =  0;
      texts_to_show[i].y = 2.94;
  };
  
  lib.plot_texts(texts_to_show, tt=0, name='transition');

  let acopy_of_texts_to_show = [
      [
          {text: ''}, {text: ''}, {text: ''}, 
          {text: ''}, {text: 'v', text_opacity: 1, key: 'vv'},
      ], [
          {text: ''}, {text: ''}, {text: ''}, {text: ''},
          {text: v.coord.x.toFixed(2), text_opacity: 1, key: 'xvv'},
      ], [
          {text: ''}, {text: ''}, {text: ''}, {text: ''},
          {text: v.coord.y.toFixed(2), text_opacity: 1, key: 'yvv'},
      ], [
          {text: ''}, {text: ''}, {text: ''}, {text: ''},
          {text: v.coord.z.toFixed(2), text_opacity: 1, key: 'zvv'},
      ], [
          {text: 'u\u1d40', text_opacity:1, key: 'uu'},
          {text: u.coord.x.toFixed(2), text_opacity: 1, key: 'xuu'},
          {text: u.coord.y.toFixed(2), text_opacity: 1, key: 'yuu'},
          {text: u.coord.z.toFixed(2), text_opacity: 1, key: 'zuu'},
          {text: uTv.toFixed(3), color: 0,
           text_opacity: 1, tt: 1000, key: 'uTv'}
      ]
  ];

  lib.plot_texts(lib.text_table_to_list(
      acopy_of_texts_to_show,
      start_coord_x=-2, start_coord_y=1.5,
      w_unit=0.26, h_unit=0.3,
      dws_array=[1.5, 2.0, 2.0, 2.0],
      dhs_array=[1.2, 1.2, 1.2, 1.2]), tt=0, name='acopy'
  );

  let uTv_texts = [{text:'u\u1d40v = '.concat(uTv.toFixed(3)), 
                    x: v.x * uTv/2, y: v.y * uTv/2,
                    text_opacity: 1, color: 0,
                    font_size: 15, tt: 1000, key: 'uTv_texts'}];

  lib.plot_texts(uTv_texts, tt=0, name='uTv_texts');
  
  uTvv_opacity = 1;
};

return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);},
  compute: function(){compute(scatter[0], scatter[1]);}
};


})();



