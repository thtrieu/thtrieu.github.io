var point_location = (function() {

var origin = [150, 130], 
  j = 10, 
  scale = 10, 
  scatter = [], 
  xLine = [],
  yLine = [],
  zLine = [],
  expectedXLine = [],
  expectedYLine = [],
  expectedZLine = [],
  beta = 0, alpha = 0, 
  key = function(d){ return d.id; }, 
  startAngleX = Math.PI/8. * 2,
  startAngleY = -Math.PI/8.,
  startAngleZ = Math.PI/8.;


d3.range(0, 13, 1).forEach(
    function(d){ 
      xLine.push([d, 0, 0]); 
    }
);

d3.range(0, 13, 1).forEach(
    function(d){ 
      yLine.push([0, d, 0]); 
    }
);

d3.range(0, 13, 1).forEach(
    function(d){ 
      zLine.push([0, 0, d]); 
    }
);


var svg    = d3.select("#svg_point_location")
               .call(d3.drag()
                       .on('drag', dragged)
                       .on('start', dragStart)
                       .on('end', dragEnd))
               .append('g');

var color  = d3.scaleOrdinal(d3.schemeCategory20);
var mx, my, mouseX, mouseY, mouseXaxis, mouseYaxis;
var axis_color = d3.scaleOrdinal(d3['schemeCategory20c']);

var rotated_z_to_size = d3.scaleLinear()
                          .domain([-9, 9])
                          .range([4, 5.5]);

var rotated_z_to_txt_size = d3.scaleLinear()
                              .domain([-9, 9])
                              .range([9, 14]);

var rotated_z_to_txt_opacity = d3.scaleLinear()
                                 .domain([-9, 9])
                                 .range([0.2, 1.0]);

var rotated_z_to_opacity = d3.scaleLinear()
                          .domain([-9, 9])
                          .range([0.5, 1.0]);

var point3d = d3._3d()
  .x(function(d){ return d.x; })
  .y(function(d){ return d.y; })
  .z(function(d){ return d.z; })
  .origin(origin)
  .scale(scale);

var xScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .scale(scale);

var yScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .scale(scale);

var zScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .scale(scale);


var toggle_val = 'everything';

function setToggle(val){
  toggle_val = val;
}


function plotaxis(data, axis, name, dim){

  var scale = svg
      .selectAll('path.'.concat(name, 'Scale'))
      .data(data);
  scale
      .enter()
      .append('path')
      .attr('class', '_3d '.concat(name, 'Scale'))
      .merge(scale)
      .attr('d', axis.draw)
      .attr('stroke', 'grey')
      .attr('stroke-width', 1.5);
  scale.exit().remove();

  // data[0].forEach(function(d){
  //     var scale = svg
  //         .selectAll('line')
  //         .data([[d.rotated]]);
  //     scale
  //         .enter()
  //         .append('line')
  //         .attr('z',)
  //         .attr('class', '_3d '.concat(name, 'Axis'))
  //         .merge(scale)
  //         // .attr('d', axis.draw)
  //         .attr('fill', 'black')
  //         .attr('stroke', 'grey')
  //         .attr('stroke-width', 1.5);
  //     scale.exit().remove();
  // })

  var text = svg
      .selectAll('text.'.concat(name, 'Text'))
      .data(data[0]);

  text
      .enter()
      .append('text')
      .attr('class', '_3d '.concat(name, 'Text'))
      .attr('dx', '.3em')
      .merge(text)
      .each(function(d){
          d.centroid = {x: d.rotated.x, 
                        y: d.rotated.y, 
                        z: d.rotated.z};
      })
      .attr('x', function(d){ return d.projected.x; })
      .attr('y', function(d){ return d.projected.y; })
      .text(function(d, i){ 
          if (i % 5 == 0) {
            return i;
          } else if (i == 12) {
            return name;
          } else {
            return '';
          }
      })
      .attr('opacity', function(d){
          return rotated_z_to_txt_opacity(d.rotated.z);
      });
  text.exit().remove();
}

function processData(data, tt){

  basis = {
      ex: data[1][0][1], 
      ey: data[2][0][1], 
      ez: data[3][0][1],
  };

  var points = svg.selectAll('circle').data(data[0], key)
                  .each(function(d){})
                  .call(d3.drag()
                          .on('drag', function(d, i){draggedPoint(i);})
                          .on('start', function(){dragStart();})
                          .on('end', function(){dragEnd();}))

 points
    .enter()
    .append('circle')
    .attr('class', '_3d point')
    .attr('opacity', 0)
    .attr('cx', posPointX)
    .attr('cy', posPointY)
    .merge(points)
    .transition().duration(tt)
    .attr('r', function(d){
        return rotated_z_to_size(d.rotated.z);
    })
    // .attr('stroke', function(d){ return d3.color(color(d.id)).darker(1.5); })
    .attr('fill', function(d){ return color(d.id); })
    .attr('opacity', function(d){
        return rotated_z_to_opacity(d.rotated.z);
    })
    .attr('cx', posPointX)
    .attr('cy', posPointY);
  points.exit().remove();

  var text = svg
      .selectAll('text.'.concat(name, 'Text'))
      .data(data[0]);
  text
      .enter()
      .append('text')
      .attr('class', '_3d '.concat(name, 'Text'))
      .attr('dx', '.4em')
      .merge(text)
      .transition().duration(tt)
      .each(function(d){
          d.centroid = {x: d.rotated.x, 
                        y: d.rotated.y, 
                        z: d.rotated.z};
      })
      .style('font-size', function(d){
        return rotated_z_to_txt_size(d.rotated.z)
                  .toString()
                  .concat('px');
      })
      .attr('x', function(d){ return d.projected.x; })
      .attr('y', function(d){ return d.projected.y; })
      .attr('z', function(d){ return d.projected.z; })
      .text(function(d){
          var coord = dot_basis(d, basis);
          return '['.concat(
              coord.x.toFixed(1),
              ', ',
              coord.y.toFixed(1),
              ', ',
              coord.z.toFixed(1),
              ']');
      })
      .attr('opacity', function(d){
          return rotated_z_to_txt_opacity(d.rotated.z);
      });

  text.exit().remove();

  if (toggle_val == 'everything') {
    plotaxis(data[1], xScale3d, 'x', 0);
    plotaxis(data[2], yScale3d, 'y', 1);
    plotaxis(data[3], zScale3d, 'z', 2);
  }

  // console.log(svg.selectAll('._3d'));
  svg.selectAll('._3d').sort(d3._3d().sort);
  // console.log(svg.selectAll('._3d'));
  // text.sort(d3._3d().sort);
}


function dot_product(u, v){
  return u.x*v.x + u.y*v.y + u.z*v.z;
}


function dot_basis(d, basis){
  return {
      x: dot_product(d.rotated, basis.ex.rotated),
      y: dot_product(d.rotated, basis.ey.rotated),
      z: dot_product(d.rotated, basis.ez.rotated),
  };
}

function posPointX(d){
  return d.projected.x;
}

function posPointY(d){
  return d.projected.y;
}


function init(){
  var cnt = 0;
  scatter = [];

  for (var z=0; z < 3; z++){
    scatter.push([
        d3.randomUniform(-j+1, j-2)(),
        d3.randomUniform(-j+1, j-2)(), 
        d3.randomUniform(-j+1, j-2)()
    ]);
  }

  alpha = startAngleX;
  beta = startAngleY;

  expectedScatter = rotatePoints(scatter, alpha, beta, startAngleZ);
  expectedXLine = rotatePoints(xLine, alpha, beta, startAngleZ);
  expectedYLine = rotatePoints(yLine, alpha, beta, startAngleZ);
  expectedZLine = rotatePoints(zLine, alpha, beta, startAngleZ);
  
  var data = [
      point3d(annotatePoint(expectedScatter)),
      xScale3d([expectedXLine]),
      yScale3d([expectedYLine]),
      zScale3d([expectedZLine])
  ];

  processData(data, 1000);
  dragEnd();
}

function dragStart(){
  mx = d3.event.x;
  my = d3.event.y;
}

function dragged(){
  dx = d3.event.x - mx;
  dy = d3.event.y - my;

  alpha  = startAngleX - dy * Math.PI / 230;
  beta   = startAngleY + dx * Math.PI / 230;

  expectedScatter = rotatePoints(scatter, alpha, beta, startAngleZ);
  expectedXLine = rotatePoints(xLine, alpha, beta, startAngleZ);
  expectedYLine = rotatePoints(yLine, alpha, beta, startAngleZ);
  expectedZLine = rotatePoints(zLine, alpha, beta, startAngleZ);

  var data = [
      point3d(annotatePoint(expectedScatter)),
      xScale3d([expectedXLine]),
      yScale3d([expectedYLine]),
      zScale3d([expectedZLine])
  ];
  processData(data, 0);
}

function draggedPoint(i){
  dx = d3.event.x - mx;
  dy = d3.event.y - my;

  alpha  = startAngleX - dy * Math.PI / 230;
  beta   = startAngleY + dx * Math.PI / 230;

  expectedScatter = [];
  scatter.forEach(function(d, j){
      if (j == i) {
        expectedScatter.push(rotatePoint(d, alpha, beta, startAngleZ));
      } else {
        expectedScatter.push(d);
      }
  });
  expectedXLine = rotatePoints(xLine, startAngleX, startAngleY, startAngleZ);
  expectedYLine = rotatePoints(yLine, startAngleX, startAngleY, startAngleZ);
  expectedZLine = rotatePoints(zLine, startAngleX, startAngleY, startAngleZ);

  var data = [
      point3d(annotatePoint(expectedScatter)),
      xScale3d([expectedXLine]),
      yScale3d([expectedYLine]),
      zScale3d([expectedZLine])
  ];
  processData(data, 0);
}


function annotatePoint(points){
  result = [];
  points.forEach(function(d, i){
      result.push({x: d[0], 
                   y: d[1], 
                   z: d[2], 
                   id: 'point_' + i});
  });
  return result;
}

function rotatePoints(g, rx=0, ry=0, rz=0){
  var result = [];
  g.forEach(function(d){
    result.push(rotatePoint(d, rx, ry, rz));
  })
  return result;
}

function rotatePoint(p, rx=0, ry=0, rz=0){
  p = rotateX(p, rx);
  p = rotateY(p, ry);
  p = rotateZ(p, rz);
  return p;
}


function rotateX(p, a){
    var sa = Math.sin(a), ca = Math.cos(a);
    return [
        p[0],
        p[1] * ca - p[2] * sa,
        p[1] * sa + p[2] * ca
    ];
}

function rotateY(p, a){
    var sa = Math.sin(a), ca = Math.cos(a);
    return [
        p[2] * sa + p[0] * ca,
        p[1],
        p[2] * ca - p[0] * sa
    ];
}

function rotateZ(p, a){
    var sa = Math.sin(a), ca = Math.cos(a);
    return [
        p[0] * ca - p[1] * sa,
        p[0] * sa + p[1] * ca,
        p[2]
    ];
}


function dragEnd(){
  scatter = expectedScatter;
  xLine = expectedXLine;
  yLine = expectedYLine;
  zLine = expectedZLine;
  startAngleX = 0;
  startAngleY = 0;
  startAngleZ = 0;
}

init();

return {
  init: function(){init();},
  toggle: function(val){setToggle(val);}
};

})();