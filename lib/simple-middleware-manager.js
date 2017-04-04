(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('debug-composer')) :
	typeof define === 'function' && define.amd ? define(['exports', 'debug-composer'], factory) :
	(factory((global['simple-middleware-manager'] = global['simple-middleware-manager'] || {}),global.createLogger));
}(this, (function (exports,createLogger) { 'use strict';

createLogger = 'default' in createLogger ? createLogger['default'] : createLogger;

var logger = createLogger('simple-middleware-manager');

var createCallbackHandler = function createCallbackHandler() {
  var autoMode = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

  var callbackHandler = {
    callbacks: {},
    middlewares: {},
    on: function on(event, cb) {
      if (typeof event !== 'string') {
        throw new Error('Event name must be a string');
      }
      if (typeof cb !== 'function') {
        throw new Error('Callback must be a function');
      }
      if (!callbackHandler.callbacks[event]) {
        callbackHandler.callbacks[event] = [];
      }
      logger.info('Adding callback for ' + event + ' event', cb);
      callbackHandler.callbacks[event].push(cb);
    },
    use: function use(event, cb) {
      if (typeof event !== 'string') {
        throw new Error('Event name must be a string');
      }
      if (typeof cb !== 'function') {
        throw new Error('Middleware must be a function');
      }
      if (!callbackHandler.middlewares[event]) {
        callbackHandler.middlewares[event] = [];
      }
      logger.info('Adding middleware for ' + event + ' event', cb);
      callbackHandler.middlewares[event].push(cb);
    },
    remove: function remove(event, cb) {
      if (typeof event !== 'string') {
        throw new Error('Event name must be a string');
      }
      if (typeof cb !== 'function') {
        throw new Error('Callback must be a function');
      }
      if (!callbackHandler.callbacks[event] && !callbackHandler.middlewares[event]) {
        throw new Error('Event ' + event + ' not found');
      }

      var foundListeners = 0;
      var foundMiddlewares = 0;
      if (callbackHandler.callbacks[event]) {
        for (var i = 0; i < callbackHandler.callbacks[event].length;) {
          if (callbackHandler.callbacks[event][i] === cb) {
            foundListeners++;
            callbackHandler.callbacks[event].splice(i, 1);
            continue;
          }
          i++;
        }
      }
      if (callbackHandler.middlewares[event]) {
        for (var _i = 0; _i < callbackHandler.middlewares[event].length;) {
          if (callbackHandler.middlewares[event][_i] === cb) {
            foundMiddlewares++;
            callbackHandler.middlewares[event].splice(_i, 1);
            continue;
          }
          _i++;
        }
      }

      logger.info('Removed ' + foundListeners + ' ' + (foundListeners === 1 ? 'listener' : 'listeners') + ' and ' + foundMiddlewares + ' ' + (foundMiddlewares === 1 ? 'middleware' : 'middlewares'));
    },
    clearListeners: function clearListeners() {
      callbackHandler.callbacks = {};
      logger.info('Registered listeners list cleared');
    },
    clearMiddlewares: function clearMiddlewares() {
      callbackHandler.middlewares = {};
      logger.info('Registered middlewares list cleared');
    },
    off: function off(event, cb) {
      return callbackHandler.remove(event, cb);
    },
    unuse: function unuse(event, cb) {
      return callbackHandler.remove(event, cb);
    },
    trigger: function trigger(event, data) {
      if (callbackHandler.callbacks[event]) {
        callbackHandler.callbacks[event].forEach(function (cb) {
          return cb(data);
        });
      }
      if (callbackHandler.middlewares[event]) {
        var next = function next(index) {
          return function () {
            if (callbackHandler.middlewares[event][index]) {
              if (!autoMode || callbackHandler.middlewares[event][index].length > 1) {
                callbackHandler.middlewares[event][index](data, next(index + 1));
              } else {
                callbackHandler.middlewares[event][index](data);
                next(index + 1)();
              }
            }
          };
        };
        return callbackHandler.middlewares[event][0](data, next(1));
      }
    }
  };
  return callbackHandler;
};

exports['default'] = createCallbackHandler;

Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=simple-middleware-manager.js.map
