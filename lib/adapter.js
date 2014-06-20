'use strict';

var Ember = require('ember'),
	DataLight = require('./index');

var Adapter = module.exports = DataLight.Adapter = Ember.Object.extend({
    serializer: null,


	find: Ember.required(Function),

	/**
    The `findAll()` method is called when you call `find` on the store
    without an ID (i.e. `store.find('post')`).
    */
	findAll: null,

	/**
    This method is called when you call `find` on the store with a
    query object as the second parameter (i.e. `store.find('person', {
    page: 1 })`).
	*/
	findQuery: null,


	/**
    Proxies to the serializer's `serialize` method.
    */
	serialize: Ember.required(Function),


	/**
    Implement this method in a subclass to handle the creation of
    new records.
    */
	createRecord: Ember.required(Function),

	/**
    Implement this method in a subclass to handle the updating of
    a record.
    */
	updateRecord: Ember.required(Function),


	/**
	 * Implement this method in a subclass to handle the deletion of
     * a record.
	 */
	deleteRecord: Ember.required(Function),


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
	}
});