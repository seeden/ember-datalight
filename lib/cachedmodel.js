'use strict';

//TODO add createrecord callback to cache - ************************

var Ember = require('ember'),
	Model = require('./model'),
	DataLight = require('./index');

var CachedModel = module.exports = DataLight.CachedModel = Model.extend({

});

CachedModel.reopenClass({
	cache: true,
	cacheItems: {},
	cacheSize: 0,
	cacheMax: null,

	getFromCache: function(cacheID) {
		if(!cacheID || !this.cacheItems[cacheID]) {
			return null;
		}

		return this.cacheItems[cacheID];
	},

	addToCache: function(cacheID, model) {
		//save newest value
		if(this.cacheItems[cacheID]) {
			return this.cacheItems[cacheID];
		}

		this.cacheItems[cacheID] = model;
		this.cacheSize++;

		if(this.cacheMax!==null && this.cacheSize>this.cacheMax) {
			this.clearCache();
		}

		return model;
	},

	clearCache: function(){
		this.cacheItems = {};
		this.cacheSize = 0;
	},

	push: function(data) {
		var chacheID = data[this.primaryKey];
		if(!chacheID) {
			throw new Error('Model does not contains primary key')
		}

		var model = this.create(data);
		model.saved();

		this.addToCache(chacheID, model);
	},

	find: function(id) {
		var self = this;
		var model = this.getFromCache(id);

		if(model) {
			return new Ember.RSVP.Promise(function(resolve, reject) {
				return resolve(model);
			});
		}
		
		return this._super(id).then(function(model) {
			return self.addToCache(model);
		});
	},

	findQuery: function(query) {
		var self = this;
		var cacheID = JSON.stringify(query);
		var models = this.getFromCache(cacheID);

		if(models) {
			return new Ember.RSVP.Promise(function(resolve, reject) {
				return resolve(models);
			});
		}
		
		return this._super(query).then(function(models) {
			var cachedModels = [];

			for(var i=0;i<models.length; i++) {
				cachedModels.push(self.addToCache(models[i]));
			}

			return cachedModels;
		});
	}
});