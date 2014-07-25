var Ember = require('ember'),
	DataLight = require('./index'),
	ModelBase = require('./modelbase'),
	Wrapper = require('./wrappers/wrapper'),
	MixedWrapper = require('./wrappers/mixed'),
	ObjectWrapper = require('./wrappers/object'),
	StringWrapper = require('./wrappers/string'),
	NumberWrapper = require('./wrappers/number'),
	BooleanWrapper = require('./wrappers/boolean'),
	DateWrapper = require('./wrappers/date'),
	ModelWrapper = require('./wrappers/model'),
	ArrayWrapper = require('./wrappers/array');

function createWrapper(type, options) {
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
		return type;
	} else if(type.isModel) {
		//user added model class as parameter
		options.model = type;
		wrapper = ModelWrapper;
	} else if(typeOfType === 'array') {
		if(type.length>1) {
			throw new Error('Array wrapper can handle max one wrapper');
		}

		options.wrapper = createWrapper(type[0], {});
		wrapper = ArrayWrapper;
	} else if(typeOfType === 'object') {
		options.obj = ComputedObject.build(type);
		wrapper = ObjectWrapper;
	}

	if(!wrapper){
		throw new Error('Type of wrapper is unrecognized');
	}

	return wrapper.create(options);
}

var attribute = DataLight.attribute = module.exports =  function attribute(type, options) {
	var wrapper = createWrapper(type, options || {});

	return Ember.computed(function(key, value) {
		if (arguments.length > 1) {
			wrapper.set('value', value);
		} 

		//default behavior is computed for templates, value is used for storing to database
		return wrapper.get('computed');
	}).meta(wrapper);
};