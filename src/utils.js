const _ = require('lodash');

const utils = {

    calculatePercentage: (initialAmt, difference) => {
        return ((difference / initialAmt) * 100).toFixed(1);
    },

    formatPrice: (price) => {
        return _.parseInt(price).toFixed(2);
    },

    getRandom: (arr) => {
        return arr[_.random(arr.length - 1)];
    }
};

module.exports = utils;
