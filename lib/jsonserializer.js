'use strict';

var Ember = require('ember'),
	DataLight = require('./index');

var JSONSerializer = module.exports = DataLight.JSONSerializer = Ember.Object.extend({
	serialize: function(Model, record, options) {
		return record.toJSON(function(key, meta) {
			if(meta.options.readOnly) {
				return false;
			}

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

	_deserializeSingle: function(Model, modelData, content, disableDR) {
		var model = Model.buildRecord(modelData);
		model.set('content', content);
		
		/*
		var model = Model.create(modelData);

		model.set('content', content);
		model.saved();*/	

		if(!disableDR) {
			this._deserializeRelationships(Model, content);	
		}
		
		return model;
	},

	_deserializeArray: function(Model, modelDatas, content) {
		var models = [];

		for(var i=0; i<modelDatas.length; i++) {
			models.push(this._deserializeSingle(Model, modelDatas[i], content, true));
		}

		this._deserializeRelationships(Model, content, true);
	
		return models;
	},

	_deserializeRelationships: function(Model, content, isArray) {
		var self = this;
		var used = {};

		Model.eachComputedProperty(function(name, meta) {
			if(!meta.options || !meta.options.belongsTo) {
				return;
			}

			var Model = meta.options.belongsTo;
			var type = self.fieldForType(Model, isArray);

			if(!type || !content || used[type] || !content[type]) {
				return;
			}

			used[type] = true;

			Model.push(content[type]);
		});
	},

	fieldForType: function(Model, isArray) {
		if(!Model.type) {
			throw new Error('Model type is undefined');
		}

		return isArray ? Model.type+'s' : Model.type;
	}
});