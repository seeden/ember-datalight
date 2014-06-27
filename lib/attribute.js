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

function getValue(obj, key, deserialize, useRelationship) {
	var meta = obj.constructor.metaForProperty(key);
	var options = meta.options;
	var value = null;
	var __attributes = obj.get('__attributes');
	var __data = obj.get('__data');

	//return latest unsaved value
	if(__attributes && typeof __attributes[key] !== 'undefined') {
		value = __attributes[key];
	} else if(__data && typeof __data[key] !== 'undefined') {
	 	//return saved value
		value = __data[key];
	} else if(typeof options.defaultValue === 'function') {
		//return default value from function
		value = options.defaultValue(obj, key);
	} else {
		value = options.defaultValue;
	}

	var isDefined = typeof value !== 'undefined';

	if(isDefined && useRelationship && options.belongsTo) {
		var model = options.belongsTo;

		return meta.isArray 
			? model.findMany(value)
			: model.find(value);
	}

	if(meta.type && meta.type.deserialize) {
		return meta.type.deserialize(value);
	}

	return value;
}

function typeCast(value, type) {
	var types = [String, Number, Boolean, Date];
	var valueType = Ember.typeOf(value);

	if(!type) {
		return value;
	} 

	if(typeof value === 'undefined') {
		return 'undefined';
	}

	if(type === Array) {
		return (valueType==='array')
			? value
			: [value];
	}

	if(types.contains(type)) {
		return type(value);
	}

	return type.serialize(value);
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
		isArray: Ember.typeOf(type) === 'array',
		isAttribute: true,
		isDirty: isDirty,
		getValue: getValue
	};

	return Ember.computed('__data', '__attributes', function(key, value) {
		var __attributes = this.get('__attributes');
		var __data = this.get('__data');

		if(!__attributes) {
			this.set('__attributes', __attributes = {});
		}

		if(!__data) {
			this.set('__data', __data = {});
		}

		if (arguments.length > 1) {
			if(options.readOnly && !this.get('isNew')) {
				throw new Error('Property ' + key + ' is read only');
			}

			if(isObject) {
				subModel.setProperties(value);
			} else {
				value = typeCast(value, type);

				if(typeof this.__data[key] === 'undefined' || this.__data[key] !== value) {
					__attributes[key] = value;
				} else if(typeof this.__attributes[key] !== 'undefined') {
					delete __attributes[key];
				}

				this.set('__attributes', __attributes);
			}
		} 

		return isObject ? subModel : getValue(this, key, true, true);
	}).meta(meta);
};