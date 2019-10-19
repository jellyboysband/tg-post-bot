require('dotenv').config()
const rabbit = require('amqplib');
// const Extra = require('telegraf/extra')
const Markup = require('telegraf/markup')
const { bot } = require('./bot')
const product2markdown = require('./getMarkdownProduct')


const wait = async (seconds, cb) => {

  await new Promise(resolve => setTimeout(resolve, 1000 * seconds))
  return cb()
}

const getMessage = async (ch, tryCount = 0) => {
  console.log("try:" + tryCount);
  const product = (await ch.get(process.env.GET_Q, { noAck: true })).content
  if (product) {
    return product.toString();
  }
  const result = await wait(60, () => { getMessage(ch, tryCount++) })
  // const result = `{"title":"100 шт./Партия набор 5x20 мм предохранители в ассортименте наборы DIY керамический предохранитель стеклянная трубка быстрая выдувная Стеклянные Предохранители 0.2A-20A","our_rating":0.13499999999999998,"id":33035920063,"url":"https://ru.aliexpress.com/item/33035920063.html","total_sales":0,"rating_product":4.9,"total_comment":14,"images":["https://ae01.alicdn.com/kf/HTB1wzhVcvWG3KVjSZFPq6xaiXXa0/100-5x20.jpg","https://ae01.alicdn.com/kf/HTB1FO8ZcAWE3KVjSZSyq6xocXXaN/100-5x20.jpg","https://ae01.alicdn.com/kf/HTB1oxR0cCWD3KVjSZSgq6ACxVXaJ/100-5x20.jpg","https://ae01.alicdn.com/kf/HTB15ONJbkxz61VjSZFtq6yDSVXa3/100-5x20.jpg","https://ae01.alicdn.com/kf/HTB1ZhR0cCWD3KVjSZSgq6ACxVXaV/100-5x20.jpg"],"discount":40,"max":{"currency":"RUB","cost":382.3},"min":{"currency":"RUB","cost":229.38},"shop":{"id":5058253,"name":"Lglesias Storage Store","followers":50,"positive_rate":98}}`

  return result

}

rabbit
  .connect({
    username: 'rabbitmq',
    password: 'rabbitmq',
  })
  .then(async (conn) => {
    conn.createChannel().then((ch) => {
      ch.assertQueue(process.env.GET_Q, { durable: false, ack: true }).then(async () => {
        const rawMessage = await getMessage(ch)
        console.log("TCL: rawMessage", rawMessage)
        const { message, url, photo } = product2markdown(JSON.parse(rawMessage));
        bot.telegram.sendPhoto('@cash_saver', { url: photo, filename: photo }, {
          caption: message,
          parse_mode: 'Markdown', disable_web_page_preview: true, reply_markup: Markup.inlineKeyboard([
            Markup.urlButton('🔥КУПИТЬ🔥', url),
          ]),
        }).then(() => {
          conn.close()
        })
      });
    });
  });

