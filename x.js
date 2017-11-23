const redis = require('redis');

const {Queue, Job, Worker, QueueFactory, WorkerFactory} = require('./index');


const redisClient = redis.createClient({
  host: 'localhost',
  port: 6379
});

const testQueue = Queue(redisClient, 'test', {
  prefix: 'queue:custom-prefix:',
  // demapper: (data) => data + 1000
});

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

testQueue.put(10)
testQueue.put(11)
testQueue.put(12)

testQueue.add([6, 7, 8])

const testWorker = WorkerFactory({interval: 1000, scale: 100})(testQueue, (data, {job, queue}) => {
  // console.log(data);
  // console.log('>>>> 2 >>>>', {job, queue});

  // throw new Error('Foo');

  return {
    __id: job.getId(),
    __data: job.getData()
  };
});

// prints
// 1
// 2
// 3
// 4
// 5

testWorker.subscribe((data, {job, queue}) => {
  // console.log('onSuccess >>>> 1 >>>>', {data, job, queue})
  console.log('onSuccess', {data})
}, (error, data, {job, queue}) => {
  // console.log('onError', {error, data, job, queue})
  console.log('onError', {error, data, job, Queue})
});

testWorker.start();

setTimeout(() => testWorker.stop().then(() => process.exit(0)), 3000)


