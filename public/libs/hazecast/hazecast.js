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

var step_size = 0.1;
var bottomLeft = [95, -10];
var topRight = [121 , 6];
var delta_t = 0.005;

var HazeGrid = _.map(_.range(bottomLeft[0], topRight[0], step_size), function(x){
	return _.map(_.range(bottomLeft[1], topRight[1], step_size), function(y){
		return {
			x: x,
			y: y,
			m: 0.0
		};
	});
});
//HazeGrid[long][lat] -> { x,y,mass }
var HazePoints = _.flatten(HazeGrid);

function populate_sources(){
	HazeGrid[140][110].m = 50;
}

var eps = 0.0001;

function step(){
	populate_sources();
	//Step 1: Mark next value.
	_.each(_.range(1, HazeGrid.length-1), function(x){
		_.each(_.range(1, HazeGrid[0].length - 1), function(y){
			var self = HazeGrid[x][y];
			var wind = getWindVelocity([self.x, self.y]);
			var left = HazeGrid[x-1][y];
			var right = HazeGrid[x+1][y];
			var top = HazeGrid[x][y+1];
			var bottom = HazeGrid[x][y-1];
			
			var self_approx = 0.25 * (left.m + right.m + top.m + bottom.m);
			var grad_term_x = delta_t * wind[0] / (2 * step_size) * (right.m - left.m);
			var grad_term_y = delta_t * wind[1] / (2 * step_size) * (top.m - bottom.m);
			self.next_m = self_approx - grad_term_x - grad_term_y;
			if(self.next_m < eps)
				self.next_m = 0;
		});
	});
	//Step 2: Update all values.
	_.each(_.range(1, HazeGrid.length-1), function(x){
		_.each(_.range(1, HazeGrid[0].length - 1), function(y){
			var self = HazeGrid[x][y];
			self.m = self.next_m;
		});
	});
}


//TODO: Convert to d3 canvas. Apparently its order of magnitudes faster than the SVG renderer.
function render(){
	var gridPoints = d3.select("#foreground").selectAll("circle")
	.data(HazePoints);
	
	var onEnter = gridPoints.enter().append("circle")
	onEnter.attr("cx", function(d,i,r){
		var pt = coordToScreen([d.x, d.y]);
		return pt[0];
	})
	onEnter.attr("cy", function(d,i,r){
		var pt = coordToScreen([d.x, d.y]);
		return pt[1];
	})
	onEnter.attr('fill', 'red');
	
	//Enter + Update
	gridPoints.attr('r', function(d,i,r){
		return Math.log(d.m+1);
	})
}

function run(n)
{
	for(var i = 0;i<n;i++){
		step();
	}
	render();
}
