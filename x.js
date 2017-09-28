const redis = require('redis');

const {queue, job, worker, queueFactory} = require('./index');


const redisClient = redis.createClient({
  host: 'redis-12345.c9.us-east-1-2.ec2.cloud.redislabs.com',
  port: 14120,
  password: 'pass'
});

const testQueue = queue(redisClient, 'test', {prefix: 'queue:custom-prefix:'});

// same
// const testQueueFactory = queueFactory(redisClient, {prefix: 'queue:custom-prefix:'});
// const testQueue = testFactory(redisClient, 'test');

// # Queue Example
testQueue.add({xxx: 1})
  .then(() => testQueue.count())
  .then((len) => {
    console.log(len)
  })
  .then(() => testQueue.get())
  .then((data) => console.log(data))


// # Queue & Worker Example
testQueue.add(1)
testQueue.add(2)
testQueue.add(3)
testQueue.add(4)
testQueue.add(5)

const testWorker = worker(testQueue, (data, job, queue) => {
  console.log(data);

  return {
    myCsutomInfoForSubscriber: job.getId(),
    myCsutomDataForSubscriber: job.getData()
  };
}, {
  scale: 2, // quantity of handler, parallel
  interval: 1000, // ask interval in ms
});

// prints
// 1
// 2
// 3
// 4
// 5

testWorker.subscribe((data, job, queue) => {
  // console.log('onSuccess', {data, job, queue})
  console.log('onSuccess', {data})
}, (error, data, job, queue) => {
  // console.log('onError', {error, data, job, queue})
  console.log('onError', {error})
});

testWorker.start();

// setTimeout(() => testWorker.stop(), 3000)


