'use strict';

var Ember = require('ember'),
	DataLight = require('./index');

var ModelBase = module.exports = DataLight.ModelBase = Ember.Object.extend({
	isNew: true,
	isDeleted: false,
	isRemoved: false,

	wrappers: Ember.computed(function() {
		var map = Ember.Map.create();

		this.constructor.eachComputedProperty(function(name, wrapper) {
			if (!wrapper || !wrapper.isWrapper) {
				return;
			}

			map.set(name, wrapper);
		});

		return map;
	}),


	isDirty: function() {
		var count = 0;
		this.get('wrappers').forEach(function(name, wrapper) {
			if(wrapper.isDirty) {
				count++;	
			}
		}, this);

		return (count>0);
	},
/*
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
	}),*/
/*
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
	},*/

	saved: function() {
		this.get('wrappers').forEach(function(name, wrapper) {
			wrapper.setAsOriginal();
		}, this);

		this.set('isNew', false);
		return this;
	},

	toJSON: function(fn) {
		var properties = {};
		//get attributes
		this.get('wrappers').forEach(function(name, wrapper) {
			if(fn && fn(name, wrapper) === false) {
				return;
			}

			properties[name] = wrapper.get('value');
		}, this);

		return properties;
	},

	copy: function() {
		var properties = this.getProperties(['isNew', 'isDeleted', 'isRemoved']);
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
	},

	adopt: function(record) {
		var data = record.toJSON();

		this.setupData(data, false, true);
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
