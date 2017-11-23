const Job = require('./Job');

module.exports = class Queue {
  constructor(redis, name = 'default', options = {}) {
    this.options = Object.assign({
      prefix: 'queue:',
      encrypt: (data) => data,
      decrypt: (data) => data,
      mapper: (data) => data,
      demapper: (data) => data,
    }, options);

    this.name = this.options.prefix + name;
    this.redis = redis;
  }

  getName() {
    return this.name;
  }


  count() {
    return new Promise((resolve, reject) => this.redis.llen(this.name, (err, result) => {
      return err ? reject(err) : resolve(result);
    }));
  }

  add(job) {
    if (Array.isArray(job)) {
      return Promise.all(job.map((job) => this.put(job)))
    }

    return this.put(job);
  }

  put(job) {
    return Promise.resolve()
      .then(() => {
        if (!(job instanceof Job)) {
          job = new Job(job, null, true);
        }

        return job.makeId()
          .then(() => this.options.mapper(job.getData()))
          .then((data) => job.setData(data))
          .then(() => this.options.encrypt(JSON.stringify(job)))
          .then((textData) => {
            return new Promise((resolve, reject) => this.redis.rpush(this.name, textData, (err, result) => {
              return err ? reject(err) : resolve(result);
            }))
              .then(() => job);
          })
      })
  }

  get() {
    return this.getJob().then((job) => {
      if (job) {
        return job.raw ? job.getData() : job
      } else {
        return null;
      }
    });
  }

  getJob() {
    return new Promise((resolve, reject) => {
      return this.redis.lpop(this.name, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result)
      });
    })
      .then((result) => {
        if (!result) {
          return null;
        }

        return Promise.resolve()
          .then(() => this.options.decrypt(result))
          .then((result) => {
            let data = JSON.parse(result);
            return new Job(data.data, data.id, data.raw);
          })
          .then((job) => {
            return Promise.resolve()
              .then(() => this.options.demapper(job.getData()))
              .then((data) => job.setData(data))
              .then(() => job)
          })
      })
  }

};
