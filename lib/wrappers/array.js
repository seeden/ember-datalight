'use strict';

var Ember = require('ember'),
	Wrapper = require('./wrapper'),
	MixedWrapper = require('./mixed');

var ArrayWrapper = module.exports = Wrapper.extend(Ember.MutableArray, {
	__type: MixedWrapper,
	__defaultValue: Wrapper.defaultValue,

	init: function() {
		this.set('__defaultValue', []);
	},

	defaultValue: function(key, value) {
		console.log(key, value);

		if (arguments.length > 1) {
			this.set('__defaultValue', this._serialize(value));	
		}

		return this.get('__defaultValue');
	}.property(),

	//set value
	_serialize: function(items) {
		var type = this.get('__type');
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

		return newItems;
	},

	/*Ember.Enumerable mixin*/
	length: function() {
		var items = this.get('value');
		return (items && items.length) ? items.length : 0;
	}.property('value'),
	
	/*Ember.Array mixin*/
	objectAt: function(idx) {
		var items = this.get('value');
		return (items && idx<items.length) ? items[idx].get('value') : void 0;
  	},

  	replace: function(idx, amt, objects) {
  		if(this.get('readOnly')) {
			throw new Error('Variable is read only');
		}

  		objects = objects || Ember.A([]);
  		objects = this._serialize(objects);

  		var items = this.get('value') || Ember.A([]);

		var len = objects.get('length');
		this.arrayContentWillChange(idx, amt, len);

		if (len === 0) {
			items.splice(idx, amt);
    	} else {
      		Ember.EnumerableUtils.replace(items, idx, amt, objects);
    	}

    	this.arrayContentDidChange(idx, amt, len);
    	return this;
  	}
});