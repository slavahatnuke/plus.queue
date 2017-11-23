const Workers = require('./Workers');
const Queue = require('./Queue');
const Job = require('./Job');

const components = {
  Job: (data, id) => new Job(data, id),
  Queue: (redis, name, options = {}) => new Queue(redis, name, options),
  QueueFactory: (redis, options = {}) => (name, specificOptions = {}) => components.Queue(redis, name, Object.assign({}, options, specificOptions)),
  Worker: (queue, handler = null , options = {}) => new Workers(queue, handler, options),
  WorkerFactory: (options = {}) => (queue, handler = null, specificOptions = {}) => components.Worker(queue, handler, Object.assign({}, options, specificOptions)),
};

module.exports = components;
