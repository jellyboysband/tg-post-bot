const redis = require('async-redis');

const config = {
  host: process.env.REDIS_HOST || 'localhost',
  port: +process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || false,
};

const client = redis.createClient(config);

client.on('error', err => {
  console.log('Error ' + err);
});

module.exports = client;
