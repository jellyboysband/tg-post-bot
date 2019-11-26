const redis = require("async-redis");

const config = {
  host: process.env.REDIS_HOST || 'localhost',
  port: +process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || false
}

client = redis.createClient(config)

client.on("error", function (err) {
  console.log("Error " + err);
});


module.exports = client;