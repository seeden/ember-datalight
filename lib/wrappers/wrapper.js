var Ember = require('ember');

var Wrapper = module.exports = Ember.Object.extend(Ember.Copyable, {
	__value: void 0, //set as undefined
	__original: void 0, //stored value that can be different from default value
	__defaultValue: void 0,

	name: null,  //custom name for toJSON  - not implemented
	readOnly: false,

	canBeNull: true,
	canBeUndefined: true,

	handleNull: true,
	handleUndefined: true,

	isWrapper: true,

	parent: null,

	copy: function() {
		properties = ['value', 'original', 'defaultValue', 'name', 'readOnly', 'canBeNull', 'canBeUndefined', 'handleNull', 'handleUndefined'];
		return this.constructor.create(this.getProperties(properties));
	},

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
			actualValue = this.get('defaultValue');
		}

		return actualValue;
	}.property('__value', 'defaultValue'),

	defaultValue: function(key, value) {
		if (arguments.length > 1) {
			this.set('__defaultValue', this._preSerialize(value));	
		}

		var defaultValue = this.get('__defaultValue');
		if(typeof defaultValue === 'function') {
			defaultValue = defaultValue();
		}

		return this._preDeserialize(defaultValue);
	}.property(),	

	original: function(key, value) {
		if (arguments.length > 1) {
			this.set('__original', this._preSerialize(value));	
		}

		return this._preDeserialize(this.get('__original'));
	}.property('__original'),

	setAsOriginal: function(clearValue) {
		this.set('original', this.get('value'));
	},

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

	rollback: function() {
		if(!this.get('isDirty')) {
			return;
		}

		var props = this.getProperties('value', 'original');
		this.set('value', props.original);
	},

	isDirty: function() {
		var props = this.getProperties('value', 'original', 'defaultValue');
		return props.value !== props.defaultValue && props.value !== props.original;
	}.property('value', 'original', 'defaultValue').readOnly(),

	parentChanged: function() {
		var parent = this.get('parent');
		if(!parent) {
			return;
		}

		parent.childChanged(this);
	}.observes('value'),

	childChanged: function() {
		throw new Error('Method childChanged is not implemented');
	},

	/**
	 * This function is used for templates
	 * @return {[type]} [description]
	 */
	computed: function() {
		return this.get('value');
	}.property('value').readOnly()
});