module.exports = function(config) {
    config.set({
        basePath:'.',
        frameworks:['jasmine'],
        files:[
            {pattern:'bower_components/moment/moment.js'},
            {pattern:'bower_components/angular/angular.js'},
            {pattern:'bower_components/angular-route/angular-route.js'},
            {pattern:'bower_components/angular-mocks/angular-mocks.js'},
            {pattern:'bower_components/binartajs/src/binarta.js'},
            {pattern:'bower_components/binartajs/src/application.js'},
            {pattern:'bower_components/binartajs/src/checkpoint.js'},
            {pattern:'bower_components/binartajs/src/media.js'},
            {pattern:'bower_components/binartajs/src/shop.js'},
            {pattern:'bower_components/binartajs/src/humanresources.js'},
            {pattern:'bower_components/binartajs/src/gateways.inmem.js'},
            {pattern:'bower_components/binarta.web.storage/src/web.storage.js'},
            {pattern:'bower_components/binarta.web.storage.angular/src/web.storage.js'},
            {pattern:'bower_components/thk-config-mock/src/config.mock.js'},
            {pattern:'src/**/*.js'},
            {pattern:'test/**/binarta-angular.spec.js'},
            {pattern:'test/recaptcha.mock.js'}
        ],
        browsers:['Chrome'],
        reporters: ['dots', 'junit'],
        junitReporter: {
            outputFile: 'test-results.xml',
            useBrowserName: false
        }
    });
};