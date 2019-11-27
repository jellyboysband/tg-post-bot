const Agent = require('socks-proxy-agent');
const Telegraf = require('telegraf');

let bot;
if (process.env.PROXY_URL) {
  bot = new Telegraf(process.env.TELEGRAM_TOKEN, {
    telegram: {
      agent: new Agent(process.env.PROXY_URL),
    },
  });
} else {
  bot = new Telegraf(process.env.TELEGRAM_TOKEN);
}
module.exports = { bot };
