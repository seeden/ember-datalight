'use strict';

var Ember = require('ember'),
	DataLight = require('./index');

var ModelBase = module.exports = DataLight.ModelBase = Ember.Object.extend({
	__data: null,
	__attributes: null,

	isNew: true,
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
		this.set('__attributes', {});

		this.attributes().forEach(function(name, meta) {
			if(meta.isObject) {
				this.get(name).rollback();
			}
		}, this);

		this.set('isDirty', false);

		return this;
	},

	saved: function() {
		var __attributes = this.get('__attributes');
		var __data = this.get('__data');

		for(var key in __attributes) {
			__data[key] = __attributes[key];
		}

		this.setProperties({
			__data: __data,
			__attributes: {},
			isNew: false
		});

		return this;
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
	},

	setupData: function(data, partial) {
		var __data = this.get('__data');

		if (partial) {
			Ember.merge(__data, data);
		} else {
			__data = data;
		}

		this.set('__data', __data);

		return this;
	}
});


ModelBase.reopenClass({
	buildRecord: function(data) {
		var model = this.create({});

		model.setupData(data);
		model.saved();

		return model;
	}	
});
