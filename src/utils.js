const _ = require('lodash');

const utils = {

    calculatePercentage: (initialAmt, difference) => {
        return ((difference / initialAmt) * 100).toFixed(0);
    },

    formatPrice: (price) => {
        return _.parseInt(price).toFixed(2);
    }
};

module.exports = utils;
