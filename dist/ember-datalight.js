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
/******/ 	
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
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
		WebError = __webpack_require__(11),
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
			var self = this;
			var adapter = this.get('adapter');
			var isDeleted = this.get('isDeleted');
			if(isDeleted) {
				return this.destroyRecord();
			}
	
			if(this.get('isNew')) {
				return adapter.createRecord(this.constructor, this).then(function() {
					self.set('isNew', false);
				});
			}
	
			return adapter.updateRecord(this.constructor, this);
		},
	
		destroyRecord: function() {
			var self = this;
			var isNew = this.get('isNew');
			var isDestroyed = this.get('isDestroyed');
			var adapter = this.get('adapter');
	
			this.set('isDeleted', true);
	
			return new Ember.RSVP.Promise(function(resolve, reject) {
				if(isDestroyed) {
					return resolve();	
				}
	
				if(isNew) {
					self.destroy();
					return resolve();
				}
	
				adapter.deleteRecord(self.constructor, self).then(function() {
					self.destroy();
				}).then(resolve, reject);
			});
		},
	
		deleteRecord: function() {
			this.set('isDeleted', true);
		},
	
		reloadRecord: function() {
			//TODO
		},
	
		isEmpty: function (keyName) {
			var str = this.get(keyName);
			return Ember.isEmpty(str);
		},
	
		isBlank: function(keyName) {
			var str = this.get(keyName);
			return Ember.isBlank(str);
		}
	});
	
	Model.reopenClass({
		adapter: RESTAdapter.create({}),
		attribute: attribute,
	
		primaryKey: 'id',
		type: null,
	
		find: function(id) {
			var type = Ember.typeOf(id);
	
			if (type === 'undefined') {
	      		return this.findAll();
	    	} else if (type === 'object') {
				return this.findQuery(id);
			} else if (type === 'array') {
				return this.findMany(id);
			}
	
			return PromiseObject.create({
				promise: Promise.cast(this.adapter.find(this, id))
			});
		},
	
		findAll: function(sinceToken) {
			return PromiseArray.create({
				promise: this.adapter.findAll(this, sinceToken)
			});
		},
	
		findQuery: function(query) {
			return PromiseArray.create({
				promise: this.adapter.findQuery(this, query)
			});
		},
	
		findMany: function(ids) {
			return PromiseArray.create({
				promise: this.adapter.findMany(this, ids)
			});
		},
	
		push: function() {
			Ember.Logger.warn('Method push needs cached version of models');
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
	
	
		find: Ember.required(Function),
	
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
				return self.find(model, id);
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
	
	var DataLight = module.exports = Ember.Namespace.create({
	
	});

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __WEBPACK_EXTERNAL_MODULE_4__;

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Ember = __webpack_require__(4),
		DataLight = __webpack_require__(3);
	
	var ModelBase = module.exports = DataLight.ModelBase = Ember.Object.extend({
		__data: null,
		__attributes: null,
	
		isNew: false,
		isDeleted: false,
	
		attributes: function() {
			var map = Ember.Map.create();
	
			this.constructor.eachComputedProperty(function(name, meta) {
				if (!meta.isAttribute) {
					return;
				}
	
				map.set(name, meta);
			});
	
			return map;
		},
	
		isDirty: function() {
			var dirtyCount = 0;
	
			this.attributes().forEach(function(name, meta) {
				if(meta.isDirty(this, name)) {
					dirtyCount++;	
				}
	
			}, this);
	
			return dirtyCount>0; 
		},
	
		dirtyAttributes: function() {
			var dirty = Ember.Map.create();
	
			this.attributes().forEach(function(name, meta) {
				if(meta.isObject) {
					var dirtyAttributes = this.get(name).dirtyAttributes();
					if(dirtyAttributes.length>0) {
						dirty.set(name, dirtyAttributes);
					}
				} else if(meta.isDirty(this, name)) {
					dirty.set(name, this.get(name));
				}
			}, this);
	
			return dirty;
		},
	
		rollback: function() {
			this.__attributes = {};
	
			this.attributes().forEach(function(name, meta) {
				if(meta.isObject) {
					this.get(name).rollback();
				}
			}, this);
	
			this.set('isDirty', false);
		},
	
		saved: function() {
			for(var key in this.__attributes) {
				this.__data[key] = this.__attributes[key];
			}
	
			this.setProperties({
				__attributes: {},
				isNew: false
			});
		},
	
		toJSON: function(fn) {
			var properties = {};
	
			//get attributes
			this.attributes().forEach(function(name, meta) {
				if(fn && fn(name, meta) === false) {
					return;
				}
	
				if(meta.isObject) {
					properties[name] = meta.subModel.toJSON(fn);
				} else {
				
					properties[name] = meta.getValue(this, name);
				}
			}, this);
	
			return properties;
		},
	
		copy: function() {
			var properties = this.getProperties(['__data', '__attributes', 'isNew', 'isDeleted']);
			var data = Ember.$.extend({}, properties);
			return this.constructor.create(data);
		}	
	});

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Ember = __webpack_require__(4),
		WebError = __webpack_require__(11),
		DataLight = __webpack_require__(3),
		Adapter = __webpack_require__(2),
		RESTSerializer = __webpack_require__(10);
	
	
	var type = {
		GET: 'GET',
		POST: 'POST',
		PUT: 'PUT',
		DELETE: 'DELETE'
	};
	
	var RESTAdapter = module.exports = DataLight.RESTAdapter = Ember.Object.extend({
		headers: {},
		host: null,
		namespace: null,
		serializer: RESTSerializer.create({}),
	
		find: function(Model, id) {
			var serializer = this.get('serializer');
	
			return this.ajax(this.buildURL(Model, id), type.GET).then(function(data) {
				return serializer.deserialize(Model, data);
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
				return serializer.deserialize(Model, data, true);
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
			var data = this.serialize(Model, record, { type: type.POST });
	
			return this.ajax(this.buildURL(Model), type.POST, { data: data });
		},
	
		/**
		Implement this method in a subclass to handle the updating of
		a record.
		*/
		updateRecord: function(Model, record) {
			var id = record.get(Model.primaryKey);
			var data = this.serialize(Model, record, { type: type.PUT });
	
			return this.ajax(this.buildURL(Model, id), type.PUT, { data: data });
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
			var self = this;
			var options = this._ajaxOptions(url, type, options);
	
			return new Ember.RSVP.Promise(function (resolve, reject) {
				Ember.$.ajax(options).then(function(data) {
					Ember.run(null, resolve, data);
				}, function(response) {
					Ember.run(null, reject, self._responseToError(response));
				});
			});
		},
	
		_prepareURL: function(url) {
			var host = this.get('host');
			var namespace = this.get('namespace');
	
			if(namespace) {
				url = namespace + url;
			}
	
			if(host) {
				url = host + url;
			}
	
			return url;
		},
	
		_ajaxOptions: function(url, type, options) {
			options = options || {};
			options.url = this._prepareURL(url);
			options.type = type;
			options.dataType = 'json';
			options.context = this;
			options.headers = Ember.$.extend({}, this.get('headers'), options.headers);
	
			return options;
		},
	
		_responseToError: function(response) {
			var message = response.responseTest || response.statusText || 'Unknown error';
			if(response.responseJSON && response.responseJSON.message) {
				message = response.responseJSON.message;    
			}
	
			var status = response.status || 500;
	
			console.log(message);
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
	
			return Model.type+'s';
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
		DataLight = __webpack_require__(3),
		ModelBase = __webpack_require__(5);
	
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
	
			return isObject ? subModel : getValue(this, key, true, true);
		}).meta(meta);
	};

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Ember = __webpack_require__(4),
		DataLight = __webpack_require__(3),
		JSONSerializer = __webpack_require__(12);
	
	var RESTSerializer = module.exports = DataLight.RESTSerializer = JSONSerializer.extend({
		
	});

/***/ },
/* 11 */
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
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(13)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (BaseError) {
				return defineWebError(BaseError);
			}.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
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
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Ember = __webpack_require__(4),
		DataLight = __webpack_require__(3);
	
	var JSONSerializer = module.exports = DataLight.JSONSerializer = Ember.Object.extend({
		serialize: function(Model, record, options) {
			return record.toJSON(function(key, meta) {
				if(options.type === 'PUT' && meta.options.put === false) {
					return false;
				}
			});
		},
	
		deserialize: function(Model, data, isArray) {
			isArray = isArray || false;
	
			var field = this.fieldForType(Model, isArray);
			var modelData = data[field];
	
			if(isArray) {
				return this._deserializeArray(Model, modelData, data);
			}
			
			return this._deserializeSingle(Model, modelData, data);
		},
	
		_deserializeSingle: function(Model, modelData, content, disableDR) {
			var model = Model.create(modelData);
	
			model.set('content', content);
			model.saved();	
	
			if(!disableDR) {
				this._deserializeRelationships(Model, content);	
			}
			
			return model;
		},
	
		_deserializeArray: function(Model, modelDatas, content) {
			var models = [];
	
			for(var i=0; i<modelDatas.length; i++) {
				models.push(this._deserializeSingle(Model, modelDatas[i], content, true));
			}
	
			this._deserializeRelationships(Model, content, true);
		
			return models;
		},
	
		_deserializeRelationships: function(Model, content, isArray) {
			var self = this;
			var used = {};
	
			Model.eachComputedProperty(function(name, meta) {
				if(!meta.options || !meta.options.belongsTo) {
					return;
				}
	
				var Model = meta.options.belongsTo;
				var type = self.fieldForType(Model, isArray);
	
				if(!type || !content || used[type] || !content[type]) {
					return;
				}
	
				used[type] = true;
	
				Model.push(content[type]);
			});
		},
	
		fieldForType: function(Model, isArray) {
			if(!Model.type) {
				throw new Error('Model type is undefined');
			}
	
			return isArray ? Model.type+'s' : Model.type;
		}
	});

/***/ },
/* 13 */
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
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = (function () {
				return BaseError;
			}.apply(null, __WEBPACK_AMD_DEFINE_ARRAY__)), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
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
})

/*
//@ sourceMappingURL=ember-datalight.js.map
*/