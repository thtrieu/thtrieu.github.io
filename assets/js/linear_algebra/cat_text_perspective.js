let cat_text_perspective = (function() {

let origin = [300, 120], 
    scale = 60, 
    scatter = [], 
    axis = [],
    expectedAxis = [],
    startAngleX = Math.PI,
    startAngleY = 0.,
    startAngleZ = 0.,
    axis_len = 2,
    unit = axis_len/10,
    cat_vector = null,
    svg = null,
    lib = null;

function select_svg(svg_id) {
  svg = d3.select(svg_id);

  lib = space_plot_lib(
      svg,
      origin, 
      scale,
      is_2d=true);

  svg = svg.append('g');
}


function init(tt){
  let [w, h] = [450, 280];
  lib.plot_images([{
    path: '/assets/js/linear_algebra/cat_text.svg',
    x: -w/2/scale + 20/scale,
    y: -h/2/scale,
    z: 0,
    width: w,
  }, {
    path: '/assets/cat.jpg',
    x: -50/scale - 175/scale + 35/scale,
    y: -50/scale - 65/scale,
    z: 1,
    width: 100,
  }])
}

select_svg('#svg_cat_text_perspective');
init();

})();