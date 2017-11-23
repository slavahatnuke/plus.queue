const Workers = require('./Workers');
const Queue = require('./Queue');
const Job = require('./Job');

const components = {
  job: (data, id) => new Job(data, id),
  queue: (redis, name, options = {}) => new Queue(redis, name, options),
  queueFactory: (redis, options = {}) => (name, specificOptions = {}) => components.queue(redis, name, Object.assign({}, options, specificOptions)),
  worker: (queue, handler = null , options = {}) => new Workers(queue, handler, options),
  workerFactory: (options = {}) => (queue, handler = null, specificOptions = {}) => components.worker(queue, handler, Object.assign({}, options, specificOptions)),
};

module.exports = components;
