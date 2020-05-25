var dot_product_project2d = (function() {

var origin = [150, 130], 
  j = 3, 
  scale = 50, 
  scatter = [], 
  xLine = [],
  yLine = [],
  expectedXLine = [],
  expectedYLine = [],
  beta = 0, alpha = 0, 
  key = function(d){ return d.id; }, 
  startAngleX = Math.PI,
  startAngleZ = 0.,
  startAngleY = 0.,
  center = [];

d3.range(0, j, 1).forEach(
    function(d){ 
      xLine.push([d, 0, 0]); 
    }
);

d3.range(0, j, 1).forEach(
    function(d){ 
      yLine.push([0, d, 0]); 
    }
);


var svg_select = d3.select("#svg_dot_product_project2d");
var svg = svg_select
          .call(d3.drag()
                  .on('drag', dragged)
                  .on('start', dragStart)
                  .on('end', dragEnd))
          .append('g');


var color  = d3.scaleOrdinal(d3.schemeCategory20);
var mx, my, mouseX, mouseY, mouseXaxis, mouseYaxis;
var axis_color = d3.scaleOrdinal(d3['schemeCategory20c']);

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

var arrow3d = d3._3d()
    .shape('LINE')
    .origin(origin)
    .scale(scale);


var toggle_val = 'everything';


function setToggle(val){
  toggle_val = val;
}


function project(d){
    return {
        x: origin[0] + scale * d.x,
        y: origin[1] + scale * d.y
    };
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
      .attr('stroke', 'grey')
      .attr('stroke-width', 1.5)
      .attr('d', axis.draw);

  scale.exit().remove();  

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
          if (i == 2) {
            return name;
          } else {
            return '';
          }
      })
  text.exit().remove();
}

function processData(scatter,
                     xline,
                     yline,
                     tt){

  u = scatter[0];
  v = scatter[1];
  var uv = dot_product(u, v);
  scatter[2] = {
      x: v.x * uv,
      y: v.y * uv,
      z: 0
  };
  uvv = scatter[2];
  // uv = scatter[2];

  basis = {
      ex: xline[1], 
      ey: yline[1], 
  };

  var xline = xScale3d([xline]);
  var yline = yScale3d([yline]);

  var arrows = [[
      {x: u.x, y:u.y, z:u.z},
      {x: uvv.x, y:uvv.y, z:uvv.z}
  ]];
  scatter.forEach(function(d){
    arrows.push([
        {x: 0., y:0., z:0.}, 
        {x: d.x, y:d.y, z:d.z, id:d.id}
    ]);
    // arrows.push([
    //     {x: d.x, y:d.y, z:d.z},
    //     {x: d.x+1, y:d.y+1, z:d.z+1, id:d.id}
    // ]);
  });
  var arrows = arrow3d(arrows);

  var lines = svg.selectAll('line').data(arrows);
  lines
    .enter()
    .append('line')
    .attr('class', '_3d line')
    .merge(lines)
    .transition().duration(tt)
    .each(function(d){})
    .style('stroke-dasharray', function(d, i) {
      if (i == 0) {
        return ('3, 3');
      }
      return;
    })
    .attr('fill', function(d){ return color(d[1].id); })
    .attr('stroke', function(d, i){ 
      if (i == 0) {
        return 'black';
      }
      return color(d[1].id); 
    })
    .attr('stroke-width', 1.5)
    .attr('opacity', 1)
    .attr('x1', function(d){ return project(d[0]).x; })
    .attr('y1', function(d){ return project(d[0]).y; })
    .attr('x2', function(d){ return project(d[1]).x; })
    .attr('y2', function(d){ return project(d[1]).y; });

  lines.exit().remove();

  var points = svg.selectAll('circle').data(point3d(scatter), key)
                  .call(d3.drag()
                          .on('drag', function(d, i){draggedPoint(i);})
                          .on('start', dragStart)
                          .on('end', dragEnd));

  points
    .enter()
    .append('circle')
    .attr('class', '_3d point')
    .attr('cx', posPointX)
    .attr('cy', posPointY)
    .merge(points)
    .transition().duration(tt)
    .attr('r', function(d, i) {
      if (i == 2) {
        return 0;
      }
      return 4
    })
    .attr('fill', function(d){ return color(d.id); })
    .attr('opacity', 1)
    .attr('cx', posPointX)
    .attr('cy', posPointY);

  scatter[2] = {
    x: uvv.x/2,
    y: uvv.y/2,
    z: 0
  };

  var text = svg
      .selectAll('text.'.concat(name, 'Text'))
      .data(point3d(scatter));
  text
      .enter()
      .append('text')
      .attr('class', '_3d '.concat(name, 'Text'))
      .attr('dx', '.4em')
      .merge(text)
      .transition().duration(tt)
      .each(function(d, i){
        d.centroid = {x: d.rotated.x, 
                      y: d.rotated.y, 
                      z: d.rotated.z};
      })
      .style('fill', function(d, i) {
        if (i < 2) {
          return 'black';
        }
        return color(d.id);
      })
      .attr('x', function(d){ return d.projected.x; })
      .attr('y', function(d){ return d.projected.y; })
      .text(function(d, i){
          var coord = dot_basis(d, basis);
          var name;
          if (i == 0) {
            name = 'u';
          } else if (i == 1) {
            name = 'v';
          } else {
            name = 'uv';
          }

          if (i < 2) {
            return name.concat(
                ' [',
                coord.x.toFixed(1),
                ', ',
                coord.y.toFixed(1),
                ']');
          } else {
            return name.concat(
                ' = ', uv.toFixed(2)
            );
          }
      })

  text.exit().remove();

  plotaxis(xline, xScale3d, 'x', 0);
  plotaxis(yline, yScale3d, 'y', 1);

  svg.selectAll('._3d').sort(d3._3d().sort);
}


function dot_product(u, v){
  return u.x*v.x + u.y*v.y;
}


function dot_basis(d, basis){
  return {
      x: dot_product(d.rotated, basis.ex.rotated),
      y: dot_product(d.rotated, basis.ey.rotated),
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

  v = [
      1./Math.sqrt(3.),
      Math.sqrt(2./3.),
      0 
  ];

  u = [
      -1.5,
      2.0,
      0,
  ];

  uv = u[0] * v[0] + u[1] * v[1]
  uv = [
      v[0] * uv,
      v[1] * uv,
      0
  ]

  scatter = [u, v, uv]

  gamma = startAngleZ;

  expectedScatter = rotatePoints(scatter, startAngleX, startAngleY, gamma);
  expectedXLine = rotatePoints(xLine, startAngleX, startAngleY, gamma);
  expectedYLine = rotatePoints(yLine, startAngleX, startAngleY, gamma);

  processData(annotatePoint(expectedScatter), 
              expectedXLine,
              expectedYLine,
              1000);
  dragEnd();
}

function getMouse(){
  return d3.mouse(svg_select.node());
}

function getMouseAtan2(){
  mouse = getMouse();
  return Math.atan2(mouse[1] - origin[1],
                    mouse[0] - origin[0]);
}

function dragStart(){
  atan0 = getMouseAtan2();
}

function dragged(rotateAxes=true){
  atan1 = getMouseAtan2();
  
  gamma = startAngleZ + atan1 - atan0;

  expectedScatter = rotatePoints(scatter, startAngleX, startAngleY, gamma);
  if (rotateAxes) {
    expectedXLine = rotatePoints(xLine, startAngleX, startAngleY, gamma);
    expectedYLine = rotatePoints(yLine, startAngleX, startAngleY, gamma);
  }

  processData(annotatePoint(expectedScatter), 
              expectedXLine,
              expectedYLine,
              0);
}

function draggedPoint(i){
  if (i > 0){
    dragged(rotateAxes=false);
    return;
  }
  expectedScatter = [];
  scatter.forEach(function(d, j){
      if (j == i) {
        mouse = getMouse();
        mouse = [mouse[0] - origin[0], mouse[1] - origin[1]];
        mouse = [mouse[0]/scale, mouse[1]/scale];
        expectedScatter.push([mouse[0], mouse[1], 0]);
      } else {
        expectedScatter.push(d);
      }
  });

  // expectedXLine = rotatePoints(xLine, startAngleX, startAngleY, startAngleZ);
  // expectedYLine = rotatePoints(yLine, startAngleX, startAngleY, startAngleZ);

  processData(annotatePoint(expectedScatter), 
              expectedXLine,
              expectedYLine, 
              0);
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