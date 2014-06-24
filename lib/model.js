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
		var adapter = this.get('adapter');

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
	},

	reloadRecord: function() {
		//TODO
	},

	isEmpty: function (keyName) {
		var str = this.get(keyName);
		return Ember.isEmpty(str);
	},

	isBlank: function(keyName) {
		var str = this.get(keyName);
		return Ember.isBlank(str);
	}
});

Model.reopenClass({
	adapter: RESTAdapter.create({}),
	attribute: attribute,

	primaryKey: 'id',
	type: null,

	find: function(id) {
		var type = Ember.typeOf(id);

		if (type === 'undefined') {
      		return this.findAll();
    	} else if (type === 'object') {
			return this.findQuery(id);
		} else if (type === 'array') {
			return this.findMany(id);
		}

		return PromiseObject.create({
			promise: Promise.cast(this.adapter.find(this, id))
		});
	},

	findAll: function(sinceToken) {
		return PromiseArray.create({
			promise: this.adapter.findAll(this, sinceToken)
		});
	},

	findQuery: function(query) {
		return PromiseArray.create({
			promise: this.adapter.findQuery(this, query)
		});
	},

	findMany: function(ids) {
		return PromiseArray.create({
			promise: this.adapter.findMany(this, ids)
		});
	},

	push: function() {
		Ember.Logger.warn('Method push needs cached version of models');
	}
});