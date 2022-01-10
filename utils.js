const utils = {
	minAbs(a, b){
		if(Math.abs(a) < Math.abs(b)){
			return a
		}
		return b
	}
}

export default utils