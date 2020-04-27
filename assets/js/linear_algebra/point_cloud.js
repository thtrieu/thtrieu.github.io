var point_cloud = (function() {

var origin = [150, 120], 
  j = 10, 
  scale = 10, 
  scatter = [], 
  yLine = [], xGrid = [], 
  beta = 0, 
  alpha = 0, 
  key = function(d){ return d.id; }, 
  startAngle = Math.PI/4;

var svg    = d3.select("#svg_lone_vector").call(d3.drag().on('drag', dragged).on('start', dragStart).on('end', dragEnd)).append('g');
var color  = d3.scaleOrdinal(d3.schemeCategory20);
var mx, my, mouseX, mouseY;

var point3d = d3._3d()
  .x(function(d){ return d.x; })
  .y(function(d){ return d.y; })
  .z(function(d){ return d.z; })
  .origin(origin)
  .rotateY( startAngle)
  .rotateX(-startAngle)
  .scale(scale);


var rotated_z_to_size = d3.scaleLinear()
                          .domain([-9, 9])
                          .range([4, 5]);

var rotated_z_to_opacity = d3.scaleLinear()
                          .domain([-9, 9])
                          .range([0.5, 1.0]);


function processData(scatter, tt){

  var points = svg.selectAll('circle').data(scatter, key);

  points
    .enter()
    .append('circle')
    .attr('class', '_3d')
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
  scatter = [], yLine = [];

  for (var z=0; z < 10; z++){
    scatter.push({
        x: d3.randomUniform(-j, j-1)(),
        y: d3.randomUniform(-10, 10)(), 
        z: d3.randomUniform(-j, j-1)(),
        id: 'pointa_' + cnt++
    })
  }

  var points = point3d(scatter);
  processData(points, 1000);
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
  var points = point3d.rotateY(beta + startAngle).rotateX(alpha - startAngle)(scatter);
  processData(points, 0);
}

function dragEnd(){
  mouseX = d3.event.x - mx + mouseX;
  mouseY = d3.event.y - my + mouseY;
}

init();

return {init: function(){init();}};

})();
