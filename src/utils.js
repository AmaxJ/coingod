const _ = require('lodash');
const Entities = require('html-entities').AllHtmlEntities;

const utils = {

    calculatePercentage: (initialAmt, difference) => {
        return ((difference / initialAmt) * 100).toFixed(1);
    },

    formatPrice: (price) => {
        return _.parseInt(price).toFixed(2);
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
