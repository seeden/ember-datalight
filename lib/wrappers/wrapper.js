var Ember = require('ember');

var Wrapper = module.exports = Ember.Object.extend({
	__stored: void 0,
	__value: void 0, //set as undefined

	parent: null,

	readOnly: false,
	defaultValue: void 0,

	canBeNull: true,
	canBeUndefined: true,

	handleNull: true,
	handleUndefined: true,

	init: function(){
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
			var useSerializer = true;

			if(this.get('readOnly')) {
				throw new Error('Variable is read only');
			}

			if(value === null) {
				if(!this.get('canBeNull')) {
					throw new Error('Can not be null');	
				}

				if(this.get('handleNull')) {
					useSerializer = false;
				}
			}
			else if(typeof value === 'undefined') {
				if(!this.get('canBeUndefined')) {
					throw new Error('Can not be undefined');	
				}

				if(this.get('handleUndefined')) {
					useSerializer = false;
				}
			}

			this.set('__value', useSerializer ? this._serialize(value) : value);
		}

		//getter
		var actualValue = this.get('__value');
		if(typeof actualValue === 'undefined') {
			return this.get('defaultValue');
		}

		return actualValue;
	}.property('__value', 'defaultValue'),

	//set value
	_serialize: function(value) {
		throw new Error('Serialize is not implemented');
	},

	//get value
	_deserialize: function() {
		throw new Error('Deserialize is not implemented');
	},

	isDefined: function() {
		return typeof this.get('value') !== 'undefined';
	}.property('value'),

	isNull: function() {
		return this.get('value') === null;
	}.property('value'),

	hasParent: function() {
		return this.get('parent') !== null;
	}.property('parent'),

	rollback: function() {

	},
});