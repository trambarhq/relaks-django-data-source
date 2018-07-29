if (process.env.NODE_ENV !== 'production') {
    module.exports = require('./class')(require('preact'), require('prop-types'));
} else {
    module.exports = require('./class')(require('preact'));
}
