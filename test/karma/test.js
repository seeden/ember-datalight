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