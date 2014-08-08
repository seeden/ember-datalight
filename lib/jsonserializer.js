'use strict';

var Ember = require('ember'),
	DataLight = require('./index');

var JSONSerializer = module.exports = DataLight.JSONSerializer = Ember.Object.extend({
	serialize: function(Model, record, options) {
		var isNew = record.get('isNew');
		
		return record.toJSON(function(key, meta) {
			if(meta.options.readOnly) {
				return false;
			}

			if(options.type === 'PUT' && meta.options.put === false) {
				return false;
			}
		});
	},

	deserialize: function(Model, record, content, isArray, includedModels) {
		isArray = isArray || false;

		var field = this.fieldForType(Model, isArray),
			modelData = content[field];

		this.deserializeRelationships(Model, content, includedModels);

		if(isArray) {
			return this._deserializeArray(Model, modelData, content);
		}

		if(record) {
			return this._deserializeRecord(record, modelData, content);
		}
		
		return this._deserializeSingle(Model, modelData, content);
	},

	_deserializeRecord: function(record, modelData, content) {
		record.setupData(modelData, false, true);
		record.set('content', content);

		return record;
	},	

	_deserializeSingle: function(Model, modelData, content) {
		var model = Model.buildRecord(modelData);
		model.set('content', content);

		return model;
	},

	_deserializeArray: function(Model, modelDatas, content) {
		var models = [];

		for(var i=0; i<modelDatas.length; i++) {
			models.push(this._deserializeSingle(Model, modelDatas[i], content, true));
		}
	
		return models;
	},

	deserializeRelationships: function(Model, content, includedModels) {
		var _this = this,
			used = {};

		if(!content) {
			return;
		}

		var models = Model.getRelatedModels(includedModels);

		for(var i=0; i<models.length; i++) {
			var RelatedModel = models[i];

			var type = _this.fieldForType(RelatedModel);
			var typeArray = _this.fieldForType(RelatedModel, true);

			if(type && content[type]) {
				RelatedModel.buildRecord(content[type]);
			}

			if(typeArray && content[typeArray]) {
				var data = content[typeArray];

				for(var j=0; j<data.length; j++) {
					RelatedModel.buildRecord(data[j]);		
				}
			}
		}
	},

	fieldForType: function(Model, isArray) {
		if(!Model.type) {
			throw new Error('Model type is undefined');
		}

		if(isArray && Model.typePlural) {
			return Model.typePlural;
		}

		return isArray ? Model.type+'s' : Model.type;
	}
});