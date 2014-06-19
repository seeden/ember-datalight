'use strict';

var Ember = require('ember'),
	WebError = require('web-error'),
	DataLight = require('./index'),
	ModelBase = require('./modelbase'),
	RESTAdapter = require('./restadapter'),
	attribute = require('./attribute');

var Model = module.exports = DataLight.Model = ModelBase.extend({
	isEmpty: function (keyName) {
		var str = this.get(keyName);
		return Ember.isEmpty(str);
	},

	isBlank: function(keyName) {
		var str = this.get(keyName);
		return Ember.isBlank(str);
	},

	save: function() {
		var self = this;
		var adapter = Model.get('adapter');
		var isDeleted = this.get('isDeleted');
		if(isDeleted) {
			return this.destroyRecord();
		}

		if(this.get('isNew')) {
			return adapter.createRecord(this.constructor, this).then(function() {
				self.set('isNew', false);
			});
		}

		return adapter.updateRecord(this.constructor, this);
	},

	destroyRecord: function() {
		var self = this;
		var isNew = this.get('isNew');
		var isDestroyed = this.get('isDestroyed');
		var adapter = Model.get('adapter');

		this.set('isDeleted', true);

		return new Ember.RSVP.Promise(function(resolve, reject) {
			if(isDestroyed) {
				return resolve();	
			}

			if(isNew) {
				self.destroy();
				return resolve();
			}

			adapter.deleteRecord(self.constructor, self).then(function() {
				self.destroy();
			}).then(resolve, reject);
		});
	},

	deleteRecord: function() {
		this.set('isDeleted', true);
	}
});

Model.reopenClass({
	adapter: RESTAdapter.create({}),
	attribute: attribute,

	primaryKey: 'id',
	type: null,

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

	push: function(data) {
		var chacheID = item[primaryKey];
		if(!chacheID) {
			throw new Error('Model does not contains primary key')
		}

		var item = this.createRecord(data, true);

		this.addToCache(chacheID, item);
	},

	addToCache: function(cacheID, item) {
		//save newest value
		if(this.cacheItems[cacheID]) {
			this.cacheItems[cacheID].setData(item.toJSON());
			return;
		}

		this.cacheItems[cacheID] = item;
		this.cacheSize++;

		if(this.cacheMax!==null && this.cacheSize>this.cacheMax) {
			this.clearCache();
		}
	},

	clearCache: function(){
		this.cacheItems = {};
		this.cacheSize = 0;
	},

	_find: function(options, postProcess) {
		var self = this;

		var url = '/'+this.pathForType();
		var data = {};

		if(typeof options === 'string') {
			url+='/'+options;	
		} else {
			data = options;
		}

		if(this.cache) {
			var cacheID = url + JSON.stringify(data);
			var cachedItem = this.getFromCache(cacheID);
			if(cachedItem) {
				return new Ember.RSVP.Promise(function(resolve) {
					resolve(cachedItem);
				});
			}				
		}

		return this.ajax(url, {data: data}, postProcess).then(function(item) {
			if(self.cache) {
				self.addToCache(cacheID, item);
			}

			return item;
		});
	}
});