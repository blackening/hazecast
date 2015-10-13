function getWindVelocity(coord){
  coord = coord || [];

  var grids = gridAgent.value(),
    field = fieldAgent.value(),
    λ = coord[0],
    φ = coord[1];
  var wind = grids.primaryGrid.interpolate(λ, φ);
  return wind; //Format [vx, vy, |v|]
}


function coordToScreen(coord){
	return globe.projection(coord);
}

var bottomLeft = [95, -10];
var topRight = [121 , 6];

var HazeGrid = _.map(_.range(bottomLeft[0], topRight[0], 0.1), function(x){
	return _.map(_.range(bottomLeft[1], topRight[1], 0.1), function(y){
		return {
			x: x,
			y: y,
			mass: 0.1
		};
	});
});

//HazeGrid[long][lat] -> { x,y,mass }


var HazePoints = _.flatten(HazeGrid);

function render(){
	var gridPoints = d3.select("#foreground").selectAll("circle")
	.data(HazePoints);
	gridPoints.enter().append("circle")
	gridPoints.attr("cx", function(d,i,r){
		var pt = coordToScreen([d.x, d.y]);
		return pt[0];
	})
	gridPoints.attr("cy", function(d,i,r){
		var pt = coordToScreen([d.x, d.y]);
		return pt[1];
	})
	gridPoints.attr('r', function(d,i,r){
		return d.mass*10;
	})
	gridPoints.attr('fill', 'red');
}