'use strict';

var Ember = require('ember'),
	DataLight = require('./index');

var ModelBase = module.exports = DataLight.ModelBase = Ember.Object.extend({
	__data: null,
	__attributes: null,

	isNew: true,
	isDeleted: false,
	isRemoved: false,

	attributes: Ember.computed(function() {
		var map = Ember.Map.create();

		this.constructor.eachComputedProperty(function(name, meta) {
			if (!meta.isAttribute) {
				return;
			}

			map.set(name, meta);
		});

		return map;
	}),

	relationships: Ember.computed(function() {
		var relationships = [];
		var attributes = this.get('attributes');

		attributes.forEach(function(name, meta) {
			if(!meta.options.belongsTo) {
				return;
			}

			var relationship = {
				name: name,
				belongsTo: meta.options.belongsTo,
				isArray: meta.isArray
			};

			relationships.push(relationship);
		}, this);

		return relationships;
	}),

	isDirty: function() {
		var dirtyCount = 0;
		var attributes = this.get('attributes');

		attributes.forEach(function(name, meta) {
			if(meta.isDirty(this, name)) {
				dirtyCount++;	
			}

		}, this);

		return dirtyCount>0; 
	},

	dirtyAttributes: Ember.computed(function() {
		var dirty = Ember.Map.create();
		var attributes = this.get('attributes');

		attributes.forEach(function(name, meta) {
			if(meta.isObject) {
				var dirtyAttributes = this.get(name).get('dirtyAttributes');
				if(dirtyAttributes.length>0) {
					dirty.set(name, dirtyAttributes);
				}
			} else if(meta.isDirty(this, name)) {
				dirty.set(name, this.get(name));
			}
		}, this);

		return dirty;
	}),

	rollback: function() {
		this.set('__attributes', {});
		var attributes = this.get('attributes');

		attributes.forEach(function(name, meta) {
			if(meta.isObject) {
				this.get(name).rollback();
			}
		}, this);

		this.set('isDirty', false);

		return this;
	},

	saved: function(ignoreAttributes) {
		var __attributes = this.get('__attributes');
		var __data = this.get('__data');

		if(!ignoreAttributes) {
			for(var key in __attributes) {
				__data[key] = __attributes[key];
			}			
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
		var attributes = this.get('attributes');

		//get attributes
		attributes.forEach(function(name, meta) {
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

	setupData: function(data, partial, clearAttributes) {
		var __data = this.get('__data');

		if (partial) {
			Ember.merge(__data, data);
		} else {
			__data = data;
		}

		this.set('__data', __data);

		if(clearAttributes) {
			this.set('__attributes', {});
		}

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
