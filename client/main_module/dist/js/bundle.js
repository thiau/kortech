(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/**
 * Created by danielabrao on 6/14/17.
 */
(function() {
    "use strict";
    var props = {
        "messageBox": ""
    };
    var factory = require("../factory/factory")(window);
    var builder = {
        "messageBox": function() {
          var widgetWrapper = window.document.createElement('div'),
            widgetText = window.document.createElement('p'),
            widgetTextWrapper = window.document.createElement('div'),
            widgetIconWrapper = window.document.createElement('div'),
            widgetIcon = window.document.createElement('div');

          widgetTextWrapper.classList.add('widget-text-wrapper');
          widgetText.classList.add('widget-text');
          widgetIcon.classList.add('widget-icon');
          widgetIconWrapper.classList.add('widget-icon-wrapper');
          widgetWrapper.classList.add('widget-wrapper');
          widgetWrapper.classList.add('init');

          widgetIconWrapper.appendChild(widgetIcon);
          widgetWrapper.appendChild(widgetIconWrapper);
          widgetWrapper.appendChild(widgetTextWrapper);

          return {
            "init": function(text) {
              return widgetWrapper
            },
            "show": function(text) {
              if(!widgetWrapper.classList.contains('opened')) {
                if(widgetWrapper.classList.contains('init')) {
                    widgetWrapper.classList.remove('init');
                }
                if(widgetWrapper.classList.contains('closed')) {
                  widgetWrapper.classList.remove('closed');
                }
              }

              widgetWrapper.classList.add('opened');

              if(widgetText.innerText.length > 0) {
                widgetTextWrapper.removeChild(widgetText);
                widgetTextWrapper.appendChild(widgetText);
              } else {
                widgetTextWrapper.appendChild(widgetText);
              }
              widgetText.innerText = text || "I didn't get it.";
            },
            "hide": function () {
              if(widgetWrapper.classList.contains('opened')) {
                widgetWrapper.classList.remove('opened');
                widgetWrapper.classList.add('closed');
              }
            }
          }
        }
    };
    var methods = {
        "start": function (debug) {
            return new Promise(function (resolve, reject) {
                var annyang = require("annyang");
                if (!debug) {
                    annyang.debug();
                }

                annyang.start();
                annyang.addCallback("result", function(userSaid, commandText, phrases) {
                    if (Array.isArray(userSaid)) {
                        userSaid = userSaid[0];
                    }
                    props.messageBox.show(userSaid);
                    factory.askWatson(userSaid).then(function (watsonResponse) {
                        console.log(watsonResponse);
                        resolve(watsonResponse);
                    }).then(function () {
                        annyang.removeCallback("result");
                        annyang.abort();
                        window.setTimeout(props.messageBox.hide, 2000);
                    });
                    console.log(userSaid); // sample output: 'hello'
                });
            });
        },
        "stop": function () {
            if (annyang.isListening()) {
                annyang.removeCallback("result");
                annyang.abort();
            }
        },
        "init": function(configs) {
            console.log("initializing widget");

            props.messageBox = builder.messageBox();
            window.document.body.appendChild(props.messageBox.init('Hello Human'));
            return {
                "start": methods.start,
                "stop": methods.stop,
                "show": props.messageBox.show,
                "hide": props.messageBox.hide
            }
        }
    };


    module.exports = {
        "init": methods.init
    };
}());

},{"../factory/factory":2,"annyang":4}],2:[function(require,module,exports){
/**
 * Created by danielabrao on 3/27/17.
 */
(function () {
    "use strict";

    module.exports = function (window) {

        var urls = {
            "askWatson": "https://duda-app.mybluemix.net/askWatson"
        };

        if (!window.Promise) {
            window.Promise = require("promise-polyfill");
        }

        return {
            "setUrl": function (url, type) {
                urls[type] = url;
            },
            "getUrl": function (type) {
                return urls[type] || "Invalid URL requested";
            },
            "askWatson": function (question) {
                return new Promise(function (resolve, reject) {
                    if (!question) {
                        return reject("Can not proceed without credentials");
                    }

                    if (window.XMLHttpRequest) {
                        var xhttp = new window.XMLHttpRequest();
                        xhttp.onreadystatechange = function() {
                            if (xhttp.readyState === 4) {
                                if (xhttp.status === 200 || xhttp.status === 201) {
                                    if (xhttp.responseText) {
                                        try {
                                            resolve(JSON.parse(xhttp.responseText));
                                        } catch (e) {
                                            resolve(xhttp.responseText);
                                        }
                                    } else {
                                        reject("An error occurred: Empty response");
                                    }

                                } else {
                                    reject(["An error occurred:", xhttp.responseText].join());
                                }
                            }
                        };

                        xhttp.open("POST", urls.askWatson);
                        xhttp.setRequestHeader("content-type", "application/json");
                        xhttp.send(JSON.stringify({
                            "question": question
                        }));

                    } else {
                        reject("AJAX Calls not supported on this browser");
                    }
                });
            },
            "getModel": function () {
                return new Promise(function (resolve, reject) {

                    if (window.XMLHttpRequest) {

                        var xhttp = new window.XMLHttpRequest();
                        xhttp.onreadystatechange = function() {
                            if (xhttp.readyState === 4) {
                                if (xhttp.status === 200) {
                                    if (xhttp.responseText) {
                                        try {
                                            resolve(JSON.parse(xhttp.responseText));
                                        } catch (e) {
                                            resolve(xhttp.responseText);
                                        }
                                    } else {
                                        reject("An error occurred: Empty response");
                                    }

                                } else {
                                    reject(["An error occurred: ", xhttp.responseText].join());
                                }
                            }
                        };

                        xhttp.open("GET", urls.urlModel);
                        xhttp.send();
                    } else {
                        reject("AJAX Calls not supported on this browser");
                    }
                });
            }
        };
    };

}());
},{"promise-polyfill":5}],3:[function(require,module,exports){
/**
 * Created by danielabrao on 3/27/17.
 */
(function (window) {
    "use strict";

    var controller = require("./controller/controller");
    window.init = controller.init;

}(window));

},{"./controller/controller":1}],4:[function(require,module,exports){
"use strict";var _typeof="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(a){return typeof a}:function(a){return a&&"function"==typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a};
//! annyang
//! version : 2.6.0
//! author  : Tal Ater @TalAter
//! license : MIT
//! https://www.TalAter.com/annyang/
!function(a,b){"function"==typeof define&&define.amd?define([],function(){return a.annyang=b(a)}):"object"===("undefined"==typeof module?"undefined":_typeof(module))&&module.exports?module.exports=b(a):a.annyang=b(a)}("undefined"!=typeof window?window:void 0,function(a,b){var c,d=a.SpeechRecognition||a.webkitSpeechRecognition||a.mozSpeechRecognition||a.msSpeechRecognition||a.oSpeechRecognition;if(!d)return null;var e,f,g=[],h={start:[],error:[],end:[],soundstart:[],result:[],resultMatch:[],resultNoMatch:[],errorNetwork:[],errorPermissionBlocked:[],errorPermissionDenied:[]},i=0,j=0,k=!1,l="font-weight: bold; color: #00f;",m=!1,n=!1,o=/\s*\((.*?)\)\s*/g,p=/(\(\?:[^)]+\))\?/g,q=/(\(\?)?:\w+/g,r=/\*\w+/g,s=/[\-{}\[\]+?.,\\\^$|#]/g,t=function(a){return a=a.replace(s,"\\$&").replace(o,"(?:$1)?").replace(q,function(a,b){return b?a:"([^\\s]+)"}).replace(r,"(.*?)").replace(p,"\\s*$1?\\s*"),new RegExp("^"+a+"$","i")},u=function(a){for(var b=arguments.length,c=Array(b>1?b-1:0),d=1;d<b;d++)c[d-1]=arguments[d];a.forEach(function(a){a.callback.apply(a.context,c)})},v=function(){return e!==b},w=function(a,b){a.indexOf("%c")!==-1||b?console.log(a,b||l):console.log(a)},x=function(){v()||c.init({},!1)},y=function(a,b,c){g.push({command:a,callback:b,originalPhrase:c}),k&&w("Command successfully loaded: %c"+c,l)},z=function(a){u(h.result,a);for(var b,c=0;c<a.length;c++){b=a[c].trim(),k&&w("Speech recognized: %c"+b,l);for(var d=0,e=g.length;d<e;d++){var f=g[d],i=f.command.exec(b);if(i){var j=i.slice(1);return k&&(w("command matched: %c"+f.originalPhrase,l),j.length&&w("with parameters",j)),f.callback.apply(this,j),void u(h.resultMatch,b,f.originalPhrase,a)}}}u(h.resultNoMatch,a)};return c={init:function(l){var o=!(arguments.length>1&&arguments[1]!==b)||arguments[1];e&&e.abort&&e.abort(),e=new d,e.maxAlternatives=5,e.continuous="http:"===a.location.protocol,e.lang="en-US",e.onstart=function(){n=!0,u(h.start)},e.onsoundstart=function(){u(h.soundstart)},e.onerror=function(a){switch(u(h.error,a),a.error){case"network":u(h.errorNetwork,a);break;case"not-allowed":case"service-not-allowed":f=!1,(new Date).getTime()-i<200?u(h.errorPermissionBlocked,a):u(h.errorPermissionDenied,a)}},e.onend=function(){if(n=!1,u(h.end),f){var a=(new Date).getTime()-i;j+=1,j%10===0&&k&&w("Speech Recognition is repeatedly stopping and starting. See http://is.gd/annyang_restarts for tips."),a<1e3?setTimeout(function(){c.start({paused:m})},1e3-a):c.start({paused:m})}},e.onresult=function(a){if(m)return k&&w("Speech heard, but annyang is paused"),!1;for(var b=a.results[a.resultIndex],c=[],d=0;d<b.length;d++)c[d]=b[d].transcript;z(c)},o&&(g=[]),l.length&&this.addCommands(l)},start:function(a){x(),a=a||{},m=a.paused!==b&&!!a.paused,f=a.autoRestart===b||!!a.autoRestart,a.continuous!==b&&(e.continuous=!!a.continuous),i=(new Date).getTime();try{e.start()}catch(a){k&&w(a.message)}},abort:function(){f=!1,j=0,v()&&e.abort()},pause:function(){m=!0},resume:function(){c.start()},debug:function(){var a=!(arguments.length>0&&arguments[0]!==b)||arguments[0];k=!!a},setLanguage:function(a){x(),e.lang=a},addCommands:function(b){var c;x();for(var d in b)if(b.hasOwnProperty(d))if(c=a[b[d]]||b[d],"function"==typeof c)y(t(d),c,d);else{if(!("object"===("undefined"==typeof c?"undefined":_typeof(c))&&c.regexp instanceof RegExp)){k&&w("Can not register command: %c"+d,l);continue}y(new RegExp(c.regexp.source,"i"),c.callback,d)}},removeCommands:function(a){a===b?g=[]:(a=Array.isArray(a)?a:[a],g=g.filter(function(b){for(var c=0;c<a.length;c++)if(a[c]===b.originalPhrase)return!1;return!0}))},addCallback:function(c,d,e){var f=a[d]||d;"function"==typeof f&&h[c]!==b&&h[c].push({callback:f,context:e||this})},removeCallback:function(a,c){var d=function(a){return a.callback!==c};for(var e in h)h.hasOwnProperty(e)&&(a!==b&&a!==e||(c===b?h[e]=[]:h[e]=h[e].filter(d)))},isListening:function(){return n&&!m},getSpeechRecognizer:function(){return e},trigger:function(a){return c.isListening()?(Array.isArray(a)||(a=[a]),void z(a)):void(k&&w(n?"Speech heard, but annyang is paused":"Cannot trigger while annyang is aborted"))}}});
},{}],5:[function(require,module,exports){
(function (root) {

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function noop() {}
  
  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = 0;
    this._handled = false;
    this._value = undefined;
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (newValue instanceof Promise) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise._immediateFn(function() {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new (this.constructor)(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    var args = Array.prototype.slice.call(arr);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
    function (fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @deprecated
   */
  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };

  /**
   * Change the function to execute on unhandled rejection
   * @param {function} fn Function to execute on unhandled rejection
   * @deprecated
   */
  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };
  
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }

})(this);

},{}]},{},[3])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi9Vc2Vycy90aGlyYXVqL0RvY3VtZW50cy9UaGlhZ28vSUJNL0NJTy9BcHBsaWNhdGlvbnMvZHVkYS1hcHAvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy90aGlyYXVqL0RvY3VtZW50cy9UaGlhZ28vSUJNL0NJTy9BcHBsaWNhdGlvbnMvZHVkYS1hcHAvY2xpZW50L21haW5fbW9kdWxlL2pzL2NvbnRyb2xsZXIvY29udHJvbGxlci5qcyIsIi9Vc2Vycy90aGlyYXVqL0RvY3VtZW50cy9UaGlhZ28vSUJNL0NJTy9BcHBsaWNhdGlvbnMvZHVkYS1hcHAvY2xpZW50L21haW5fbW9kdWxlL2pzL2ZhY3RvcnkvZmFjdG9yeS5qcyIsIi9Vc2Vycy90aGlyYXVqL0RvY3VtZW50cy9UaGlhZ28vSUJNL0NJTy9BcHBsaWNhdGlvbnMvZHVkYS1hcHAvY2xpZW50L21haW5fbW9kdWxlL2pzL21haW4uanMiLCIvVXNlcnMvdGhpcmF1ai9Eb2N1bWVudHMvVGhpYWdvL0lCTS9DSU8vQXBwbGljYXRpb25zL2R1ZGEtYXBwL25vZGVfbW9kdWxlcy9hbm55YW5nL2Rpc3QvYW5ueWFuZy5taW4uanMiLCIvVXNlcnMvdGhpcmF1ai9Eb2N1bWVudHMvVGhpYWdvL0lCTS9DSU8vQXBwbGljYXRpb25zL2R1ZGEtYXBwL25vZGVfbW9kdWxlcy9wcm9taXNlLXBvbHlmaWxsL3Byb21pc2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKX12YXIgZj1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwoZi5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxmLGYuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGRhbmllbGFicmFvIG9uIDYvMTQvMTcuXG4gKi9cbihmdW5jdGlvbigpIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICB2YXIgcHJvcHMgPSB7XG4gICAgICAgIFwibWVzc2FnZUJveFwiOiBcIlwiXG4gICAgfTtcbiAgICB2YXIgZmFjdG9yeSA9IHJlcXVpcmUoXCIuLi9mYWN0b3J5L2ZhY3RvcnlcIikod2luZG93KTtcbiAgICB2YXIgYnVpbGRlciA9IHtcbiAgICAgICAgXCJtZXNzYWdlQm94XCI6IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHZhciB3aWRnZXRXcmFwcGVyID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgICAgICAgd2lkZ2V0VGV4dCA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyksXG4gICAgICAgICAgICB3aWRnZXRUZXh0V3JhcHBlciA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcbiAgICAgICAgICAgIHdpZGdldEljb25XcmFwcGVyID0gd2luZG93LmRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpLFxuICAgICAgICAgICAgd2lkZ2V0SWNvbiA9IHdpbmRvdy5kb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcblxuICAgICAgICAgIHdpZGdldFRleHRXcmFwcGVyLmNsYXNzTGlzdC5hZGQoJ3dpZGdldC10ZXh0LXdyYXBwZXInKTtcbiAgICAgICAgICB3aWRnZXRUZXh0LmNsYXNzTGlzdC5hZGQoJ3dpZGdldC10ZXh0Jyk7XG4gICAgICAgICAgd2lkZ2V0SWNvbi5jbGFzc0xpc3QuYWRkKCd3aWRnZXQtaWNvbicpO1xuICAgICAgICAgIHdpZGdldEljb25XcmFwcGVyLmNsYXNzTGlzdC5hZGQoJ3dpZGdldC1pY29uLXdyYXBwZXInKTtcbiAgICAgICAgICB3aWRnZXRXcmFwcGVyLmNsYXNzTGlzdC5hZGQoJ3dpZGdldC13cmFwcGVyJyk7XG4gICAgICAgICAgd2lkZ2V0V3JhcHBlci5jbGFzc0xpc3QuYWRkKCdpbml0Jyk7XG5cbiAgICAgICAgICB3aWRnZXRJY29uV3JhcHBlci5hcHBlbmRDaGlsZCh3aWRnZXRJY29uKTtcbiAgICAgICAgICB3aWRnZXRXcmFwcGVyLmFwcGVuZENoaWxkKHdpZGdldEljb25XcmFwcGVyKTtcbiAgICAgICAgICB3aWRnZXRXcmFwcGVyLmFwcGVuZENoaWxkKHdpZGdldFRleHRXcmFwcGVyKTtcblxuICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcImluaXRcIjogZnVuY3Rpb24odGV4dCkge1xuICAgICAgICAgICAgICByZXR1cm4gd2lkZ2V0V3JhcHBlclxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwic2hvd1wiOiBmdW5jdGlvbih0ZXh0KSB7XG4gICAgICAgICAgICAgIGlmKCF3aWRnZXRXcmFwcGVyLmNsYXNzTGlzdC5jb250YWlucygnb3BlbmVkJykpIHtcbiAgICAgICAgICAgICAgICBpZih3aWRnZXRXcmFwcGVyLmNsYXNzTGlzdC5jb250YWlucygnaW5pdCcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHdpZGdldFdyYXBwZXIuY2xhc3NMaXN0LnJlbW92ZSgnaW5pdCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZih3aWRnZXRXcmFwcGVyLmNsYXNzTGlzdC5jb250YWlucygnY2xvc2VkJykpIHtcbiAgICAgICAgICAgICAgICAgIHdpZGdldFdyYXBwZXIuY2xhc3NMaXN0LnJlbW92ZSgnY2xvc2VkJyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgd2lkZ2V0V3JhcHBlci5jbGFzc0xpc3QuYWRkKCdvcGVuZWQnKTtcblxuICAgICAgICAgICAgICBpZih3aWRnZXRUZXh0LmlubmVyVGV4dC5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgd2lkZ2V0VGV4dFdyYXBwZXIucmVtb3ZlQ2hpbGQod2lkZ2V0VGV4dCk7XG4gICAgICAgICAgICAgICAgd2lkZ2V0VGV4dFdyYXBwZXIuYXBwZW5kQ2hpbGQod2lkZ2V0VGV4dCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgd2lkZ2V0VGV4dFdyYXBwZXIuYXBwZW5kQ2hpbGQod2lkZ2V0VGV4dCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgd2lkZ2V0VGV4dC5pbm5lclRleHQgPSB0ZXh0IHx8IFwiSSBkaWRuJ3QgZ2V0IGl0LlwiO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIFwiaGlkZVwiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgIGlmKHdpZGdldFdyYXBwZXIuY2xhc3NMaXN0LmNvbnRhaW5zKCdvcGVuZWQnKSkge1xuICAgICAgICAgICAgICAgIHdpZGdldFdyYXBwZXIuY2xhc3NMaXN0LnJlbW92ZSgnb3BlbmVkJyk7XG4gICAgICAgICAgICAgICAgd2lkZ2V0V3JhcHBlci5jbGFzc0xpc3QuYWRkKCdjbG9zZWQnKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgdmFyIG1ldGhvZHMgPSB7XG4gICAgICAgIFwic3RhcnRcIjogZnVuY3Rpb24gKGRlYnVnKSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICAgICAgICAgIHZhciBhbm55YW5nID0gcmVxdWlyZShcImFubnlhbmdcIik7XG4gICAgICAgICAgICAgICAgaWYgKCFkZWJ1Zykge1xuICAgICAgICAgICAgICAgICAgICBhbm55YW5nLmRlYnVnKCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgYW5ueWFuZy5zdGFydCgpO1xuICAgICAgICAgICAgICAgIGFubnlhbmcuYWRkQ2FsbGJhY2soXCJyZXN1bHRcIiwgZnVuY3Rpb24odXNlclNhaWQsIGNvbW1hbmRUZXh0LCBwaHJhc2VzKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChBcnJheS5pc0FycmF5KHVzZXJTYWlkKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdXNlclNhaWQgPSB1c2VyU2FpZFswXTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwcm9wcy5tZXNzYWdlQm94LnNob3codXNlclNhaWQpO1xuICAgICAgICAgICAgICAgICAgICBmYWN0b3J5LmFza1dhdHNvbih1c2VyU2FpZCkudGhlbihmdW5jdGlvbiAod2F0c29uUmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKHdhdHNvblJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUod2F0c29uUmVzcG9uc2UpO1xuICAgICAgICAgICAgICAgICAgICB9KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFubnlhbmcucmVtb3ZlQ2FsbGJhY2soXCJyZXN1bHRcIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbm55YW5nLmFib3J0KCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB3aW5kb3cuc2V0VGltZW91dChwcm9wcy5tZXNzYWdlQm94LmhpZGUsIDIwMDApO1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2codXNlclNhaWQpOyAvLyBzYW1wbGUgb3V0cHV0OiAnaGVsbG8nXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSxcbiAgICAgICAgXCJzdG9wXCI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGlmIChhbm55YW5nLmlzTGlzdGVuaW5nKCkpIHtcbiAgICAgICAgICAgICAgICBhbm55YW5nLnJlbW92ZUNhbGxiYWNrKFwicmVzdWx0XCIpO1xuICAgICAgICAgICAgICAgIGFubnlhbmcuYWJvcnQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgXCJpbml0XCI6IGZ1bmN0aW9uKGNvbmZpZ3MpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwiaW5pdGlhbGl6aW5nIHdpZGdldFwiKTtcblxuICAgICAgICAgICAgcHJvcHMubWVzc2FnZUJveCA9IGJ1aWxkZXIubWVzc2FnZUJveCgpO1xuICAgICAgICAgICAgd2luZG93LmRvY3VtZW50LmJvZHkuYXBwZW5kQ2hpbGQocHJvcHMubWVzc2FnZUJveC5pbml0KCdIZWxsbyBIdW1hbicpKTtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgXCJzdGFydFwiOiBtZXRob2RzLnN0YXJ0LFxuICAgICAgICAgICAgICAgIFwic3RvcFwiOiBtZXRob2RzLnN0b3AsXG4gICAgICAgICAgICAgICAgXCJzaG93XCI6IHByb3BzLm1lc3NhZ2VCb3guc2hvdyxcbiAgICAgICAgICAgICAgICBcImhpZGVcIjogcHJvcHMubWVzc2FnZUJveC5oaWRlXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgICAgICAgXCJpbml0XCI6IG1ldGhvZHMuaW5pdFxuICAgIH07XG59KCkpO1xuIiwiLyoqXG4gKiBDcmVhdGVkIGJ5IGRhbmllbGFicmFvIG9uIDMvMjcvMTcuXG4gKi9cbihmdW5jdGlvbiAoKSB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uICh3aW5kb3cpIHtcblxuICAgICAgICB2YXIgdXJscyA9IHtcbiAgICAgICAgICAgIFwiYXNrV2F0c29uXCI6IFwiaHR0cHM6Ly9kdWRhLWFwcC5teWJsdWVtaXgubmV0L2Fza1dhdHNvblwiXG4gICAgICAgIH07XG5cbiAgICAgICAgaWYgKCF3aW5kb3cuUHJvbWlzZSkge1xuICAgICAgICAgICAgd2luZG93LlByb21pc2UgPSByZXF1aXJlKFwicHJvbWlzZS1wb2x5ZmlsbFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBcInNldFVybFwiOiBmdW5jdGlvbiAodXJsLCB0eXBlKSB7XG4gICAgICAgICAgICAgICAgdXJsc1t0eXBlXSA9IHVybDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBcImdldFVybFwiOiBmdW5jdGlvbiAodHlwZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB1cmxzW3R5cGVdIHx8IFwiSW52YWxpZCBVUkwgcmVxdWVzdGVkXCI7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJhc2tXYXRzb25cIjogZnVuY3Rpb24gKHF1ZXN0aW9uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFxdWVzdGlvbikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlamVjdChcIkNhbiBub3QgcHJvY2VlZCB3aXRob3V0IGNyZWRlbnRpYWxzXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHdpbmRvdy5YTUxIdHRwUmVxdWVzdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIHhodHRwID0gbmV3IHdpbmRvdy5YTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgeGh0dHAub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHhodHRwLnJlYWR5U3RhdGUgPT09IDQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHhodHRwLnN0YXR1cyA9PT0gMjAwIHx8IHhodHRwLnN0YXR1cyA9PT0gMjAxKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoeGh0dHAucmVzcG9uc2VUZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShKU09OLnBhcnNlKHhodHRwLnJlc3BvbnNlVGV4dCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh4aHR0cC5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KFwiQW4gZXJyb3Igb2NjdXJyZWQ6IEVtcHR5IHJlc3BvbnNlXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoW1wiQW4gZXJyb3Igb2NjdXJyZWQ6XCIsIHhodHRwLnJlc3BvbnNlVGV4dF0uam9pbigpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHhodHRwLm9wZW4oXCJQT1NUXCIsIHVybHMuYXNrV2F0c29uKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHhodHRwLnNldFJlcXVlc3RIZWFkZXIoXCJjb250ZW50LXR5cGVcIiwgXCJhcHBsaWNhdGlvbi9qc29uXCIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgeGh0dHAuc2VuZChKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgXCJxdWVzdGlvblwiOiBxdWVzdGlvblxuICAgICAgICAgICAgICAgICAgICAgICAgfSkpO1xuXG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoXCJBSkFYIENhbGxzIG5vdCBzdXBwb3J0ZWQgb24gdGhpcyBicm93c2VyXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgXCJnZXRNb2RlbFwiOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcblxuICAgICAgICAgICAgICAgICAgICBpZiAod2luZG93LlhNTEh0dHBSZXF1ZXN0KSB7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciB4aHR0cCA9IG5ldyB3aW5kb3cuWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHhodHRwLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh4aHR0cC5yZWFkeVN0YXRlID09PSA0KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh4aHR0cC5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHhodHRwLnJlc3BvbnNlVGV4dCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoSlNPTi5wYXJzZSh4aHR0cC5yZXNwb25zZVRleHQpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlc29sdmUoeGh0dHAucmVzcG9uc2VUZXh0KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChcIkFuIGVycm9yIG9jY3VycmVkOiBFbXB0eSByZXNwb25zZVwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KFtcIkFuIGVycm9yIG9jY3VycmVkOiBcIiwgeGh0dHAucmVzcG9uc2VUZXh0XS5qb2luKCkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgeGh0dHAub3BlbihcIkdFVFwiLCB1cmxzLnVybE1vZGVsKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHhodHRwLnNlbmQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChcIkFKQVggQ2FsbHMgbm90IHN1cHBvcnRlZCBvbiB0aGlzIGJyb3dzZXJcIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9O1xuXG59KCkpOyIsIi8qKlxuICogQ3JlYXRlZCBieSBkYW5pZWxhYnJhbyBvbiAzLzI3LzE3LlxuICovXG4oZnVuY3Rpb24gKHdpbmRvdykge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgdmFyIGNvbnRyb2xsZXIgPSByZXF1aXJlKFwiLi9jb250cm9sbGVyL2NvbnRyb2xsZXJcIik7XG4gICAgd2luZG93LmluaXQgPSBjb250cm9sbGVyLmluaXQ7XG5cbn0od2luZG93KSk7XG4iLCJcInVzZSBzdHJpY3RcIjt2YXIgX3R5cGVvZj1cImZ1bmN0aW9uXCI9PXR5cGVvZiBTeW1ib2wmJlwic3ltYm9sXCI9PXR5cGVvZiBTeW1ib2wuaXRlcmF0b3I/ZnVuY3Rpb24oYSl7cmV0dXJuIHR5cGVvZiBhfTpmdW5jdGlvbihhKXtyZXR1cm4gYSYmXCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiZhLmNvbnN0cnVjdG9yPT09U3ltYm9sJiZhIT09U3ltYm9sLnByb3RvdHlwZT9cInN5bWJvbFwiOnR5cGVvZiBhfTtcbi8vISBhbm55YW5nXG4vLyEgdmVyc2lvbiA6IDIuNi4wXG4vLyEgYXV0aG9yICA6IFRhbCBBdGVyIEBUYWxBdGVyXG4vLyEgbGljZW5zZSA6IE1JVFxuLy8hIGh0dHBzOi8vd3d3LlRhbEF0ZXIuY29tL2FubnlhbmcvXG4hZnVuY3Rpb24oYSxiKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtdLGZ1bmN0aW9uKCl7cmV0dXJuIGEuYW5ueWFuZz1iKGEpfSk6XCJvYmplY3RcIj09PShcInVuZGVmaW5lZFwiPT10eXBlb2YgbW9kdWxlP1widW5kZWZpbmVkXCI6X3R5cGVvZihtb2R1bGUpKSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9YihhKTphLmFubnlhbmc9YihhKX0oXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6dm9pZCAwLGZ1bmN0aW9uKGEsYil7dmFyIGMsZD1hLlNwZWVjaFJlY29nbml0aW9ufHxhLndlYmtpdFNwZWVjaFJlY29nbml0aW9ufHxhLm1velNwZWVjaFJlY29nbml0aW9ufHxhLm1zU3BlZWNoUmVjb2duaXRpb258fGEub1NwZWVjaFJlY29nbml0aW9uO2lmKCFkKXJldHVybiBudWxsO3ZhciBlLGYsZz1bXSxoPXtzdGFydDpbXSxlcnJvcjpbXSxlbmQ6W10sc291bmRzdGFydDpbXSxyZXN1bHQ6W10scmVzdWx0TWF0Y2g6W10scmVzdWx0Tm9NYXRjaDpbXSxlcnJvck5ldHdvcms6W10sZXJyb3JQZXJtaXNzaW9uQmxvY2tlZDpbXSxlcnJvclBlcm1pc3Npb25EZW5pZWQ6W119LGk9MCxqPTAsaz0hMSxsPVwiZm9udC13ZWlnaHQ6IGJvbGQ7IGNvbG9yOiAjMDBmO1wiLG09ITEsbj0hMSxvPS9cXHMqXFwoKC4qPylcXClcXHMqL2cscD0vKFxcKFxcPzpbXildK1xcKSlcXD8vZyxxPS8oXFwoXFw/KT86XFx3Ky9nLHI9L1xcKlxcdysvZyxzPS9bXFwte31cXFtcXF0rPy4sXFxcXFxcXiR8I10vZyx0PWZ1bmN0aW9uKGEpe3JldHVybiBhPWEucmVwbGFjZShzLFwiXFxcXCQmXCIpLnJlcGxhY2UobyxcIig/OiQxKT9cIikucmVwbGFjZShxLGZ1bmN0aW9uKGEsYil7cmV0dXJuIGI/YTpcIihbXlxcXFxzXSspXCJ9KS5yZXBsYWNlKHIsXCIoLio/KVwiKS5yZXBsYWNlKHAsXCJcXFxccyokMT9cXFxccypcIiksbmV3IFJlZ0V4cChcIl5cIithK1wiJFwiLFwiaVwiKX0sdT1mdW5jdGlvbihhKXtmb3IodmFyIGI9YXJndW1lbnRzLmxlbmd0aCxjPUFycmF5KGI+MT9iLTE6MCksZD0xO2Q8YjtkKyspY1tkLTFdPWFyZ3VtZW50c1tkXTthLmZvckVhY2goZnVuY3Rpb24oYSl7YS5jYWxsYmFjay5hcHBseShhLmNvbnRleHQsYyl9KX0sdj1mdW5jdGlvbigpe3JldHVybiBlIT09Yn0sdz1mdW5jdGlvbihhLGIpe2EuaW5kZXhPZihcIiVjXCIpIT09LTF8fGI/Y29uc29sZS5sb2coYSxifHxsKTpjb25zb2xlLmxvZyhhKX0seD1mdW5jdGlvbigpe3YoKXx8Yy5pbml0KHt9LCExKX0seT1mdW5jdGlvbihhLGIsYyl7Zy5wdXNoKHtjb21tYW5kOmEsY2FsbGJhY2s6YixvcmlnaW5hbFBocmFzZTpjfSksayYmdyhcIkNvbW1hbmQgc3VjY2Vzc2Z1bGx5IGxvYWRlZDogJWNcIitjLGwpfSx6PWZ1bmN0aW9uKGEpe3UoaC5yZXN1bHQsYSk7Zm9yKHZhciBiLGM9MDtjPGEubGVuZ3RoO2MrKyl7Yj1hW2NdLnRyaW0oKSxrJiZ3KFwiU3BlZWNoIHJlY29nbml6ZWQ6ICVjXCIrYixsKTtmb3IodmFyIGQ9MCxlPWcubGVuZ3RoO2Q8ZTtkKyspe3ZhciBmPWdbZF0saT1mLmNvbW1hbmQuZXhlYyhiKTtpZihpKXt2YXIgaj1pLnNsaWNlKDEpO3JldHVybiBrJiYodyhcImNvbW1hbmQgbWF0Y2hlZDogJWNcIitmLm9yaWdpbmFsUGhyYXNlLGwpLGoubGVuZ3RoJiZ3KFwid2l0aCBwYXJhbWV0ZXJzXCIsaikpLGYuY2FsbGJhY2suYXBwbHkodGhpcyxqKSx2b2lkIHUoaC5yZXN1bHRNYXRjaCxiLGYub3JpZ2luYWxQaHJhc2UsYSl9fX11KGgucmVzdWx0Tm9NYXRjaCxhKX07cmV0dXJuIGM9e2luaXQ6ZnVuY3Rpb24obCl7dmFyIG89IShhcmd1bWVudHMubGVuZ3RoPjEmJmFyZ3VtZW50c1sxXSE9PWIpfHxhcmd1bWVudHNbMV07ZSYmZS5hYm9ydCYmZS5hYm9ydCgpLGU9bmV3IGQsZS5tYXhBbHRlcm5hdGl2ZXM9NSxlLmNvbnRpbnVvdXM9XCJodHRwOlwiPT09YS5sb2NhdGlvbi5wcm90b2NvbCxlLmxhbmc9XCJlbi1VU1wiLGUub25zdGFydD1mdW5jdGlvbigpe249ITAsdShoLnN0YXJ0KX0sZS5vbnNvdW5kc3RhcnQ9ZnVuY3Rpb24oKXt1KGguc291bmRzdGFydCl9LGUub25lcnJvcj1mdW5jdGlvbihhKXtzd2l0Y2godShoLmVycm9yLGEpLGEuZXJyb3Ipe2Nhc2VcIm5ldHdvcmtcIjp1KGguZXJyb3JOZXR3b3JrLGEpO2JyZWFrO2Nhc2VcIm5vdC1hbGxvd2VkXCI6Y2FzZVwic2VydmljZS1ub3QtYWxsb3dlZFwiOmY9ITEsKG5ldyBEYXRlKS5nZXRUaW1lKCktaTwyMDA/dShoLmVycm9yUGVybWlzc2lvbkJsb2NrZWQsYSk6dShoLmVycm9yUGVybWlzc2lvbkRlbmllZCxhKX19LGUub25lbmQ9ZnVuY3Rpb24oKXtpZihuPSExLHUoaC5lbmQpLGYpe3ZhciBhPShuZXcgRGF0ZSkuZ2V0VGltZSgpLWk7ais9MSxqJTEwPT09MCYmayYmdyhcIlNwZWVjaCBSZWNvZ25pdGlvbiBpcyByZXBlYXRlZGx5IHN0b3BwaW5nIGFuZCBzdGFydGluZy4gU2VlIGh0dHA6Ly9pcy5nZC9hbm55YW5nX3Jlc3RhcnRzIGZvciB0aXBzLlwiKSxhPDFlMz9zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7Yy5zdGFydCh7cGF1c2VkOm19KX0sMWUzLWEpOmMuc3RhcnQoe3BhdXNlZDptfSl9fSxlLm9ucmVzdWx0PWZ1bmN0aW9uKGEpe2lmKG0pcmV0dXJuIGsmJncoXCJTcGVlY2ggaGVhcmQsIGJ1dCBhbm55YW5nIGlzIHBhdXNlZFwiKSwhMTtmb3IodmFyIGI9YS5yZXN1bHRzW2EucmVzdWx0SW5kZXhdLGM9W10sZD0wO2Q8Yi5sZW5ndGg7ZCsrKWNbZF09YltkXS50cmFuc2NyaXB0O3ooYyl9LG8mJihnPVtdKSxsLmxlbmd0aCYmdGhpcy5hZGRDb21tYW5kcyhsKX0sc3RhcnQ6ZnVuY3Rpb24oYSl7eCgpLGE9YXx8e30sbT1hLnBhdXNlZCE9PWImJiEhYS5wYXVzZWQsZj1hLmF1dG9SZXN0YXJ0PT09Ynx8ISFhLmF1dG9SZXN0YXJ0LGEuY29udGludW91cyE9PWImJihlLmNvbnRpbnVvdXM9ISFhLmNvbnRpbnVvdXMpLGk9KG5ldyBEYXRlKS5nZXRUaW1lKCk7dHJ5e2Uuc3RhcnQoKX1jYXRjaChhKXtrJiZ3KGEubWVzc2FnZSl9fSxhYm9ydDpmdW5jdGlvbigpe2Y9ITEsaj0wLHYoKSYmZS5hYm9ydCgpfSxwYXVzZTpmdW5jdGlvbigpe209ITB9LHJlc3VtZTpmdW5jdGlvbigpe2Muc3RhcnQoKX0sZGVidWc6ZnVuY3Rpb24oKXt2YXIgYT0hKGFyZ3VtZW50cy5sZW5ndGg+MCYmYXJndW1lbnRzWzBdIT09Yil8fGFyZ3VtZW50c1swXTtrPSEhYX0sc2V0TGFuZ3VhZ2U6ZnVuY3Rpb24oYSl7eCgpLGUubGFuZz1hfSxhZGRDb21tYW5kczpmdW5jdGlvbihiKXt2YXIgYzt4KCk7Zm9yKHZhciBkIGluIGIpaWYoYi5oYXNPd25Qcm9wZXJ0eShkKSlpZihjPWFbYltkXV18fGJbZF0sXCJmdW5jdGlvblwiPT10eXBlb2YgYyl5KHQoZCksYyxkKTtlbHNle2lmKCEoXCJvYmplY3RcIj09PShcInVuZGVmaW5lZFwiPT10eXBlb2YgYz9cInVuZGVmaW5lZFwiOl90eXBlb2YoYykpJiZjLnJlZ2V4cCBpbnN0YW5jZW9mIFJlZ0V4cCkpe2smJncoXCJDYW4gbm90IHJlZ2lzdGVyIGNvbW1hbmQ6ICVjXCIrZCxsKTtjb250aW51ZX15KG5ldyBSZWdFeHAoYy5yZWdleHAuc291cmNlLFwiaVwiKSxjLmNhbGxiYWNrLGQpfX0scmVtb3ZlQ29tbWFuZHM6ZnVuY3Rpb24oYSl7YT09PWI/Zz1bXTooYT1BcnJheS5pc0FycmF5KGEpP2E6W2FdLGc9Zy5maWx0ZXIoZnVuY3Rpb24oYil7Zm9yKHZhciBjPTA7YzxhLmxlbmd0aDtjKyspaWYoYVtjXT09PWIub3JpZ2luYWxQaHJhc2UpcmV0dXJuITE7cmV0dXJuITB9KSl9LGFkZENhbGxiYWNrOmZ1bmN0aW9uKGMsZCxlKXt2YXIgZj1hW2RdfHxkO1wiZnVuY3Rpb25cIj09dHlwZW9mIGYmJmhbY10hPT1iJiZoW2NdLnB1c2goe2NhbGxiYWNrOmYsY29udGV4dDplfHx0aGlzfSl9LHJlbW92ZUNhbGxiYWNrOmZ1bmN0aW9uKGEsYyl7dmFyIGQ9ZnVuY3Rpb24oYSl7cmV0dXJuIGEuY2FsbGJhY2shPT1jfTtmb3IodmFyIGUgaW4gaCloLmhhc093blByb3BlcnR5KGUpJiYoYSE9PWImJmEhPT1lfHwoYz09PWI/aFtlXT1bXTpoW2VdPWhbZV0uZmlsdGVyKGQpKSl9LGlzTGlzdGVuaW5nOmZ1bmN0aW9uKCl7cmV0dXJuIG4mJiFtfSxnZXRTcGVlY2hSZWNvZ25pemVyOmZ1bmN0aW9uKCl7cmV0dXJuIGV9LHRyaWdnZXI6ZnVuY3Rpb24oYSl7cmV0dXJuIGMuaXNMaXN0ZW5pbmcoKT8oQXJyYXkuaXNBcnJheShhKXx8KGE9W2FdKSx2b2lkIHooYSkpOnZvaWQoayYmdyhuP1wiU3BlZWNoIGhlYXJkLCBidXQgYW5ueWFuZyBpcyBwYXVzZWRcIjpcIkNhbm5vdCB0cmlnZ2VyIHdoaWxlIGFubnlhbmcgaXMgYWJvcnRlZFwiKSl9fX0pOyIsIihmdW5jdGlvbiAocm9vdCkge1xuXG4gIC8vIFN0b3JlIHNldFRpbWVvdXQgcmVmZXJlbmNlIHNvIHByb21pc2UtcG9seWZpbGwgd2lsbCBiZSB1bmFmZmVjdGVkIGJ5XG4gIC8vIG90aGVyIGNvZGUgbW9kaWZ5aW5nIHNldFRpbWVvdXQgKGxpa2Ugc2lub24udXNlRmFrZVRpbWVycygpKVxuICB2YXIgc2V0VGltZW91dEZ1bmMgPSBzZXRUaW1lb3V0O1xuXG4gIGZ1bmN0aW9uIG5vb3AoKSB7fVxuICBcbiAgLy8gUG9seWZpbGwgZm9yIEZ1bmN0aW9uLnByb3RvdHlwZS5iaW5kXG4gIGZ1bmN0aW9uIGJpbmQoZm4sIHRoaXNBcmcpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24gKCkge1xuICAgICAgZm4uYXBwbHkodGhpc0FyZywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9XG5cbiAgZnVuY3Rpb24gUHJvbWlzZShmbikge1xuICAgIGlmICh0eXBlb2YgdGhpcyAhPT0gJ29iamVjdCcpIHRocm93IG5ldyBUeXBlRXJyb3IoJ1Byb21pc2VzIG11c3QgYmUgY29uc3RydWN0ZWQgdmlhIG5ldycpO1xuICAgIGlmICh0eXBlb2YgZm4gIT09ICdmdW5jdGlvbicpIHRocm93IG5ldyBUeXBlRXJyb3IoJ25vdCBhIGZ1bmN0aW9uJyk7XG4gICAgdGhpcy5fc3RhdGUgPSAwO1xuICAgIHRoaXMuX2hhbmRsZWQgPSBmYWxzZTtcbiAgICB0aGlzLl92YWx1ZSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLl9kZWZlcnJlZHMgPSBbXTtcblxuICAgIGRvUmVzb2x2ZShmbiwgdGhpcyk7XG4gIH1cblxuICBmdW5jdGlvbiBoYW5kbGUoc2VsZiwgZGVmZXJyZWQpIHtcbiAgICB3aGlsZSAoc2VsZi5fc3RhdGUgPT09IDMpIHtcbiAgICAgIHNlbGYgPSBzZWxmLl92YWx1ZTtcbiAgICB9XG4gICAgaWYgKHNlbGYuX3N0YXRlID09PSAwKSB7XG4gICAgICBzZWxmLl9kZWZlcnJlZHMucHVzaChkZWZlcnJlZCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIHNlbGYuX2hhbmRsZWQgPSB0cnVlO1xuICAgIFByb21pc2UuX2ltbWVkaWF0ZUZuKGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBjYiA9IHNlbGYuX3N0YXRlID09PSAxID8gZGVmZXJyZWQub25GdWxmaWxsZWQgOiBkZWZlcnJlZC5vblJlamVjdGVkO1xuICAgICAgaWYgKGNiID09PSBudWxsKSB7XG4gICAgICAgIChzZWxmLl9zdGF0ZSA9PT0gMSA/IHJlc29sdmUgOiByZWplY3QpKGRlZmVycmVkLnByb21pc2UsIHNlbGYuX3ZhbHVlKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgdmFyIHJldDtcbiAgICAgIHRyeSB7XG4gICAgICAgIHJldCA9IGNiKHNlbGYuX3ZhbHVlKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmVqZWN0KGRlZmVycmVkLnByb21pc2UsIGUpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXNvbHZlKGRlZmVycmVkLnByb21pc2UsIHJldCk7XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiByZXNvbHZlKHNlbGYsIG5ld1ZhbHVlKSB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIFByb21pc2UgUmVzb2x1dGlvbiBQcm9jZWR1cmU6IGh0dHBzOi8vZ2l0aHViLmNvbS9wcm9taXNlcy1hcGx1cy9wcm9taXNlcy1zcGVjI3RoZS1wcm9taXNlLXJlc29sdXRpb24tcHJvY2VkdXJlXG4gICAgICBpZiAobmV3VmFsdWUgPT09IHNlbGYpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0EgcHJvbWlzZSBjYW5ub3QgYmUgcmVzb2x2ZWQgd2l0aCBpdHNlbGYuJyk7XG4gICAgICBpZiAobmV3VmFsdWUgJiYgKHR5cGVvZiBuZXdWYWx1ZSA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIG5ld1ZhbHVlID09PSAnZnVuY3Rpb24nKSkge1xuICAgICAgICB2YXIgdGhlbiA9IG5ld1ZhbHVlLnRoZW47XG4gICAgICAgIGlmIChuZXdWYWx1ZSBpbnN0YW5jZW9mIFByb21pc2UpIHtcbiAgICAgICAgICBzZWxmLl9zdGF0ZSA9IDM7XG4gICAgICAgICAgc2VsZi5fdmFsdWUgPSBuZXdWYWx1ZTtcbiAgICAgICAgICBmaW5hbGUoc2VsZik7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiB0aGVuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgZG9SZXNvbHZlKGJpbmQodGhlbiwgbmV3VmFsdWUpLCBzZWxmKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHNlbGYuX3N0YXRlID0gMTtcbiAgICAgIHNlbGYuX3ZhbHVlID0gbmV3VmFsdWU7XG4gICAgICBmaW5hbGUoc2VsZik7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgcmVqZWN0KHNlbGYsIGUpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHJlamVjdChzZWxmLCBuZXdWYWx1ZSkge1xuICAgIHNlbGYuX3N0YXRlID0gMjtcbiAgICBzZWxmLl92YWx1ZSA9IG5ld1ZhbHVlO1xuICAgIGZpbmFsZShzZWxmKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZpbmFsZShzZWxmKSB7XG4gICAgaWYgKHNlbGYuX3N0YXRlID09PSAyICYmIHNlbGYuX2RlZmVycmVkcy5sZW5ndGggPT09IDApIHtcbiAgICAgIFByb21pc2UuX2ltbWVkaWF0ZUZuKGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAoIXNlbGYuX2hhbmRsZWQpIHtcbiAgICAgICAgICBQcm9taXNlLl91bmhhbmRsZWRSZWplY3Rpb25GbihzZWxmLl92YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwLCBsZW4gPSBzZWxmLl9kZWZlcnJlZHMubGVuZ3RoOyBpIDwgbGVuOyBpKyspIHtcbiAgICAgIGhhbmRsZShzZWxmLCBzZWxmLl9kZWZlcnJlZHNbaV0pO1xuICAgIH1cbiAgICBzZWxmLl9kZWZlcnJlZHMgPSBudWxsO1xuICB9XG5cbiAgZnVuY3Rpb24gSGFuZGxlcihvbkZ1bGZpbGxlZCwgb25SZWplY3RlZCwgcHJvbWlzZSkge1xuICAgIHRoaXMub25GdWxmaWxsZWQgPSB0eXBlb2Ygb25GdWxmaWxsZWQgPT09ICdmdW5jdGlvbicgPyBvbkZ1bGZpbGxlZCA6IG51bGw7XG4gICAgdGhpcy5vblJlamVjdGVkID0gdHlwZW9mIG9uUmVqZWN0ZWQgPT09ICdmdW5jdGlvbicgPyBvblJlamVjdGVkIDogbnVsbDtcbiAgICB0aGlzLnByb21pc2UgPSBwcm9taXNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFRha2UgYSBwb3RlbnRpYWxseSBtaXNiZWhhdmluZyByZXNvbHZlciBmdW5jdGlvbiBhbmQgbWFrZSBzdXJlXG4gICAqIG9uRnVsZmlsbGVkIGFuZCBvblJlamVjdGVkIGFyZSBvbmx5IGNhbGxlZCBvbmNlLlxuICAgKlxuICAgKiBNYWtlcyBubyBndWFyYW50ZWVzIGFib3V0IGFzeW5jaHJvbnkuXG4gICAqL1xuICBmdW5jdGlvbiBkb1Jlc29sdmUoZm4sIHNlbGYpIHtcbiAgICB2YXIgZG9uZSA9IGZhbHNlO1xuICAgIHRyeSB7XG4gICAgICBmbihmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgaWYgKGRvbmUpIHJldHVybjtcbiAgICAgICAgZG9uZSA9IHRydWU7XG4gICAgICAgIHJlc29sdmUoc2VsZiwgdmFsdWUpO1xuICAgICAgfSwgZnVuY3Rpb24gKHJlYXNvbikge1xuICAgICAgICBpZiAoZG9uZSkgcmV0dXJuO1xuICAgICAgICBkb25lID0gdHJ1ZTtcbiAgICAgICAgcmVqZWN0KHNlbGYsIHJlYXNvbik7XG4gICAgICB9KTtcbiAgICB9IGNhdGNoIChleCkge1xuICAgICAgaWYgKGRvbmUpIHJldHVybjtcbiAgICAgIGRvbmUgPSB0cnVlO1xuICAgICAgcmVqZWN0KHNlbGYsIGV4KTtcbiAgICB9XG4gIH1cblxuICBQcm9taXNlLnByb3RvdHlwZVsnY2F0Y2gnXSA9IGZ1bmN0aW9uIChvblJlamVjdGVkKSB7XG4gICAgcmV0dXJuIHRoaXMudGhlbihudWxsLCBvblJlamVjdGVkKTtcbiAgfTtcblxuICBQcm9taXNlLnByb3RvdHlwZS50aGVuID0gZnVuY3Rpb24gKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkKSB7XG4gICAgdmFyIHByb20gPSBuZXcgKHRoaXMuY29uc3RydWN0b3IpKG5vb3ApO1xuXG4gICAgaGFuZGxlKHRoaXMsIG5ldyBIYW5kbGVyKG9uRnVsZmlsbGVkLCBvblJlamVjdGVkLCBwcm9tKSk7XG4gICAgcmV0dXJuIHByb207XG4gIH07XG5cbiAgUHJvbWlzZS5hbGwgPSBmdW5jdGlvbiAoYXJyKSB7XG4gICAgdmFyIGFyZ3MgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcnIpO1xuXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkgcmV0dXJuIHJlc29sdmUoW10pO1xuICAgICAgdmFyIHJlbWFpbmluZyA9IGFyZ3MubGVuZ3RoO1xuXG4gICAgICBmdW5jdGlvbiByZXMoaSwgdmFsKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgaWYgKHZhbCAmJiAodHlwZW9mIHZhbCA9PT0gJ29iamVjdCcgfHwgdHlwZW9mIHZhbCA9PT0gJ2Z1bmN0aW9uJykpIHtcbiAgICAgICAgICAgIHZhciB0aGVuID0gdmFsLnRoZW47XG4gICAgICAgICAgICBpZiAodHlwZW9mIHRoZW4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgdGhlbi5jYWxsKHZhbCwgZnVuY3Rpb24gKHZhbCkge1xuICAgICAgICAgICAgICAgIHJlcyhpLCB2YWwpO1xuICAgICAgICAgICAgICB9LCByZWplY3QpO1xuICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGFyZ3NbaV0gPSB2YWw7XG4gICAgICAgICAgaWYgKC0tcmVtYWluaW5nID09PSAwKSB7XG4gICAgICAgICAgICByZXNvbHZlKGFyZ3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZXgpIHtcbiAgICAgICAgICByZWplY3QoZXgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJncy5sZW5ndGg7IGkrKykge1xuICAgICAgICByZXMoaSwgYXJnc1tpXSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgUHJvbWlzZS5yZXNvbHZlID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgaWYgKHZhbHVlICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUuY29uc3RydWN0b3IgPT09IFByb21pc2UpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUpIHtcbiAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgIH0pO1xuICB9O1xuXG4gIFByb21pc2UucmVqZWN0ID0gZnVuY3Rpb24gKHZhbHVlKSB7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcbiAgICAgIHJlamVjdCh2YWx1ZSk7XG4gICAgfSk7XG4gIH07XG5cbiAgUHJvbWlzZS5yYWNlID0gZnVuY3Rpb24gKHZhbHVlcykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuID0gdmFsdWVzLmxlbmd0aDsgaSA8IGxlbjsgaSsrKSB7XG4gICAgICAgIHZhbHVlc1tpXS50aGVuKHJlc29sdmUsIHJlamVjdCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gVXNlIHBvbHlmaWxsIGZvciBzZXRJbW1lZGlhdGUgZm9yIHBlcmZvcm1hbmNlIGdhaW5zXG4gIFByb21pc2UuX2ltbWVkaWF0ZUZuID0gKHR5cGVvZiBzZXRJbW1lZGlhdGUgPT09ICdmdW5jdGlvbicgJiYgZnVuY3Rpb24gKGZuKSB7IHNldEltbWVkaWF0ZShmbik7IH0pIHx8XG4gICAgZnVuY3Rpb24gKGZuKSB7XG4gICAgICBzZXRUaW1lb3V0RnVuYyhmbiwgMCk7XG4gICAgfTtcblxuICBQcm9taXNlLl91bmhhbmRsZWRSZWplY3Rpb25GbiA9IGZ1bmN0aW9uIF91bmhhbmRsZWRSZWplY3Rpb25GbihlcnIpIHtcbiAgICBpZiAodHlwZW9mIGNvbnNvbGUgIT09ICd1bmRlZmluZWQnICYmIGNvbnNvbGUpIHtcbiAgICAgIGNvbnNvbGUud2FybignUG9zc2libGUgVW5oYW5kbGVkIFByb21pc2UgUmVqZWN0aW9uOicsIGVycik7IC8vIGVzbGludC1kaXNhYmxlLWxpbmUgbm8tY29uc29sZVxuICAgIH1cbiAgfTtcblxuICAvKipcbiAgICogU2V0IHRoZSBpbW1lZGlhdGUgZnVuY3Rpb24gdG8gZXhlY3V0ZSBjYWxsYmFja3NcbiAgICogQHBhcmFtIGZuIHtmdW5jdGlvbn0gRnVuY3Rpb24gdG8gZXhlY3V0ZVxuICAgKiBAZGVwcmVjYXRlZFxuICAgKi9cbiAgUHJvbWlzZS5fc2V0SW1tZWRpYXRlRm4gPSBmdW5jdGlvbiBfc2V0SW1tZWRpYXRlRm4oZm4pIHtcbiAgICBQcm9taXNlLl9pbW1lZGlhdGVGbiA9IGZuO1xuICB9O1xuXG4gIC8qKlxuICAgKiBDaGFuZ2UgdGhlIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgb24gdW5oYW5kbGVkIHJlamVjdGlvblxuICAgKiBAcGFyYW0ge2Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBleGVjdXRlIG9uIHVuaGFuZGxlZCByZWplY3Rpb25cbiAgICogQGRlcHJlY2F0ZWRcbiAgICovXG4gIFByb21pc2UuX3NldFVuaGFuZGxlZFJlamVjdGlvbkZuID0gZnVuY3Rpb24gX3NldFVuaGFuZGxlZFJlamVjdGlvbkZuKGZuKSB7XG4gICAgUHJvbWlzZS5fdW5oYW5kbGVkUmVqZWN0aW9uRm4gPSBmbjtcbiAgfTtcbiAgXG4gIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gUHJvbWlzZTtcbiAgfSBlbHNlIGlmICghcm9vdC5Qcm9taXNlKSB7XG4gICAgcm9vdC5Qcm9taXNlID0gUHJvbWlzZTtcbiAgfVxuXG59KSh0aGlzKTtcbiJdfQ==
