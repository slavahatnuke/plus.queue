const crypto = require('crypto');

module.exports = class Job {
  constructor(data = null, id = null, raw = undefined) {
    this.data = data;
    this.id = id;
    this.raw = raw;
  }

  getData() {
    return this.data;
  }

  getId() {
    return this.id;
  }

  makeId() {
    return Promise.resolve()
      .then(() => {
        if (!this.id) {
          return new Promise((resolve, reject) => {
            crypto.randomBytes(16, (err, buf) => {
              if (err) return reject(err);
              resolve(buf.toString('hex').toUpperCase());
            });
          })
            .then((id) => this.id = id)
        }
      })
      .then(() => this.id);
  }
};
