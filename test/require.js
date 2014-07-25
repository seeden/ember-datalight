function capitaliseFirstLetter(string) {
	string = string.split('/');
	string = string.pop();
    string = string.charAt(0).toUpperCase() + string.slice(1);

    if(string === 'Mixed') string = 'MixedWrapper';
    else if(string === 'Cachedmodel') string = 'CachedModel';
    else if(string === 'Jsonserializer') string = 'JSONSerializer';
    else if(string === 'Modelbase') string = 'ModelBase';
    else if(string === 'Promisearray') string = 'PromiseArray';
    else if(string === 'Promiseobject') string = 'PromiseObject';
    else if(string === 'Restadapter') string = 'RESTAdapter';
    else if(string === 'Restserializer') string = 'RESTSerializer';
    else if(string === 'Index') string = 'DataLight';
    else if(string === 'web-error') string = 'WebError';

    
    

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