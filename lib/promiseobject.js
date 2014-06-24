'use strict';

var Ember = require('ember');

var PromiseObject = module.exports = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin, {
	content: Ember.Object.create({})
});