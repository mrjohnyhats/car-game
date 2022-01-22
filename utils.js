import * as THREE from 'https://cdn.skypack.dev/three'

const utils = {
	minAbs: function(a, b){
		if(Math.abs(a) < Math.abs(b)){
			return a
		}
		return b
	},
	moveClock: new THREE.Clock(true)
}

export default utils