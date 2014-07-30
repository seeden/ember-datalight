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

		this.get('attributes').forEach(function(name, wrapper) {
			wrapper.set('parent', this);
		}, this);

		//recompute dirty
		this.childChanged();	
	},

	attributes: function() {
		var map = Ember.Map.create();

		this.constructor.eachComputedProperty(function(name, wrapper) {
			if (!wrapper || !wrapper.isWrapper) {
				return;
			}

			map.set(name, wrapper);
		});

		return map;
	}.property(),

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
		this.get('dirtyCount')>0;
	}.property('dirtyCount').readOnly(),

	dirtyAttributes: function() {
		var dirty = Ember.Map.create();

		this.get('attributes').forEach(function(name, wrapper) {
			if(wrapper.get('isDirty')) {
				return;
			}

			dirty.set(name, wrapper);
		}, this);

		return dirty;
	}.property('dirtyCount', 'dirtyNames').readOnly(),

	rollback: function() {
		this.get('attributes').forEach(function(name, wrapper) {
			wrapper.rollback();
		}, this);

		return this;
	},

	setAsOriginal: function() {
		this.get('attributes').forEach(function(name, wrapper) {
			wrapper.setAsOriginal();
		}, this);

		this.set('isNew', false);
		return this;
	},

	toJSON: function(fn) {
		var properties = {};
		//get attributes
		this.get('attributes').forEach(function(name, wrapper) {
			if(fn && fn(name, wrapper) === false) {
				return;
			}

			properties[name] = wrapper.get('value');
		}, this);

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

		this.setProperties(json);
		this.setAsOriginal();

		return this;
	},

	adopt: function(record) {
		var data = record.toJSON();
		this.setupData(data, false, true);
	},


	/*************  PART BOTTOM IS NOT READY FOR NEW STRUCTURE  **************/

	copy: function() {
		var properties = this.getProperties(['isNew', 'isDeleted', 'isRemoved']);
		var data = Ember.$.extend({}, properties);
		return this.constructor.create(data);
	}
});


ModelBase.reopenClass({

	buildRecord: function(data) {
		var model = this.create({});

		model.setupData(data);
		model.setAsOriginal();

		return model;
	}	
});
