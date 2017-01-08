const SlackBot = require('slackbots');
const _ = require('lodash');

// create a bot
const bot = new SlackBot({
    token: process.env.SLACKBOT_TOKEN,
    name: process.env.SLACKBOT_NAME
});

bot.on('start', () => {
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
    // bot.user = _.filter(bot.users, (_user) => {
    //   return _user.name === bot.name;
    // })[0];
});

bot.on('message', (message) => {


    if (message.type !== 'message' || !message.text || !_botCalled(message.text)) {
      console.log('no params met');
      return;
    }
    const channel = _getChannelName(message.channel);

    bot.postMessageToGroup('testing', `your\'re in ${channel}` , {as_user: true});

})

function _isValidMessage(message) {
  return message.type === 'message' && !!message.text
}

function _botCalled(text) {
  return _.lowerCase(text).indexOf('coingod') > -1;
}

function _getChannelName(id) {

  const channel = _.find(bot._channels, (channel) => {
    return channel.id === id;
  });

  if (channel){
    return channel.name;
  }

  const group = _.find(bot._groups, (group) => {
    return group.id === id;
  });

  if (group) {
    return group.name;
  }
}
