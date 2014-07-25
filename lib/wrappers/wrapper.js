var Ember = require('ember');

var Wrapper = module.exports = Ember.Object.extend({
	__value: void 0, //set as undefined
	__original: void 0, 
	__defaultValue: void 0,

	parent: null,

	readOnly: false,

	canBeNull: true,
	canBeUndefined: true,

	handleNull: true,
	handleUndefined: true,

	init: function() {
		this._super();

		var props = this.getProperties(['value', 'defaultValue', 'canBeNull', 'canBeUndefined']);

		if(!props.canBeNull && (props.value === null || props.defaultValue === null)) {
			throw new Error('Can not be null');	
		} else if(!props.canBeUndefined && (typeof props.value === 'undefined' || typeof props.defaultValue === 'undefined')) {
			throw new Error('Can not be undefined');	
		}
	},

	value: function(key, value) {
		// setter
		if (arguments.length > 1) {
			if(this.get('readOnly')) {
				throw new Error('Variable is read only');
			} else if(value === null && !this.get('canBeNull')) {
				throw new Error('Can not be null');
			} else if(typeof value === 'undefined' && !this.get('canBeUndefined')) {
				throw new Error('Can not be undefined');
			}

			this.set('__value', this._preSerialize(value));
		}

		//getter
		var actualValue = this._preDeserialize(this.get('__value'));
		if(typeof actualValue === 'undefined') {
			return this.get('defaultValue');
		}

		return actualValue;
	}.property('__value', 'defaultValue'),

	defaultValue: function(key, value) {
		if (arguments.length > 1) {
			this.set('__defaultValue', this._preSerialize(value));	
		}

		return this._preDeserialize(this.get('__defaultValue'));
	}.property(),	

	original: function(key, value) {
		if (arguments.length > 1) {
			this.set('__original', this._preSerialize(value));	
		}

		return this._preDeserialize(this.get('__original'));
	}.property('__original'),

	_preSerialize: function(value) {
		if(value === null && this.get('handleNull')) {
			return value;
		} else if(typeof value === 'undefined' && this.get('handleUndefined')) {
			return value;
		}

		return this._serialize(value);
	},

	_preDeserialize: function(value) {
		if(value === null && this.get('handleNull')) {
			return value;
		} else if(typeof value === 'undefined' && this.get('handleUndefined')) {
			return value;
		}

		return this._deserialize(value);
	},	

	//set value
	_serialize: function(value) {
		throw new Error('Serialize is not implemented');
	},

	//get value
	_deserialize: function(value) {
		throw new Error('Deserialize is not implemented');
	},

	isDefined: function() {
		return typeof this.get('value') !== 'undefined';
	}.property('value').readOnly(),

	isNull: function() {
		return this.get('value') === null;
	}.property('value').readOnly(),

	hasParent: function() {
		return this.get('parent') !== null;
	}.property('parent').readOnly(),

	rollback: function() {
		if(!this.get('isChanged')) {
			return;
		}

		var props = this.getProperties('value', 'original');
		this.set('value', props.original);
	},

	isChanged: function() {
		var props = this.getProperties('value', 'original');
		return props.value !== props.original;
	}.property('value', 'original').readOnly(),

	/**
	 * This function is used for templates
	 * @return {[type]} [description]
	 */
	computed: function() {
		return this.get('value');
	}.property('value').readOnly()
});