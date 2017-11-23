const Worker = require('./Worker');

module.exports = class Workers {
  constructor(queue, handler, options = {}) {
    this.queue = queue;

    this.handler = handler;

    this.options = Object.assign({
      scale: 1,
      interval: 500
    }, options);

    this.workers = [];
  }

  start() {
    return this.stop()
      .then(() => this._makeWorkers())
      .then(() => Promise.all(this.workers.map((worker) => worker.start())))
  }

  stop() {
    return Promise.all(this.workers.map((worker) => worker.stop()))
      .then(() => this.workers = [])
  }

  subscribe(onSuccess = () => null, onError = () => null) {
    return this._makeWorkers()
      .then(() => this.workers.forEach((worker) => worker.subscribe(onSuccess, onError)));
  }

  _makeWorkers() {
    return Promise.resolve()
      .then(() => {
        if(this.workers.length !== this.options.scale) {
          return Array(this.options.scale).fill(0).map(() => {
            return new Worker(this.queue, this.handler, this.options);
          })
        } else {
          return this.workers;
        }
      })
      .then((workers) => this.workers = workers);
  }

};
