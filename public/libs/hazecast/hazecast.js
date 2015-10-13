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