import * as THREE from 'https://cdn.skypack.dev/three'
import { GLTFLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/OBJLoader.js';

const scene = new THREE.Scene()

const renderer = new THREE.WebGLRenderer()
renderer.setPixelRatio(window.devicePixelRatio)
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 1, 500)
camera.position.set(0,0,10)
camera.lookAt(0,0,0)

const light = new THREE.AmbientLight(0x00ff00, 0.000002)
light.position.set(0,20,0)
scene.add(light)

const pointLight = new THREE.PointLight(0xff0000, 0.000001)
pointLight.position.set(4,10,5)
scene.add(pointLight)

const GLTFloader = new GLTFLoader();
const OBJloader = new OBJLoader();

OBJloader.load('./mercedes.obj', (obj)=>{
	obj.position.set(0,0,0)
	scene.add(obj)
})

function render(){
	window.requestAnimationFrame(render)
	renderer.render(scene, camera)
}

render()
