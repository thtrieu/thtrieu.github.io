(function() {

var origin = [150, 100], 
  j = 10, 
  scale = 10, 
  scatter = [], 
  xLine = [], 
  yLine = [], 
  zLine = [], 
  beta = 0, 
  alpha = 0, 
  key = function(d){ return d.id; }, 
  startAngleX = 0.;
  startAngleZ = 0.;
  startAngleY = 0.;

var svg    = d3.select("#svg_point_coord_lines2d")
               .call(d3.drag()
                       .on('drag', dragged)
                       .on('start', dragStart)
                       .on('end', dragEnd))
               .append('g');

var color  = d3.scaleOrdinal(d3.schemeCategory20);
var mx, my, mouseX, mouseY;

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

function processData(data, tt){

  var points = svg.selectAll('circle').data(data[0], key);

  points
    .enter()
    .append('circle')
    .attr('class', '_3d')
    .attr('opacity', 0)
    .attr('cx', posPointX)
    .attr('cy', posPointY)
    .merge(points)
    .transition().duration(tt)
    .attr('r', 1.5)
    .attr('stroke', function(d){ return d3.color(color(d.id)).darker(1.5); })
    .attr('fill', function(d){ return color(d.id); })
    .attr('opacity', 1)
    .attr('cx', posPointX)
    .attr('cy', posPointY);

  points.exit().remove();

  var xScale = svg.selectAll('path.xScale').data(data[1]);

  xScale
      .enter()
      .append('path')
      .attr('class', '_3d xScale')
      .merge(xScale)
      .attr('stroke', 'black')
      .attr('stroke-width', .5)
      .attr('d', xScale3d.draw);

  xScale.exit().remove();

  var yScale = svg.selectAll('path.yScale').data(data[2]);

  yScale
      .enter()
      .append('path')
      .attr('class', '_3d yScale')
      .merge(yScale)
      .attr('stroke', 'black')
      .attr('stroke-width', .5)
      .attr('d', yScale3d.draw);

  yScale.exit().remove();


  var zScale = svg.selectAll('path.zScale').data(data[3]);
  zScale
      .enter()
      .append('path')
      .attr('class', '_3d zScale')
      .merge(zScale)
      .attr('stroke', 'black')
      .attr('stroke-width', .5)
      .attr('d', zScale3d.draw);
  zScale.exit().remove();
  // d3.selectAll('._3d').sort(d3._3d().sort);
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

  for (var z=0; z < 10; z++){
    scatter.push({
        x: d3.randomUniform(-j, j-1)(),
        y: d3.randomUniform(-10, 10)(), 
        z: d3.randomUniform(-j, j-1)(),
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
  beta   = (d3.event.x - mx + mouseX) * Math.PI / 230 ;
  alpha  = (d3.event.y - my + mouseY) * Math.PI / 230  * (-1);
  var data = [
      point3d.rotateZ(beta + startAngleZ)(scatter),
      xScale3d.rotateZ(beta + startAngleZ)([xLine]),
      yScale3d.rotateZ(beta + startAngleZ)([yLine]),
      zScale3d.rotateZ(beta + startAngleZ)([zLine]),
  ];
  processData(data, 0);
}

function dragEnd(){
  mouseX = d3.event.x - mx + mouseX;
  mouseY = d3.event.y - my + mouseY;
}

init();

})();