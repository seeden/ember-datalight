'use strict';

var Ember = require('ember'),
	Wrapper = require('./wrapper'),
	MixedWrapper = require('./mixed'),
	Model = require('../model');

var ArrayWrapper = module.exports = Wrapper.extend(Ember.MutableArray, {
	type: MixedWrapper,
	async: true,

	init: function() {
		this.set('__defaultValue', []);
	},

	//set value
	_serialize: function(items) {
		var type = this.get('type');
		if(!type) {
			throw new Error('Array type is not defined');
		}

		if(Ember.typeOf(items) !== 'array') {
			throw new Error('Items is not an array');
		}

		var newItems = Ember.A([]);
		for(var i=0; i<items.length; i++) {
			var item = items[i];

			var newItem = type.create({
				value: item
			});

			newItems.pushObject(newItem);
		}

		//load computed property imadiately
		if(!this.get('async')) {
			setTimeout(function() {
				_this.get('computed');	
			}, 0);			
		}

		return newItems;
	},

	//get value
	_deserialize: function(items) {
		var newItems = [];

		for(var i=0; i<items.length; i++) {
			newItems.push(items[i].get('value'));
		}

		return newItems;
	},

	/*Ember.Enumerable mixin*/
	length: function() {
		var items = this.get('__value');
		return (items && items.length) ? items.length : 0;
	}.property('value').readOnly(),
	
	/*Ember.Array mixin*/
	objectAt: function(idx) {
		var items = this.get('__value');
		return (items && idx<items.length) ? items[idx].get('value') : void 0;
  	},

  	replace: function(idx, amt, objects) {
  		if(this.get('readOnly')) {
			throw new Error('Variable is read only');
		}

  		objects = objects || Ember.A([]);
  		objects = this._preSerialize(objects);

  		var items = this.get('__value') || Ember.A([]);

		var len = objects.get('length');
		this.arrayContentWillChange(idx, amt, len);
		this.propertyWillChange('__value');

		if (len === 0) {
			items.splice(idx, amt);
    	} else {
      		Ember.EnumerableUtils.replace(items, idx, amt, objects);
    	}

    	this.propertyDidChange('__value');
    	this.arrayContentDidChange(idx, amt, len);
    	return this;
  	},

  	isChanged: function() {
  		var original = this.get('original');
  		var items = this.get('value');

  		if(original.length != items.length) {
  			return true;
  		}

  		for(var i=0; i<original.length; i++) {
  			if(original[i]!==items[i]) {
  				return true;
  			}
  		}

  		return false;
	}.property('value', 'original').readOnly(),

  	computed: function() {
  		var items = this.get('value');
  		var type = this.get('type');

  		if(type.isModel) {
  			return type.findMany(items);
  		}

  		return items;
  	}.property('value', 'type').readOnly()
});