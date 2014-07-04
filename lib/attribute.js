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

	if(isDefined && value!==null && useRelationship && options.belongsTo) {
		var model = options.belongsTo;

		return meta.isArray ? model.findMany(value) : model.find(value);
	}

	if(meta.type && meta.type.deserialize) {
		return meta.type.deserialize(value);
	}

	return value;
}

function typeCast(meta, value) {
	var types = [String, Number, Boolean, Date];
	var typeOfValue = Ember.typeOf(value);

	if(meta.typeOfType === 'undefined') {
		return value;
	}

	if(typeOfValue === 'undefined' || typeOfValue === 'null') {
		return value;
	} 

	if(meta.isArray) {
		return (typeOfValue === 'array') ? value : [value];
	}

	if(types.contains(meta.type)) {
		return meta.type(value);
	}

	return type.serialize(value);
}

module.exports = DataLight.Attribute = function attribute(type, options) {
	options = options || {};
	options.readOnly = options.readOnly || false;
	options.belongsTo = options.belongsTo || false;

	var typeOfType = Ember.typeOf(type);
	var isArray = typeOfType === 'array';
	var isObject = typeOfType === 'object';

	if(isObject) {
		var SubModel = ModelBase.extend(type);
		var subModel = SubModel.create({});
	}

	var meta = {
		options: options,

		type: type,
		typeOfType: typeOfType,
		
		isObject: isObject,
		isArray: isArray,
		isAttribute: true,

		subModel: subModel,
		
		isDirty: isDirty,
		getValue: getValue
	};

	return Ember.computed('__data', '__attributes', function(key, value) {
		if (arguments.length > 1) {
			if(options.readOnly && !this.get('isNew')) {
				throw new Error('Property ' + key + ' is read only');
			}

			if(isObject) {
				subModel.setProperties(value);
			} else {
				var __attributes = this.get('__attributes');
				var __data = this.get('__data');

				if(!__attributes) {
					this.set('__attributes', __attributes = {});
				}

				if(!__data) {
					this.set('__data', __data = {});
				}

				value = typeCast(meta, value);

				if(typeof __data[key] === 'undefined' || __data[key] !== value) {
					__attributes[key] = value;
					this.set('__attributes', __attributes);
				} else if(typeof __attributes[key] !== 'undefined') {
					delete __attributes[key];
					this.set('__attributes', __attributes);
				}
			}
		} 

		return isObject ? subModel : getValue(this, key, true, true);
	}).meta(meta);
};