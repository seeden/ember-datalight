var Ember = require('ember'),
	$ = Ember.$,
	DataLight = require('./index'),
	ModelBase = require('./modelbase'),
	ComputedObject = require('./computedobject'),
	Wrapper = require('./wrappers/wrapper'),
	MixedWrapper = require('./wrappers/mixed'),
	ObjectWrapper = require('./wrappers/object'),
	StringWrapper = require('./wrappers/string'),
	NumberWrapper = require('./wrappers/number'),
	BooleanWrapper = require('./wrappers/boolean'),
	DateWrapper = require('./wrappers/date'),
	ModelWrapper = require('./wrappers/model'),
	ArrayWrapper = require('./wrappers/array');

function getWrapperClass(type) {
	var typeOfType = Ember.typeOf(type),
		wrapper = null;

	if(!type) {
		wrapper = MixedWrapper;
	} else if(type === String) {
		wrapper = StringWrapper;
	} else if(type === Number) {
		wrapper = NumberWrapper;
	} else if(type === Boolean) {
		wrapper = BooleanWrapper;
	} else if(type === Date) {
		wrapper = DateWrapper;
	} else if(type.isWrapper) {
		//user added instance of wrapper as parameter
		wrapper = type;
	} else if(type.isModel) {
		//user added model class as parameter
		wrapper = ModelWrapper.extend({
			model: type
		});
	} else if(typeOfType === 'array') {
		if(type.length>1) {
			throw new Error('Array wrapper can handle max one parameter');
		}

		wrapper = ArrayWrapper.extend({
			wrapperClass: getWrapperClass(type[0])
		});
	} else if(typeOfType === 'object') {
		wrapper = ObjectWrapper.extend({
			computedObject: ComputedObject.extend(type)
		});
	}

	if(!wrapper){
		throw new Error('Type of wrapper is unrecognized');
	}

	return wrapper;
}

var attribute = DataLight.attribute = module.exports =  function attribute(type, options) {
	var wrapperClass = getWrapperClass(type);

	var meta = {
		isAttribute: true,
		wrapperClass: wrapperClass,
		getWrapper: function(obj, name) {
			var wrappers = obj.get('__wrappers');
			if(!wrappers) {
				obj.set('__wrappers', wrappers = {});	
			}

			if(!wrappers[name]) {
				wrappers[name] = wrapperClass.create($.extend({}, options || {}));
			}

			return wrappers[name];
		}
	};

	return Ember.computed(function(key, value) {
		var wrapper = meta.getWrapper(this, key);

		if (arguments.length > 1) {
			try {
				wrapper.set('value', value);	
			} catch(e) {
				console.log('PROBLEM WITH>'+key);
				throw e;
			}

			
		} 

		//default behavior is computed for templates, value is used for storing to database
		return wrapper.get('computed');
	}).meta(meta);
};