'use strict';

var Ember = require('ember'),
	DataLight = require('./index');

var ModelBase = module.exports = DataLight.ModelBase = Ember.Object.extend({
	__data: {},
	__attributes: {},

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

		this.__attributes = {};

		this.setProperties({
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

			var value = this.get(name);

			properties[name] = meta.isObject ? value.toJSON(fn) : value;
		}, this);

		return properties;
	},

	copy: function() {
		var model =  this.constructor.createRecord(this.toJSON());
		model.setProperties(this.getProperties(['isNew', 'isDeleted']));

		return model;
	},

	serialize: function (method) {
		return this.toJSON(function(key, meta) {
			if(method === 'PUT' && meta.options.put === false) {
				return false;
			}
		});
	}	
});

ModelBase.reopenClass({
	createRecord: function(properties, exists) {
		properties = properties || {};

		var model = this.create(properties);
		model.set('isNew', true);

		if(exists) {
			model.saved();
		}

		return model;
	}
});