'use strict';

var Ember = require('ember'),
	Wrapper = require('./wrapper'),
	ComputedObject = require('../computedobject');

var ObjectWrapper = module.exports = Wrapper.extend({
	obj: null, //mandatory property

	dirtyCount: 0,
	dirtyNames: [],

	init: function() {
		var obj = this.get('obj');
		if(!obj) {
			throw new Error('Object need property named obj defined');
		}

		console.log('*** init');

		//init object with actual values
		this.set('__value', obj);

		//set parent 
		this.get('attributes').forEach(function(name, wrapper) {
			wrapper.set('parent', this);
		}, this);

		//recompute dirty
		this.childChanged();
	},

	attributes: function() {
		return this.get('__value.attributes');
	}.property('__value'),

	//set value
	_serialize: function(properties) {
		console.log('*** serialize');
		var obj = this.get('__value');
		obj.setProperties(properties);
		return obj;
	},

	//get value
	_deserialize: function(obj) {
		var data = {};

		obj.get('attributes').forEach(function(name, wrapper) {
			data[name] = wrapper.get('value');
		}, this);

		return data;
	},

	rollback: function() {
		this.get('attributes').forEach(function(name, wrapper) {
			wrapper.rollback();
		}, this);
	},

	childChanged: function() {
		var dirtyCount = 0;
		var dirtyNames = [];

		this.get('attributes').forEach(function(name, wrapper) {
			if(wrapper.get('isDirty')) {
				dirtyCount++;
				dirtyNames.push(name);
			}
		}, this);

		this.setProperties({
			dirtyCount: dirtyCount,
			dirtyNames: dirtyNames
		});	
	},

	isDirty: function() {
		return this.get('dirtyCount')>0;
	}.property('dirtyCount').readOnly(),

	computed: function() {
  		return this.get('__value');
  	}.property('__value').readOnly()
});


ObjectWrapper.reopenClass()