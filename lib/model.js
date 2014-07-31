'use strict';

var Ember = require('ember'),
	Promise = Ember.RSVP.Promise,
	WebError = require('web-error'),
	DataLight = require('./index'),
	ModelBase = require('./modelbase'),
	RESTAdapter = require('./restadapter'),
	PromiseObject = require('./promiseobject'),
	PromiseArray = require('./promisearray'),
	attribute = require('./attribute');

var Model = module.exports = DataLight.Model = ModelBase.extend({
	adapter: function() {
		return this.constructor.adapter;
	}.property(),

	save: function() {
		var self = this;
		var adapter = this.get('adapter');
		var isDeleted = this.get('isDeleted');
		if(isDeleted) {
			return this.destroyRecord();
		}

		if(this.get('isNew')) {
			return adapter.createRecord(this.constructor, this);
		}

		return adapter.updateRecord(this.constructor, this);
	},

	destroyRecord: function() {
		var self = this;
		var isNew = this.get('isNew');
		var isRemoved = this.get('isRemoved');
		var adapter = this.get('adapter');

		this.set('isDeleted', true);

		return new Ember.RSVP.Promise(function(resolve, reject) {
			if(isRemoved) {
				return resolve();	
			}

			if(isNew) {
				self.set('isRemoved', true);
				//self.destroy();
				return resolve();
			}

			adapter.deleteRecord(self.constructor, self).then(function() {
				self.set('isRemoved', true);
				//self.destroy();
			}).then(resolve, reject);
		});
	},

	deleteRecord: function() {
		this.set('isDeleted', true);
	},

	reloadRecord: function() {
		//TODO
	},

	/**
	 * Resolve all relationships
	 * @param  {Boolean} ignoreAsync If it is not true promises with async === true will be ignored
	 * @return {Promise}             [description]
	 */
	resolveRelationships: function(ignoreAsync) {
		var _this = this;
		var promises = [];
		ignoreAsync = ignoreAsync || false;

		var attributes = this.get('attributes');

		for(var name in attributes) {
			var wrapper = attributes[name];

			if(!ignoreAsync && wrapper.get('async')) {
				continue;
			}

			var promise = wrapper.resolveRelationships(ignoreAsync);
			if(!promise) {
				continue;
			}

			promises.push(Promise.cast(promise));			
		}

		return Ember.RSVP.Promise.all(promises).then(function() {
			return _this;
		});
	}
});

Model.reopenClass({
	isModel: true,

	adapter: RESTAdapter.create({}),
	attribute: attribute,

	primaryKey: 'id',
	type: null,
	included: [],

	resolveMultipleRecords: function(records) {
		var promises = [];

		for(var i=0; i<records.length; i++) {
			var record = records[i];
			promises.push(record.resolveRelationships());	
		}

		return Ember.RSVP.Promise.all(promises);
	},

	find: function(id) {
		var type = Ember.typeOf(id);

		if (type === 'undefined') {
      		return this.findAll();
    	} else if (type === 'object') {
			return this.findQuery(id);
		} else if (type === 'array') {
			return this.findMany(id);
		}

		return this.findByID(id);
	},

	findByID: function(id) {
		return PromiseObject.create({
			promise: this.adapter.findByID(this, id).then(function(record) {
				return record.resolveRelationships();
			})
		});
	},

	findAll: function(sinceToken) {
		var _this = this;
		return PromiseArray.create({
			promise: this.adapter.findAll(this, sinceToken).then(function(records) {
				return _this.resolveMultipleRecords(records);
			})
		});
	},

	findQuery: function(query) {
		var _this = this;
		return PromiseArray.create({
			promise: this.adapter.findQuery(this, query).then(function(records) {
				return _this.resolveMultipleRecords(records);
			})
		});
	},

	findMany: function(ids) {
		var _this = this;
		return PromiseArray.create({
			promise: this.adapter.findMany(this, ids).then(function(records) {
				return _this.resolveMultipleRecords(records);
			})
		});
	},

	/*
	push: function() {
		Ember.Logger.warn('Method push needs cached version of models');
	},*/

	ajax: function(url, type, options, isArray) {
		var Model = this;
		var serializer = this.adapter.get('serializer');

		isArray = isArray || false;

		var promise = this.adapter.ajax(url, type, options).then(function(data) {
			return serializer.deserialize(Model, null, data, isArray);
		});

		if(isArray) {
			return PromiseArray.create({ promise: Promise.cast(promise) });
		} else {
			return PromiseObject.create({ promise: Promise.cast(promise) });
		}
	},

	GET: function(url, options, isArray) {
		return this.ajax(url, 'GET', options, isArray);
	},

	POST: function(url, options, isArray) {
		return this.ajax(url, 'POST', options, isArray);
	},

	PUT: function(url, options, isArray) {
		return this.ajax(url, 'PUT', options, isArray);
	},

	DELETE: function(url, options, isArray) {
		return this.ajax(url, 'DELETE', options, isArray);
	},

	getRelatedModels: function(includedModels) {
		var _this = this;
		var used = {};
		var models = [];

		includedModels = includedModels || [];

		this.eachComputedProperty(function(name, meta) {
			if(!meta || !meta.wrapperClass) {
				return;
			}

			var modelsAttr = meta.wrapperClass.getRelatedModels();
			for(var i=0; i<modelsAttr.length; i++) {
				var model = modelsAttr[i];

				if(used[model.type] || _this === model) {
					return;
				}

				models.push(model);
				used[model.type] = true;
			}
		});

		
		//additional included models
		for(var i=0; i<this.included.length; i++) {
			var model = this.included[i];
			if(used[model.type] || this === model) {
				continue;
			}

			models.push(model);
			used[model.type] = true;			
		}

		//additional included models
		for(var i=0; i<includedModels.length; i++) {
			var model = includedModels[i];
			if(used[model.type] || _this === model) {
				continue;
			}

			models.push(model);
			used[model.type] = true;			
		}

		return models;
	}
});