'use strict';

var Ember = require('ember'),
	DataLight = require('./index');

var JSONSerializer = module.exports = DataLight.JSONSerializer = Ember.Object.extend({
	serializeIntoHash: function(type, model, record) {
		return record.toJSON(function(key, meta) {
			if(type === 'PUT' && meta.options.put === false) {
				return false;
			}
		});
	}
});