import logger from './logger';

const createCallbackHandler = ({ autoMode = false } = {}) => {
  const callbackHandler = {
    callbacks: {},
    middlewares: {},
    on(event, argWrapper, argCb) {
      let wrapper = argWrapper;
      let cb = argCb;
      if (!cb) {
        wrapper = undefined; // eslint-disable-line no-undefined
        cb = argWrapper;
      }

      if (typeof event !== 'string') {
        throw new Error('Event name must be a string');
      }
      if (typeof cb !== 'function') {
        throw new Error('Callback must be a function');
      }
      if (!callbackHandler.callbacks[event]) {
        callbackHandler.callbacks[event] = [];
      }
      logger.info(`Adding callback for ${event} event`, cb);
      callbackHandler.callbacks[event].push({ wrapper, cb });
    },
    use(event, argWrapper, argCb) {
      let wrapper = argWrapper;
      let cb = argCb;
      if (!cb) {
        wrapper = undefined; // eslint-disable-line no-undefined
        cb = argWrapper;
      }

      if (typeof event !== 'string') {
        throw new Error('Event name must be a string');
      }
      if (typeof cb !== 'function') {
        throw new Error('Middleware must be a function');
      }
      if (!callbackHandler.middlewares[event]) {
        callbackHandler.middlewares[event] = [];
      }
      logger.info(`Adding middleware for ${event} event`, cb);
      callbackHandler.middlewares[event].push({ wrapper, cb });
    },
    remove(event, cb) {
      if (typeof event !== 'string') {
        throw new Error('Event name must be a string');
      }
      if (typeof cb !== 'function') {
        throw new Error('Callback must be a function');
      }
      if (!callbackHandler.callbacks[event] && !callbackHandler.middlewares[event]) {
        throw new Error(`Event ${event} not found`);
      }

      let foundListeners = 0;
      let foundMiddlewares = 0;
      if (callbackHandler.callbacks[event]) {
        for (let i = 0; i < callbackHandler.callbacks[event].length;) {
          if (callbackHandler.callbacks[event][i].cb === cb) {
            foundListeners++;
            callbackHandler.callbacks[event].splice(i, 1);
            continue;
          }
          i++;
        }
      }
      if (callbackHandler.middlewares[event]) {
        for (let i = 0; i < callbackHandler.middlewares[event].length;) {
          if (callbackHandler.middlewares[event][i].cb === cb) {
            foundMiddlewares++;
            callbackHandler.middlewares[event].splice(i, 1);
            continue;
          }
          i++;
        }
      }

      logger.info(`Removed ${foundListeners} ${foundListeners === 1 ? 'listener' : 'listeners'} and ${foundMiddlewares} ${foundMiddlewares === 1 ? 'middleware' : 'middlewares'}`);
    },
    clearListeners() {
      callbackHandler.callbacks = {};
      logger.info('Registered listeners list cleared');
    },
    clearMiddlewares() {
      callbackHandler.middlewares = {};
      logger.info('Registered middlewares list cleared');
    },
    off(event, cb) {
      return callbackHandler.remove(event, cb);
    },
    unuse(event, cb) {
      return callbackHandler.remove(event, cb);
    },
    trigger(event, data) {
      if (callbackHandler.callbacks[event]) {
        callbackHandler.callbacks[event].forEach(cb => {
          if (cb.wrapper) {
            return cb.wrapper(event, data, cb.cb);
          }
          cb.cb(data);
        });
      }
      if (callbackHandler.middlewares[event]) {
        const next = index => () => {
          if (callbackHandler.middlewares[event][index]) {
            if (!autoMode || callbackHandler.middlewares[event][index].cb.length > 1) {
              callbackHandler.middlewares[event][index].cb(data, next(index + 1));
            } else {
              callbackHandler.middlewares[event][index].cb(data);
              next(index + 1)();
            }
          }
        };
        return callbackHandler.middlewares[event][0].cb(data, next(1));
      }
    },
  };
  return callbackHandler;
};

export default createCallbackHandler;
