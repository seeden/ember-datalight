'use strict';

var Ember = require('ember');

var ComputedObject = module.exports = Ember.Object.extend({
	attributes: Ember.computed(function() {
		var _this = this,
			map = {};

		this.constructor.eachComputedProperty(function(name, meta) {
			if (!meta || !meta.isAttribute) {
				return;
			}

			map[name] = meta.getWrapper(_this, name);
		});

		return map;
	})
});