'use strict';

var Ember = require('ember'),
	Wrapper = require('./wrapper');

var ComputedObject = module.exports = Ember.Object.extend({

	_attributes: Ember.computed(function() {
		var map = Ember.Map.create();

		this.constructor.eachComputedProperty(function(name, meta) {
			if (!meta.isAttribute) {
				return;
			}

			map.set(name, meta);
		});

		return map;
	}),	
});


ComputedObject.reopenClass({
	build: function(obj) {
		return ComputedObject.extend(obj).create();
	}
});

var ObjectWrapper = module.exports = Wrapper.extend({
	obj: null,

	init: function() {
		var obj = this.get('obj');
		if(!obj) {
			throw new Error('Object need property named obj defined');
		}

		//init object with actual values
		this.set('__value', obj);
	},

	//set value
	_serialize: function(properties) {
		var obj = this.get('__value');
		obj.setProperties(properties);
		return obj;
	},

	//get value
	_deserialize: function(obj) {
		var data = {};
		
		var attributes = obj.get('_attributes');

		attributes.forEach(function(name, meta) {
			data[name] = 123456;//meta.wrapper.get('value');
		}, this);

		return data;
	},

	computed: function() {
  		this.get('__value');
  	}.property('__value').readOnly()
});