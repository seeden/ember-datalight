var Ember = require('ember'),
	DataLight = require('./index'),
	ModelBase = require('./modelbase');

function isDirty(obj, key) {
	var meta = obj.constructor.metaForProperty(key);
	if(meta.isObject) {
		return meta.subModel.isDirty();
	}

	return (typeof obj.__attributes[key] !== 'undefined');
}

function getValue(obj, key, meta) {
	//return latest unsaved value
	if(typeof obj.__attributes[key] !== 'undefined') {
		return obj.__attributes[key];
	}

	//return saved value
	if(typeof obj.__data[key] !== 'undefined') {
		return obj.__data[key];
	}		

	//return default value from function
	var defaultValue = meta.options.defaultValue;
	if(typeof defaultValue === 'function') {
		return defaultValue(obj, key);
	}

	return defaultValue;
}

function typeCast(value, type) {
	var types = [String, Number, Boolean, Date, Array];

	if(!type) {
		return value;
	} else if(types.contains(type)) {
		if(typeof value ==='undefined') {
			return new type();
		}

		if(!(value instanceof type)) {
			return type(value);	
		}
	}

	return value;
}

module.exports = DataLight.Attribute = function attribute(type, options) {
	options = options || {};

	var isObject = (type !== null && typeof type === 'object');

	if(isObject) {
		var SubModel = ModelBase.extend(type);
		var subModel = SubModel.create({});
	}

	var meta = {
		type: type,
		options: options,
		isObject: isObject,
		subModel: subModel,
		isAttribute: true,
		isDirty: isDirty
	};

	return Ember.computed('__data', function(key, value) {
		if(!this.__attributes) {
			this.__attributes = {};
		}

		if(!this.__data) {
			this.__data = {};
		}

		if (arguments.length > 1) {
			if(isObject) {
				subModel.setProperties(value);
			} else {
				value = typeCast(value, type);

				if(typeof this.__data[key] === 'undefined' || this.__data[key] !== value) {
					this.__attributes[key] = value;
				} else if(typeof this.__attributes[key] !== 'undefined') {
					delete this.__attributes[key];
				}
			}
		} 

		return isObject ? subModel : getValue(this, key, meta);
	}).meta(meta);
};