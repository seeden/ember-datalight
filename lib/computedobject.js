'use strict';

var Ember = require('ember');

var ComputedObject = module.exports = Ember.Object.extend({
	attributes: Ember.computed(function() {
		var map = Ember.Map.create();

		this.constructor.eachComputedProperty(function(name, wrapper) {
			if (!wrapper || !wrapper.isWrapper) {
				return;
			}
			map.set(name, wrapper);
		});

		return map;
	})
});

ComputedObject.reopenClass({
	build: function(obj) {
		return ComputedObject.extend(obj).create();
	}
});