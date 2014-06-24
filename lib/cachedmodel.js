'use strict';

var Ember = require('ember'),
	Promise = Ember.RSVP.Promise,
	PromiseObject = require('./promiseobject'),
	PromiseArray = require('./promisearray'),
	Model = require('./model'),
	DataLight = require('./index');

var CachedModel = module.exports = DataLight.CachedModel = Model.extend({
	copy: function() {
		var model = this.constructor.create();
		var properties = this.getProperties(['__data', '__attributes', 'isNew', 'isDeleted']);
		var propertiesCopy = Ember.$.extend({}, properties);

		model.setProperties({
			isDeleted: properties.isDeleted,
			isNew: properties.isNew
		});

		model.__data = propertiesCopy.__data;
		model.__attributes = propertiesCopy.__attributes;

		return model;
	}
});

CachedModel.reopenClass({
	cache: true,
	cacheItems: {},
	cacheSize: 0,
	cacheMax: null,
	cacheQueries: true,

	_computeCacheID: function(id) {
		if(!id) {
			return null;
		}

		if(!this.type) {
			throw new Error('Model type is not defined');
		}

		return this.type + '-' + id;
	},

	create: function(data) {
		data = data || {};

		var primaryKey = this.primaryKey;
		var cacheID = this._computeCacheID(data[primaryKey]);
		var model = this.getFromCache(cacheID);

		if(!model) {
			model = this._super(data);
			this.addToCache(cacheID, model);
		}

		return model;
	},

	getFromCache: function(cacheID) {
		if(!cacheID || !this.cacheItems[cacheID]) {
			return null;
		}

		return this.cacheItems[cacheID];
	},

	addToCache: function(cacheID, model) {
		if(!cacheID) {
			return model;
		}

		//save newest value
		if(this.cacheItems[cacheID]) {
			return this.cacheItems[cacheID];
		}

		this.cacheItems[cacheID] = model;
		this.cacheSize++;

		if(this.cacheMax !== null && this.cacheSize>this.cacheMax) {
			this.clearCache();
		}

		return model;
	},

	clearCache: function() {
		this.cacheItems = {};
		this.cacheSize = 0;
	},

	find: function(id) {
		var self = this;
		var cacheID = this._computeCacheID(id);
		var model = this.getFromCache(cacheID);

		if(model) {
			return PromiseObject.create({
				promise: Promise.cast(model)
			});
		}
		
		return this._super(id);
	},

	findQuery: function(query) {
		var self = this;
		var cacheID = this._computeCacheID('cq-'+JSON.stringify(query));
		var models = this.getFromCache(cacheID);

		if(models) {
			return PromiseArray.create({
				promise: Promise.cast(model)
			});
		}
		
		return this._super(query).then(function(models) {
			//store whole query to cache
			if(self.cacheQueries) {
				self.addToCache(cacheID, models);	
			}

			return models;
		});
	},

	push: function(data) {
		var model = this.create(data);
		model.saved();

		return model;
	}
});