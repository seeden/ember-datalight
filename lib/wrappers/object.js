'use strict';

var Ember = require('ember'),
	Wrapper = require('./wrapper');

var ComputedObject = module.exports = Ember.Object.extend({
	_wrappers: Ember.computed(function() {
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

		obj.get('_wrappers').forEach(function(name, wrapper) {
			data[name] = wrapper.get('value');
		}, this);

		return data;
	},

	rollback: function() {
		this.get('__value._wrappers').forEach(function(name, wrapper) {
			wrapper.rollback();
		}, this);
	},

	isDirty: function() {
		var count = 0;
		this.get('__value._wrappers').forEach(function(name, wrapper) {
			if(wrapper.isDirty) {
				count++;	
			}
		}, this);

		return (count>0);
	}.property('__value').readOnly(),

	computed: function() {
  		this.get('__value');
  	}.property('__value').readOnly()
});


ObjectWrapper.reopenClass()