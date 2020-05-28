var point_arrow_location = (function() {


// !function(t,r){"object"==typeof exports&&"undefined"!=typeof module?r(exports):"function"==typeof define&&define.amd?define(["exports"],r):r(t.d3=t.d3||{})}(this,function(t){"use strict";function r(t,r,e,n){var o=Math.cos(r),u=Math.sin(r),a=Math.cos(e),d=Math.sin(e),c=Math.cos(n),i=Math.sin(n),f=o*d*i-u*c,p=o*d*c+u*i,y=u*a,x=u*d*i+o*c,h=u*d*c-o*i,s=-d,z=a*i,j=a*c;return{x:o*a*t.x+f*-t.y+p*t.z,y:y*t.x+x*-t.y+h*t.z,z:s*t.x+z*-t.y+j*t.z}}function e(t,r,e,n,o){return r===x.ortho?{x:e[0]+n*t.x,y:e[1]+n*t.y}:r===x.persp?{x:e[0]+n*t.x/(t.z+o),y:e[1]+n*t.y/(t.z+o)}:void 0}function n(t,n,o,u,a,d,c,i){for(var f=t.length-1;f>=0;f--){var p=t[f];p.rotated=r({x:p.x,y:p.y,z:p.z},o,u,a),p.projected=e(p.rotated,n,d,c,i)}return t}function o(t,n,o,u,a,d,c,i){for(var f=t.length-1;f>=0;f--){var p=t[f],y=p[0],x=p[1];y.rotated=r({x:y.x,y:y.y,z:y.z},o,u,a),x.rotated=r({x:x.x,y:x.y,z:x.z},o,u,a),y.projected=e(y.rotated,n,d,c,i),x.projected=e(x.rotated,n,d,c,i),p.lng=Math.sqrt(Math.pow(x.rotated.x-y.rotated.x,2)+Math.pow(x.rotated.y-y.rotated.y,2)+Math.pow(x.rotated.z-y.rotated.z,2)),p.midPoint={x:(y.x+x.x)/2,y:(y.y+x.y)/2,z:(y.z+x.z)/2}}return t}function u(t,r,e,n,o,u,a,d){for(var c=t.length-1;c>=0;c--);return t}function a(t,r,e,n,o,u,a,d){for(var c=t.length-1;c>=0;c--);return t}function d(t,n,o,u,a,d,c,i){for(var f=t.length-1;f>=0;f--){var p=t[f],y=p[0],x=p[1],h=p[2];y.rotated=r({x:y.x,y:y.y,z:y.z},o,u,a),x.rotated=r({x:x.x,y:x.y,z:x.z},o,u,a),h.rotated=r({x:h.x,y:h.y,z:h.z},o,u,a),y.projected=e(y.rotated,n,d,c,i),x.projected=e(x.rotated,n,d,c,i),h.projected=e(h.rotated,n,d,c,i),p.area=1}return t}function c(t,r,e,n,o,u,a,d){for(var c=t.length-1;c>=0;c--);return t}function i(t,r,e,n,o,u,a,d){for(var c=t.length-1;c>=0;c--);return t}function f(t){return"M"+t.projected.x+","+t.projected.y+"m"+-t.radius+",0a"+t.radius+","+t.radius+",0,1,1,"+2*t.radius+",0a"+t.radius+","+t.radius+",0,1,1,-"+2*t.radius+",0"}function p(t){return"M"+t[0].projected.x+","+t[0].projected.y+"L"+t[1].projected.x+","+t[1].projected.y}function y(t){return"M"+t[0].projected.x+","+t[0].projected.y+"L"+t[1].projected.x+","+t[1].projected.y+"L"+t[2].projected.x+","+t[2].projected.y}var x={ortho:"ortho",persp:"persp"},h=function(){function t(t){return M[v](t,e,j,l,g,h,s,z)}var r=x.ortho,e=(x.persp,r),h=[0,0],s=1,z=1,j=0,l=0,g=0,v="POINTS",M={POINTS:n,LINES:o,LINES_LOOP:u,LINES_STRIP:a,TRIANGLES:d,TRIANGLES_STRIP:c,TRIANGLES_FAN:i},I={POINTS:f,LINES:p,TRIANGLES:y};return t.projection=function(r){return arguments.length?(e=r,t):e},t.origin=function(r){return arguments.length?(h=r,t):h},t.scale=function(r){return arguments.length?(s=r,t):s},t.distance=function(r){return arguments.length?(z=r,t):z},t.rotateZ=function(r){return arguments.length?(j=r,t):j},t.rotateY=function(r){return arguments.length?(l=r,t):l},t.rotateX=function(r){return arguments.length?(g=r,t):g},t.primitiveType=function(r){return arguments.length?(v=r,t):v},t.draw=function(t){return I[v](t)},t};t._3d=h,Object.defineProperty(t,"__esModule",{value:!0})});


var origin = [150, 130], 
  j = 10, 
  scale = 10, 
  scatter = [], 
  xLine = [],
  yLine = [],
  zLine = [],
  npoint = 3,
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


var svg    = d3.select("#svg_point_arrow_location")
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

var rotated_z_to_thick_opacity = d3.scaleLinear()
                                 .domain([-9, 9])
                                 .range([1.0, 1.5]);

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


function project(d){
    return {
        x: origin[0] + scale * d.x,
        y: origin[1] + scale * d.y
    };
}

function processData(scatter, xline, yline, zline, tt){

  // scatter = [scatter[0], scatter[1]];

  basis = {
      ex: xline[1], 
      ey: yline[1], 
      ez: zline[1],
  };

  var scatter = point3d(scatter);
  var xline = xScale3d([xline]);
  var yline = yScale3d([yline]);
  var zline = zScale3d([zline]);

  var arrows = [];
  scatter.forEach(function(d){
    arrows.push([
        {x: 0., y:0., z:0.}, 
        {x: d.x, y:d.y, z:d.z, id:d.id}
    ])
  });
  // console.log(arrows)
  var arrows = arrow3d(arrows);

  var lines = svg.selectAll('line').data(arrows);
  lines
    .enter()
    .append('line')
    .attr('class', '_3d line')
    .merge(lines)
    .transition().duration(tt)
    .each(function(d){})
    .attr('fill', function(d){ return color(d[1].id); })
    .attr('stroke', function(d){ return color(d[1].id); })
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

  var points = svg.selectAll('circle').data(scatter, key)
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
      .selectAll('text.Text')
      .data(scatter);
  text
      .enter()
      .append('text')
      .attr('class', '_3d Text')
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

  for (var z=0; z < npoint; z++){
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

function dragged(){
  dx = d3.event.x - mx;
  dy = d3.event.y - my;

  alpha  = startAngleX - dy * Math.PI / 230;
  beta   = startAngleY + dx * Math.PI / 230;

  expectedScatter = rotatePoints(scatter, alpha, beta, startAngleZ);
  expectedXLine = rotatePoints(xLine, alpha, beta, startAngleZ);
  expectedYLine = rotatePoints(yLine, alpha, beta, startAngleZ);
  expectedZLine = rotatePoints(zLine, alpha, beta, startAngleZ);

  processData(annotatePoint(expectedScatter), 
              expectedXLine,
              expectedYLine,
              expectedZLine,
              0);
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