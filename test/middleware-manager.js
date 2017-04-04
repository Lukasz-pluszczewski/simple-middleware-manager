import chai, { expect } from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);

import createCallbackHandler from '../src/index'; // change this

describe('callbackHandler', () => {
  const event1Data = {key: 'value1'};
  const event2Data = {key: 'value2'};
  const middlewares = {
    event1Middleware1(data, next) {next()},
    event1Middleware2(data, next) {next()},
    event2Middleware1(data, next) {next()},
    event2Middleware2(data) {}, // next function for this middleware should be automatically triggered when autoMode is enabled
    event2Middleware3(data, next) {next()},
    event2Middleware4(data, next) {next()},
  };
  sinon.spy(middlewares, 'event1Middleware1');
  sinon.spy(middlewares, 'event1Middleware2');
  sinon.spy(middlewares, 'event2Middleware1');
  sinon.spy(middlewares, 'event2Middleware2');
  sinon.spy(middlewares, 'event2Middleware3');
  sinon.spy(middlewares, 'event2Middleware4');

  const listeners = {
    event1Listener1: sinon.spy(),
    event1Listener2: sinon.spy(),
    event2Listener1: sinon.spy(),
    event2Listener2: sinon.spy(),
    event2Listener3: sinon.spy(),
  };

  const resetMiddlewares = () => {
    middlewares.event1Middleware1.reset();
    middlewares.event1Middleware2.reset();
    middlewares.event2Middleware1.reset();
    middlewares.event2Middleware2.reset();
    middlewares.event2Middleware3.reset();
    middlewares.event2Middleware4.reset();
  };

  const resetListeners = () => {
    listeners.event1Listener1.reset();
    listeners.event1Listener2.reset();
    listeners.event2Listener1.reset();
    listeners.event2Listener2.reset();
    listeners.event2Listener3.reset();
  };

  beforeEach(() => {
    resetMiddlewares();
    resetListeners();
  });
  it('should register eventListeners and call them', () => {
    const ch = createCallbackHandler();

    ch.on('event1', listeners.event1Listener1);
    ch.on('event1', listeners.event1Listener2);
    ch.on('event2', listeners.event2Listener1);
    ch.on('event2', listeners.event2Listener2);
    ch.on('event2', listeners.event2Listener3);

    ch.off('event2', listeners.event2Listener3);

    ch.trigger('event1', event1Data);
    ch.trigger('event2', event2Data);

    expect(listeners.event1Listener1).to.be.calledWith(event1Data);
    expect(listeners.event1Listener2).to.be.calledWith(event1Data);
    expect(listeners.event2Listener1).to.be.calledWith(event2Data);
    expect(listeners.event2Listener2).to.be.calledWith(event2Data);
    expect(listeners.event2Listener3).to.not.be.called;
  });

  it('should register middlewares, call them one by one and stop execution when next is not called', () => {
    const ch = createCallbackHandler();

    ch.use('event1', middlewares.event1Middleware1);
    ch.use('event1', middlewares.event1Middleware2);
    ch.use('event2', middlewares.event2Middleware1);
    ch.use('event2', middlewares.event2Middleware2);
    ch.use('event2', middlewares.event2Middleware3);
    ch.use('event2', middlewares.event2Middleware4);

    ch.off('event2', middlewares.event2Middleware4);

    ch.trigger('event1', event1Data);
    ch.trigger('event2', event2Data);

    expect(middlewares.event1Middleware1).to.be.calledWith(event1Data);
    expect(middlewares.event1Middleware2).to.be.calledWith(event1Data);
    expect(middlewares.event2Middleware1).to.be.calledWith(event2Data);
    expect(middlewares.event2Middleware2).to.be.calledWith(event2Data);
    expect(middlewares.event2Middleware3).to.not.be.called;
    expect(middlewares.event2Middleware4).to.not.be.called;
  });

  it('should register middlewares in auto mode, call them one by one and auto execute next when it\'s not passed to the middleware', () => {
    const ch = createCallbackHandler(true);

    ch.use('event1', middlewares.event1Middleware1);
    ch.use('event1', middlewares.event1Middleware2);
    ch.use('event2', middlewares.event2Middleware1);
    ch.use('event2', middlewares.event2Middleware2);
    ch.use('event2', middlewares.event2Middleware3);
    ch.use('event2', middlewares.event2Middleware4);

    ch.unuse('event2', middlewares.event2Middleware4);

    ch.trigger('event1', event1Data);
    ch.trigger('event2', event2Data);

    expect(middlewares.event1Middleware1).to.be.calledWith(event1Data);
    expect(middlewares.event1Middleware2).to.be.calledWith(event1Data);
    expect(middlewares.event2Middleware1).to.be.calledWith(event2Data);
    expect(middlewares.event2Middleware2).to.be.calledWith(event2Data);
    expect(middlewares.event2Middleware3).to.be.calledWith(event2Data);
    expect(middlewares.event2Middleware4).to.not.be.called;
  });
});