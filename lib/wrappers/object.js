'use strict';

var Wrapper = require('./wrapper');

var ObjectWrapper = module.exports = Wrapper.extend({
	//set value
	_serialize: function(value) {
		return Date(value);
	},

	//get value
	_deserialize: function(value) {
		return value.toString();
	}
});

ObjectWrapper.reopenClass({
	build: function(obj) {
		return ObjectWrapper.extend(obj);
	}
});