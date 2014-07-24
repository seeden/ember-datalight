function capitaliseFirstLetter(string) {
	string = string.replace('./', '');
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function require(name) {
	name = capitaliseFirstLetter(name);

	return window[name];
}

module = {
	exports: {

	}
};