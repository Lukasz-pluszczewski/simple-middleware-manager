# Simple middleware manager
> Lightweight and simple yet powerful middleware manager

[![CircleCI](https://circleci.com/gh/Lukasz-pluszczewski/simple-middleware-manager/tree/master.svg?style=svg)](https://circleci.com/gh/Lukasz-pluszczewski/simple-middleware-manager/tree/master)

Tool to manage middlewares and/or eventListeners. It works similar to express middlewares with a little more flexibility.

## FAQ

#### Why this exists?
There are not many tools that helps manage middlewares and callbacks and none that have auto mode (see below)

#### I found a bug! What should I do?
Feel free to make a pull request. All contributions are appreciated!

## Usage

#### Installing library
```bash
npm i --save simple-middleware-manager
```

#### Registering callbacks
You can register callback (or eventListeners) using `.on` method and remove them with `.off` method
```javascript
import createMiddlewareManager from 'simple-middleware-manager';

const manager = createMiddlewareManager();

// adding callbacks/eventListeners
const listener1 = data => console.log('listener1', data);
const listener2 = data => console.log('listener2', data);

manager.on('myEvent', listener1);
manager.on('myEvent', listener2);

manager.trigger('myEvent', 'myData'); // listener1 myData; listener2 myData

// removing callbacks/eventListeners
manager.off('myEvent', listener2);

manager.trigger('myEvent', 'myData'); // listener1 myData
```

#### Registering callbacks with additional conditions
You can register eventListeners and add additional conditions that can prevent them from being called
```javascript
import createMiddlewareManager from 'simple-middleware-manager';

const manager = createMiddlewareManager();

// adding callbacks/eventListeners
const listener1 = data => console.log('listener1', data);
const listener2 = data => console.log('listener2', data);

const condition = (event, data, listener) => {
  if (data === 'foo') {
    listener(data);
  }
};

manager.on('myEvent', listener1);
manager.on('myEvent', condition, listener2);

manager.trigger('myEvent', 'myData'); // listener1 myData; listener2 myData

manager.trigger('myEvent', 'myData'); // listener1 myData
```

NOTE: adding additional function may seem counter intuitive as the same logic can be just added to the listener. In the case of altering the listener, however, it will make it impossible to remove it later. See the example below:

Imagine you use middleware-manager internally in another library, that allows you to add conditions:

```javascript
yourLibrary.on('eventName', { foo: 'bar' }, listener).
```

In that case you can wrap condition in a function and just pass listener unchanged which will allow you to remove it later easily still using simple-middleware-manager mechanism:

```
yourLibrary.off('eventName', listener);
```


#### Registering middlewares
 * You can add middlewares using `.use` method, remove them using `.unuse` or `.remove` methods.
 * Middlewares will be triggered in the order of registering
 * Each middleware get data as first argument and `next()` function as second
 * Calling `next()` function will trigger next middleware 
 * You can break middleware pipeline by not calling next
```javascript
import createMiddlewareManager from 'simple-middleware-manager';

const manager = createMiddlewareManager();

// adding middlewares
const middleware1 = (data, next) => {
  console.log('I will be called', data);
  next();
};
const middleware2 = (data, next) => {
  console.log('I will be called as well', data);
}
const middleware3 = (data, next) => {
  console.log('Will I be called?', data);
  next();
}

manager.use('myEvent', middleware1);
manager.use('myEvent', middleware2);
manager.use('myEvent', middleware3);

manager.trigger('myEvent', 'myData'); // I will be called myData; I will be called as well myData

// removing middlewares
manager.unuse('myEvent', middleware2);

manager.trigger('myEvent', 'myData'); // I will be called myData; Will I be called? myData
```

#### Using middleware manager in auto mode
 * In auto mode, manager will detect if you passed next as second argument to the middleware
 * If you did, manager will wait for it to be called
 * If you didn't, `next()` function will be called automatically
 
```javascript
import createMiddlewareManager from 'simple-middleware-manager';

const manager = createMiddlewareManager({ autoMode: true }); // creating manager with autoMode on

// adding middlewares
const middleware1 = (data) => { // we don't pass next() function so it will be called automatically
  console.log('I will be called', data);
};
const middleware2 = (data, next) => {
  console.log('I will be called as well', data);
}
const middleware3 = (data, next) => {
  console.log('I will not be called :(', data);
  next();
}

manager.use('myEvent', middleware1);
manager.use('myEvent', middleware2);
manager.use('myEvent', middleware3);

manager.trigger('myEvent', 'myData'); // I will be called myData; I will be called as well myData
```

## Roadmap
- Adding conditions function for middlewares