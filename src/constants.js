const _ = require('lodash');

module.exports = {
    GDAX_ETH_ENDPOINT: 'https://api.gdax.com/products/ETH-USD/stats',
    GDAX_BTC_ENDPOINT: 'https://api.gdax.com/products/BTC-USD/stats',
    COINS: _.orderBy([
        'ripple',
        'litecoin',
        'monero',
        'augur',
        'golem',
        'zcash',
        'iconomi',
        'melon',
        'edgeless',
        'blackcoin',
        '0x',
        'district0x',
        'status',
        'bitcoin-cash',
        'basic-attention-token',
        'iota',
        'neo',
        'monero',
        'omisego',
        'civic',
        'digibyte',
        'storj'], ['length'], ['desc'])
};
