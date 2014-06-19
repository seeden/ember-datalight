'use strict';

var Ember = require('ember'),
	DataLight = require('./index'),
	JSONSerializer = require('./jsonserializer');

var RESTSerializer = module.exports = DataLight.RESTSerializer = JSONSerializer.extend({});