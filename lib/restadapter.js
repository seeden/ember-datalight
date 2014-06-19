'use strict';

var Ember = require('ember'),
	DataLight = require('./index'),
	Adapter = require('./adapter'),
	RESTSerializer = require('./restserializer');

var type = {
	GET: 'GET',
	POST: 'POST',
	PUT: 'PUT',
	DELETE: 'DELETE'
};

var RESTAdapter = module.exports = DataLight.RESTAdapter = Ember.Object.extend({
	headers: [],
	host: null,
	namespace: null,
	serializer: RESTSerializer.create({}),

	find: function(model, id) {
		return this.ajax(this.buildURL(model, id), type.GET);
	},

	/**
	The `findAll()` method is called when you call `find` on the store
	without an ID (i.e. `store.find('post')`).
	*/
	findAll: function(model, sinceToken) {
		var query;

    	if (sinceToken) {
      		query = {
      			since: sinceToken
      		};
    	}

    	return this.ajax(this.buildURL(model), type.GET, { data: query });
	},

	/**
	This method is called when you call `find` on the store with a
	query object as the second parameter (i.e. `store.find('person', {
	page: 1 })`).
	*/
	findQuery: function(model, query) {
		return this.ajax(this.buildURL(model), type.GET, { data: query });
	},


	/**
	Implement this method in a subclass to handle the creation of
	new records.
	*/
	createRecord: function(model, record) {
		var data = this.get('serializer').serializeIntoHash(type.POST, model, record);

		return this.ajax(this.buildURL(model), type.POST, { data: data });
	},

	/**
	Implement this method in a subclass to handle the updating of
	a record.
	*/
	updateRecord: function(model, record) {
		var id = record.get(model.primaryKey);
		var data = this.get('serializer').serializeIntoHash(type.PUT, model, record);

    	return this.ajax(this.buildURL(model, id), type.PUT, { data: data });
	},


	/**
	 * Implement this method in a subclass to handle the deletion of
	 * a record.
	 */
	deleteRecord: function(model, record) {
		var id = record.get(model.primaryKey);

    	return this.ajax(this.buildURL(model, id), type.DELETE);
	},


	/**
	Find multiple records at once.

	By default, it loops over the provided ids and calls `find` on each.
	May be overwritten to improve performance and reduce the number of
	server requests.
	*/
	findMany: function(store, type, ids) {
		var promises = Ember.ArrayPolyfills.map.call(ids, function(id) {
			return this.find(store, type, id);
		}, this);

		return Ember.RSVP.all(promises);
	},

	ajax: function(url, type, options) {
		var self = this;
		var options = this._ajaxOptions(url, type, options);

		return new Ember.RSVP.Promise(function (resolve, reject) {
			Ember.$.ajax(options).then(function(data) {
				Ember.run(null, resolve, data);
			}, function(response) {
				Ember.run(null, reject, self._responseToError(response));
			});
		});
	},

	_prepareURL: function(url) {
		var host = this.get('host');
		var namespace = this.get('namespace');

		if(namespace) {
			url = '/' + namespace + url;
		}

		if(host) {
			url = '/' + host + url;
		}

		return url;
	},

	_ajaxOptions: function(url, type, options) {
		options = options || {};
		options.url = this._prepareURL(url);
		options.type = type;
		options.dataType = 'json';
		options.context = this;
		options.headers = Ember.$.extend({}, this.get('headers'), options.headers);

		return options;
	},

	_responseToError: function(response) {
		var message = response.responseTest || 'Unknown error';
		if(response.responseJSON && response.responseJSON.message) {
			message = response.responseJSON.message;    
		}

		var status = response.status || 500;
		return new WebError(status, message);
	},

	pathForType: function(model) {
		if(!model.type) {
			throw new Error('Model type is undefined');
		}

		return model.type+'s';
	},

	buildURL: function(model, id) {
		var url = '/' + this.pathForType(model);
		if(id) {
			url += '/' + id;	
		}

		return url;
	}
});