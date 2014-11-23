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
			'__defaultValue': [],
			'__value': []
		});

		this._super();

		//recompute dirty
		this.propertyDidChange('value');
	},

	_wrapObjects: function(objects) {
		var wrappedObjects = [];
		var wrapperClass = this.get('wrapperClass');

		if(!wrapperClass) {
			throw new Error('Array wrapperClass is not defined');
		}

		if(Ember.typeOf(objects) !== 'array') {
			throw new Error('Objects are not an array');
		}

		for(var i=0; i<objects.length; i++) {
			var obj = objects[i];
			var wrappedObject = wrapperClass.create({
				parent: this
			});

			if(this.useSetupData) {
				wrappedObject.setupData(obj);
			} else {
				wrappedObject.set('value', obj);
			}

			wrappedObjects.pushObject(wrappedObject);
		}		

		return wrappedObjects;
	},

	//set value
	_serialize: function(objects) {
		var _this = this;
		var wrappedObjects = this._wrapObjects(objects);

		var items = this.get('__value');
		items.splice(0, items.length);

		for(var i=0;i<wrappedObjects.length; i++) {
			items.push(wrappedObjects[i]);	
		}

		//load computed property imadiately
		if(!this.get('async')) {
			setTimeout(function() {
				_this.get('computed');	
			}, 0);			
		}

		return items;
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
		return this.get('__value').length;
	}.property('value').readOnly(),
	
	/*Ember.Array mixin*/
	objectAt: function(idx) {
		var items = this.get('__value');
		var wrapperClass = this.get('wrapperClass');

		if(idx>=items.length) {
			return void 0;
		}

		var item = items[idx];
		return item.get('computed');
  	},

  	replace: function(idx, amt, objects) {
  		if(this.get('readOnly')) {
			throw new Error('Variable is read only');
		}

  		objects = this._wrapObjects(objects);

  		var items = this.get('__value');

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

    	this.childChanged(objects[0]); //can be removed

    	return this;
  	},

  	isDirty: function() {
		return this.get('dirtyCount')>0;
	}.property('dirtyCount').readOnly(),

  	computed: function() {
  		return this;
  	}.property().readOnly(), //'value', 'wrapperClass', '__value'

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

		this.propertyDidChange('value');

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
		var items = this.get('__value');
		for(var i=0; i<items.length; i++) {
			items[i].setAsOriginal(); //notice: because must be setted as original
		}
	},

	setAsOriginal: function() {
		this._super();

		//notify childs
		var items = this.get('__value');
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