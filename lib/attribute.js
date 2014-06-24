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

function getValue(obj, key, useRelationship) {
	var meta = obj.constructor.metaForProperty(key);
	var options = meta.options;
	var value = null;

	//return latest unsaved value
	if(typeof obj.__attributes[key] !== 'undefined') {
		value = obj.__attributes[key];
	} else if(typeof obj.__data[key] !== 'undefined') {
	 	//return saved value
		value = obj.__data[key];
	} else if(typeof options.defaultValue === 'function') {
		//return default value from function
		value = options.defaultValue(obj, key);
	} else {
		value = options.defaultValue;
	}

	if(!value) {
		return value;
	}

	if(useRelationship && options.belongsTo) {
		var model = options.belongsTo;
		var record = model.find(value);

		return record;
	}

	return value;
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
	options.readOnly = options.readOnly || false;
	options.belongsTo = options.belongsTo || false;

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
		isDirty: isDirty,
		getValue: getValue
	};

	return Ember.computed('__data', '__attributes', function(key, value) {
		if(!this.__attributes) {
			this.__attributes = {};
		}

		if(!this.__data) {
			this.__data = {};
		}

		if (arguments.length > 1) {
			if(options.readOnly) {
				throw new Error('Property ' + key + ' is read only');
			}

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

		return isObject ? subModel : getValue(this, key, true);
	}).meta(meta);
};