'use strict';

const zookeeper = require('zookeeper-cluster-client');
const path = '/test/default/a.b.c.service/c/1.1.1.1';

const client = zookeeper.createClient('10.218.140.224:2181');

client.on('connected', function () {
  console.log('pid: %s connected, leader: %s', process.pid, client.isClusterClientLeader);
});
client.on('disconnected', function () {
  console.log('pid: %s disconnected, leader: %s', process.pid, client.isClusterClientLeader);
});
client.on('expired', function () {
  console.log('pid: %s expired, leader: %s', process.pid, client.isClusterClientLeader);
});
client.once('connected', function () {
    client.watch(path, function (err, value) {
    	if (err) {
        if (err.name === 'NO_NODE') {
          client.mkdirp(path, function(err, meta) {
            if (err) {
              return console.error('create %s error: %s', path, err);
            }
            console.log('create %s successfully, meta: %s', path, meta);
          });
        }
    		return console.log('watch %s error: %s', path, err)
    	}
      console.log(process.pid, path, 'changed', value ? value.toString() : 'no value');
    });
});

client.connect();

let count = 1;
setInterval(function () {
  const data = 'data' + ++count + ', pid:' + process.pid;
  client.setData(path, new Buffer(data), function (err) {
  	if (err) {
  		return console.log('%s setData %s error: %s', process.pid, path, err);
  	}
    console.log('setData: %s', data);
  });
}, 5000);
