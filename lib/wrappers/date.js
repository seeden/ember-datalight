'use strict';

var Wrapper = require('./wrapper');

var DateWrapper = module.exports = Wrapper.extend({
	//set value
	_serialize: function(value) {
		return new Date(value);
	},

	//get value
	_deserialize: function(value) {
		return value.toString();
	}
});