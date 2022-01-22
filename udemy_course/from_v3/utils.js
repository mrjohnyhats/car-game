const makeWheelBody = function(wheel, wheelMaterial){
	var cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
	var wheelBody = new CANNON.Body({mass: 1, material: wheelMaterial});

	var qAngle = new CANNON.Quaternion();
	qAngle.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);

	wheelBody.addShape(cylinderShape, new CANNON.Vec3(), qAngle);

	return wheelBody
}

const makeLandscape = function(){
	let heightMatrix = [];
	let sizeX = 64, sizeY = 64;

	for (let i = 0; i < sizeX; i++) {
		heightMatrix.push([]);
		for (var j = 0; j < sizeY; j++) {
			var height = Math.cos(i / sizeX * Math.PI * 5) * Math.cos(j/sizeY * Math.PI * 5) * 2 + 2;
			if(i === 0 || i === sizeX-1 || j===0 || j === sizeY-1){
				height = 3;
			}
			heightMatrix[i].push(height);
		}
	}

	var hfShape = new CANNON.Heightfield(heightMatrix, {
		elementSize: 100 / sizeX
	});
	var hfBody = new CANNON.Body({ mass: 0 });
	hfBody.addShape(hfShape);
	hfBody.position.set(-sizeX * hfShape.elementSize / 2, -4, sizeY * hfShape.elementSize / 2);
	hfBody.quaternion.setFromAxisAngle( new CANNON.Vec3(1,0,0), -Math.PI/2);
	return hfBody
}