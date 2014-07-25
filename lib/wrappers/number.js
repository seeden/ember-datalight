'use strict';

var Wrapper = require('./wrapper');

var NumberWrapper = module.exports = Wrapper.extend({
	//set value
	_serialize: function(value) {
		return Number(value);
	},

	//get value
	_deserialize: function(value) {
		return value;
	},

	isNaN: function() {
		return isNaN(this.get('value'));
	}.property('value').readOnly()
});