let dot_product_formula2d = (function() {

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
    lib = null;

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
      ex: axis[1/unit - 1 + axis_len * 0][1], 
      ey: axis[1/unit - 1 + axis_len * 1][1],
      ez: {x: 0, y: 0, z: 0}, // dummy 
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
  uTvv_line.text = 'u\u1d40v = '.concat(uTv.toFixed(3));
  uTvv_line.text_color = 0;

  lines.push(uTvv_line);

  let dash_line = [
      {x: u.x, y: u.y, z: u.z},
      {x: uTvv.x, y: uTvv.y, z: 0,
       tt:true}];
  
  dash_line.dash = true;
  dash_line.centroid_z = -1000;
  lines.push(dash_line);

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

  let texts_to_show = [
      [
          {text: 'u'}, {text: '= ['},  
          {text: u.coord.x.toFixed(2), color: 8},
          {text: ''}, {text: ''}, {text: ','},
          {text: u.coord.y.toFixed(2), color: 8},
          {text: ''}, {text: ''}, {text: ']'}
      ], [
          {text: 'v'}, {text: '= ['},
          {text: ''}, {text: ''},
          {text: v.coord.x.toFixed(2), color: 6},
          {text: ','}, {text: ''}, {text: ''},
          {text: v.coord.y.toFixed(2), color: 6},
          {text: ']'}
      ], [
          {text: 'u\u1d40v', color: 0}, {text: '='},
          {text: u.coord.x.toFixed(2), color: 8},
          {text: '\u00d7'},
          {text: v.coord.x.toFixed(2), color: 6},
          {text: '+'},
          {text: u.coord.y.toFixed(2), color: 8},
          {text: '\u00d7'},
          {text: v.coord.y.toFixed(2), color: 6},
          {text: ''},
      ], [
          {text: ''}, {text: '='},
          {text: uTv.toFixed(3), color: 0},
          {text: ''}, {text: ''}, {text: ''},
          {text: ''}, {text: ''}, {text: ''},
          {text: ''}
      ]
  ];

  lib.plot_texts(lib.text_table_to_list(
      texts_to_show,
      start_coord_x=-2.2, start_coord_y=2.2,
      col_unit=0.24, row_unit=0.3,
      dws_array=[1.7, 1.5, 2.4, 0.8, 2.4, 0.8, 2.4, 0.8, 2.4],
      dhs_array=[1.0, 1.8, 1.0])
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

function dragged(){
  angle_z = lib.get_drag_angle_2d();

  expectedScatter = lib.rotate_points(scatter, 0, 0, angle_z);
  expectedAxis = lib.rotate_lines(axis, 0, 0, angle_z);
  
  plot(expectedScatter, 
       expectedAxis, 
       0);
}

function dragged_point_only(){
  angle_z = lib.get_drag_angle_2d();

  expectedScatter = lib.rotate_points(scatter, 0, 0, angle_z);
  
  plot(expectedScatter, 
       expectedAxis, 
       0);
}

function dragged_point(i){
  expectedScatter = [];
  scatter.forEach(function(d, j){
      if (j == i) {
        expectedScatter.push(
            lib.update_point_position_from_mouse(d));
      } else {
        expectedScatter.push(d);
      }
  });

  plot(expectedScatter, 
       expectedAxis, 
       0);
}

function drag_end(){
  scatter = expectedScatter;
  axis = expectedAxis;
}

return {
  init: function(tt=0){init(tt);},
  select_svg: function(svg_id){select_svg(svg_id);}
};

})();