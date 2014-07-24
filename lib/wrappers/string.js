'use strict';

var Wrapper = require('./wrapper');

var StringWrapper = module.exports = Wrapper.extend({
	//set value
	_serialize: function(value) {
		return String(value);
	}
});