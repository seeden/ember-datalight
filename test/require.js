function capitaliseFirstLetter(string) {
	string = string.replace('./', '');
    string = string.charAt(0).toUpperCase() + string.slice(1);

    if(string === 'Mixed') string = 'MixedWrapper';
    return string;
}

function require(name) {
	name = capitaliseFirstLetter(name);

	return window[name];
}

module = {
	exports: {

	}
};