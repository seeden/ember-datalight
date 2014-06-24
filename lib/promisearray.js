'use strict';

var Ember = require('ember');

var PromiseArray = module.exports = Ember.ArrayProxy.extend(Ember.PromiseProxyMixin);