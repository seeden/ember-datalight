(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory(require("Ember"));
	else if(typeof define === 'function' && define.amd)
		define(["Ember"], factory);
	else if(typeof exports === 'object')
		exports["ember-datalight"] = factory(require("Ember"));
	else
		root["ember-datalight"] = factory(root["Ember"]);
})(this, function(__WEBPACK_EXTERNAL_MODULE_4__) {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/public/dist/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(2);
	module.exports = __webpack_require__(3);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Ember = __webpack_require__(4),
		Promise = Ember.RSVP.Promise,
		WebError = __webpack_require__(12),
		DataLight = __webpack_require__(3),
		ModelBase = __webpack_require__(5),
		RESTAdapter = __webpack_require__(6),
		PromiseObject = __webpack_require__(7),
		PromiseArray = __webpack_require__(8),
		attribute = __webpack_require__(9);
	
	var Model = module.exports = DataLight.Model = ModelBase.extend({
		adapter: function() {
			return this.constructor.adapter;
		}.property(),
	
		save: function() {
			var adapter = this.get('adapter'),
				isDeleted = this.get('isDeleted');
	
			if(isDeleted) {
				return this.destroyRecord();
			}
	
			if(this.get('isNew')) {
				return adapter.createRecord(this.constructor, this);
			}
	
			return adapter.updateRecord(this.constructor, this);
		},
	
		destroyRecord: function() {
			var _this = this,
				isNew = this.get('isNew'),
				isRemoved = this.get('isRemoved'),
				adapter = this.get('adapter');
	
			this.set('isDeleted', true);
	
			return new Ember.RSVP.Promise(function(resolve, reject) {
				if(isRemoved) {
					return resolve();	
				}
	
				if(isNew) {
					_this.set('isRemoved', true);
					//_this.destroy();
					return resolve();
				}
	
				adapter.deleteRecord(_this.constructor, _this).then(function() {
					_this.set('isRemoved', true);
					//_this.destroy();
				}).then(resolve, reject);
			});
		},
	
		deleteRecord: function() {
			this.set('isDeleted', true);
		},
	
		reloadRecord: function() {
			//TODO
		},
	
		/**
		 * Resolve all relationships
		 * @param  {Boolean} ignoreAsync If it is not true promises with async === true will be ignored
		 * @return {Promise}             [description]
		 */
		resolveRelationships: function(ignoreAsync) {
			var _this = this,
				promises = [],
				attributes = this.get('attributes');
	
			ignoreAsync = ignoreAsync || false;
	
			for(var name in attributes) {
				var wrapper = attributes[name];
	
				if(!ignoreAsync && wrapper.get('async')) {
					continue;
				}
	
				var promise = wrapper.resolveRelationships(ignoreAsync);
				if(!promise) {
					continue;
				}
	
				promises.push(Promise.cast(promise));			
			}
	
			return Ember.RSVP.Promise.all(promises).then(function() {
				return _this;
			});
		}
	});
	
	Model.reopenClass({
		isModel: true,
	
		adapter: RESTAdapter.create({}),
		attribute: attribute,
	
		primaryKey: 'id',
		type: null,
		included: [],
	
		resolveMultipleRecords: function(records) {
			var promises = [];
	
			for(var i=0; i<records.length; i++) {
				var record = records[i];
				promises.push(record.resolveRelationships());	
			}
	
			return Ember.RSVP.Promise.all(promises);
		},
	
		find: function(id) {
			var type = Ember.typeOf(id);
	
			if (type === 'undefined') {
	      		return this.findAll();
	    	} else if (type === 'object') {
				return this.findQuery(id);
			} else if (type === 'array') {
				return this.findMany(id);
			}
	
			return this.findByID(id);
		},
	
		findByID: function(id) {
			return PromiseObject.create({
				promise: this.adapter.findByID(this, id).then(function(record) {
					return record.resolveRelationships();
				})
			});
		},
	
		findAll: function(sinceToken) {
			var _this = this;
	
			return PromiseArray.create({
				promise: this.adapter.findAll(this, sinceToken).then(function(records) {
					return _this.resolveMultipleRecords(records);
				})
			});
		},
	
		findQuery: function(query) {
			var _this = this;
	
			return PromiseArray.create({
				promise: this.adapter.findQuery(this, query).then(function(records) {
					return _this.resolveMultipleRecords(records);
				})
			});
		},
	
		findMany: function(ids) {
			var _this = this;
	
			return PromiseArray.create({
				promise: this.adapter.findMany(this, ids).then(function(records) {
					return _this.resolveMultipleRecords(records);
				})
			});
		},
	
		/*
		push: function() {
			Ember.Logger.warn('Method push needs cached version of models');
		},*/
	
		ajax: function(url, type, options, isArray) {
			var Model = this,
				serializer = this.adapter.get('serializer');
	
			isArray = isArray || false;
	
			var promise = this.adapter.ajax(url, type, options).then(function(data) {
				return serializer.deserialize(Model, null, data, isArray);
			});
	
			if(isArray) {
				return PromiseArray.create({ promise: Promise.cast(promise) });
			} else {
				return PromiseObject.create({ promise: Promise.cast(promise) });
			}
		},
	
		GET: function(url, options, isArray) {
			return this.ajax(url, 'GET', options, isArray);
		},
	
		POST: function(url, options, isArray) {
			return this.ajax(url, 'POST', options, isArray);
		},
	
		PUT: function(url, options, isArray) {
			return this.ajax(url, 'PUT', options, isArray);
		},
	
		DELETE: function(url, options, isArray) {
			return this.ajax(url, 'DELETE', options, isArray);
		},
	
		getRelatedModels: function(includedModels) {
			var _this = this,
				used = {},
				models = [];
	
			includedModels = includedModels || [];
	
			this.eachComputedProperty(function(name, meta) {
				if(!meta || !meta.wrapperClass) {
					return;
				}
	
				var modelsAttr = meta.wrapperClass.getRelatedModels();
				for(var i=0; i<modelsAttr.length; i++) {
					var model = modelsAttr[i];
	
					if(used[model.type] || _this === model) {
						return;
					}
	
					models.push(model);
					used[model.type] = true;
				}
			});
	
			
			//additional included models
			for(var i=0; i<this.included.length; i++) {
				var model = this.included[i];
				if(used[model.type] || this === model) {
					continue;
				}
	
				models.push(model);
				used[model.type] = true;			
			}
	
			//additional included models
			for(var i=0; i<includedModels.length; i++) {
				var model = includedModels[i];
				if(used[model.type] || _this === model) {
					continue;
				}
	
				models.push(model);
				used[model.type] = true;			
			}
	
			return models;
		}
	});

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Ember = __webpack_require__(4),
		DataLight = __webpack_require__(3),
		PromiseArray = __webpack_require__(8),
		map = Ember.EnumerableUtils.map,
		RSVP = Ember.RSVP,
		Promise = RSVP.Promise;
	
	var Adapter = module.exports = DataLight.Adapter = Ember.Object.extend({
		serializer: null,
	
	
		findByID: Ember.required(Function),
	
		/**
		The `findAll()` method is called when you call `find` on the store
		without an ID (i.e. `store.find('post')`).
		*/
		findAll: null,
	
		/**
		This method is called when you call `find` on the store with a
		query object as the second parameter (i.e. `store.find('person', {
		page: 1 })`).
		*/
		findQuery: null,
	
	
		/**
		Proxies to the serializer's `serialize` method.
		*/
		serialize: Ember.required(Function),
	
	
		/**
		Implement this method in a subclass to handle the creation of
		new records.
		*/
		createRecord: Ember.required(Function),
	
		/**
		Implement this method in a subclass to handle the updating of
		a record.
		*/
		updateRecord: Ember.required(Function),
	
	
		/**
		 * Implement this method in a subclass to handle the deletion of
		 * a record.
		 */
		deleteRecord: Ember.required(Function),
	
	
		/**
		Find multiple records at once.
	
		By default, it loops over the provided ids and calls `find` on each.
		May be overwritten to improve performance and reduce the number of
		server requests.
		*/
		findMany: function(model, ids) {
			var self = this;
			var promise = Ember.RSVP.all(map(ids, function(id) {
				return self.findByID(model, id);
			}));
	
			return PromiseArray.create({
				promise: Promise.cast(promise)
			});
		}
	});

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Ember = __webpack_require__(4);
	
	var DataLight = module.exports = Ember.Namespace.create({});

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Ember = __webpack_require__(4),
		DataLight = __webpack_require__(3),
		ComputedObject = __webpack_require__(10);
	
	var ModelBase = module.exports = DataLight.ModelBase = Ember.Object.extend({
		isNew: true,
		isDeleted: false,
		isRemoved: false,
	
		dirtyCount: 0,
		dirtyNames: [],
	
		init: function() {
			this._super();
	
			var dirtyCount = 0,
				attributes = this.get('attributes');
	
			for(var name in attributes) {
				attributes[name].set('parent', this);
			}
	
			//recompute dirty
			this.childChanged();	
		},
	
		getWrapper: function(name) {
			var _this = this,
				wrapper = null;
	
			this.constructor.eachComputedProperty(function(wrapperName, meta) {
				if (wrapperName!==name) {
					return;
				}
	
				wrapper = meta.getWrapper(_this, name);
			});
	
			return wrapper;
		},	
	
		attributes: function() {
			var _this = this,
				map = {};
	
			this.constructor.eachComputedProperty(function(name, meta) {
				if (!meta || !meta.isAttribute) {
					return;
				}
	
				map[name] = meta.getWrapper(_this, name);
			});
	
			return map;
		}.property(),
	
		childChanged: function(child) {
			var dirtyCount = 0,
				dirtyNames = [],
				attributes = this.get('attributes');
	
			for(var name in attributes) {
				var wrapper = attributes[name];
	
				if(wrapper === child) {
					this.propertyDidChange(name);
				}
	
				if(!wrapper.get('isDirty')) {
					continue;
				}
	
				dirtyCount++;
				dirtyNames.push(name);
			}
	
			this.setProperties({
				dirtyCount: dirtyCount,
				dirtyNames: dirtyNames
			});	
		},
	
		isDirty: function() {
			return this.get('dirtyCount')>0;
		}.property('dirtyCount').readOnly(),
	
		dirtyAttributes: function() {
			var dirty = Ember.Map.create(),
				attributes = this.get('attributes');
	
			for(var name in attributes) {
				var wrapper = attributes[name];
				if(wrapper.get('isDirty')) {
					continue;
				}
	
				dirty.set(name, wrapper);
			}
	
			return dirty;
		}.property('dirtyCount', 'dirtyNames').readOnly(),
	
		rollback: function() {
			var attributes = this.get('attributes');
	
			for(var name in attributes) {
				attributes[name].rollback();
			}
	
			return this;
		},
	
		setAsOriginal: function() {
			var attributes = this.get('attributes');
	
			for(var name in attributes) {
				attributes[name].setAsOriginal();
			}
	
			this.set('isNew', false);
			return this;
		},
	
		toJSON: function(fn) {
			var properties = {},
				attributes = this.get('attributes');
	
			for(var name in attributes) {
				var wrapper = attributes[name];
				if(fn && fn(name, wrapper) === false) {
					continue;
				}
	
				properties[name] = wrapper.toJSON(fn, this);
			}
	
			return properties;
		},
	
		setupData: function(data, partial, rollback) {
			var json = this.toJSON();
	
			if (partial) {
				Ember.merge(json, data);
			} else {
				json = data;
			}
	
			if(rollback) {
				this.rollback();
			}
	
			var attributes = this.get('attributes');
			for(var name in attributes) {
				attributes[name].setupData(data[name], partial);
			}
	
			this.setAsOriginal(json);
			//this.propertyDidChange('value');
			return this;
		},
	
		adopt: function(record) {
			var data = record.toJSON();
			this.setupData(data, false, true);
		}
	
	
		/*************  PART BOTTOM IS NOT READY FOR NEW STRUCTURE  **************/
		/*copy: function() {
			var properties = this.getProperties(['isNew', 'isDeleted', 'isRemoved']);
			var data = Ember.$.extend({}, properties);
			return this.constructor.create(data);
		}*/
	});
	
	
	ModelBase.reopenClass({
		buildRecord: function(data) {
			var model = this.create({});
			model.setupData(data);
			return model;
		}	
	});

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Ember = __webpack_require__(4),
		WebError = __webpack_require__(12),
		DataLight = __webpack_require__(3),
		Adapter = __webpack_require__(2),
		RESTSerializer = __webpack_require__(11);
	
	var type = {
		GET: 'GET',
		POST: 'POST',
		PUT: 'PUT',
		DELETE: 'DELETE',
		PATCH: 'PATCH'
	};
	
	var RESTAdapter = module.exports = DataLight.RESTAdapter = Ember.Object.extend({
		headers: {},
		host: null,
		namespace: null,
		serializer: RESTSerializer.create({}),
	
		findByID: function(Model, id) {
			var serializer = this.get('serializer');
	
			return this.ajax(this.buildURL(Model, id), type.GET).then(function(data) {
				return serializer.deserialize(Model, null, data);
			});
		},
	
		/**
		The `findAll()` method is called when you call `find` on the store
		without an ID (i.e. `store.find('post')`).
		*/
		findAll: function(Model, sinceToken) {
			var query;
	
	    	if (sinceToken) {
	      		query = {
	      			since: sinceToken
	      		};
	    	}
	
			return this.findQuery(Model, query);
		},
	
		/**
		This method is called when you call `find` on the store with a
		query object as the second parameter (i.e. `store.find('person', {
		page: 1 })`).
		*/
		findQuery: function(Model, query) {
			var serializer = this.get('serializer');
	
			return this.ajax(this.buildURL(Model), type.GET, { data: query }).then(function(data) {
				return serializer.deserialize(Model, null, data, true);
			});
		},
	
	
		serialize: function(Model, record, options) {
			options = options || {};
	
			return this.get('serializer').serialize(Model, record, options);
		},
	
	
		/**
		Implement this method in a subclass to handle the creation of
		new records.
		*/
		createRecord: function(Model, record) {
			var serializer = this.get('serializer'),
				data = this.serialize(Model, record, { 
					type: type.POST 
				});
	
			return this.ajax(this.buildURL(Model), type.POST, { data: data }).then(function(data) {
				return serializer.deserialize(Model, record, data);
			});
		},
	
		/**
		Implement this method in a subclass to handle the updating of
		a record.
		*/
		updateRecord: function(Model, record) {
			var serializer = this.get('serializer'),
				id = record.get(Model.primaryKey),
				data = this.serialize(Model, record, { 
					type: type.PUT 
				});
	
			return this.ajax(this.buildURL(Model, id), type.PUT, { data: data }).then(function(data) {
				return serializer.deserialize(Model, record, data);
			});
		},
	
	
		/**
		 * Implement this method in a subclass to handle the deletion of
		 * a record.
		 */
		deleteRecord: function(Model, record) {
			var id = record.get(Model.primaryKey);
	
			return this.ajax(this.buildURL(Model, id), type.DELETE);
		},
	
	
	
		ajax: function(url, type, options) {
			var _this = this,
				options = this._ajaxOptions(url, type, options);
	
			return new Ember.RSVP.Promise(function (resolve, reject) {
				Ember.$.ajax(options).then(function(data) {
					Ember.run(null, resolve, data);
				}, function(response) {
					Ember.run(null, reject, _this._responseToError(response));
				});
			});
		},
	
		_prepareURL: function(url) {
			var host = this.get('host'),
				namespace = this.get('namespace');
	
			if(namespace) {
				url = namespace + url;
			}
	
			if(host) {
				url = host + url;
			}
	
			return url;
		},
	
		_ajaxOptions: function(url, requestType, options) {
			options = options || {};
			options.url = this._prepareURL(url);
			options.type = requestType;
			options.dataType = options.dataType || 'json';
			options.context = this;
			options.headers = Ember.$.extend({}, this.get('headers'), options.headers);
	
			if(options.contentType!==false && 
				(requestType === type.POST || requestType === type.PUT || requestType === type.PATCH)) {
				options.contentType = options.contentType ||  "application/json";
				if(options.data && options.processData!==false) {
					options.data = JSON.stringify(options.data);
				}
			}
	
			return options;
		},
	
		_responseToError: function(response) {
			var message = response.responseTest || response.statusText || 'Unknown error',
				status = response.status || 500;
	
			if(response.responseJSON && response.responseJSON.message) {
				message = response.responseJSON.message;    
			}
	
			return new WebError(status, message);
		},
	
		buildURL: function(Model, id) {
			var url = '/' + this.pathForType(Model);
			if(id) {
				url += '/' + id;	
			}
	
			return url;
		},
	
		pathForType: function(Model) {
			if(!Model.type) {
				throw new Error('Model type is undefined');
			}
	
			if(Model.typePlural) {
				return Model.typePlural;
			}
	
			return Model.type + 's';
		},
	
		GET: function(url, options) {
			return this.ajax(url, type.GET, options);
		},
	
		POST: function(url, options) {
			return this.ajax(url, type.POST, options);
		},
	
		PUT: function(url, options) {
			return this.ajax(url, type.PUT, options);
		},
	
		DELETE: function(url, options) {
			return this.ajax(url, type.DELETE, options);
		}
	});

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Ember = __webpack_require__(4);
	
	var PromiseObject = module.exports = Ember.ObjectProxy.extend(Ember.PromiseProxyMixin, {
		//content: Ember.Object.create({})
	});

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Ember = __webpack_require__(4);
	
	var PromiseArray = module.exports = Ember.ArrayProxy.extend(Ember.PromiseProxyMixin);

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var Ember = __webpack_require__(4),
		$ = Ember.$,
		DataLight = __webpack_require__(3),
		ModelBase = __webpack_require__(5),
		ComputedObject = __webpack_require__(10),
		Wrapper = __webpack_require__(13),
		MixedWrapper = __webpack_require__(14),
		ObjectWrapper = __webpack_require__(15),
		StringWrapper = __webpack_require__(16),
		NumberWrapper = __webpack_require__(17),
		BooleanWrapper = __webpack_require__(18),
		DateWrapper = __webpack_require__(19),
		ModelWrapper = __webpack_require__(20),
		ArrayWrapper = __webpack_require__(21);
	
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

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Ember = __webpack_require__(4);
	
	var ComputedObject = module.exports = Ember.Object.extend({
		attributes: Ember.computed(function() {
			var _this = this,
				map = {};
	
			this.constructor.eachComputedProperty(function(name, meta) {
				if (!meta || !meta.isAttribute) {
					return;
				}
	
				map[name] = meta.getWrapper(_this, name);
			});
	
			return map;
		})
	});

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Ember = __webpack_require__(4),
		DataLight = __webpack_require__(3),
		JSONSerializer = __webpack_require__(22);
	
	var RESTSerializer = module.exports = DataLight.RESTSerializer = JSONSerializer.extend({
		
	});

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root) {
		'use strict';
	
		function defineWebError (BaseError) {
			function WebError (status, message, constructorOpt) {
				this.status = status || 500;
				message = message || STATUS_CODES[this.status];
	
				BaseError.call(this, message, constructorOpt || WebError);
			}
	
			WebError.prototype = new BaseError(); 
			WebError.prototype.name = 'WebError';
			WebError.STATUS_CODES = STATUS_CODES;
	
			return WebError;
		}
	
		var STATUS_CODES = {
			400: "Bad Request",
			401: "Unauthorized",
			402: "Payment Required",
			403: "Forbidden",
			404: "Not Found",
			405: "Method Not Allowed",
			406: "Not Acceptable",
			407: "Proxy Authentication Required",
			408: "Request Timeout",
			409: "Conflict",
			410: "Gone",
			411: "Length Required",
			412: "Precondition Failed",
			413: "Request Entity Too Large",
			414: "Request-URI Too Long",
			415: "Unsupported Media Type",
			416: "Requested Range Not Satisfiable",
			417: "Expectation Failed",
			418: "I'm a Teapot", // (RFC 2324) http://tools.ietf.org/html/rfc2324
			420: "Enhance Your Calm", // Returned by the Twitter Search and Trends API when the client is being rate limited
			422: "Unprocessable Entity", // (WebDAV) (RFC 4918)
			423: "Locked", // (WebDAV) (RFC 4918)
			424: "Failed Dependency", // (WebDAV) (RFC 4918)
			425: "Unordered Collection", // (RFC 3648)
			426: "Upgrade Required", // (RFC 2817)
			428: "Precondition Required",
			429: "Too Many Requests", // Used for rate limiting
			431: "Request Header Fields Too Large",
			444: "No Response", // An nginx HTTP server extension. The server returns no information to the client and closes the connection (useful as a deterrent for malware).
			449: "Retry With", // A Microsoft extension. The request should be retried after performing the appropriate action.
			450: "Blocked By Windows Parental Controls",
			499: "Client Closed Request",
			500: "Internal Server Error",
			501: "Not Implemented",
			502: "Bad Gateway",
			503: "Service Unavailable",
			504: "Gateway Timeout",
			505: "HTTP Version Not Supported",
			506: "Variant Also Negotiates",
			507: "Insufficient Storage",
			508: "Loop Detected",
			509: "Bandwidth Limit Exceeded",
			510: "Not Extended",
			511: "Network Authentication Required"
		};	
	
		//Exports
		//AMD
		if (true) {
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(23)], __WEBPACK_AMD_DEFINE_RESULT__ = function (BaseError) {
				return defineWebError(BaseError);
			}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}
	
		//CommonJS
		else if (typeof module !== 'undefined' && module.exports) {
			module.exports = defineWebError(require('base-error'));
		}
	
		//Script tag
		else {
			root.WebError = defineWebError(root.BaseError);
		}
	
	} (this));

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var Ember = __webpack_require__(4);
	
	var Wrapper = module.exports = Ember.Object.extend(Ember.Copyable, {
		__value: void 0, //set as undefined
		__defaultValue: void 0,
	
		original: void 0, //stored value that can be different from default value
	
		name: null,  //custom name for toJSON  - not implemented
		readOnly: false,
	
		canBeNull: true,
		canBeUndefined: true,
	
		handleNull: true,
		handleUndefined: true,
	
		parent: null,
	
		init: function() {
			this._super();
	
			var props = this.getProperties(['value', 'defaultValue', 'canBeNull', 'canBeUndefined']);
	
			if(!props.canBeNull && (props.value === null || props.defaultValue === null)) {
				throw new Error('Can not be null');	
			} else if(!props.canBeUndefined && (typeof props.value === 'undefined' || typeof props.defaultValue === 'undefined')) {
				throw new Error('Can not be undefined');	
			}
		},
	
		toJSON: function(fn) {
			return this.get('value');
		},
	
		copy: function() {
			properties = ['value', 'original', 'defaultValue', 'name', 'readOnly', 'canBeNull', 'canBeUndefined', 'handleNull', 'handleUndefined'];
			return this.constructor.create(this.getProperties(properties));
		},
	
		value: function(key, value) {
			// setter
			if (arguments.length > 1) {
				if(this.get('readOnly')) {
					throw new Error('Variable is read only');
				} else if(value === null && !this.get('canBeNull')) {
					throw new Error('Can not be null');
				} else if(typeof value === 'undefined' && !this.get('canBeUndefined')) {
					throw new Error('Can not be undefined');
				}
	
				this.set('__value', this._preSerialize(value));
			}
	
			//getter
			var actualValue = this._preDeserialize(this.get('__value'));
	
			if(typeof actualValue === 'undefined') {
				actualValue = this.get('defaultValue');
			}
	
			return actualValue;
		}.property('__value', 'defaultValue'),
	
		defaultValue: function(key, value) {
			if (arguments.length > 1) {
				this.set('__defaultValue', this._preSerialize(value));	
			}
	
			var defaultValue = this.get('__defaultValue');
			if(typeof defaultValue === 'function') {
				defaultValue = defaultValue();
			}
	
			return this._preDeserialize(defaultValue);
		}.property(),
	
		/*
		original: function(key, value) {
			if (arguments.length > 1) {
				this.set('__original', this._preSerialize(value));	
			}
	
			return this._preDeserialize(this.get('__original'));
		}.property('__original'),*/
	
		setAsOriginal: function() {
			this.set('original', this.get('value'));
			return this;
		},
	
		_preSerialize: function(value) {
			if(value === null && this.get('handleNull')) {
				return value;
			} else if(typeof value === 'undefined' && this.get('handleUndefined')) {
				return value;
			}
	
			return this._serialize(value);
		},
	
		_preDeserialize: function(value) {
			if(value === null && this.get('handleNull')) {
				return value;
			} else if(typeof value === 'undefined' && this.get('handleUndefined')) {
				return value;
			}
	
			return this._deserialize(value);
		},	
	
		//set value
		_serialize: function(value) {
			throw new Error('Serialize is not implemented');
		},
	
		//get value
		_deserialize: function(value) {
			throw new Error('Deserialize is not implemented');
		},
	
		isDefined: function() {
			return typeof this.get('value') !== 'undefined';
		}.property('value').readOnly(),
	
		isNull: function() {
			return this.get('value') === null;
		}.property('value').readOnly(),
	
		rollback: function() {
			if(this.get('readOnly')) {
				return;
			}
	
			this.set('value', this.get('original'));
		},
	
		isDirty: function() {
			var props = this.getProperties('value', 'original', 'defaultValue');
	
			return props.value !== props.defaultValue && props.value !== props.original;
		}.property('value', 'original', 'defaultValue').readOnly(),
	
		changed: function() {
			var parent = this.get('parent');
			if(!parent) {
				return;
			}
	
			parent.childChanged(this);
		}.observes('value', 'original'),//original because isdirty
	
		parentChanged: function() {
			var parent = this.get('parent');
			if(!parent) {
				return;
			}
	
			parent.childChanged(this);
		}.observes('parent'),	
	
		childChanged: function() {
			throw new Error('Method childChanged is not implemented');
		},
	
		/**
		 * This function is used for templates
		 * @return {[type]} [description]
		 */
		computed: function() {
			return this.get('value');
		}.property('value').readOnly(),
	
		isEmpty: function () {
			return Ember.isEmpty(this.get('value'));
		}.property('value').readOnly(),
	
		isBlank: function() {
			return Ember.isBlank(this.get('value'));
		}.property('value').readOnly(),
	
	  	resolveRelationships: function(ignoreAsync) {
			if(!ignoreAsync && this.get('async')) {
				return null;
			}
	
			return this.get('computed');
		},
	
		setupData: function(data, partial) {
			this.set('__value', this._preSerialize(data));
	
			var parent = this.get('parent');
			if(!parent) {
				return;
			}
			parent.childChanged(this);
		}
	});
	
	Wrapper.reopenClass({
		isWrapper: true,
	
		getRelatedModels: function() {
			return [];
		}
	});

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Wrapper = __webpack_require__(13);
	
	var MixedWrapper = module.exports = Wrapper.extend({
		//set value
		_serialize: function(value) {
			return value;
		},
	
		//get value
		_deserialize: function(value) {
			return value;
		}
	});

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Ember = __webpack_require__(4),
		Promise = Ember.RSVP.Promise,
		Wrapper = __webpack_require__(13),
		ComputedObject = __webpack_require__(10);
	
	var ObjectWrapper = module.exports = Wrapper.extend({
		dirtyCount: 0,
		dirtyNames: [],
	
		computedObject: function() {
			return this.constructor.computedObject;
		}.property().readOnly(),
	
		init: function() {
			var computedObject = this.get('computedObject');
			if(!computedObject) {
				throw new Error('ObjectWrapper class need computedObject defined');
			}
	
			//init object with actual values
			var obj = this.get('__value');
			if(!obj) {
				this.set('__value', computedObject.create());
			}
	
			//super must be here because value is not defined
			this._super();
	
			//set parent 
			var attributes = this.get('attributes');
	
			for(var name in attributes) {
				attributes[name].set('parent', this);
			}
	
			//recompute dirty
			this.propertyDidChange('value');
		},
	
		getWrapper: function(wrapperName) {
			var wrapper = null,
				attributes = this.get('attributes');
	
			for(var name in attributes) {
				if (wrapperName===name) {
					continue;
				}
	
				wrapper = attributes[name];
			}
	
			return wrapper;
		},	
	
		attributes: function() {
			var value = this.get('__value');
			if(!value) {
				return {};
			}
	
			return value.get('attributes');
		}.property('__value'),
	
		//set value
		_serialize: function(properties) {
			var computedObject = this.get('computedObject'),
				obj = this.get('__value');
	
			if(!computedObject) {
				throw new Error('ObjectWrapper class need computedObject defined');
			}
	
			if(!obj) {
				this.set('__value', obj = computedObject.create());
			}
	
			obj.setProperties(properties);
	
			return obj;
		},
	
		//get value
		_deserialize: function(obj) {
			var data = {},
				attributes = this.get('attributes');
	
			for(var name in attributes) {
				data[name] = attributes[name].get('value');
			}
	
			return data;
		},
	
		rollback: function() {
			var attributes = this.get('attributes');
	
			for(var name in attributes) {
				attributes[name].rollback();
			}
		},
	
	  	setAsOriginal: function() {
			var attributes = this.get('attributes');
	
			for(var name in attributes) {
				attributes[name].setAsOriginal();
			}
		},
	
		childChanged: function(child) {
			var dirtyCount = 0,
				dirtyNames = [],
				attributes = this.get('attributes');
	
			for(var name in attributes) {
				var wrapper = attributes[name];
	
				if(wrapper === child) {
					this.propertyDidChange(name);
	
					//notify base object about changes
					this.get('__value').propertyDidChange(name);
				}
	
				if(!wrapper.get('isDirty')) {
					continue;
				}
	
				dirtyCount++;
				dirtyNames.push(name);
			}
	
			this.setProperties({
				dirtyCount: dirtyCount,
				dirtyNames: dirtyNames
			});
	
			//notify parent
			var parent = this.get('parent');
			if(!parent) {
				return;
			}
	
			parent.childChanged(this);
		},
	
		isDirty: function() {
			return this.get('dirtyCount')>0;
		}.property('dirtyCount').readOnly(),
	
		computed: function() {
	  		return this.get('__value');
	  	}.property('__value').readOnly(),
	
	
	  	resolveRelationships: function(ignoreAsync) {
	  		var promises = [],
	  			attributes = this.get('attributes');
	
			for(var name in attributes) {
				promises.push(attributes[name].resolveRelationships(ignoreAsync));
			}
	
			return Promise.all(promises);
		},
	
		setupData: function(data, partial) {
			var json = this.get('value'),
				attributes = this.get('attributes');
				
			data = data || {};
	
			if (partial) {
				Ember.merge(json, data);
			} else {
				json = data;
			}
	
			for(var name in attributes) {
				attributes[name].setupData(json[name], partial);
				this.propertyDidChange(name);
			}
	
			this.setAsOriginal(json);
			this.propertyDidChange('value');
			return this;
		},
	
		toJSON: function(fn, parent) {
			var properties = {},
				attributes = this.get('attributes');
	
			for(var name in attributes) {
				var wrapper = attributes[name];
				if(fn && fn(name, wrapper) === false) {
					continue;
				}
	
				properties[name] = wrapper.toJSON(fn, this);
			}
	
			return properties;
		}
	});
	
	ObjectWrapper.reopenClass({
		isObjectWWW: true, 
		computedObject: ComputedObject.extend({}),
	
		getRelatedModels: function() {
			var models = [];
	
			if(!this.computedObject || !this.computedObject.eachComputedProperty) {
				throw new Error('computedObject is not extended class from ComputedObject');
			}
	
			this.computedObject.eachComputedProperty(function(name, meta) {
				if(!meta || !meta.wrapperClass) {
					return;
				}
	
				var modelsAttr = meta.wrapperClass.getRelatedModels();
				for(var i=0; i<modelsAttr.length; i++) {
					models.push(modelsAttr[i]);	
				}
			});
				
			return models;
		}
	});

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Wrapper = __webpack_require__(13);
	
	var StringWrapper = module.exports = Wrapper.extend({
		//set value
		_serialize: function(value) {
			return String(value);
		},
	
		//get value
		_deserialize: function(value) {
			return value;
		}
	});

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Wrapper = __webpack_require__(13);
	
	var NumberWrapper = module.exports = Wrapper.extend({
		//set value
		_serialize: function(value) {
			return Number(value);
		},
	
		//get value
		_deserialize: function(value) {
			return value;
		},
	
		isNaN: function() {
			return isNaN(this.get('value'));
		}.property('value').readOnly()
	});

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Wrapper = __webpack_require__(13);
	
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
		},
	
		//get value
		_deserialize: function(value) {
			return value;
		}
	});

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Wrapper = __webpack_require__(13);
	
	var DateWrapper = module.exports = Wrapper.extend({
		//set value
		_serialize: function(value) {
			return new Date(value);
		},
	
		//get value
		_deserialize: function(value) {
			return value.toString();
		}
	});

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Wrapper = __webpack_require__(13);
	
	var ModelWrapper = module.exports = Wrapper.extend({
		async: true,
	
		//set value
		_serialize: function(value) {
			var _this = this;
	
			//load computed property imadiately
			if(!this.get('async')) {
				setTimeout(function() {
					_this.get('computed');
				}, 0);
			}
	
			return value;
		},
	
		//get value
		_deserialize: function(value) {
			return value;
		},
	
		//retrive promise
		computed: function() {
			var value = this.get('value');
			var model = this.get('model');
	
			if(!model || !model.find) {
				throw new Error('Model is not defined or has no implemented method find');
			}
	
			return model.find(value);
		}.property('value').readOnly(),
	
		model: function() {
			return this.constructor.model;
		}.property()
	});
	
	
	ModelWrapper.reopenClass({
		model: null,
		isModelWrapper: true,
	
		getRelatedModels: function() {
			if(!this.model) {
				return [];
			}
	
			return [this.model];
		}
	});

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Ember = __webpack_require__(4),
		Wrapper = __webpack_require__(13),
		ModelWrapper = __webpack_require__(20),
		MixedWrapper = __webpack_require__(14),
		Model = __webpack_require__(1);
	
	var ArrayWrapper = module.exports = Wrapper.extend(Ember.MutableArray, {
		async: true,
		dirtyCount: 0,
		dirtyNames: [],
	
		useSetupData: false,
	
	
		copy: function() {
			properties = ['value', 'original', 'defaultValue', 
				'readOnly', 'async',
				'canBeNull', 'canBeUndefined', 
				'handleNull', 'handleUndefined'];
	
			return this.constructor.create(this.getProperties(properties));
		},
	
		init: function() {
			var wrapperClass = this.get('wrapperClass');
			if(!wrapperClass) {
				throw new Error('WrapperClass is undefined');
			}
	
			this.setProperties({
				dirtyNames: [],
				original: [],
				'__defaultValue': []
			});
	
			this._super();
	
			//recompute dirty
			this.propertyDidChange('value');
		},
	
		_prepareItems: function(items) {
			var newItems = [];
	
			var wrapperClass = this.get('wrapperClass');
			if(!wrapperClass) {
				throw new Error('Array wrapperClass is not defined');
			}
	
			if(Ember.typeOf(items) !== 'array') {
				throw new Error('Items is not an array');
			}
	
			for(var i=0; i<items.length; i++) {
				var item = items[i],
					newItem = wrapperClass.create({
						parent: this
					});
	
				if(this.useSetupData) {
					newItem.setupData(item);
				} else {
					newItem.set('value', item);
				}
	
				newItems.pushObject(newItem);
			}		
	
			return newItems;
		},
	
		//set value
		_serialize: function(items) {
			items = this._prepareItems(items);
	
			var newItems = this.get('__value') || Ember.A([]);
			newItems.splice(0, newItems.length);
	
			for(var i=0;i<items.length; i++) {
				newItems.push(items[i]);	
			}
	
			//load computed property imadiately
			if(!this.get('async')) {
				setTimeout(function() {
					_this.get('computed');	
				}, 0);			
			}
	
			return newItems;
		},
	
		//get value
		_deserialize: function(items) {
			var newItems = [];
	
			for(var i=0; i<items.length; i++) {
				newItems.push(items[i].get('value'));
			}
	
			return newItems;
		},
	
		/*Ember.Enumerable mixin*/
		length: function() {
			var items = this.get('__value');
			return (items && items.length) ? items.length : 0;
		}.property('value').readOnly(),
		
		/*Ember.Array mixin*/
		objectAt: function(idx) {
			var items = this.get('__value');
			return (items && idx<items.length) ? items[idx].get('value') : void 0;
	  	},
	
	  	replace: function(idx, amt, objects) {
	  		if(this.get('readOnly')) {
				throw new Error('Variable is read only');
			}
	
	  		objects = objects || Ember.A([]);
	  		objects = this._prepareItems(objects);
	
	  		var items = this.get('__value') || Ember.A([]);
	
			var len = objects.get('length');
			this.arrayContentWillChange(idx, amt, len);
			this.propertyWillChange('__value');
	
			if (len === 0) {
				items.splice(idx, amt);
	    	} else {
	      		Ember.EnumerableUtils.replace(items, idx, amt, objects);
	    	}
	
	    	this.propertyDidChange('__value');
	    	this.arrayContentDidChange(idx, amt, len);
	
	    	this.childChanged(objects[0]);
	
	    	return this;
	  	},
	
	  	isDirty: function() {
			return this.get('dirtyCount')>0;
		}.property('dirtyCount').readOnly(),
	
	  	computed: function() {
	  		var items = this.get('value'),
	  			wrapperClass = this.get('wrapperClass'),
	  			wrapperItems = this.get('__value') || [];
	
	  		if(wrapperClass && wrapperClass.isModelWrapper) {
	  			return wrapperClass.model.findMany(items);
	  		} else if(wrapperClass && wrapperClass.isObjectWWW) {
	  			var newItems = [];
	
				for(var i=0; i<wrapperItems.length; i++) {
					newItems.push(wrapperItems[i].get('computed'));
				}
	
				return newItems;
	  		}
	
	  		return items;
	  	}.property('value', 'wrapperClass', '__value').readOnly(),
	
	
	  	wrapperClass: function() {
			return this.constructor.wrapperClass;
		}.property().readOnly(),
	
	
		childChanged: function(child) {
			var dirtyCount = 0;
			var dirtyNames = [];
			var items = this.get('__value') || Ember.A([]);
	
			for(var i=0; i<items.length; i++) {
				var wrapper = items[i];
	
				if(wrapper === child) {
					//notify base object about changes
					//this.arrayContentDidChange(i, amt, len);
					this.propertyDidChange(i);
				}
	
				if(!wrapper.get('isDirty')) {
					continue;
				}
	
				dirtyCount++;
				dirtyNames.push(i);
			}
	
			this.setProperties({
				dirtyCount: dirtyCount,
				dirtyNames: dirtyNames
			});
	
			//notify parent
			var parent = this.get('parent');
			if(!parent) {
				return;
			}
	
			parent.childChanged(this);	
		},
	
		rollback: function() {
			this._super();
	
			//notify childs
			var items = this.get('__value') || Ember.A([]);
			for(var i=0; i<items.length; i++) {
				items[i].setAsOriginal(); //notice: because must be setted as original
			}
		},
	
		setAsOriginal: function() {
			this._super();
	
			//notify childs
			var items = this.get('__value') || Ember.A([]);
			for(var i=0; i<items.length; i++) {
				items[i].setAsOriginal();
			}
		},
	
		setupData: function(data, partial) {
			this.useSetupData = true;
			this._super(data, partial);
			this.useSetupData = false;
	
			this.propertyDidChange('value');
		}
	});
	
	ArrayWrapper.reopenClass({
		wrapperClass: MixedWrapper
	});

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Ember = __webpack_require__(4),
		DataLight = __webpack_require__(3);
	
	var JSONSerializer = module.exports = DataLight.JSONSerializer = Ember.Object.extend({
		serialize: function(Model, record, options) {
			var isNew = record.get('isNew');
			
			return record.toJSON(function(key, wrapper) {
				if(wrapper.get('readOnly')) {
					return false;
				}
			});
		},
	
		deserialize: function(Model, record, content, isArray, includedModels) {
			isArray = isArray || false;
	
			var field = this.fieldForType(Model, isArray),
				modelData = content[field];
	
			this.deserializeRelationships(Model, content, includedModels);
	
			if(isArray) {
				return this._deserializeArray(Model, modelData, content);
			}
	
			if(record) {
				return this._deserializeRecord(record, modelData, content);
			}
			
			return this._deserializeSingle(Model, modelData, content);
		},
	
		_deserializeRecord: function(record, modelData, content) {
			record.setupData(modelData, false, true);
			record.set('content', content);
	
			return record;
		},	
	
		_deserializeSingle: function(Model, modelData, content) {
			var model = Model.buildRecord(modelData);
			model.set('content', content);
	
			return model;
		},
	
		_deserializeArray: function(Model, modelDatas, content) {
			var models = [];
	
			for(var i=0; i<modelDatas.length; i++) {
				models.push(this._deserializeSingle(Model, modelDatas[i], content, true));
			}
		
			return models;
		},
	
		deserializeRelationships: function(Model, content, includedModels) {
			var _this = this,
				used = {};
	
			if(!content) {
				return;
			}
	
			var models = Model.getRelatedModels(includedModels);
	
			for(var i=0; i<models.length; i++) {
				var RelatedModel = models[i];
	
				var type = _this.fieldForType(RelatedModel);
				var typeArray = _this.fieldForType(RelatedModel, true);
	
				if(type && content[type]) {
					RelatedModel.buildRecord(content[type]);
				}
	
				if(typeArray && content[typeArray]) {
					var data = content[typeArray];
	
					for(var j=0; j<data.length; j++) {
						RelatedModel.buildRecord(data[j]);		
					}
				}
			}
		},
	
		fieldForType: function(Model, isArray) {
			if(!Model.type) {
				throw new Error('Model type is undefined');
			}
	
			if(isArray && Model.typePlural) {
				return Model.typePlural;
			}
	
			return isArray ? Model.type+'s' : Model.type;
		}
	});

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (root) {
		'use strict';
	
		function BaseError (message, constructorOpt) {
			this.captureStackTrace(constructorOpt || BaseError);
			this.message = message;
		}
	
		BaseError.prototype = new Error(); 
		BaseError.prototype.name = 'BaseError';
	
		BaseError.prototype.captureStackTrace = function(constructorOpt) {
			if(Error.captureStackTrace) {
				Error.captureStackTrace(this, constructorOpt);
			} else {
				var err = new Error();
				this.stack = err.stack;
			}
		};
	
		//Exports
		//AMD
		if (true) {
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function () {
				return BaseError;
			}.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
		}
	
		//CommonJS
		else if (typeof module !== 'undefined' && module.exports) {
			module.exports = BaseError;
		}
	
		//Script tag
		else {
			root.BaseError = BaseError;
		}
	
	} (this));

/***/ }
/******/ ])
});

//# sourceMappingURL=ember-datalight.js.map