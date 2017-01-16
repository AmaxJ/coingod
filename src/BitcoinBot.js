const _ = require('lodash');
const SlackBot = require('slackbots');
const Gdax = require('gdax');
const utils = require('./utils');

// when creating attributes or methods for this
// class be careful to avoid collisions with methods defined
// on the slackbots class. Check the source if something isn't
// working!
class BitcoinBot extends SlackBot {

    constructor(config) {
        super(config);

        this.config = { as_user: true };

        this.gdaxClient = new Gdax.PublicClient();

        this.on('message', this.handleMessage);
        console.log('initialized...');
    }

    handleMessage(slackEvent) {
        if (slackEvent.type !== 'message' || !slackEvent.text || !this.botCalled(slackEvent.text)) {
            return;
        }
        const channel = this._getChannel(slackEvent.channel);
        // If 'today' and 'coingod' are mentioned in the same comment, post BTC's 24 hr performance
        if (slackEvent.text.indexOf('today') > -1) {
            return this.package24HrData()
                .then(message => this._postMessage(message, channel))
                .catch(console.error);
        }

        this.getBitcoinPrice(channel)
          .then((priceData) => {
              const price = utils.formatPrice(priceData.price);
              const message = `Blessings child. The price of bitcoin is currently $${price}.`;
              return this._postMessage(message, channel);
          })
          .catch(console.error);
    }

    _postMessage(message, channelData) {
        const { channelType, channel } = channelData;
        if (!channelType || !channel) {
            return;
        }
        if (channelType === 'public') {
            return this.postMessageToChannel(channel, message, this.config)
                .fail(console.error);
        }
        return this.postMessageToGroup(channel, message, this.config)
            .fail(console.error);
    }

    package24HrData() {
        return Promise.all([this.get24HrData(), this.getBitcoinPrice()])
            .then((priceData) => {
                const openPrice = utils.formatPrice(priceData[0].open);
                const currentPrice = utils.formatPrice(priceData[1].price);
                const difference = Math.abs(openPrice - currentPrice);
                const percentChange = utils.calculatePercentage(openPrice, difference);

                if (openPrice < currentPrice) {
                    return `The devout shall inherit the moon. Bitcoin has risen ${percentChange} percent from $${openPrice} to $${currentPrice} in the last 24 hours.`;
                }
                return `Feel the deep thrust of my wrath into your loins, prole! Bitcoin has fallen ${percentChange} percent from $${openPrice} to $${currentPrice} in the last 24 hours.`;
            });
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

    botCalled(text) {
        return _.lowerCase(text).indexOf(this.name) > -1;
    }

    _getChannel(id) {
        const channel = _.find(this.channels, (slackChannel) => {
            return slackChannel.id === id;
        });

        if (channel) {
            return {
                channelType: 'public',
                channel: channel.name
            };
        }

        const group = _.find(this.groups, (slackGroup) => {
            return slackGroup.id === id;
        });

        if (group) {
            return {
                channelType: 'private',
                channel: group.name
            };
        }
    }
}

module.exports = BitcoinBot;
