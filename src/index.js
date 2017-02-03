const BitcoinBot = require('./bot/Bot.js');
/* eslint-disable no-unused-vars */
const coing = new BitcoinBot({
    token: process.env.SLACKBOT_TOKEN,
    name: process.env.SLACKBOT_NAME
});
