const SlackBot = require('slackbots');
const _ = require('lodash');
const axios = require('axios');

// create a bot
const bot = new SlackBot({
    token: process.env.SLACKBOT_TOKEN,
    name: process.env.SLACKBOT_NAME
});

const config = {
  as_user: true
}

bot.on('start', _bootstrap);

bot.on('message', (message) => {
    if (message.type !== 'message' || !message.text || !_botCalled(message.text)) {
      return;
    }
    const channel = _getChannel(message.channel);

    _getBitcoinPrice()
      .then((bitcoinData) => {
        _postMessage(bitcoinData, channel);
      })
      .catch(console.err);
})

function _bootstrap() {
  bot.getChannels()
    .then((response) => {
      bot._channels = response.channels;
    })
    .catch(console.err);

  bot._groups = bot.getGroups()
    .then((response) => {
      bot._groups = response.groups;
    })
    .catch(console.err);
}

function _postMessage(bitcoinData, channelData) {
  const { price, market } = bitcoinData;
  const formattedPrice = _.parseInt(price).toFixed(2);
  const { channel_type, channel } = channelData;
  const message = `The bitcoin price is currently $${formattedPrice} on ${market}`;

  if (channel_type === 'public') {
    bot.postMessageToChannel(channel, message, config);
  } else {
    bot.postMessageToGroup(channel, message, config);
  }
}

function _getBitcoinPrice(exchange='bitstamp') {
  return axios.get('https://api.cryptonator.com/api/full/btc-usd')
    .then((response) => {
      const formattedExchange = exchange.toLowerCase();
      const _exchange = _.find(response.data.ticker.markets, (marketData) => {
        return marketData.market.toLowerCase() === formattedExchange;
      });
      if (_exchange) {
        return _exchange;
      }
      return {
        market: 'average',
        price: response.data.ticker.price
      }
    });
}


function _isValidMessage(message) {
  return message.type === 'message' && !!message.text
}

function _botCalled(text) {
  return _.lowerCase(text).indexOf('coingod') > -1;
}

function _getChannel(id) {
  const channel = _.find(bot._channels, (channel) => {
    return channel.id === id;
  });

  if (channel){
    return {
      channel_type: 'public',
      channel: channel.name
    }
  }

  const group = _.find(bot._groups, (group) => {
    return group.id === id;
  });

  if (group) {
    return {
      channel_type: 'private',
      channel: group.name
    }
  }

}
