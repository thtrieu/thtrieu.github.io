var point_coord_lines = (function() {

var origin = [150, 130], 
  j = 10, 
  scale = 10, 
  scatter = [], 
  axis = [],
  expectedAxis = [],
  beta = 0, alpha = 0, 
  key = function(d){ return d.id; }, 
  startAngleX = Math.PI/8. * 2,
  startAngleY = -Math.PI/8.,
  startAngleZ = Math.PI/8.,
  axisLen = 13;


function appendAxis(axis, name, ord) {
  d3.range(0, axisLen, 1).forEach(
      function(d){
        var id = '';
        if (d % 5 == 0) {
          id = d;
        } else if (d == axisLen-1) {
          id = name
        }
        var p1 = [0, 0, 0],
            p2 = [0, 0, 0];
        p1[ord] = d;
        p2[ord] = d+1;
        axis.push([
            {x: p1[0], y:p1[1], z:p1[2]},
            {x: p2[0], y:p2[1], z:p2[2], id:id}
        ]); 
      }
  );
}

appendAxis(axis, 'x', 0);
appendAxis(axis, 'y', 1);
appendAxis(axis, 'z', 2);


var svg    = d3.select("#svg_point_coord_lines")
               .call(d3.drag()
                       .on('drag', dragged)
                       .on('start', dragStart)
                       .on('end', dragEnd))
               .append('g');

var color  = d3.scaleOrdinal(d3.schemeCategory20);
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

var rotated_z_to_stroke_width = d3.scaleLinear()
                          .domain([-9, 9])
                          .range([1.0, 2.5]);

var point3d = d3._3d()
  .x(function(d){ return d.x; })
  .y(function(d){ return d.y; })
  .z(function(d){ return d.z; })
  .origin(origin)
  .scale(scale);


var axis3d = d3._3d()
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


function plot_lines(data){
  var scale = svg
      .selectAll('line')
      .data(data);
  scale
      .enter()
      .append('line')
      .attr('class', '_3d '.concat(name, 'line'))
      .merge(scale)
      .each(function(d){
        d.centroid = {
          x: (d[1].x+d[0].x)/2,
          y: (d[1].y+d[0].y)/2,
          z: (d[1].z+d[0].z)/2
        }
      })
      .attr('fill', 'grey')
      .attr('stroke', 'grey')
      .attr('stroke-width', function(d){ return rotated_z_to_stroke_width(d[1].z);})
      .attr('x1', function(d){ return project(d[0]).x; })
      .attr('y1', function(d){ return project(d[0]).y; })
      .attr('x2', function(d){ return project(d[1]).x; })
      .attr('y2', function(d){ return project(d[1]).y; })
      .attr('opacity', function(d){
          return rotated_z_to_opacity(d[1].z);
      });
  scale.exit().remove();

  var text = svg
      .selectAll('text.'.concat(name, 'Text'))
      .data(data);

  text
      .enter()
      .append('text')
      .attr('class', '_3d '.concat(name, 'Text'))
      .attr('dx', '.1em')
      .merge(text)
      .each(function(d){
          d.centroid = {x: d[1].x, 
                        y: d[1].y, 
                        z: d[1].z};
      })
      .style('font-size', function(d){
        return rotated_z_to_txt_size(d[1].z)
                  .toString()
                  .concat('px');
      })
      .attr('x', function(d){ return project(d[0]).x; })
      .attr('y', function(d){ return project(d[0]).y; })
      .text(function(d){
        return d[1].id;
      })
      .attr('opacity', function(d){
          return rotated_z_to_txt_opacity(d[1].z);
      });
  text.exit().remove();
}

function processData(scatter, axis, tt){

  basis = {
      ex: axis[axisLen * 0][1], 
      ey: axis[axisLen * 1][1], 
      ez: axis[axisLen * 2][1],
  };

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
    .merge(points)
    .transition().duration(tt)
    .attr('cx', function(d){return project(d).x})
    .attr('cy', function(d){return project(d).y})
    .each(function(d){
      d.centroid = {x: d.x, y: d.y, z: d.z};
    })
    .attr('r', function(d){
        return rotated_z_to_size(d.z);
    })
    .attr('fill', function(d){ return color(d.id); })
    .attr('opacity', function(d){
        return rotated_z_to_opacity(d.z);
    });

  plot_lines(axis);

  svg.selectAll('._3d').sort(d3._3d().sort);
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

  for (var z=0; z < 5; z++){
    scatter.push([
        d3.randomUniform(-j+1, j-2)(),
        d3.randomUniform(-j+1, j-2)(), 
        d3.randomUniform(-j+1, j-2)()
    ]);
  }

  alpha = startAngleX;
  beta = startAngleY;

  expectedScatter = rotatePoints(scatter, alpha, beta, startAngleZ);
  expectedAxis = rotateLines(axis, alpha, beta, startAngleZ);

  processData(annotatePoint(expectedScatter), 
              expectedAxis,
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
  expectedAxis = rotateLines(axis, alpha, beta, startAngleZ);

  processData(annotatePoint(expectedScatter), 
              expectedAxis,
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
  expectedAxis = rotateLines(axis, startAngleX, startAngleY, startAngleZ);

  processData(annotatePoint(expectedScatter), 
              expectedAxis,
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

function rotateLines(l, rx=0, ry=0, rz=0){
  var result = [];
  l.forEach(function(d){
    var p1 = Object.assign({}, d[0]);
    var p2 = Object.assign({}, d[1]);
    var r1 = rotatePoint([p1.x, p1.y, p1.z], rx, ry, rz);
    var r2 = rotatePoint([p2.x, p2.y, p2.z], rx, ry, rz);
    p1.x = r1[0];
    p1.y = r1[1];
    p1.z = r1[2];
    p2.x = r2[0];
    p2.y = r2[1];
    p2.z = r2[2];
    result.push([p1, p2]);
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
  axis = expectedAxis;
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