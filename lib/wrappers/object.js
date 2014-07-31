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

		//init object with actual values
		this.setProperties({
			'__value': obj,
			'obj': null
		});

		//super must be here because value is not defined
		this._super();

		//set parent 
		var attributes = this.get('attributes');

		for(var name in attributes) {
			attributes[name].set('parent', this);
		}

		//recompute dirty
		this.propertyDidChange('value');
		//this.childChanged(child);
	},

	attributes: function() {
		var value = this.get('__value');
		if(!value) {
			return {};
		}

		return value.get('attributes');
	}.property('__value'),

	//set value
	_serialize: function(properties) {
		var obj = this.get('__value');
		obj.setProperties(properties);
		return obj;
	},

	//get value
	_deserialize: function(obj) {
		var data = {};

		var attributes = this.get('attributes');
		for(var name in attributes) {
			data[name] = attributes[name].get('value');
		}

		return data;
	},

	rollback: function() {
		var attributes = this.get('attributes');

		for(var name in attributes) {
			attributes[name].rollback();
		}
	},

  	setAsOriginal: function() {
		var attributes = this.get('attributes');

		for(var name in attributes) {
			attributes[name].setAsOriginal();
		}
	},

	childChanged: function(child) {
		var dirtyCount = 0;
		var dirtyNames = [];
		var attributes = this.get('attributes');

		for(var name in attributes) {
			var wrapper = attributes[name];

			if(wrapper === child) {
				this.propertyDidChange(name);

				//notify base object about changes
				this.get('__value').propertyDidChange(name);
			}

			if(!wrapper.get('isDirty')) {
				continue;
			}

			dirtyCount++;
			dirtyNames.push(name);
		}

		this.setProperties({
			dirtyCount: dirtyCount,
			dirtyNames: dirtyNames
		});

		//notify parent
		var parent = this.get('parent');
		if(!parent) {
			return;
		}

		parent.childChanged(this);	
	},

	isDirty: function() {
		return this.get('dirtyCount')>0;
	}.property('dirtyCount').readOnly(),

	computed: function() {
  		return this.get('__value');
  	}.property('__value').readOnly()
});