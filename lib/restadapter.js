'use strict';

var Ember = require('ember'),
	WebError = require('web-error'),
	DataLight = require('./index'),
	Adapter = require('./adapter'),
	RESTSerializer = require('./restserializer');

var type = {
	GET: 'GET',
	POST: 'POST',
	PUT: 'PUT',
	DELETE: 'DELETE',
	PATCH: 'PATCH'
};

var RESTAdapter = module.exports = DataLight.RESTAdapter = Ember.Object.extend({
	headers: {},
	host: null,
	namespace: null,
	serializer: RESTSerializer.create({}),

	findByID: function(Model, id) {
		var serializer = this.get('serializer');

		return this.ajax(this.buildURL(Model, id), type.GET).then(function(data) {
			return serializer.deserialize(Model, null, data);
		});
	},

	/**
	The `findAll()` method is called when you call `find` on the store
	without an ID (i.e. `store.find('post')`).
	*/
	findAll: function(Model, sinceToken) {
		var query;

    	if (sinceToken) {
      		query = {
      			since: sinceToken
      		};
    	}

		return this.findQuery(Model, query);
	},

	/**
	This method is called when you call `find` on the store with a
	query object as the second parameter (i.e. `store.find('person', {
	page: 1 })`).
	*/
	findQuery: function(Model, query) {
		var serializer = this.get('serializer');

		return this.ajax(this.buildURL(Model), type.GET, { data: query }).then(function(data) {
			return serializer.deserialize(Model, null, data, true);
		});
	},


	serialize: function(Model, record, options) {
		options = options || {};

		return this.get('serializer').serialize(Model, record, options);
	},


	/**
	Implement this method in a subclass to handle the creation of
	new records.
	*/
	createRecord: function(Model, record) {
		var serializer = this.get('serializer'),
			data = this.serialize(Model, record, { 
				type: type.POST 
			});

		return this.ajax(this.buildURL(Model), type.POST, { data: data }).then(function(data) {
			return serializer.deserialize(Model, record, data);
		});
	},

	/**
	Implement this method in a subclass to handle the updating of
	a record.
	*/
	updateRecord: function(Model, record) {
		var serializer = this.get('serializer'),
			id = record.get(Model.primaryKey),
			data = this.serialize(Model, record, { 
				type: type.PUT 
			});

		return this.ajax(this.buildURL(Model, id), type.PUT, { data: data }).then(function(data) {
			return serializer.deserialize(Model, record, data);
		});
	},


	/**
	 * Implement this method in a subclass to handle the deletion of
	 * a record.
	 */
	deleteRecord: function(Model, record) {
		var id = record.get(Model.primaryKey);

		return this.ajax(this.buildURL(Model, id), type.DELETE);
	},



	ajax: function(url, type, options) {
		var _this = this,
			options = this._ajaxOptions(url, type, options);

		return new Ember.RSVP.Promise(function (resolve, reject) {
			Ember.$.ajax(options).then(function(data) {
				Ember.run(null, resolve, data);
			}, function(response) {
				Ember.run(null, reject, _this._responseToError(response));
			});
		});
	},

	_prepareURL: function(url) {
		var host = this.get('host'),
			namespace = this.get('namespace');

		if(namespace) {
			url = namespace + url;
		}

		if(host) {
			url = host + url;
		}

		return url;
	},

	_ajaxOptions: function(url, requestType, options) {
		options = options || {};
		options.url = this._prepareURL(url);
		options.type = requestType;
		options.dataType = options.dataType || 'json';
		options.context = this;
		options.headers = Ember.$.extend({}, this.get('headers'), options.headers);

		if(options.contentType!==false && 
			(requestType === type.POST || requestType === type.PUT || requestType === type.PATCH)) {
			options.contentType = options.contentType ||  "application/json";
			if(options.data && options.processData!==false) {
				options.data = JSON.stringify(options.data);
			}
		}

		return options;
	},

	_responseToError: function(response) {
		var message = response.responseTest || response.statusText || 'Unknown error',
			status = response.status || 500;

		if(response.responseJSON && response.responseJSON.message) {
			message = response.responseJSON.message;    
		}

		return new WebError(status, message);
	},

	buildURL: function(Model, id) {
		var url = '/' + this.pathForType(Model);
		if(id) {
			url += '/' + id;	
		}

		return url;
	},

	pathForType: function(Model) {
		if(!Model.type) {
			throw new Error('Model type is undefined');
		}

		if(Model.typePlural) {
			return Model.typePlural;
		}

		return Model.type + 's';
	},

	GET: function(url, options) {
		return this.ajax(url, type.GET, options);
	},

	POST: function(url, options) {
		return this.ajax(url, type.POST, options);
	},

	PUT: function(url, options) {
		return this.ajax(url, type.PUT, options);
	},

	DELETE: function(url, options) {
		return this.ajax(url, type.DELETE, options);
	}
});