const makeWheelBody = function(wheel, wheelMaterial, side){
	var cylinderShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 20);
	var wheelBody = new CANNON.Body({mass: 100, material: wheelMaterial});

	var qAngle = new CANNON.Quaternion();
	if(side == 'right'){
		qAngle.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), 3 * Math.PI / 2);
	} else if(side == 'left'){
		qAngle.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
	}

	wheelBody.addShape(cylinderShape, new CANNON.Vec3(), qAngle);

	return wheelBody
}

const makeLandscape = function(){
	let heightMatrix = [];

	//make little mountains
	let sizeX = 128, sizeY = 128;

	seedX = 10 + parseInt(Math.random()*10)
	seedY = 10 + parseInt(Math.random()*10)
	xUnit = sizeX/seedX
	yUnit = sizeY/seedY
	var seed = []
	var lastSeed = Math.random()*12-6
	for(var i = 0; i < seedY; i++){
		seed.push([])
		for(var j = 0; j < seedX; j++){
			seed[i].push(lastSeed + Math.random()*4-2)
			lastSeed = seed[i][seed[i].length-1]
		}
	}

	for (let i = 0; i < sizeX; i++) {
		heightMatrix.push([]);
		for (var j = 0; j < sizeY; j++) {
			var seedVal = seed[parseInt(Math.floor(i/yUnit))][parseInt(Math.floor(j/xUnit))]
			var height = Math.cos(i / sizeX * Math.PI * 5) * Math.cos(j/sizeY * Math.PI * 5) * seedVal + 2;
			// var height = Math.cos(i / sizeX * Math.PI * 5) * Math.cos(j/sizeY * Math.PI * 5) * 2 + 2;
			if(i === 0 || i === sizeX-1 || j===0 || j === sizeY-1){
				height = 3;
			}
			heightMatrix[i].push(height);
		}
	}
	// //make big mountain
	// for(let i = 30; i < 90; i++){
	// 	for(let j = 30; j < 90; j++){
	// 		var heightAddition = Math.cos((i-60)/90*3/2*Math.PI) * Math.cos((j-60)/90*3/2*Math.PI)*10
	// 		heightMatrix[i][j] += heightAddition
	// 	}
	// }

	// let bigHeightMatrix = []
	// for(let i = 0; i < 512; i++){
	// 	bigHeightMatrix.push([])
	// 	for(let j = 0; j < 512; j++){
	// 		if(i > 100 && i < 228 && j > 100 && j < 228){
	// 			bigHeightMatrix[i].push(heightMatrix[i-100][j-100])
	// 		} else {
	// 			bigHeightMatrix[i].push(1)
	// 		}
	// 	}
	// }

	var hfShape = new CANNON.Heightfield(heightMatrix, {
		elementSize: 2
		// elementSize: 100 / sizeX
	});
	var hfBody = new CANNON.Body({ mass: 0 });
	hfBody.addShape(hfShape);
	hfBody.position.set(-sizeX * hfShape.elementSize / 2, -4, sizeY * hfShape.elementSize / 2);
	hfBody.quaternion.setFromAxisAngle( new CANNON.Vec3(1,0,0), -Math.PI/2);
	return hfBody
}

const makePlane = function(){
	var shape = new CANNON.Cylinder(100, 100, 3, 40)
	// var shape = new CANNON.Box(new CANNON.Vec3(100, 3, 100))
	var body = new CANNON.Body({mass: 0})
	body.addShape(shape)
	body.position.set(0,0,0)
	body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), Math.PI/2)
	// body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), 0)
	return body
}

const makeCubeObstacle = function(position=new CANNON.Vec3(0,0,0), halfDims=new CANNON.Vec3(5,5,5), mass=100){
	var shape = new CANNON.Box(halfDims)
	var body = new CANNON.Body({mass: mass})
	body.addShape(shape)
	body.position = position
	return body
}