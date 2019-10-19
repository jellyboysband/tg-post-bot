const qs = require('querystring')

const product2markdown = (product) => {
    let result = ''
    result += `${product.title}\n`
    result += ''
    result += `\n*Цена ${((product.min.cost || product.max.cost)) !== product.max.cost ? 'от ' : ''}${~~(product.min.cost || product.max.cost)}₽*\n`
    return {
        message: result,
        url: `${process.env.DEEP_LINK}${qs.stringify({ sub: process.env.APP_ID, to: product.url })}`,
        photo: product.images[0],
    }
}
module.exports = product2markdown;