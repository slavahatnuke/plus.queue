const EventEmitter = require('events');

module.exports = class Worker {
  constructor(queue, handler, options = {}) {
    this.queue = queue;

    this.handler = handler || ((data) => data);

    this.options = Object.assign({
      interval: 500,
      maxListeners: 100
    }, options);

    this.timeout = null;
    this.isQuit = false;
    this.workInProgress = false;

    this.eventEmitter = new EventEmitter;
    this.eventEmitter.setMaxListeners(this.options.maxListeners);
  }

  start() {
    return Promise.resolve().then(() => this._ask())
  }

  stop() {
    this.isQuit = true;
    this._resetTimeout();

    return new Promise((resolve) => {
      if (!this.workInProgress) {
        return resolve();
      } else {
        this.eventEmitter.once('job.finished', ({job}) => resolve(job || null))
      }
    })
      .then(() => this.eventEmitter.removeAllListeners());
  }

  _reAsk() {
    if (this.isQuit) {
      return;
    }

    this._resetTimeout();
    this.timeout = setTimeout(() => this._ask(), this.options.interval)
  }

  _resetTimeout() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }

  _ask() {
    console.log('_ask', Math.random().toString(35).slice(3, 15));

    if (this.isQuit) {
      this.eventEmitter.emit('job.finished', {job: null});
      return Promise.resolve();
    }

    return Promise.resolve()
      .then(() => this.workInProgress = true)
      .then(() => {
        return Promise.resolve()
          .then(() => this.queue.getJob())
          .then((job) => {
            if (!job) {
              this.workInProgress = false;
              this.eventEmitter.emit('job.finished', {job});

              this._reAsk();
              return;
            }

            return Promise.resolve()
              .then(() => this.handler(job.getData(), job, this.queue))
              .then((result) => this.eventEmitter.emit('job.result', {job, result}))
              .catch((error) => {
                // console.log({error})
                this.eventEmitter.emit('job.error', {job, error})
              })
              .then(() => this.workInProgress = false)
              .then(() => this.eventEmitter.emit('job.finished', {job}))
              .then(() => this._ask());
          });
      })
  }

  subscribe(onSuccess = () => null, onError = () => null) {
    this.eventEmitter.on('job.result', ({job, result}) => onSuccess(result, job, this.queue));
    this.eventEmitter.on('job.error', ({job, error}) => onError(error, job.getData(), job, this.queue));
  }
};
