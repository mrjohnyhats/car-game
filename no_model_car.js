import * as THREE from 'https://cdn.skypack.dev/three'
import * as CANNON from 'https://github.com/schteppe/cannon.js/releases/download/v0.6.2/cannon.min.js'
import { GLTFLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/OBJLoader.js';
import utils from './utils.js'


class Sprite{
	constructor({obj, dx=0, dy=0, dz=0, dax=0, day=0, daz=0}={}){
		this.obj = obj
		this.dx = dx
		this.dy = dy
		this.dz = dz
		this.dax = dax
		this.day = day
		this.daz = daz
	}
	move(){
		// var t = parseFloat((utils.moveClock.getElapsedTime()*10000.0))
		var t = 1
		// console.log(t)
		this.obj.rotateX(this.dax*t)
		this.obj.rotateY(this.day*t)
		this.obj.rotateZ(this.daz*t)
		this.obj.translateX(this.dx*t)
		this.obj.translateY(this.dy*t)
		this.obj.translateZ(this.dz*t)
		// console.log(this.day*t)
	}
	getGroundSpeed(){
		return Math.sqrt(this.dx*this.dx + this.dz*this.dz)
	}
}

class Car extends Sprite {
	constructor({obj, dx=0, dy=0, dz=0, dax=0, day=0, daz=0}={}){
		super({obj,dx,dy,dz,dax,day,daz})
		this.gasPressed = false
		this.brakePressed = false
		this.wheelRotation = new THREE.Euler(0,0,0)
		this.drifting = false
		this.velocityAngle = this.obj.rotation.clone()
		this.velocityDax = 0
		this.velocityDay = 0
		this.velocityDaz = 0
	}
	move(){
		if(this.gasPressed){
			this.dz += 0.1
		}

		if(this.brakePressed){
			if(this.dz != 0){
				this.dz -= utils.minAbs(0.05, this.dz)
			} else {
				this.dz = -0.1
			}
		}

		// if(this.obj.rotation.y != this.wheelRotation.y && this.getGroundSpeed() > 0){
		// 	// sqrt((cos(curA) - cos(A) * groundSpeed)^2 + (sin(curA) - sin(A) * groundSpeed)^2) = 0.5
		// 	// ((cos(curA) - cos(A)) * groundSpeed)^2 + ((sin(curA) - sin(A)) * groundSpeed)^2 = 0.25
		// 	// groundSpeed^2((cos(curA) - cos(A))^2 + (sin(curA) - sin(A))^2) = 0.25
		// 	// (cos(curA) - cos(A))^2 + (sin(curA) - sin(A))^2 = 0.25/groundSpeed^2
		// 	// cos^2(curA) - 2*cos(curA)*cos(A) + cos^2(A) + sin^2(curA) - 2*sin(curA)*sin(A) + sin^2(A)
		// 	// 2 - 2*cos(curA)*cos(A) - 2*sin(curA)*sin(A) = 0.25/groundSpeed^2
		// 	// 2 - 2*cos(curA - A) = 0.25/groundSpeed^2
		// 	// 1 - cos(curA - A) = 0.125/groundSpeed^2
		// 	// 1 - 0.125/groundSpeed^2 = cos(curA - A)
		// 	// acos(1 - 0.125/groundSpeed^2) = curA - A
		// 	// A = curA - acos(1 - 0.125/groundSpeed^2)



		// 	var groundSpeed = this.getGroundSpeed()
		// 	var carRot = -1*Math.acos(1 - 0.001/Math.max(1, groundSpeed*groundSpeed/100))
		// 	if(this.obj.rotation.y < this.wheelRotation.y){
		// 		carRot *= -1
		// 	}
		// 	this.day = carRot

		// 	if(Math.abs(this.obj.rotation.y - this.wheelRotation.y) < 0.05){
		// 		this.obj.rotation.y = this.wheelRotation.y
		// 	}

		// 	if(this.obj.rotation.y + this.day/2 - this.wheelRotation.y < this.obj.rotation.y + this.day - this.wheelRotation){
		// 		// if half of this.day is closer to wheelrotation than this.day then divide this.day by 2
		// 		this.day /= 2

		// 	}

		// 	console.log(this.obj.rotation.y+' '+this.wheelRotation.y)
		// }
		var groundSpeed = this.getGroundSpeed()

		if(groundSpeed*groundSpeed > 10){
			this.startDrift()
		}

		if(this.wheelRotation.y != 0 && groundSpeed > 0){
			this.day = this.wheelRotation.y/10
			// this.day = this.wheelRotation.y/((Math.pow(groundSpeed, 1) + 40)/5)
			if(this.drifting){
				this.velocityDay = this.wheelRotation.y/Math.pow(Math.max(1.5, groundSpeed), 4)
				// console.log(this.velocityDay)
				// console.log(this.day)
			}
		}

		if(!this.drifting){
			super.move()
		} else {
			this.obj.rotateX(this.dax)
			this.obj.rotateY(this.day)
			this.obj.rotateZ(this.daz)
			this.velocityAngle.x += this.velocityDax 
			this.velocityAngle.y += this.velocityDay 
			this.velocityAngle.z += this.velocityDaz
			this.velocity = new THREE.Vector3(0,0,groundSpeed).applyEuler(this.velocityAngle)
			this.obj.position.x += this.velocity.x
			this.obj.position.y += this.velocity.y
			this.obj.position.z += this.velocity.z
		}
	}
	straightenWheels(){
		this.wheelRotation.y = 0
		this.day = 0
	}
	startDrift(){
		this.drifting = true
		this.velocityAngle = this.obj.rotation.clone()
	}
}

function makeWheel(){
	const geometry = new THREE.BoxBufferGeometry(33,12,12)
	const material = new THREE.MeshLambertMaterial({color: 0x333333})
	const wheel = new THREE.Mesh(geometry, material)
	return wheel
}

// function makeLambertCar(){
// 	const car = new THREE.Group()

// 	const backWheel = makeWheel()
// 	backWheel.position.y = 6
// 	backWheel.position.z = -18
// 	car.add(backWheel)

// 	const frontWheel = makeWheel()
// 	frontWheel.position.y = 6
// 	frontWheel.position.z = 18
// 	car.add(frontWheel)

// 	const body = new THREE.Mesh(
// 		new THREE.BoxBufferGeometry(30,15,60),
// 		new THREE.MeshLambertMaterial({color: 0x78b14b})
// 	)
// 	body.position.y = 12
// 	car.add(body)

// 	const cabin = new THREE.Mesh(
// 		new THREE.BoxBufferGeometry(24, 12, 33),
// 		new THREE.MeshLambertMaterial({color: 0xffffff})
// 	)

// 	cabin.position.z = -6
// 	cabin.position.y = 25.5
// 	car.add(cabin)

// 	return car
// }

function makeCar(){
	const car = new THREE.Group()

	const backWheel = makeWheel()
	backWheel.position.y = 6
	backWheel.position.z = -18
	car.add(backWheel)

	const frontWheel = makeWheel()
	frontWheel.position.y = 6
	frontWheel.position.z = 18
	car.add(frontWheel)

	const body = new THREE.Mesh(
		new THREE.BoxBufferGeometry(30,15,60),
		new THREE.MeshPhongMaterial({color: 0x18ffa0})
	)
	body.position.y = 12
	car.add(body)

	const cabin = new THREE.Mesh(
		new THREE.BoxBufferGeometry(24, 12, 33),
		new THREE.MeshPhongMaterial({color: 0xffffff})
	)

	cabin.position.z = -6
	cabin.position.y = 25.5
	car.add(cabin)

	car.position.set(0,0,0)

	return car
}

function makeTrack(){
	return new THREE.Mesh(
		new THREE.BoxBufferGeometry(100, 1, 1000),
		new THREE.MeshPhongMaterial({color: 0xff00ff})
	)
}

const scene = new THREE.Scene()

const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
scene.add(ambientLight)

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
directionalLight.position.set(300, 500, 200)
scene.add(directionalLight)

// const car = makeLambertCar()
// scene.add(car)

var carObj = makeCar()
var carSprite = new Car({obj: carObj})
scene.add(carSprite.obj)

document.addEventListener('keydown', (e)=>{
	if(e.keyCode == 87){
		carSprite.gasPressed = true
	} else if(e.keyCode == 83){
		carSprite.brakePressed = true
	}

	if(e.keyCode == 65){
		console.log('pressed')
		// carSprite.day = 0.1
		carSprite.wheelRotation.y = Math.PI/4
	} else if(e.keyCode == 68){
		// carSprite.day = -0.1
		carSprite.wheelRotation.y = -1*Math.PI/4
	}
})

document.addEventListener('keyup', (e)=>{
	if(e.keyCode == 87){
		carSprite.gasPressed = false
	} else if(e.keyCode == 83){
		carSprite.brakePressed = false 
	} else if(e.keyCode == 65 || e.keyCode == 68){
		console.log('set to 0')
		carSprite.straightenWheels()
	}
})

const track = makeTrack()
track.position.z = 500
scene.add(track)

// const point = new THREE.Mesh(
// 	new THREE.BoxBufferGeometry(3,100,3),
// 	new THREE.MeshLambertMaterial({color: 0xff0000})
// )
// point.position.set(0,50,20)
// scene.add(point)

const aspectRatio = window.innerWidth/window.innerHeight
const cameraWidth = 150
const cameraHeight = cameraWidth / aspectRatio

// const camera = new THREE.OrthographicCamera(
// 	cameraWidth/-2, //left
// 	cameraWidth/2, //right
// 	cameraHeight/2, //top
// 	cameraHeight/-2, //bottom
// 	0, // near plane
// 	1000 // far plane
// )

// camera.position.set(200,200,200)
// camera.lookAt(0,10,0)

const camera = new THREE.PerspectiveCamera(
	45, // view angle
	aspectRatio,
	1, // near plane
	10000 // far plane
)


camera.position.set(20,1000,-100)
camera.lookAt(20,10,200)


const renderer = new THREE.WebGLRenderer({antialias: true})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.render(scene, camera)
utils.moveClock.start()

renderer.setAnimationLoop(()=>{
	utils.moveClock.start()
	carSprite.move()
	renderer.render(scene, camera)
})

document.body.appendChild(renderer.domElement)
