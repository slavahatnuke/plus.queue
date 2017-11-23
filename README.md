# plus.queue
Simple redis-based Queue and scalable Workers

## Queue and Worker Example
```javascript
const redis = require('redis');

const {Queue, Worker, QueueFactory} = require('plus.queue');

const redisClient = redis.createClient({
  host: 'redis-12345.c9.us-east-1-2.ec2.cloud.redislabs.com',
  port: 14120,
  password: 'YourPassHere'
});

const testQueue = Queue(redisClient, 'test', {
  prefix: 'queue:custom-prefix:', // // optional
  encrypt: (data) => data, // optional
  decrypt: (data) => data, // optional
  mapper: (data) => data, // optional
  demapper: (data) => data // optional
});

testQueue.add(1)
testQueue.add(2)
testQueue.add(3)
testQueue.add(4)
testQueue.add(5)

testQueue.add([6, 7, 8])

testQueue.put(10)
testQueue.put(11)
testQueue.put(12)

const testWorker = Worker(testQueue, (data, {job, queue}) => {
  console.log(data);

  return {
    myCsutomInfoForSubscriber: job.getId(),
    myCsutomDataForSubscriber: job.getData()
  };
}, {
  scale: 1, // quantity of handler, parallel
  interval: 1000, // ask interval in ms
});

// prints
// 1
// 2
// 3
// 4
// 5
// 6 
// 7
// 8
// 10
// 11
// 12
 
testWorker.subscribe((data, {job, queue}) => {
  // console.log('onSuccess', {data, job, queue})
  console.log('onSuccess', {data})
}, (error, data, {job, queue}) => {
  // console.log('onError', {error, data, job, queue})
  console.log('onError', {error})
});

testWorker.start();

setTimeout(() => testWorker.stop().then(() => process.exit(0)), 10000)

```

## Queue Example
```javascript
testQueue.add({xxx: 1})
  .then(() => testQueue.count())
  .then((len) => {
    console.log(len)
  })
  .then(() => testQueue.get())
  .then((data) => console.log(data))
```

## Queue Factory (sugar)
```javascript

const redisClient = redis.createClient({
  host: 'redis-12345.c9.us-east-1-2.ec2.cloud.redislabs.com',
  port: 14120,
  password: 'passs'
});

const testQueueFactory = QueueFactory(redisClient, {
  prefix: 'queue:custom-prefix:', // // optional
  encrypt: (data) => data, // optional
  decrypt: (data) => data // optional
});

const testQueue = testQueueFactory(redisClient, 'test');

testQueue.add({xxx: 1})
  .then(() =>  testQueue.get())
  
// ....

```
