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
		WebError = __webpack_require__(7),
		DataLight = __webpack_require__(3),
		ModelBase = __webpack_require__(5),
		attribute = __webpack_require__(6);
	
	var Model = module.exports = DataLight.Model = ModelBase.extend({
		isEmpty: function (keyName) {
			var str = this.get(keyName);
			return Ember.isEmpty(str);
		},
	
		isBlank: function(keyName) {
			var str = this.get(keyName);
			return Ember.isBlank(str);
		},
	
		save: function() {
			var isDeleted = this.get('isDeleted');
			if(isDeleted) {
				return this.destroyRecord();
			}
	
			var method = this.get('isNew') ? 'POST' : 'PUT';
			var data = this.serialize(method);
			var url = '/' + this.constructor.pathForType() + '/' + this.get(this.constructor.primaryKey);
	
			return this.constructor[method](url, { data: data }).then(function() {
				this.set('isNew', false);
			});
		},
	
		destroyRecord: function() {
			var self = this;
			var isNew = this.get('isNew');
			var isDestroyed = this.get('isDestroyed');
			var url = '/' + this.constructor.pathForType() + '/' + this.get(this.constructor.primaryKey);
	
			this.set('isDeleted', true);
	
			return new Ember.RSVP.Promise(function(resolve, reject) {
				if(isDestroyed) {
					return resolve();	
				}
	
				if(isNew) {
					self.destroy();
					return resolve();
				}
	
				self.constructor.DELETE(url).then(function() {
					self.destroy();
				}).then(resolve, reject);
			});
		},
	
		deleteRecord: function() {
			this.set('isDeleted', true);
		}
	});
	
	Model.reopenClass({
		attr: attr,
	
		primaryKey: 'id',
		type: null,
		cache: true,
		cacheItems: {},
		cacheSize: 0,
		cacheMax: null,
	
		namespace: 'api',
		headers: {},
	
		ajax: function(url, settings, postProcess) {
			if(!postProcess) {
				postProcess = function(){};
			}
	
			if(typeof settings === 'function') {
				postProcess = settings;
				settings = {};
			}
	
			if(Model.namespace) {
				url = '/' + Model.namespace + url;
			}
	
			settings.headers = Ember.$.extend({}, Model.headers, settings.headers);
			settings.dataType = settings.dataType || 'json';
	
			return new Ember.RSVP.Promise(function (resolve, reject) {
				Ember.$.ajax(url, settings).then(function(data) {
					Ember.run(null, resolve, postProcess(data));
				}, function(response) {
					var message = response.responseTest || 'Unknown error';
					if(response.responseJSON && response.responseJSON.message) {
						message = response.responseJSON.message;	
					}
	
					var status = response.status || 500;
					var error = new WebError(status, message);
	
					Ember.run(null, reject, error);
				});
			});
		},
	
		POST: function(url, settings, postProcess) {
			settings.type = 'POST';
			return this.ajax(url, settings, postProcess);
		},
	
		DELETE: function(url, settings, postProcess) {
			settings.type = 'DELETE';
			return this.ajax(url, settings, postProcess);
		},
	
		PUT: function(url, settings, postProcess) {
			settings.type = 'PUT';
			return this.ajax(url, settings, postProcess);
		},
	
		getFromCache: function(cacheID) {
			if(!cacheID || !this.cacheItems[cacheID]) {
				return null;
			}
	
			return this.cacheItems[cacheID];
		},
	
		push: function(data) {
			var chacheID = item[primaryKey];
			if(!chacheID) {
				throw new Error('Model does not contains primary key')
			}
	
			var item = this.createRecord(data, true);
	
			this.addToCache(chacheID, item);
		},
	
		addToCache: function(cacheID, item) {
			//save newest value
			if(this.cacheItems[cacheID]) {
				this.cacheItems[cacheID].setData(item.toJSON());
				return;
			}
	
			this.cacheItems[cacheID] = item;
			this.cacheSize++;
	
			if(this.cacheMax!==null && this.cacheSize>this.cacheMax) {
				this.clearCache();
			}
		},
	
		clearCache: function(){
			this.cacheItems = {};
			this.cacheSize = 0;
		},
	
		_find: function(options, postProcess) {
			var self = this;
	
			var url = '/'+this.pathForType();
			var data = {};
	
			if(typeof options === 'string') {
				url+='/'+options;	
			} else {
				data = options;
			}
	
			if(this.cache) {
				var cacheID = url + JSON.stringify(data);
				var cachedItem = this.getFromCache(cacheID);
				if(cachedItem) {
					return new Ember.RSVP.Promise(function(resolve) {
						resolve(cachedItem);
					});
				}				
			}
	
			return this.ajax(url, {data: data}, postProcess).then(function(item) {
				if(self.cache) {
					self.addToCache(cacheID, item);
				}
	
				return item;
			});
		},
	
		pathForType: function() {
			if(!this.type) {
				throw new Error('Model type is undefined');
			}
	
			return this.type+'s';
		}
	});

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	var Ember = __webpack_require__(4),
		DataLight = __webpack_require__(3);
	
	var Adapter = module.exports = DataLight.Adapter = Ember.Object.extend({
	
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
			var model =  this.constructor.createRecord(this.toJSON());
			model.setProperties(this.getProperties(['isNew', 'isDeleted']));
	
			return model;
		},
	
		serialize: function (method) {
			return this.toJSON(function(key, meta) {
				if(method === 'PUT' && meta.options.put === false) {
					return false;
				}
			});
		}	
	});
	
	ModelBase.reopenClass({
		createRecord: function(properties, exists) {
			properties = properties || {};
	
			var model = this.create(properties);
			model.set('isNew', true);
	
			if(exists) {
				model.saved();
			}
	
			return model;
		}
	});

/***/ },
/* 6 */
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
/* 7 */
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
			!(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__(8)], __WEBPACK_AMD_DEFINE_RESULT__ = (function (BaseError) {
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
/* 8 */
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