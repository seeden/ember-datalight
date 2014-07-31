'use strict';

var Ember = require('ember');

var ComputedObject = module.exports = Ember.Object.extend({
	attributes: Ember.computed(function() {
		var _this = this;
		var map = {};

		this.constructor.eachComputedProperty(function(name, meta) {
			if (!meta || !meta.isAttribute) {
				return;
			}

			map[name] = meta.getWrapper(_this, name);
		});

		return map;
	})
});
/*
ComputedObject.reopenClass({
	build: function(obj) {
		return ComputedObject.extend(obj).create();
	}
});*/