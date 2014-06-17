define(['ember', 'jquery', 'web-error', './modelbase', './attribute'], function(Ember, $, WebError, ModelBase, attr) {
	'use strict';
	
	var Model = ModelBase.extend({
		isEmpty: function (keyName) {
			var str = this.get(keyName);
			return Ember.isEmpty(str);
		},

		isBlank: function(keyName) {
			var str = this.get(keyName);
			return Ember.isBlank(str);
		},

		save: function() {
			var isDeleted = this.get('isDeleted');
			if(isDeleted) {
				return this.destroyRecord();
			}

			var method = this.get('isNew') ? 'POST' : 'PUT';
			var data = this.serialize(method);
			var url = '/' + this.constructor.pathForType() + '/' + this.get(this.constructor.primaryKey);

			return this.constructor[method](url, { data: data }).then(function() {
				this.set('isNew', false);
			});
		},

		destroyRecord: function() {
			var self = this;
			var isNew = this.get('isNew');
			var isDestroyed = this.get('isDestroyed');
			var url = '/' + this.constructor.pathForType() + '/' + this.get(this.constructor.primaryKey);

			this.set('isDeleted', true);

			return new Ember.RSVP.Promise(function(resolve, reject) {
				if(isDestroyed) {
					return resolve();	
				}

				if(isNew) {
					self.destroy();
					return resolve();
				}

				self.constructor.DELETE(url).then(function() {
					self.destroy();
				}).then(resolve, reject);
			});
		},

		deleteRecord: function() {
			this.set('isDeleted', true);
		}
	});

	Model.reopenClass({
		attr: attr,

		primaryKey: 'id',
		type: null,
		cache: true,
		cacheItems: {},
		cacheSize: 0,
		cacheMax: null,

		namespace: 'api',
		headers: {},

		ajax: function(url, settings, postProcess) {
			if(!postProcess) {
				postProcess = function(){};
			}

			if(typeof settings === 'function') {
				postProcess = settings;
				settings = {};
			}

			if(Model.namespace) {
				url = '/' + Model.namespace + url;
			}

			settings.headers = $.extend({}, Model.headers, settings.headers);
			settings.dataType = settings.dataType || 'json';

			return new Ember.RSVP.Promise(function (resolve, reject) {
				$.ajax(url, settings).then(function(data) {
					Ember.run(null, resolve, postProcess(data));
				}, function(response) {
					var message = response.responseTest || 'Unknown error';
					if(response.responseJSON && response.responseJSON.message) {
						message = response.responseJSON.message;	
					}

					var status = response.status || 500;
					var error = new WebError(status, message);

					Ember.run(null, reject, error);
				});
			});
		},

		POST: function(url, settings, postProcess) {
			settings.type = 'POST';
			return this.ajax(url, settings, postProcess);
		},

		DELETE: function(url, settings, postProcess) {
			settings.type = 'DELETE';
			return this.ajax(url, settings, postProcess);
		},

		PUT: function(url, settings, postProcess) {
			settings.type = 'PUT';
			return this.ajax(url, settings, postProcess);
		},

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
		},

		pathForType: function() {
			if(!this.type) {
				throw new Error('Model type is undefined');
			}

			return this.type+'s';
		}
	});

	return Model;
});