'use strict';

var Wrapper = require('./wrapper');

var MixedWrapper = module.exports = Wrapper.extend({
	//set value
	_serialize: function(value) {
		return value;
	},

	//get value
	_deserialize: function(value) {
		return value;
	}
});