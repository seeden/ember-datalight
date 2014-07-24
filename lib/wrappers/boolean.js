'use strict';

var Wrapper = require('./wrapper');

var BooleanWrapper = module.exports = Wrapper.extend({
	//set value
	_serialize: function(value) {
		if(typeof value === 'string') {
			value = value.toLowerCase();
			if(value==='true' || value==='yes' || value==='1') {
				return true;
			} 
			
			return false;
		}

		return Boolean(value);
	}
});