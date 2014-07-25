'use strict';

var Wrapper = require('./wrapper');

var StringWrapper = module.exports = Wrapper.extend({
	//set value
	_serialize: function(value) {
		return String(value);
	},

	//get value
	_deserialize: function(value) {
		return value;
	}
});