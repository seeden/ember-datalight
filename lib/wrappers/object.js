'use strict';

var Ember = require('ember'),
	Promise = Ember.RSVP.Promise,
	Wrapper = require('./wrapper'),
	ComputedObject = require('../computedobject');

var ObjectWrapper = module.exports = Wrapper.extend({
	dirtyCount: 0,
	dirtyNames: [],

	computedObject: function() {
		return this.constructor.computedObject;
	}.property().readOnly(),

	init: function() {
		var computedObject = this.get('computedObject');
		if(!computedObject) {
			throw new Error('ObjectWrapper class need computedObject defined');
		}

		//init object with actual values
		var obj = this.get('__value');
		if(!obj) {
			this.set('__value', computedObject.create());
		}

		//super must be here because value is not defined
		this._super();

		//set parent 
		var attributes = this.get('attributes');

		for(var name in attributes) {
			attributes[name].set('parent', this);
		}

		//recompute dirty
		this.propertyDidChange('value');
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
		var computedObject = this.get('computedObject');
		if(!computedObject) {
			throw new Error('ObjectWrapper class need computedObject defined');
		}

		var obj = this.get('__value');
		if(!obj) {
			this.set('__value', obj = computedObject.create());
		}

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
  	}.property('__value').readOnly(),


  	resolveRelationships: function(ignoreAsync) {
  		var promises = [];
		var attributes = this.get('attributes');

		for(var name in attributes) {
			promises.push(attributes[name].resolveRelationships(ignoreAsync));
		}

		return Promise.all(promises);
	},

	setupData: function(data, partial) {
		var json = this.get('value');

		if (partial) {
			Ember.merge(json, data);
		} else {
			json = data;
		}

		var attributes = this.get('attributes');
		for(var name in attributes) {
			attributes[name].setupData(json[name], partial);
			this.propertyDidChange(name);
		}

		this.setAsOriginal(json);
		this.propertyDidChange('value');
		return this;
	}
});

ObjectWrapper.reopenClass({
	isObjectWWW: true, 
	computedObject: ComputedObject.extend({}),

	getRelatedModels: function() {
		var models = [];

		if(!this.computedObject || !this.computedObject.eachComputedProperty) {
			throw new Error('computedObject is not extended class from ComputedObject');
		}

		this.computedObject.eachComputedProperty(function(name, meta) {
			if(!meta || !meta.wrapperClass) {
				return;
			}

			var modelsAttr = meta.wrapperClass.getRelatedModels();
			for(var i=0; i<modelsAttr.length; i++) {
				models.push(modelsAttr[i]);	
			}
		});
			
		return models;
	}
});