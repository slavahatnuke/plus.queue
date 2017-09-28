const Job = require('./Job');

module.exports = class Queue {
  constructor(redis, name = 'default', options = {}) {
    this.options = Object.assign({
      prefix: 'queue:'
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
    return Promise.resolve()
      .then(() => {
        if (!(job instanceof Job)) {
          job = new Job(job, null, true);
        }

        return job.makeId()
          .then(() => {
            return new Promise((resolve, reject) => this.redis.rpush(this.name, JSON.stringify(job), (err, result) => {
              return err ? reject(err) : resolve(result);
            }))
              .then(() => job);
          })
      })
  }

  get() {
    return this.getJob().then((job) => {
      if(job) {
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

        let data;
        try {
          data = JSON.parse(result);
        } catch (error) {
          return reject(error);
        }

        if (!data) {
          return resolve(null);
        }

        return resolve(new Job(data.data, data.id, data.raw));
      });
    })
  }

};
