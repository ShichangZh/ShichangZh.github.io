function poisson(mean){
	var L = Math.exp(- mean);
	var p = 1.0;
	var k = 0;

	do {
	    k++;
	    p *= Math.random();
	} while (p > L);

	return k - 1
}
