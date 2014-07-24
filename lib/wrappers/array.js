'use strict';

var Wrapper = require('./wrapper');

var ArrayWrapper = module.exports = Wrapper.extend({
	_type: null,

	init: function(value, type) {
		
	},

	//get value
	deserialize: function() {
		throw new Error('Deserialize is not implemented');
	},

	//set value
	serialize: function() {
		throw new Error('Serialize is not implemented');
	}
});