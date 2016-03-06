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
            {pattern:'src/**/*.js'},
            {pattern:'test/**/*.js'}
        ],
        browsers:['PhantomJS']
    });
};