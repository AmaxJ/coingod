const BitcoinBot = require('./BitcoinBot.js');

const coing = new BitcoinBot({
  token: process.env.SLACKBOT_TOKEN,
  name: process.env.SLACKBOT_NAME
});
