var dot_product_formula = (function() {


var origin = [80, 130], 
  j = 3, 
  scale = 40, 
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

d3.range(0, j, 1).forEach(
    function(d){ 
      zLine.push([0, 0, d]); 
    }
);


var svg    = d3.select("#svg_dot_product_formula")
               .call(d3.drag()
                       .on('drag', dragged)
                       .on('start', dragStart)
                       .on('end', dragEnd))
               .append('g');

var color  = d3.scaleOrdinal(d3.schemeCategory20);
var mx, my, mouseX, mouseY, mouseXaxis, mouseYaxis;
var axis_color = d3.scaleOrdinal(d3['schemeCategory20c']);

var rotated_z_to_size = d3.scaleLinear()
                          .domain([-2, 2])
                          .range([4, 6]);

var rotated_z_to_txt_size = d3.scaleLinear()
                              .domain([-2, 2])
                              .range([9, 14]);

var rotated_z_to_txt_opacity = d3.scaleLinear()
                                 .domain([-2, 2])
                                 .range([0.2, 1.0]);

var rotated_z_to_thick_opacity = d3.scaleLinear()
                                 .domain([-2, 2])
                                 .range([1.0, 1.5]);

var rotated_z_to_opacity = d3.scaleLinear()
                          .domain([-1., 1.])
                          .range([0.7, 1.5]);

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

var arrow3d = d3._3d()
    .shape('LINE')
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
      .attr('z', function(d){ return d.z; })
      .text(function(d, i){ 
          if (i == 2) {
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


function project(d){
    return {
        x: origin[0] + scale * d.x,
        y: origin[1] + scale * d.y
    };
}

function formula() {
  positions = [
      {x: 2.1, y: 0.0, z:0.0},
      {x: 2.1, y: 0.5, z:0.0}
  ];

  var text = svg
      .selectAll('text.'.concat(name, 'Text'))
      .data(point3d(positions));
  text
      .enter()
      .append('text')
      .attr('class', '_3d '.concat(name, 'Text'))
      .attr('dx', '.4em')
      .merge(text)
      .each(function(d){
          d.centroid = {x: d.rotated.x, 
                        y: d.rotated.y, 
                        z: d.rotated.z};
      })
      .style('fill', 'black')
      .style('font-size', 14)
      .attr('x', function(d){ return project(d).x; })
      .attr('y', function(d){ return project(d).y; })
      .attr('z', function(d){ return project(d).z; })
      .text(function(d, i){
        return i
      });

  text.exit().remove();
}
  

function processData(scatter, xline, yline, zline, tt){

  // scatter = [scatter[0], scatter[1]];

  u = scatter[0];
  v = scatter[1];
  var uv = dot_product(u, v);
  scatter[2] = {
      x: v.x * uv,
      y: v.y * uv,
      z: 0
  };
  uvv = scatter[2];

  basis = {
      ex: xline[1], 
      ey: yline[1], 
      ez: zline[1],
  };

  var scatter = point3d(scatter);
  var xline = xScale3d([xline]);
  var yline = yScale3d([yline]);
  var zline = zScale3d([zline]);

  var arrows = [[
      {x: uvv.x, y:uvv.y, z:uvv.z},
      {x: u.x, y:u.y, z:u.z}
  ]];
  scatter.forEach(function(d){
    arrows.push([
        {x: 0., y:0., z:0.}, 
        {x: d.x, y:d.y, z:d.z, id:d.id}
    ])
  });
  // console.log(arrows)=

  var lines = svg.selectAll('line').data(arrow3d(arrows));
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
    .attr('stroke-width', function(d){
        return rotated_z_to_thick_opacity(d[1].z)
    })
    .attr('x1', function(d){ return project(d[0]).x; })
    .attr('y1', function(d){ return project(d[0]).y; })
    .attr('x2', function(d){ return project(d[1]).x; })
    .attr('y2', function(d){ return project(d[1]).y; })
    .attr('opacity', function(d){
        return rotated_z_to_opacity(d[1].z);
    });

  lines.exit().remove();

  var points = svg.selectAll('circle').data(point3d(scatter), key)
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
    .attr('r', function(d, i){
      if (i == 2) {
        return 0;
      }
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

  formula();

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
      .each(function(d){
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
      .style('font-size', function(d){
        return rotated_z_to_txt_size(d.rotated.z)
                  .toString()
                  .concat('px');
      })
      .attr('x', function(d){ return d.projected.x; })
      .attr('y', function(d){ return d.projected.y; })
      .attr('z', function(d){ return d.z; })
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
                ', ',
                coord.z.toFixed(1),
                ']');
          } else {
            return name.concat(
                ' = ', uv.toFixed(2)
            );
          }
      })
      .attr('opacity', function(d, i){
          if (i == 2) {
            return 1.0;
          }
          return rotated_z_to_txt_opacity(d.rotated.z);
      });

  text.exit().remove();

  if (toggle_val == 'everything') {
    plotaxis(xline, xScale3d, 'x', 0);
    plotaxis(yline, yScale3d, 'y', 1);
    plotaxis(zline, zScale3d, 'z', 2);
  }

  // console.log(svg.selectAll('._3d').sort);
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

  v = [
      1./Math.sqrt(14.),
      -2./Math.sqrt(14.),
      3./Math.sqrt(14.),
  ];

  u = [
      1.3,
      1.3,
      -1.3
  ];

  uv = u[0] * v[0] + u[1] * v[1] + u[2] * v[2];
  scatter[2] = {
      x: v.x * uv,
      y: v.y * uv,
      z: 0
  };
  uvv = [
      v[0] * uv,
      v[1] * uv,
      v[2] * uv
  ]

  scatter = [
      u,
      v,
      uvv
  ]


  alpha = startAngleX;
  beta = startAngleY;

  expectedScatter = rotatePoints(scatter, alpha, beta, startAngleZ);
  expectedXLine = rotatePoints(xLine, alpha, beta, startAngleZ);
  expectedYLine = rotatePoints(yLine, alpha, beta, startAngleZ);
  expectedZLine = rotatePoints(zLine, alpha, beta, startAngleZ);

  processData(annotatePoint(expectedScatter), 
              expectedXLine,
              expectedYLine,
              expectedZLine,
              1000);
  dragEnd();
}

function dragStart(){
  mx = d3.event.x;
  my = d3.event.y;
}

function dragged(rotateAxes=true){
  dx = d3.event.x - mx;
  dy = d3.event.y - my;

  alpha  = startAngleX - dy * Math.PI / 230;
  beta   = startAngleY + dx * Math.PI / 230;

  expectedScatter = rotatePoints(scatter, alpha, beta, startAngleZ);
  if (rotateAxes) {
    expectedXLine = rotatePoints(xLine, alpha, beta, startAngleZ);
    expectedYLine = rotatePoints(yLine, alpha, beta, startAngleZ);
    expectedZLine = rotatePoints(zLine, alpha, beta, startAngleZ);
  }

  processData(annotatePoint(expectedScatter), 
              expectedXLine,
              expectedYLine,
              expectedZLine,
              0);
}

function draggedPoint(i){
  if (i > 0){
    dragged(rotateAxes=false);
    return;
  }
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

  processData(annotatePoint(expectedScatter), 
              expectedXLine,
              expectedYLine,
              expectedZLine,
              0);
}


function annotatePoint(points){
  result = [];
  points.forEach(function(d, i){
      result.push({x: d[0], 
                   y: d[1], 
                   z: d[2], 
                   id: i});
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