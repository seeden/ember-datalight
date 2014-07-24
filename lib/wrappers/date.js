'use strict';

var Wrapper = require('./wrapper');

var DateWrapper = module.exports = Ember.Object.extend({
	//set value
	_serialize: function(value) {
		return Date(value);
	}
});