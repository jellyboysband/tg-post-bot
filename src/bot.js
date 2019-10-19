const Agent = require('socks-proxy-agent');
const Telegraf = require('telegraf')

const bot = new Telegraf(process.env.TELEGRAM_TOKEN, {
    telegram: {
        agent: new Agent(process.env.PROXY_URL),
    },
});

module.exports = { bot };