'use strict';

var Ember = require('ember'),
	Wrapper = require('./wrapper'),
	ModelWrapper = require('./model'),
	MixedWrapper = require('./mixed'),
	Model = require('../model');

var ArrayWrapper = module.exports = Wrapper.extend(Ember.MutableArray, {
	async: true,
	dirtyCount: 0,
	dirtyNames: [],

	useSetupData: false,


	copy: function() {
		properties = ['value', 'original', 'defaultValue', 
			'readOnly', 'async',
			'canBeNull', 'canBeUndefined', 
			'handleNull', 'handleUndefined'];

		return this.constructor.create(this.getProperties(properties));
	},

	init: function() {
		var wrapperClass = this.get('wrapperClass');
		if(!wrapperClass) {
			throw new Error('WrapperClass is undefined');
		}

		this.setProperties({
			dirtyNames: [],
			original: [],
			'__defaultValue': []
		});

		this._super();

		//recompute dirty
		this.propertyDidChange('value');
	},

	_prepareItems: function(items) {
		var newItems = [];

		var wrapperClass = this.get('wrapperClass');
		if(!wrapperClass) {
			throw new Error('Array wrapperClass is not defined');
		}

		if(Ember.typeOf(items) !== 'array') {
			throw new Error('Items is not an array');
		}

		for(var i=0; i<items.length; i++) {
			var item = items[i],
				newItem = wrapperClass.create({
					parent: this
				});

			if(this.useSetupData) {
				newItem.setupData(item);
			} else {
				newItem.set('value', item);
			}

			newItems.pushObject(newItem);
		}		

		return newItems;
	},

	//set value
	_serialize: function(items) {
		items = this._prepareItems(items);

		var newItems = this.get('__value') || Ember.A([]);
		newItems.splice(0, newItems.length);

		for(var i=0;i<items.length; i++) {
			newItems.push(items[i]);	
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
  		objects = this._prepareItems(objects);

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

    	this.childChanged(objects[0]);

    	return this;
  	},

  	isDirty: function() {
		return this.get('dirtyCount')>0;
	}.property('dirtyCount').readOnly(),

  	computed: function() {
  		var items = this.get('value'),
  			wrapperClass = this.get('wrapperClass'),
  			wrapperItems = this.get('__value') || [];

  		if(wrapperClass && wrapperClass.isModelWrapper) {
  			return wrapperClass.model.findMany(items);
  		} else if(wrapperClass && wrapperClass.isObjectWWW) {
  			var newItems = [];

			for(var i=0; i<wrapperItems.length; i++) {
				newItems.push(wrapperItems[i].get('computed'));
			}

			return newItems;
  		}

  		return items;
  	}.property('value', 'wrapperClass', '__value').readOnly(),


  	wrapperClass: function() {
		return this.constructor.wrapperClass;
	}.property().readOnly(),


	childChanged: function(child) {
		var dirtyCount = 0;
		var dirtyNames = [];
		var items = this.get('__value') || Ember.A([]);

		for(var i=0; i<items.length; i++) {
			var wrapper = items[i];

			if(wrapper === child) {
				//notify base object about changes
				//this.arrayContentDidChange(i, amt, len);
				this.propertyDidChange(i);
			}

			if(!wrapper.get('isDirty')) {
				continue;
			}

			dirtyCount++;
			dirtyNames.push(i);
		}

		this.setProperties({
			dirtyCount: dirtyCount,
			dirtyNames: dirtyNames
		});

		//notify parent
		var parent = this.get('parent');
		if(!parent) {
			return;
		}

		parent.childChanged(this);	
	},

	rollback: function() {
		this._super();

		//notify childs
		var items = this.get('__value') || Ember.A([]);
		for(var i=0; i<items.length; i++) {
			items[i].setAsOriginal(); //notice: because must be setted as original
		}
	},

	setAsOriginal: function() {
		this._super();

		//notify childs
		var items = this.get('__value') || Ember.A([]);
		for(var i=0; i<items.length; i++) {
			items[i].setAsOriginal();
		}
	},

	setupData: function(data, partial) {
		this.useSetupData = true;
		this._super(data, partial);
		this.useSetupData = false;

		this.propertyDidChange('value');
	}
});

ArrayWrapper.reopenClass({
	wrapperClass: MixedWrapper
});