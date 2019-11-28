require('dotenv').config();
const rabbit = require('amqplib');
const redis = require('./redis');
// const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup');
const { bot } = require('./bot');
const product2markdown = require('./getMarkdownProduct');

const wait = async (seconds, cb) => {
  await new Promise(resolve => setTimeout(resolve, 1000 * seconds));
  return cb();
};

const getMessage = async ch => {
  console.log('try:');
  const product = await ch.get(process.env.GET_Q, { noAck: true });
  if (product) {
    const str = await product.content.toString();

    return JSON.parse(str);
  }
  return false;

  // const result = `{"title":"100 шт./Партия набор 5x20 мм предохранители в ассортименте наборы DIY керамический предохранитель стеклянная трубка быстрая выдувная Стеклянные Предохранители 0.2A-20A","our_rating":0.13499999999999998,"id":33035920063,"url":"https://ru.aliexpress.com/item/33035920063.html","total_sales":0,"rating_product":4.9,"total_comment":14,"images":["https://ae01.alicdn.com/kf/HTB1wzhVcvWG3KVjSZFPq6xaiXXa0/100-5x20.jpg","https://ae01.alicdn.com/kf/HTB1FO8ZcAWE3KVjSZSyq6xocXXaN/100-5x20.jpg","https://ae01.alicdn.com/kf/HTB1oxR0cCWD3KVjSZSgq6ACxVXaJ/100-5x20.jpg","https://ae01.alicdn.com/kf/HTB15ONJbkxz61VjSZFtq6yDSVXa3/100-5x20.jpg","https://ae01.alicdn.com/kf/HTB1ZhR0cCWD3KVjSZSgq6ACxVXaV/100-5x20.jpg"],"discount":40,"max":{"currency":"RUB","cost":382.3},"min":{"currency":"RUB","cost":229.38},"shop":{"id":5058253,"name":"Lglesias Storage Store","followers":50,"positive_rate":98}}`
};

const send = async ch => {
  console.log('TCL: new Date().getHours()', new Date().getHours());
  const data = await getMessage(ch);
  if (data) {
    const { message, url, photo, hash } = await product2markdown(data);
    console.log('TCL: hash', hash);

    const messageObj = await bot.telegram.sendPhoto(
      process.env.CHANNEL || '@ali_ga_ng',
      { url: photo, filename: photo + Date.now() },
      {
        caption: message,
        parse_mode: 'Markdown',
        disable_web_page_preview: true,
        reply_markup: Markup.inlineKeyboard([
          Markup.urlButton(`🔥КУПИТЬ🔥${hash ? ' 0❤️' : ''}`, url),
        ]),
      },
    );
    console.log('TCL: messageObj', !!messageObj);
    try {
      if (hash) {
        await redis.set(
          `${process.env.REDIS_PREFIX}${hash}`,
          JSON.stringify({
            channelId: process.env.CHANNEL,
            messageId: messageObj.message_id,
            inlineMessageId: 0,
            url,
          }),
        );
      }
    } catch (err) {
      console.error(err);
    }
    if (new Date().getHours() === 3 || new Date().getHours() === 2) {
      await wait(8 * 3600, () => {
        console.log('Wake up, Neo ...');
      });
    }
    console.log('TCL: process.env.TIMEOUT', process.env.TIMEOUT);

    setTimeout(async () => {
      process.exit(1);
      await send(ch);
    }, process.env.TIMEOUT || 3600000);
  } else {
    if (new Date().getHours() === 3 || new Date().getHours() === 2) {
      await wait(8 * 3600, () => {
        console.log('Wake up, Neo ...');
      });
    }
    setTimeout(async () => {
      process.exit(1);
      await send(ch);
    }, process.env.TIMEOUT || 3600000);
  }
};

rabbit
  .connect({
    username: 'rabbitmq',
    password: 'rabbitmq',
  })
  .then(async conn => {
    conn.createChannel().then(async ch => {
      await ch.assertQueue(process.env.GET_Q, { durable: false, ack: true });
      await send(ch);
    });
  });
