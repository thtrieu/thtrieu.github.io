let dot_product_collide2d = (function() {

let origin = [300, 140], 
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
    uTvv_opacity = 0;


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
      ex: axis[1/unit -1 + axis_len/unit * 0][1], 
      ey: axis[1/unit -1 + axis_len/unit * 1][1],
      ez: {x: 0, y: 0, z: 0}, // dummy 
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
  }

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

  let acopyof_texts_to_show = [
      [
          {text: ''}, {text: ''}, 
          {text: ''}, {text: 'v', text_opacity: 0, key: 'vv'},
      ], [
          {text: ''}, {text: ''}, {text: ''},
          {text: v.coord.x.toFixed(2), text_opacity: 0, key: 'xvv'},
      ], [
          {text: ''}, {text: ''}, {text: ''}, 
          {text: v.coord.y.toFixed(2), text_opacity: 0, key: 'yvv'},
      ], [
          {text: 'u\u1d40', text_opacity: 0, key: 'uu'},
          {text: u.coord.x.toFixed(2), text_opacity: 0, key: 'xuu'},
          {text: u.coord.y.toFixed(2), text_opacity: 0, key: 'yuu'},
          {text: uTv.toFixed(3), text_opacity: 0, key:'uTv'}
      ]
  ],
      texts_to_show = [
      [
          {text: ''}, {text: ''}, 
          {text: ''}, {text: 'v', text_opacity: 0.7, key: 'v'},
      ], [
          {text: ''}, {text: ''}, {text: ''},
          {text: v.coord.x.toFixed(2), text_opacity: 0.7, key: 'xv'},
      ], [
          {text: ''}, {text: ''}, {text: ''}, 
          {text: v.coord.y.toFixed(2), text_opacity: 0.7, key: 'yv'},
      ], [
          {text: 'u\u1d40', text_opacity: 0.7, key: 'u'},
          {text: u.coord.x.toFixed(2), text_opacity: 0.7, key: 'xu'},
          {text: u.coord.y.toFixed(2), text_opacity: 0.7, key: 'yu'},
          {text: uTv.toFixed(3), font_size: 15, color: 0,
           text_opacity: uTvv_opacity, key:'uTv'}
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
      acopyof_texts_to_show,
      start_coord_x=-2.2, start_coord_y=2.2,
      w_unit=0.26, h_unit=0.3,
      dws_array=[1.5, 3.5, 3.5],
      dhs_array=[1.2, 1.3, 1.3]), tt=0, name='acopy'
  );

  lib.plot_texts(lib.text_table_to_list(
      texts_to_show,
      start_coord_x=-2.2, start_coord_y=2.2,
      w_unit=0.26, h_unit=0.3,
      dws_array=[1.5, 3.5, 3.5],
      dhs_array=[1.2, 1.3, 1.3]), tt=0, name='transition'
  );

  lib.sort();

}

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
  uTvv_opacity = 0;

  expectedScatter = lib.rotate_points(scatter, startAngleX, startAngleY, startAngleZ);
  expectedAxis = lib.rotate_lines(axis, startAngleX, startAngleY, startAngleZ);
  plot(expectedScatter, 
       expectedAxis, 
       tt);
  drag_end();
}

function drag_start(){
  lib.drag_start2d();
}

function dragged(printed_uTvv){
  angle_z = lib.get_drag_angle_2d();

  expectedScatter = lib.rotate_points(scatter, 0, 0, angle_z);
  expectedAxis = lib.rotate_lines(axis, 0, 0, angle_z);
  
  if (printed_uTvv==true){
    plot(expectedScatter, 
       expectedAxis, 
       0, printed_uTvv=true);  
  } else {
    plot(expectedScatter, 
       expectedAxis, 
       0);
  }
};


function dragged_point_only(printed_uTvv){
  angle_z = lib.get_drag_angle_2d();

  expectedScatter = lib.rotate_points(scatter, 0, 0, angle_z);

  uTvv_opacity = 0;
  plot(expectedScatter, 
       expectedAxis, 
       0);
}

function dragged_point(i,printed_uTvv){
  expectedScatter = [];
  scatter.forEach(function(d, j){
      if (j == i) {
        expectedScatter.push(
            lib.update_point_position_from_mouse(d));
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
          {text: v.coord.x.toFixed(2), text_opacity: 0,tt: 900, key: 'xv'},
          {text: v.coord.y.toFixed(2), text_opacity: 0,tt: 450, key: 'yv'},
          {text: u.coord.x.toFixed(2), text_opacity: 0, tt: 900, key: 'xu'},
          {text: u.coord.y.toFixed(2), text_opacity: 0, tt: 450, key: 'yu'},
  ];
  for (i = 0; i < texts_to_show.length; i++) {
      texts_to_show[i].x =  0;
      texts_to_show[i].y = 3.35;
  };
  
  lib.plot_texts(texts_to_show, tt=0, name='transition');

  let texts_to_show_again = [
      [
          {text: ''}, {text: ''}, 
          {text: ''}, {text: 'v', text_opacity: 0.6, key: 'vv'},
      ], [
          {text: ''}, {text: ''}, {text: ''},
          {text: v.coord.x.toFixed(2), text_opacity: 0.6, key: 'xvv'},
      ], [
          {text: ''}, {text: ''}, {text: ''}, 
          {text: v.coord.y.toFixed(2), text_opacity: 0.6, key: 'yvv'},
      ], [
          {text: 'u\u1d40', text_opacity: 0.6, key: 'uu'},
          {text: u.coord.x.toFixed(2), text_opacity: 0.6, key: 'xuu'},
          {text: u.coord.y.toFixed(2), text_opacity: 0.6, key: 'yuu'},
          {text: uTv.toFixed(3), color: 0,
           text_opacity: 1, font_size: 15, tt: 1000, key: 'uTv'}
      ]
  ];

  lib.plot_texts(lib.text_table_to_list(
      texts_to_show_again,
      start_coord_x=-2.2, start_coord_y=2.2,
      w_unit=0.26, h_unit=0.3,
      dws_array=[1.5, 3.5, 3.5],
      dhs_array=[1.2, 1.3, 1.3]), tt=0, name='acopy'
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
