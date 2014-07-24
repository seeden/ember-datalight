'use strict';

var Wrapper = require('./wrapper');

var NumberWrapper = module.exports = Wrapper.extend({
	//set value
	_serialize: function(value) {
		return Number(value);
	},

	isNaN: function() {
		return isNaN(this.get('value'));
	}.property('value')
});