var value = 123456;

describe('Wrapper', function(){
	it('can create', function() {
		var wrapper = Wrapper.create();

		Should(wrapper.get('value')).be.exactly(undefined);
    });

    it('can not set value', function() {
		var wrapper = Wrapper.create();

		expect(function(){
			wrapper.set('value', value);
		}).toThrow(new Error("Serialize is not implemented"));
    });

    it('can should copy', function() {
		var wrapper = Wrapper.create();

		var wrapper2 = wrapper.copy();

		Should(wrapper2 instanceof Wrapper).be.exactly(true);
    });
});

describe('Number Wrapper', function(){
	it('can create', function() {
		var wrapper = NumberWrapper.create();

		Should(wrapper.get('value')).be.exactly(undefined);
		Should(wrapper.get('isDefined')).be.exactly(false);
		Should(wrapper.get('isNull')).be.exactly(false);
    });

    it('can set value', function() {
		var wrapper = NumberWrapper.create();

		wrapper.set('value', value);

		Should(wrapper.get('value')).be.exactly(value);
		Should(wrapper.get('isDefined')).be.exactly(true);
		Should(wrapper.get('isNull')).be.exactly(false);
    });

    it('can create with value', function() {
		var wrapper = NumberWrapper.create({
			value: value
		});

		Should(wrapper.get('value')).be.exactly(value);
    });

     it('can check dirty', function() {
		var wrapper = NumberWrapper.create({});

		Should(wrapper.get('isDirty')).be.exactly(false);
		wrapper.set('value', 999);
		Should(wrapper.get('isDirty')).be.exactly(true);


		wrapper = NumberWrapper.create({
			value: value
		});

		Should(wrapper.get('isDirty')).be.exactly(true);
    });   

    it('can not set for readOnly', function() {
		var wrapper = NumberWrapper.create({
			readOnly: true,
			original: value
		});

		Should(wrapper.get('value')).be.exactly(value);

		expect(function(){
			wrapper.set('value', 9999);
		}).toThrow(new Error("Variable is read only"));
    });   

    it('can should copy', function() {
		var wrapper = NumberWrapper.create({
			value: value
		});

		var wrapper2 = wrapper.copy();

		Should(wrapper2 instanceof NumberWrapper).be.exactly(true);
		Should(wrapper2.get('value')).be.exactly(value);
    });

    it('can create with value equal null', function() {
		var wrapper = NumberWrapper.create({
			value: null
		});

		Should(wrapper.get('value')).be.exactly(null);
		Should(wrapper.get('isDefined')).be.exactly(true);
		Should(wrapper.get('isNull')).be.exactly(true);
    });

    it('can create with casted value to number equal -123', function() {
		var wrapper = NumberWrapper.create({
			value: "-123"
		});

		Should(wrapper.get('value')).be.exactly(-123);
		Should(wrapper.get('isDefined')).be.exactly(true);
		Should(wrapper.get('isNull')).be.exactly(false);
    });
});


describe('Boolean Wrapper', function(){
	it('can create', function() {
		var wrapper = BooleanWrapper.create();

		Should(wrapper.get('value')).be.exactly(undefined);
		Should(wrapper.get('isDefined')).be.exactly(false);
		Should(wrapper.get('isNull')).be.exactly(false);
    });

    it('can set value true', function() {
		var wrapper = BooleanWrapper.create();

		wrapper.set('value', true);

		Should(wrapper.get('value')).be.exactly(true);
		Should(wrapper.get('isDefined')).be.exactly(true);
		Should(wrapper.get('isNull')).be.exactly(false);
    });

    it('can create with value false', function() {
		var wrapper = BooleanWrapper.create({
			value: false
		});

		Should(wrapper.get('value')).be.exactly(false);
		Should(wrapper.get('isDefined')).be.exactly(true);
		Should(wrapper.get('isNull')).be.exactly(false);
    });

    it('can should copy', function() {
		var wrapper = BooleanWrapper.create({
			value: true
		});

		var wrapper2 = wrapper.copy();

		Should(wrapper2 instanceof BooleanWrapper).be.exactly(true);
		Should(wrapper2.get('value')).be.exactly(true);
    });


    it('can create with casted value equal "true"', function() {
		var wrapper = BooleanWrapper.create({
			value: "true"
		});

		Should(wrapper.get('value')).be.exactly(true);
		Should(wrapper.get('isDefined')).be.exactly(true);
		Should(wrapper.get('isNull')).be.exactly(false);
    });

    it('can create with casted value equal "yes"', function() {
		var wrapper = BooleanWrapper.create({
			value: "yes"
		});

		Should(wrapper.get('value')).be.exactly(true);
		Should(wrapper.get('isDefined')).be.exactly(true);
		Should(wrapper.get('isNull')).be.exactly(false);
    });

    it('can create with casted value equal "1"', function() {
		var wrapper = BooleanWrapper.create({
			value: "1"
		});

		Should(wrapper.get('value')).be.exactly(true);
		Should(wrapper.get('isDefined')).be.exactly(true);
		Should(wrapper.get('isNull')).be.exactly(false);
    });         
});


describe('Array Wrapper', function(){
	it('can create', function() {
		var wrapper = ArrayWrapper.create();

		Should(wrapper.get('value')).be.instanceof(Array).and.have.lengthOf(0);
		Should(wrapper.get('isDefined')).be.exactly(true);
		Should(wrapper.get('isNull')).be.exactly(false);
    });

    it('can set value', function() {
		var wrapper = ArrayWrapper.create({
			type: StringWrapper
		});

		wrapper.set('value', ["ahoj", "peter"]);

		Should(wrapper.get('value')).be.instanceof(Array).and.have.lengthOf(2);
		Should(wrapper.get('isDefined')).be.exactly(true);
		Should(wrapper.get('isNull')).be.exactly(false);

		Should(wrapper.objectAt(0)).be.exactly("ahoj");
		Should(wrapper.objectAt(1)).be.exactly("peter");

		wrapper.forEach(function(item, index){
			Should(item).be.exactly(index===0 ? "ahoj" : "peter");
		});

		wrapper.pushObject("smith");
		Should(wrapper.get('value')).be.instanceof(Array).and.have.lengthOf(3);

		wrapper.removeAt(1);
		Should(wrapper.get('value')).be.instanceof(Array).and.have.lengthOf(2);
		wrapper.forEach(function(item, index){
			Should(item).be.exactly(index===0 ? "ahoj" : "smith");
		});
    });
});

var TestModel = Model.extend({});
TestModel.reopenClass({
	type: 'test'
});


describe('Test Model', function(){
	it('instanceof', function() {
		var testModel = TestModel.create({});

		Should(TestModel.isModel).be.exactly(true);
		Should(Model.isModel).be.exactly(true);
		Should(ModelBase.isModel).not.be.exactly(true);

		Should(testModel instanceof TestModel).be.exactly(true);
		Should(testModel instanceof Model).be.exactly(true);
		Should(testModel instanceof ModelBase).be.exactly(true);
    });
});

describe('Object Wrapper', function(){
	it('can create', function() {
		var obj = ComputedObject.build({
			name: DataLight.attribute(String, {defaultValue: 'Zlatko Fedor'})
		});

		var wrapper = ObjectWrapper.create({
			obj: obj
		});

		Should(wrapper.get('isDefined')).be.exactly(true);
		Should(wrapper.get('isNull')).be.exactly(false);
    });
});

/*
//MUST BE LAST
describe('Model Wrapper', function(){
	it('can create', function() {
		var wrapper = ModelWrapper.create();

		Should(wrapper.get('isDefined')).be.exactly(false);
		Should(wrapper.get('isNull')).be.exactly(false);
    });

    it('can set value', function() {
		var wrapper = ModelWrapper.create({});

		wrapper.set('value', 123456);

		Should(wrapper.get('value')).be.exactly(123456);
		Should(wrapper.get('isDefined')).be.exactly(true);
		Should(wrapper.get('isNull')).be.exactly(false);

		expect(function(){
			wrapper.get('computed');
		}).toThrow(new Error("Model is not defined or has no implemented method find"));
    });

    it('can set with real model', function() {
		var wrapper = ModelWrapper.create({
			model: TestModel
		});

		wrapper.set('value', 123456);


		Should(wrapper.get('model').type).be.exactly('test');

		Should(wrapper.get('value')).be.exactly(123456);
		Should(wrapper.get('isDefined')).be.exactly(true);
		Should(wrapper.get('isNull')).be.exactly(false);

		wrapper.get('computed');
    });
});*/