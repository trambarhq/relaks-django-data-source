if (process.env.NODE_ENV !== 'production') {
    module.exports = require('./class')(require('react'), require('prop-types'));
} else {
    module.exports = require('./class')(require('react'));
}
