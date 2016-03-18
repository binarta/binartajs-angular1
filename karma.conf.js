module.exports = function(config) {
    config.set({
        basePath:'.',
        frameworks:['jasmine'],
        files:[
            {pattern:'bower_components/angular/angular.js'},
            {pattern:'bower_components/angular-route/angular-route.js'},
            {pattern:'bower_components/angular-mocks/angular-mocks.js'},
            {pattern:'bower_components/binartajs/src/binarta.js'},
            {pattern:'bower_components/binartajs/src/checkpoint.js'},
            {pattern:'bower_components/binartajs/src/gateways.inmem.js'},
            {pattern:'src/**/*.js'},
            {pattern:'test/**/binarta-angular.spec.js'}
        ],
        browsers:['PhantomJS'],
        reporters: ['dots', 'junit'],
        junitReporter: {
            outputFile: 'test-results.xml',
            useBrowserName: false
        }
    });
};