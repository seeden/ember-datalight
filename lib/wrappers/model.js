'use strict';

var Wrapper = require('./wrapper');

var ModelWrapper = module.exports = Wrapper.extend({
	model: null,
	async: true,

	isModel: true,

	//set value
	_serialize: function(value) {
		var _this = this;

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
		var value = this.get('value');
		var model = this.get('model');

		if(!model || !model.find) {
			throw new Error('Model is not defined or has no implemented method find');
		}

		return model.find(value);
	}.property('value', 'model').readOnly()
});