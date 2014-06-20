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
		WebError = __webpack_require__(10),
		DataLight = __webpack_require__(3),
		ModelBase = __webpack_require__(5),
		RESTAdapter = __webpack_require__(6),
		attribute = __webpack_require__(7);
	
	var Model = module.exports = DataLight.Model = ModelBase.extend({
		save: function() {
			var self = this;
			var adapter = Model.get('adapter');
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
			var adapter = Model.get('adapter');
	
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
			return this.adapter.find(this, id);
		},
	
		findAll: function(sinceToken) {
			return this.adapter.findAll(this, sinceToken);
		},
	
		findQuery: function(query) {
			return this.adapter.findQuery(this, query);
		}
	});

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Ember = __webpack_require__(4),
		DataLight = __webpack_require__(3);
	
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
		findMany: function(store, type, ids) {
	    	var promises = Ember.ArrayPolyfills.map.call(ids, function(id) {
	      		return this.find(store, type, id);
	    	}, this);
	
	    	return Ember.RSVP.all(promises);
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
		__data: {},
		__attributes: {},
	
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
	
			this.__attributes = {};
	
			this.setProperties({
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
	
				var value = this.get(name);
	
				properties[name] = meta.isObject ? value.toJSON(fn) : value;
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
		DataLight = __webpack_require__(3),
		Adapter = __webpack_require__(2),
		RESTSerializer = __webpack_require__(8);
	
	var type = {
		GET: 'GET',
		POST: 'POST',
		PUT: 'PUT',
		DELETE: 'DELETE'
	};
	
	var RESTAdapter = module.exports = DataLight.RESTAdapter = Ember.Object.extend({
		headers: [],
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
				url = '/' + namespace + url;
			}
	
			if(host) {
				url = '/' + host + url;
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
			var message = response.responseTest || 'Unknown error';
			if(response.responseJSON && response.responseJSON.message) {
				message = response.responseJSON.message;    
			}
	
			var status = response.status || 500;
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
		}
	});

/***/ },
/* 7 */
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
	
	function getValue(obj, key, meta) {
		//return latest unsaved value
		if(typeof obj.__attributes[key] !== 'undefined') {
			return obj.__attributes[key];
		}
	
		//return saved value
		if(typeof obj.__data[key] !== 'undefined') {
			return obj.__data[key];
		}		
	
		//return default value from function
		var defaultValue = meta.options.defaultValue;
		if(typeof defaultValue === 'function') {
			return defaultValue(obj, key);
		}
	
		return defaultValue;
	}
	
	function typeCast(value, type) {
		var types = [String, Number, Boolean, Date, Array];
	
		if(!type) {
			return value;
		} else if(types.contains(type)) {
			if(typeof value ==='undefined') {
				return new type();
			}
	
			if(!(value instanceof type)) {
				return type(value);	
			}
		}
	
		return value;
	}
	
	module.exports = DataLight.Attribute = function attribute(type, options) {
		options = options || {};
	
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
			isAttribute: true,
			isDirty: isDirty
		};
	
		return Ember.computed('__data', function(key, value) {
			if(!this.__attributes) {
				this.__attributes = {};
			}
	
			if(!this.__data) {
				this.__data = {};
			}
	
			if (arguments.length > 1) {
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
	
			return isObject ? subModel : getValue(this, key, meta);
		}).meta(meta);
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Ember = __webpack_require__(4),
		DataLight = __webpack_require__(3),
		JSONSerializer = __webpack_require__(9);
	
	var RESTSerializer = module.exports = DataLight.RESTSerializer = JSONSerializer.extend({
		
	});

/***/ },
/* 9 */
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
	
		_deserializeSingle: function(Model, modelData, content) {
			var model = Model.create(modelData);
	
			model.set('content', content);
			model.saved();	
	
			return model;
		},
	
		_deserializeArray: function(Model, modelDatas, content) {
			var models = [];
	
			for(var i=0; i<modelDatas; i++) {
				models.push(this._deserializeSingle(Model, modelDatas[i], content));
			}
			
			return models;
		},
	
		fieldForType: function(Model, isArray) {
			if(!Model.type) {
				throw new Error('Model type is undefined');
			}
	
			return isArray ? Model.type+'s' : Model.type;
		}
	});

/***/ },
/* 10 */
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
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(11)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (BaseError) {
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
/* 11 */
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