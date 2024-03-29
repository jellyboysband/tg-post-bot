const qs = require('querystring');

let wretch = require('wretch');
wretch().polyfills({
  fetch: require('node-fetch'),
  URLSearchParams: require('url').URLSearchParams,
});
wretch().defaults({ headers: { Accept: 'application/json' } });
const product2markdown = async product => {
  product.url = product.url.replace('aliexpress.ru', 'aliexpress.com');
  let result = '';
  result += `${product.title}\n`;
  result += '';
  result += `\n*Цена ${
    (product.min.cost || product.max.cost) !== product.max.cost ? 'от ' : ''
  }${~~(product.min.cost || product.max.cost)}₽*\n`;
  const longUrl = `${process.env.DEEP_LINK}${qs.stringify({
    sub: process.env.APP_ID,
    to: product.url,
  })}`;
  let shortUrl;
  let hash;
  try {
    const short = await wretch(process.env.SHORTER || 'http://localhost:3001/api/v1/shorten')
      .post({ long_url: longUrl, c_new: true })
      .json();
    shortUrl = short.short_url;
    hash = short.hash;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error(err);
  }

  console.log('TCL: shortUrl', shortUrl);
  return {
    message: result,
    url: shortUrl || longUrl,
    photo: product.images[0],
    hash: hash || false,
  };
};
module.exports = product2markdown;
