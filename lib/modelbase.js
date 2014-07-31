'use strict';

var Ember = require('ember'),
	DataLight = require('./index'),
	ComputedObject = require('./computedobject');

var ModelBase = module.exports = DataLight.ModelBase = Ember.Object.extend({
	isNew: true,
	isDeleted: false,
	isRemoved: false,

	dirtyCount: 0,
	dirtyNames: [],

	init: function() {
		this._super();

		var dirtyCount = 0;
		var attributes = this.get('attributes');

		for(var name in attributes) {
			attributes[name].set('parent', this);
		}

		//recompute dirty
		this.childChanged();	
	},

	attributes: function() {
		var _this = this;
		var map = {};

		this.constructor.eachComputedProperty(function(name, meta) {
			if (!meta || !meta.isAttribute) {
				return;
			}

			map[name] = meta.getWrapper(_this, name);
		});

		return map;
	}.property(),

	childChanged: function(child) {
		var dirtyCount = 0;
		var dirtyNames = [];
		var attributes = this.get('attributes');

		for(var name in attributes) {
			var wrapper = attributes[name];

			if(wrapper === child) {
				this.propertyDidChange(name);
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
	},

	isDirty: function() {
		return this.get('dirtyCount')>0;
	}.property('dirtyCount').readOnly(),

	dirtyAttributes: function() {
		var dirty = Ember.Map.create();
		var attributes = this.get('attributes');

		for(var name in attributes) {
			var wrapper = attributes[name];
			if(wrapper.get('isDirty')) {
				continue;
			}

			dirty.set(name, wrapper);
		}

		return dirty;
	}.property('dirtyCount', 'dirtyNames').readOnly(),

	rollback: function() {
		var attributes = this.get('attributes');

		for(var name in attributes) {
			attributes[name].rollback();
		}

		return this;
	},

	setAsOriginal: function() {
		var attributes = this.get('attributes');

		for(var name in attributes) {
			attributes[name].setAsOriginal();
		}

		this.set('isNew', false);
		return this;
	},

	toJSON: function(fn) {
		var properties = {};
		var attributes = this.get('attributes');

		for(var name in attributes) {
			var wrapper = attributes[name];
			if(fn && fn(name, wrapper) === false) {
				continue;
			}

			properties[name] = wrapper.get('value');
		}

		return properties;
	},

	setupData: function(data, partial, rollback) {
		var json = this.toJSON();

		if (partial) {
			Ember.merge(json, data);
		} else {
			json = data;
		}

		if(rollback) {
			this.rollback();
		}

		var attributes = this.get('attributes');
		for(var name in attributes) {
			attributes[name].setupData(data[name], partial);
		}

		this.setAsOriginal(json);
		return this;
	},

	adopt: function(record) {
		var data = record.toJSON();
		this.setupData(data, false, true);
	}


	/*************  PART BOTTOM IS NOT READY FOR NEW STRUCTURE  **************/
	/*copy: function() {
		var properties = this.getProperties(['isNew', 'isDeleted', 'isRemoved']);
		var data = Ember.$.extend({}, properties);
		return this.constructor.create(data);
	}*/
});


ModelBase.reopenClass({
	buildRecord: function(data) {
		var model = this.create({});

		model.setupData(data);
		model.setAsOriginal();

		return model;
	}	
});