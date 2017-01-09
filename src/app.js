const SlackBot = require('slackbots');
const _ = require('lodash');
const axios = require('axios');
const Gdax = require('gdax');

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

    if (message.text.indexOf("today") > -1) {
      return _package24HrData()
        .then((message) => {
          return _postMessage(message, channel);
        });
    }

    _getBitcoinPrice()
      .then((priceData) => {
        const price = _formatPrice(priceData.price);
        const message = `Blessings child. The price of bitcoin is currently $${price}.`
        return _postMessage(message, channel);
      })
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

  bot.gdaxClient = new Gdax.PublicClient();
  console.log('initialized..')
}

function _postMessage(message, channelData) {
  const { channel_type, channel } = channelData;
  if (channel_type === 'public') {
    bot.postMessageToChannel(channel, message, config);
  } else {
    bot.postMessageToGroup(channel, message, config);
  }
}

function _package24HrData() {
  return Promise.all([_get24HrData(),_getBitcoinPrice()])
    .then((priceData) => {
      const openPrice = _formatPrice(priceData[0].open);
      const currentPrice = _formatPrice(priceData[1].price);
      const difference = Math.abs(openPrice - currentPrice);
      const percentChange = calculatePercentage(openPrice, difference);

      if (openPrice < currentPrice) {
        return `The devout shall inherit the moon. Bitcoin has risen ${percentChange} percent from $${openPrice} to $${currentPrice} in the last 24 hours. Blessings be upon you, my child.`;
      }
      return `Feel the deep thrust of my wrath into your loins, prole! Bitcoin has fallen ${percentChange} percent from $${openPrice} to $${currentPrice} in the last 24 hours.`;
    })
}

function calculatePercentage(initialAmt, difference) {
  return (difference / initialAmt * 100).toFixed(0);
}

function _get24HrData(exchange) {
  return new Promise((resolve, reject) => {
    bot.gdaxClient.getProduct24HrStats((err, response, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

function _getBitcoinPrice(exchange='bitstamp') {
  return new Promise((resolve, reject) => {
    bot.gdaxClient.getProductTicker((err, response, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    })
  });
}

function _formatPrice(price) {
    return _.parseInt(price).toFixed(2);
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
