var Path = require('path');

module.exports = function(config) {
    config.set({
        port: 9876,
        colors: true,
        logLevel: config.LOG_WARNING,
        autoWatch: true,
        singleRun: false,
        browsers: [ 'Chrome' ],
        frameworks: [ 'chai', 'mocha', 'server-side' ],
        files: [
            'tests.bundle.js',
        ],
        concurrency: 1,

        preprocessors: {
            'tests.bundle.js': [ 'webpack', 'sourcemap' ]
        },

        plugins: [
            'karma-chai',
            'karma-chrome-launcher',
            'karma-mocha',
            'karma-sourcemap-loader',
            'karma-webpack',
            'karma-server-side',
        ],

        reporters: [ 'progress' ],

        webpack: {
            mode: 'development',
            module: {
                rules: [
                    {
                        test: /\.jsx?$/,
                        loader: 'babel-loader',
                        exclude: Path.resolve('./node_modules'),
                        query: {
                            presets: [ 'env' ]
                        }
                    }
                ]
            },
            externals: {}
        },

        webpackMiddleware: {
            noInfo: true,
        },
    })
};
