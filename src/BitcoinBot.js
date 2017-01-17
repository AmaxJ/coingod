const _ = require('lodash');
const SlackBot = require('slackbots');
const Gdax = require('gdax');
const utils = require('./utils');
const templates = require('./templates/templates.json');


class BitcoinBot extends SlackBot {
    /**
     * config.name determines which template file is loaded.
     * @param {object} config - name, token
     * @constructor
     */
    constructor(config) {
        super(config);
        this.config = { as_user: true };
        this.gdaxClient = new Gdax.PublicClient();
        this.template = templates[this.name] ? templates[this.name] : templates.default;
        this.on('message', this.handleMessage);
        console.log(this.name, 'initialized...');
    }

    /**
     * Listener for slack events.
     * @param {object} slackEvent
     */
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
              const price = {
                  price: utils.formatPrice(priceData.price)
              };
              const template = utils.getRandom(this.template.bitcoin.current_price);
              const compileMessage = _.template(template);
              const message = compileMessage(price);
              return this._postMessage(message, channel);
          })
          .catch(console.error);
    }

    /**
     * Posts message to appropriate slack channel.
     * @param {string} message
     * @param {object} channelData
     * @returns {Promise}
     */
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

    /**
     * Packages bitcoin 24hr price movement into a message.
     * @returns {string}
     */
    package24HrData() {
        return Promise.all([this.get24HrData(), this.getBitcoinPrice()])
            .then((priceData) => {
                const openPrice = utils.formatPrice(priceData[0].open);
                const currentPrice = utils.formatPrice(priceData[1].price);
                const difference = Math.abs(openPrice - currentPrice);
                const percentChange = utils.calculatePercentage(openPrice, difference);

                let template;

                if (openPrice < currentPrice) {
                    template = utils.getRandom(this.template.bitcoin.price_change.increase);
                } else {
                    template = utils.getRandom(this.template.bitcoin.price_change.decrease);
                }
                const compileMessage = _.template(template);
                return compileMessage({ percentChange, openPrice, currentPrice });
            });
    }

    /**
     * Returns promise for bitcoin market price data from 24 hours ago.
     * @returns {Promise}
     */
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

    /**
     * Returns promise for current bitcoin market price data.
     * @returns {Promise}
     */
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


    /**
     * returns a boolean for whether the text contains the name of the bot.
     * @param  {string} text
     * @return {boolean}
     */
    botCalled(text) {
        const formattedName = this.name.toLowerCase();
        return text.toLowerCase().indexOf(formattedName) > -1;
    }


    /**
     * returns an object with the channel name and type
     * @param  {string} id
     * @return {object}
     */
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
