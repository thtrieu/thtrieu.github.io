var point_coord_lines = (function() {

var origin = [150, 125], 
  j = 10, 
  scale = 10, 
  scatter = [], 
  xLine = [],
  yLine = [], 
  zLine = [], 
  beta = 0, 
  alpha = 0, 
  key = function(d){ return d.id; }, 
  startAngleX = -Math.PI/8. * 3;
  startAngleZ = Math.PI/8.;
  startAngleY = 0.;

var svg    = d3.select("#svg_point_coord_lines")
               .call(d3.drag()
                       .on('drag', dragged)
                       .on('start', dragStart)
                       .on('end', dragEnd))
               .append('g');

var color  = d3.scaleOrdinal(d3.schemeCategory20);
var mx, my, mouseX, mouseY;

var rotated_z_to_size = d3.scaleLinear()
                          .domain([-9, 9])
                          .range([4, 5.5]);

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
  .rotateX(-startAngleX)
  .rotateY(startAngleY)
  .rotateZ(startAngleZ)
  .scale(scale);

var xScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .scale(scale)
    .rotateX(-startAngleX)
    .rotateY(startAngleY)
    .rotateZ(startAngleZ);

var yScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .scale(scale)
    .rotateX(-startAngleX)
    .rotateY(startAngleY)
    .rotateZ(startAngleZ);

var zScale3d = d3._3d()
    .shape('LINE_STRIP')
    .origin(origin)
    .scale(scale)
    .rotateX(-startAngleX)
    .rotateY(startAngleY)
    .rotateZ(startAngleZ);

function plotaxis(data, axis, name, dim){
  var scale = svg
      .selectAll('path.'.concat(name, 'Scale'))
      .data(data);

  scale
      .enter()
      .append('path')
      .attr('class', '_3d '.concat(name, 'Scale'))
      .merge(scale)
      .attr('stroke', 'black')
      .attr('stroke-width', 1.)
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
      .attr('y', function(d){ return d.projected.y+3; })
      .attr('z', function(d){ return d.projected.z; })
      .text(function(d){ 
          return d[dim] % 5 == 0 ? d[dim] : ''; 
      })
      .attr('opacity', function(d){
          return rotated_z_to_txt_opacity(d.rotated.z);
      });
  text.exit().remove();
}


function processData(data, tt){

  var points = svg.selectAll('circle').data(data[0], key);

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
    .attr('cx', posPointX)
    .attr('cy', posPointY)
    .attr('opacity', function(d){
        return rotated_z_to_opacity(d.rotated.z);
    });

  points.exit().remove();

  plotaxis(data[1], xScale3d, 'x', 0)
  plotaxis(data[2], yScale3d, 'y', 1)
  plotaxis(data[3], zScale3d, 'z', 2)

  svg.selectAll('._3d').sort(d3._3d().sort);
}

function posPointX(d){
  return d.projected.x;
}

function posPointY(d){
  return d.projected.y;
}

function init(){
  var cnt = 0;
  scatter = [],
  xLine = [],
  yLine = [],
  zLine = [];

  for (var z=0; z < 5; z++){
    scatter.push({
        x: d3.randomUniform(-j+1, j-2)(),
        y: d3.randomUniform(-j+1, j-2)(), 
        z: d3.randomUniform(-j+1, j-2)(),
        id: 'point_' + cnt++
    })
  }

  d3.range(0, 11, 1).forEach(
      function(d){ 
        xLine.push([d, 0, 0]); 
      }
  );
  d3.range(0, 11, 1).forEach(
      function(d){ 
        yLine.push([0, d, 0]); 
      }
  );
  d3.range(0, 11, 1).forEach(
      function(d){ 
        zLine.push([0, 0, d]); 
      }
  );

  var data = [
      point3d(scatter),
      xScale3d([xLine]),
      yScale3d([yLine]),
      zScale3d([zLine]),
  ];
  processData(data, 1000);
}

function dragStart(){
  mx = d3.event.x;
  my = d3.event.y;
}

function dragged(){
  mouseX = mouseX || 0;
  mouseY = mouseY || 0;

  dx = d3.event.x - mx;
  dy = d3.event.y - my;
  beta   = (mouseX + dx) * Math.PI / 230 ;
  alpha  = (mouseY + dy) * Math.PI / 230  * (-1);
  var data = [
      point3d.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)(scatter),
      xScale3d.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([xLine]),
      yScale3d.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([yLine]),
      zScale3d.rotateY(beta + startAngleY).rotateX(alpha - startAngleX)([zLine]),
  ];
  processData(data, 0);
}

function dragEnd(){
  mouseX += dx;
  mouseY += dy;
}

init();

return {
  init: function(){init();}
};

})();