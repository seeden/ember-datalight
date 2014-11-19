'use strict';

var Wrapper = require('./wrapper'),
	ModelBase = require('../modelbase');

var ModelWrapper = module.exports = Wrapper.extend({
	async: true,

	//set value
	_serialize: function(value) {
		var _this = this,
			model = this.get('model');

		if(!model) {
			throw new Error('Model is not defined or has no implemented method find');
		}

		if(value instanceof model) {
			value = value.get(value.constructor.primaryKey);
		}

		//load computed property imadiately
		if(!this.get('async')) {
			setTimeout(function() {
				_this.get('computed');
			}, 0);
		}

		return value;
	},

	//get value
	_deserialize: function(value) {
		return value;
	},

	//retrive promise
	computed: function() {
		var value = this.get('value'),
			model = this.get('model');

		if(!model || !model.find) {
			throw new Error('Model is not defined or has no implemented method find');
		}

		return model.find(value);
	}.property('value').readOnly(),

	model: function() {
		return this.constructor.model;
	}.property()
});


ModelWrapper.reopenClass({
	model: null,
	isModelWrapper: true,

	getRelatedModels: function() {
		if(!this.model) {
			return [];
		}

		return [this.model];
	}
});