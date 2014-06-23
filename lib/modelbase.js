'use strict';

var Ember = require('ember'),
	DataLight = require('./index');

var ModelBase = module.exports = DataLight.ModelBase = Ember.Object.extend({
	__data: null,
	__attributes: null,

	isNew: false,
	isDeleted: false,

	attributes: function() {
		var map = Ember.Map.create();

		this.constructor.eachComputedProperty(function(name, meta) {
			if (!meta.isAttribute) {
				return;
			}

			map.set(name, meta);
		});

		return map;
	},

	isDirty: function() {
		var dirtyCount = 0;

		this.attributes().forEach(function(name, meta) {
			if(meta.isDirty(this, name)) {
				dirtyCount++;	
			}

		}, this);

		return dirtyCount>0; 
	},

	dirtyAttributes: function() {
		var dirty = Ember.Map.create();

		this.attributes().forEach(function(name, meta) {
			if(meta.isObject) {
				var dirtyAttributes = this.get(name).dirtyAttributes();
				if(dirtyAttributes.length>0) {
					dirty.set(name, dirtyAttributes);
				}
			} else if(meta.isDirty(this, name)) {
				dirty.set(name, this.get(name));
			}
		}, this);

		return dirty;
	},

	rollback: function() {
		this.__attributes = {};

		this.attributes().forEach(function(name, meta) {
			if(meta.isObject) {
				this.get(name).rollback();
			}
		}, this);

		this.set('isDirty', false);
	},

	saved: function() {
		for(var key in this.__attributes) {
			this.__data[key] = this.__attributes[key];
		}

		this.setProperties({
			__attributes: {},
			isNew: false
		});
	},

	toJSON: function(fn) {
		var properties = {};

		//get attributes
		this.attributes().forEach(function(name, meta) {
			if(fn && fn(name, meta) === false) {
				return;
			}

			if(meta.isObject) {
				properties[name] = meta.subModel.toJSON(fn);
			} else {
			
				properties[name] = meta.getValue(this, name);
			}
		}, this);

		return properties;
	},

	copy: function() {
		var properties = this.getProperties(['__data', '__attributes', 'isNew', 'isDeleted']);
		var data = Ember.$.extend({}, properties);
		return this.constructor.create(data);
	}	
});