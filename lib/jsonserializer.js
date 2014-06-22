'use strict';

var Ember = require('ember'),
	DataLight = require('./index');

var JSONSerializer = module.exports = DataLight.JSONSerializer = Ember.Object.extend({
	serialize: function(Model, record, options) {
		return record.toJSON(function(key, meta) {
			if(options.type === 'PUT' && meta.options.put === false) {
				return false;
			}
		});
	},

	deserialize: function(Model, data, isArray) {
		isArray = isArray || false;

		var field = this.fieldForType(Model, isArray);
		var modelData = data[field];

		if(isArray) {
			return this._deserializeArray(Model, modelData, data);
		}
		
		return this._deserializeSingle(Model, modelData, data);
	},

	_deserializeSingle: function(Model, modelData, content) {
		var model = Model.create(modelData);

		model.set('content', content);
		model.saved();	

		return model;
	},

	_deserializeArray: function(Model, modelDatas, content) {
		var models = [];

		for(var i=0; i<modelDatas.length; i++) {
			models.push(this._deserializeSingle(Model, modelDatas[i], content));
		}
		
		return models;
	},

	fieldForType: function(Model, isArray) {
		if(!Model.type) {
			throw new Error('Model type is undefined');
		}

		return isArray ? Model.type+'s' : Model.type;
	}
});