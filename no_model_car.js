import * as THREE from 'https://cdn.skypack.dev/three'
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
		this.obj.rotateX(this.dax)
		this.obj.rotateY(this.day)
		this.obj.rotateZ(this.daz)
		this.obj.translateX(this.dx)
		this.obj.translateY(this.dy)
		this.obj.translateZ(this.dz)
	}
}

class Car extends Sprite {
	constructor({obj, dx=0, dy=0, dz=0, dax=0, day=0, daz=0}={}){
		super({obj,dx,dy,dz,dax,day,daz})
		this.gasPressed = false
		this.brakePressed = false
	}
	move(){
		super.move()
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
	} else if(e.keyCode == 65){
		carSprite.day = 0.1
	} else if(e.keyCode == 68){
		carSprite.day = -0.1
	}
})

document.addEventListener('keyup', (e)=>{
	if(e.keyCode == 87){
		carSprite.gasPressed = false
	} else if(e.keyCode == 83){
		carSprite.brakePressed = false 
	} else if(e.keyCode == 65 || e.keyCode == 68){
		carSprite.day = 0
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
	1000 // far plane
)


camera.position.set(20,100,-100)
camera.lookAt(20,10,100)


const renderer = new THREE.WebGLRenderer({antialias: true})
renderer.setSize(window.innerWidth, window.innerHeight)
renderer.render(scene, camera)

renderer.setAnimationLoop(()=>{
	carSprite.move()
	renderer.render(scene, camera)
})

document.body.appendChild(renderer.domElement)
