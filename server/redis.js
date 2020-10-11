const redis = require('redis');

const client = redis.createClient();

client.on('connect', function() {
  console.log('connected');
});

client.set('framework', 'AngularJS');

client.get('framework', function(err, reply) {
  console.log(`framework: ${reply}`);
  process.exit(0);
});