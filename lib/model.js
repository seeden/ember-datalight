'use strict';

var Ember = require('ember'),
	WebError = require('web-error'),
	DataLight = require('./index'),
	ModelBase = require('./modelbase'),
	RESTAdapter = require('./restadapter'),
	attribute = require('./attribute');

var Model = module.exports = DataLight.Model = ModelBase.extend({
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
		return this.adapter.find(this, id);
	},

	findAll: function(sinceToken) {
		return this.adapter.findAll(this, sinceToken);
	},

	findQuery: function(query) {
		return this.adapter.findQuery(this, query);
	}
});