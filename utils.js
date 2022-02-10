const loader = new THREE.FBXLoader()

let magnetMesh;

loader.load('assets/magnet.fbx', (object)=>{
	object.traverse((child)=>{
		if(child.name == 'magnet'){
			magnetMesh = child
			magnetMesh.castShadow = true
		}
	})
})

class CannonBoxData {
	constructor({halfDims=new CANNON.Vec3(1,1,1), offset=new CANNON.Vec3(0,0,0), quat=new CANNON.Quaternion(1,0,0,0)}={}){
		this.halfDims = halfDims
		this.offset = offset
		this.quat = quat
	}
}

// const createCannonTrimesh = function(geometry){
// 	// if (!geometry.isBufferGeometry) return null;
// 	const vertices = geometry.vertices;
// 	let indices = [];
// 	for(let i=0; i<vertices.length; i++){
// 		indices.push(i);
// 	}
	
// 	return new CANNON.Trimesh(vertices, indices);
// }

const createCannonConvex = function(geometry){
	if (!geometry.isBufferGeometry) return null;

	// // geometry = geometry.toNonIndexed()
	// // geometry = THREE.BufferGeometryUtils.mergeVertices(geometry)

	// const floats = geometry.attributes.position.array;
	// console.log(floats)
	// const vertices = [];
	// const faces = [];
	// let face = [];

	// for(let i=0; i<floats.length; i+=3){
	// 	vertices.push(new CANNON.Vec3(floats[i], floats[i+1], floats[i+2]) );

	// 	if(geometry.index.count == 0){
	// 		face.push(index++);
	// 		if (face.length==3){
	// 			faces.push(face);
	// 			face = [];
	// 		}
	// 	}
	// }
	// if(geometry.index.count > 0){
	// 	geometry.index.array.forEach((i)=>{
	// 		face.push(i)
	// 		if(face.length == 3){
	// 			faces.push(face)
	// 			face = []
	// 		}
	// 	})
	// }
	// console.log(vertices)
	// console.log(faces)
	// console.log(new CANNON.ConvexPolyhedron(vertices, faces))
	// return new CANNON.ConvexPolyhedron(vertices, faces);

	// console.log(geometry)
	var newGeom = new THREE.BufferGeometry()
	newGeom.setAttribute('position', new THREE.BufferAttribute(geometry.attributes.position.array))
	// geometry = geometry.toNonIndexed()
	// newGeom.setAttribute('position', new THREE.BufferAttribute(geometry.attributes.position.array))
	// newGeom = newGeom.toIndexed()
	var vertices = newGeom.attributes.position.array
	var newVerts = []
	var newFaces = []

	for(var i = 0; i < vertices.length; i+=3){
		newVerts.push(new CANNON.Vec3(vertices[i], vertices[i+1], vertices[i+2]))
	}

	if(geometry.index != null){
		var faces = geometry.index.array

		for(var i = 0; i < faces.length; i+=3){
			newFaces.push([faces[i], faces[i+1], faces[i+2]])
		}
	} else {
		for(var i = 0; i < newVerts.length; i+=3){
			newFaces.push([i,i+1,i+2])
		}
	}
	
	console.log(newFaces)
	console.log(newVerts)
	var out = new CANNON.ConvexPolyhedron(newVerts, newFaces)
	out.computeNormals()
	out.computeEdges()
	// out.computeWorldFaceNormals()
	return new CANNON.ConvexPolyhedron(newVerts, newFaces)
}

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
	var shape = new CANNON.Cylinder(120, 120, 5, 40)
	// var shape = new CANNON.Box(new CANNON.Vec3(100, 3, 100))
	var body = new CANNON.Body({mass: 0, collisionFilterMask: 1, collisionFilterGroup: 1})
	body.addShape(shape)
	body.position.set(0,0,0)
	body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), Math.PI/2)
	// body.quaternion.setFromAxisAngle(new CANNON.Vec3(1,0,0), 0)
	return body
}

const makeRandColor = function(){
	var r = parseInt(Math.random()*255)
		var g = parseInt(Math.random()*255)
		var b = parseInt(Math.random()*255)
		return 'rgb('+r+','+g+','+b+')'
}

// const cannonFromMesh = function({mesh=(new THREE.BoxGeometry(2,2,2)), position=(new CANNON.Vec3(0,2,0)), scale=(new CANNON.Vec3(1,1,1)), mass=50}={}){
// 	if(!mesh.isBufferGeometry){
// 		mesh = new THREE.BufferGeometry(mesh)
// 	}

// 	// var vertices = []
// 	// mesh.vertices.forEach((v)=>{
// 	// 	vertices.push(new CANNON.Vec3(v.x,v.y,v.z))
// 	// })
// 	// faces = []
// 	// mesh.faces.forEach((face)=>{
// 	// 	faces.push([face.a,face.b,face.c])
// 	// })
// 	// var shape = new CANNON.ConvexPolyhedron(vertices, faces)
// 	var shape = createCannonConvex(mesh)
// 	// var shape = createCannonTrimesh(mesh)
// 	var body = new CANNON.Body({mass: mass})
// 	body.addShape(shape)
// 	body.position = position
// 	return body
// }

// const makeMagnet = function({position=(new CANNON.Vec3(0,2,0)), scale=(new CANNON.Vec3(1,1,1))}={}){
// 	return cannonFromMesh({mesh: magnetMesh, scale: scale, position: position})
// }

// // const makeCubeObstacle = function(position=(new CANNON.Vec3(0,0,0)), halfDims=(new CANNON.Vec3(5,5,5)), mass=100){
// // 	try{
// // 		var r = cannonFromMesh({mesh:(new THREE.BoxGeometry(halfDims.x,halfDims.y,halfDims.z)),halfDims:halfDims,position:position,mass:mass})
// // 		console.log(r)
// // 		return r
// // 	} catch(exp) {
// // 		console.error(exp)
// // 	}
// // }

const makeCubeObstacle = function(position=new CANNON.Vec3(0,0,0), halfDims=new CANNON.Vec3(5,5,5), mass=100){
	var shape = new CANNON.Box(halfDims)
	var body = new CANNON.Body({mass: mass})
	body.addShape(shape)
	body.position = position
	return body
}

const makeColliderBody = function(boxData, mass=50, scale=new CANNON.Vec3(1,1,1)){
	var body = new CANNON.Body({mass: mass})
	boxData.forEach((box)=>{
		var halfDims = new CANNON.Vec3(box.halfDims.x*scale.x,box.halfDims.y*scale.y,box.halfDims.z*scale.z)
		var shape = new CANNON.Box(halfDims)
		var offset = new CANNON.Vec3(box.offset.x*scale.x,box.offset.y*scale.y,box.offset.z*scale.z)
		body.addShape(shape, offset, box.quat)
	})
	return body
}

const boxDataFromMesh = function(mesh){
	const halfDims = new CANNON.Vec3(mesh.scale.x/100, mesh.scale.y/100, mesh.scale.z/100)
	const position = new CANNON.Vec3(mesh.position.x,mesh.position.y,mesh.position.z)
	const quaternion = new CANNON.Quaternion(mesh.quaternion.x,mesh.quaternion.y,mesh.quaternion.z,mesh.quaternion.w)
	// const quaternion = new CANNON.Quaternion(mesh.quaternion.x,mesh.quaternion.y,mesh.quaternion.z,mesh.quaternion.w)
	return new CannonBoxData({halfDims,offset:position,quat:quaternion})
}



