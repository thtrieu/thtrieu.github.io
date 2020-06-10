var dot_product_formula2d = (function() {

var origin = [150, 140], 
  scatter = [], 
  axis = [],
  expectedAxis = [],
  startAngleX = Math.PI,
  startAngleY = 0.,
  startAngleZ = 0.;

let scale = 60;
let axis_len = 2;
let unit = axis_len/10.;

var svg_select = d3.select("#svg_dot_product_formula2d");


var lib = space_plot_lib(
  svg_select,
  origin, 
  scale,
  is_2d=true);


svg = svg_select.call(d3.drag()
         .on('drag', dragged)
         .on('start', drag_start)
         .on('end', drag_end))
         .append('g');

axis = lib.init_float_axis(axis_len=axis_len, unit=unit);

function compute_uvv(u, v) {
  let uv = lib.dot_product(u, v);
  return {
      x: v.x * uv,
      y: v.y * uv,
      z: 0.,
      color: 0
  };
}


function plot(scatter, axis, tt){

  basis = {
      ex: lib.normalize(axis[axis_len/unit * 0][1]), 
      ey: lib.normalize(axis[axis_len/unit * 1][1]),
      ez: 0.
  };

  lib.plot_lines(axis);

  let u = scatter[0];
  let v = scatter[1];
  let uv = lib.dot_product(u, v);
  let uvv = compute_uvv(u, v);

  scatter.forEach(function(d){
    var coord = lib.dot_basis(d, basis);
    d.coord = coord;
    d.text = '['.concat(
        coord.x.toFixed(2),
        ', ',
        coord.y.toFixed(2),
        ']');
  })

  u.text = 'u = ' + u.text;
  v.text = 'v = ' + v.text;
  uvv.text = '';
  uvv.r = 0;

  scatter = [u, v, uvv];

  var lines = [];
  scatter.forEach(function(d){
    lines.push([
        {x: 0., y: 0., z: 0.},
        {x: d.x, y: d.y, z: d.z, 
         color: d.color, tt: true}
    ]);
  })

  arrow_uvv = lines[2];
  arrow_uvv.text = 'u\u1d40v = ' + uv.toFixed(3);
  arrow_uvv.text_color = arrow_uvv[1].color;
  arrow_uvv.centroid_z = 1000;

  dash_segment = [
      {x: u.x, y: u.y, z: u.z},
      {x: uvv.x, y: uvv.y, z: uvv.z}
  ];
  dash_segment.dash = true;
  lines.push(dash_segment);

  let x = '\u00d7';

  if (false) {
    text_table = [
        [{text: 'u = [', color: 4}, 
         {text: u.coord.x.toFixed(2), color: 4},
         {text: ''}, {text: ''},
         {text: ',', color: 4},
         {text: u.coord.y.toFixed(2), color: 4},
         {text: ''}, {text: ''},
         {text: ']', color: 4}],
        [{text: 'v = [', color: 2}, 
         {text: v.coord.x.toFixed(2), color: 2},
         {text: ''}, {text: ''},
         {text: ',', color: 2}, 
         {text: v.coord.y.toFixed(2), color: 2},
         {text: ''}, {text: ''},
         {text: ']', color: 2}],
        [{text: 'u\u1d40v = ', color: 0}, 
         {text: u.coord.x.toFixed(2), color: 4}, 
         {text: '\u00d7'},
         {text: v.coord.x.toFixed(2), color: 2},
         {text: '+'}, 
         {text: u.coord.y.toFixed(2), color: 4}, 
         {text: '\u00d7'},
         {text: v.coord.y.toFixed(2), color: 2},
         {text: '=' + uv.toFixed(3), color: 0}],
    ];

    lib.plot_texts(text_table_to_list(
        text_table, 
        x=-2, y=2.7,
        dhs=[0.3, 0.3],
        dws=[0.7, 0.6, 0.2, 0.6, 0.2, 0.6, 0.2, 0.6]), tt)
  } else {
    text_table = [
        [{text: 'u = ['}, 
         {text: u.coord.x.toFixed(2), color: 8},
         {text: ''}, {text: ''},
         {text: ','},
         {text: u.coord.y.toFixed(2), color: 6},
         {text: ''}, {text: ''},
         {text: ']'}],
        [{text: 'v = ['}, 
         {text: ''}, {text: ''},
         {text: v.coord.x.toFixed(2), color: 8},
         {text: ','}, 
         {text: ''}, {text: ''},
         {text: v.coord.y.toFixed(2), color: 6},
         {text: ']'}],
        [{text: 'u\u1d40v = ', color: 0}, 
         {text: u.coord.x.toFixed(2), color: 8}, 
         {text: '\u00d7'},
         {text: v.coord.x.toFixed(2), color: 8},
         {text: '+'}, 
         {text: u.coord.y.toFixed(2), color: 6}, 
         {text: '\u00d7'},
         {text: v.coord.y.toFixed(2), color: 6},
         {text: '=' + uv.toFixed(3), color: 0}],
    ];

    lib.plot_texts(text_table_to_list(
        text_table, 
        x=-2, y=2.7,
        dhs=[0.3, 0.3],
        dws=[0.7, 0.6, 0.2, 0.6, 0.2, 0.6, 0.2, 0.6]), tt)
  }

  lib.plot_lines(lines, tt, 'arrow');
  lib.plot_points(scatter, tt,
                  drag_point_fn=function(d, i){dragged_point(i)},
                  drag_start_fn=drag_start,
                  drag_end_fn=drag_end);
  lib.sort();
  mathjax();
}


function text_table_to_list(table, x, y, dhs, dws) {
  let nrow = table.length,
      ncol = table[0].length;

  let xs = [x], ys = [y];

  dws.forEach(function(dw){
    x += dw;
    xs.push(x);
  })

  dhs.forEach(function(dh){
    y += dh;
    ys.push(y);
  })

  let texts = [];
  for (var i = 0; i < nrow; i++){
    for (var j = 0; j < ncol; j++){
      text = table[i][j];
      text.x = xs[j];
      text.y = ys[i];
      text.z = 0.0;
      texts.push(text);
    }
  }

  return texts;
}


function init(){
  scatter = [];

  let u = {
      x: -1.0,
      y: -4.0/3.,
      z: 0.,
      color: 4
  };

  let v = {
      x: 1./Math.sqrt(3.),
      y: -Math.sqrt(2./3.),
      z: 0.,
      color: 2
  };

  let uvv = compute_uvv(u, v);

  scatter = [u, v, uvv]

  alpha = startAngleX;
  beta = startAngleY;

  expectedScatter = lib.rotate_points(scatter, alpha, beta, startAngleZ);
  expectedAxis = lib.rotate_lines(axis, alpha, beta, startAngleZ);
  plot(expectedScatter, 
       expectedAxis, 
       1000);
  drag_end();
}


function drag_start(){
  lib.drag_start2d();
}

function dragged(rotateAxes=true){
  angle_z = lib.get_drag_angle_2d();

  expectedScatter = lib.rotate_points(scatter, 0, 0, angle_z);
  if (rotateAxes) {
    expectedAxis = lib.rotate_lines(axis, 0, 0, angle_z);
  };
  
  plot(expectedScatter, 
       expectedAxis, 
       0);
}

function dragged_point(i){
  if (i > 0){
    dragged(rotateAxes=false);
    return;
  }

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
  startAngleX = 0;
  startAngleY = 0;
  startAngleZ = 0;
}

init();

function mathjax(){
  // MathJax.Hub.Queue(["Typeset",MathJax.Hub]);

  // setTimeout(() => {

  // console.log(svg_select.selectAll('.tick'));
  
  // MathJax.Hub.Register.StartupHook("End", function() {
  //   setTimeout(() => {
  //         svg.selectAll('.tick').each(function(){
  //           console.log(this);
  //           var self = d3.select(this),
  //               g = self.select('text>span>svg');
  //           g.remove();
  //           self.append(function(){
  //             return g.node();
  //           });
  //       });
  //     }, 1);
  //   });
  
  // MathJax.Hub.Queue(["Typeset", MathJax.Hub, svg.node()]);
    
  // }, 1);
}

return {
  init: function(){init();}
};

})();