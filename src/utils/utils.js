const _ = require('lodash');
const axios = require('axios');
const Entities = require('html-entities').AllHtmlEntities;
const constants = require('../constants.js');


const utils = {

    calculatePercentage: (initialAmt, difference) => {
        return ((difference / initialAmt) * 100).toFixed(1);
    },

    formatPrice: (price) => {
        return parseFloat(price).toFixed(2);
    },

    getRandom: (arr) => {
        return arr[_.random(arr.length - 1)];
    },

    parseMessageForTemplate(message) {
        const pattern = /<tmp>(.*?)<\/tmp>/;
        return returnMatchOrNull(pattern, message);
    },

    parseMessageForLabel(message) {
        const pattern = /<lbl>(.*?)<\/lbl>/;
        return returnMatchOrNull(pattern, message);
    },

    getTemplatesAtPath(templateObj, path) {
        const templates = _.get(templateObj, path, false);
        if (!templates || !_.isArray(templates)) {
            return false;
        }
        return templates;
    },

    getEtherPriceData() {
        return axios.get(constants.GDAX_ETH_ENDPOINT);
    },

    getBitcoinPriceData() {
        return axios.get(constants.GDAX_BTC_ENDPOINT);
    },

    package24HrData(priceData) {
        const openPrice = this.formatPrice(priceData.open);
        const currentPrice = this.formatPrice(priceData.last);
        const difference = Math.abs(openPrice - currentPrice);
        const percentChange = this.calculatePercentage(openPrice, difference);
        return { openPrice, currentPrice, difference, percentChange };
    },

    namesValidCoin(message) {
        return _.find(constants.COINS, (coin) => {
            const pattern = new RegExp(coin, 'i');
            return message.match(pattern);
        });
    },

    fetchFromCoinMarketCap(coin) {
        return axios.get(`https://api.coinmarketcap.com/v1/ticker/${coin}`);
    }

};


const entities = new Entities();

/**
 * returnMatchOrNull
 * @param  {regex} pattern
 * @param  {string} message
 * @return {string}
 */
function returnMatchOrNull(pattern, message) {
    const decodedMessage = entities.decode(message);
    const match = decodedMessage.match(pattern);
    return match ? match[1] : null;
}


module.exports = utils;
