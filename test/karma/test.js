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
});