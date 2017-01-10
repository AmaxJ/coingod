'use strict';

const SlackBot = require('slackbots');
const _ = require('lodash');
const Gdax = require('gdax');

//when creating attributes or methods for this
// class be careful to avoid collisions with methods defined
// on the slackbots class. Check the source if something isn't
// working!
class BitcoinBot extends SlackBot {

    constructor(config) {
        super(config);

        this.config = { as_user: true }

        this.gdaxClient = new Gdax.PublicClient();

        this.on('message', this.handleMessage);
        console.log('initialized...');
    }

    handleMessage(message) {
        if (message.type !== 'message' || !message.text || !this.botCalled(message.text)) {
          return;
        }
        const channel = this._getChannel(message.channel);
        //If 'today' and 'coingod' are mentioned in the same comment, post BTC's 24 hr performance
        if (message.text.indexOf("today") > -1) {
          return this.package24HrData()
            .then((message) => {
              return this._postMessage(message, channel);
            })
            .catch(console.error);
        }

        this.getBitcoinPrice(channel)
          .then((priceData) => {
            const price = this.formatPrice(priceData.price);
            const message = `Blessings child. The price of bitcoin is currently $${price}.`
            return this._postMessage(message, channel);
          })
          .catch(console.error)
      }

    _postMessage(message, channelData) {
        const { channel_type, channel } = channelData;
        if (!channel_type || !channel) {
            return;
        }
        if (channel_type === 'public') {
            return this.postMessageToChannel(channel, message, this.config)
                .fail(console.err);
        } else {
            return this.postMessageToGroup(channel, message, this.config)
                .fail(console.err);
        }
    }

    package24HrData() {
        return Promise.all([this.get24HrData(), this.getBitcoinPrice()])
            .then((priceData) => {
                const openPrice = this.formatPrice(priceData[0].open);
                const currentPrice = this.formatPrice(priceData[1].price);
                const difference = Math.abs(openPrice - currentPrice);
                const percentChange = this.calculatePercentage(openPrice, difference);

                if (openPrice < currentPrice) {
                    return `The devout shall inherit the moon. Bitcoin has risen ${percentChange} percent from $${openPrice} to $${currentPrice} in the last 24 hours. Blessings be upon you, my child.`;
                }
                return `Feel the deep thrust of my wrath into your loins, prole! Bitcoin has fallen ${percentChange} percent from $${openPrice} to $${currentPrice} in the last 24 hours.`;
            });
    }

    calculatePercentage(initialAmt, difference) {
        return (difference / initialAmt * 100).toFixed(0);
    }

    get24HrData() {
        return new Promise((resolve, reject) => {
            this.gdaxClient.getProduct24HrStats((err, response, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    getBitcoinPrice() {
        return new Promise((resolve, reject) => {
            this.gdaxClient.getProductTicker((err, response, data) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(data);
                }
            });
        });
    }

    formatPrice(price) {
        return _.parseInt(price).toFixed(2);
    }

    isValidMessage(message) {
        return message.type === 'message' && !!message.text;
    }

    botCalled(text) {
        return _.lowerCase(text).indexOf('coingod') > -1;
    }

    _getChannel(id) {
        const channel = _.find(this.channels, (channel) => {
            return channel.id === id;
        });

        if (channel){
            return {
                channel_type: 'public',
                channel: channel.name
            }
        }

        const group = _.find(this.groups, (group) => {
            return group.id === id;
        });

        if (group) {
            return {
                channel_type: 'private',
                channel: group.name
            }
        }
    }
}

module.exports = BitcoinBot;
