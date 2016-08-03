(function () {
    angular.module('binarta-applicationjs-angular1', [
        'ngRoute',
        'binartajs-angular1',
        'binarta-applicationjs-gateways-angular1'
    ])
        .provider('application', ['binartaApplicationGatewayProvider', ApplicationProvider])
        .config(['binartaProvider', 'applicationProvider', ExtendBinarta])
        .factory('binartaApplicationIsInitialised.deferred', ['$q', IsInitialisedDeferredFactory])
        .factory('binartaApplicationIsInitialised', ['binartaApplicationIsInitialised.deferred', IsInitialisedFactory])
        .run(['application', WireAngularDependencies])
        .run(['binartaIsInitialised', 'binartaApplicationIsInitialised.deferred', 'application', InitCaches]);

    function ApplicationProvider(provider) {
        this.application = new BinartaApplicationjs();
        this.application.gateway = provider.gateway;
        this.ui = new UI();
        this.$get = ['$window', '$location', function ($window, $location) {
            this.ui.window = $window;
            this.ui.location = $location;
            return this.application;
        }]
    }

    function UI() {
        var self = this;
    }

    function ExtendBinarta(binarta, applicationProvider) {
        binarta.addSubSystems({application: applicationProvider.application});
    }

    function WireAngularDependencies() {
    }

    function InitCaches(binartaIsInitialised, d, application) {
        binartaIsInitialised.then(function() {
            application.refresh(d.resolve);
        });
    }

    function IsInitialisedDeferredFactory($q) {
        return $q.defer();
    }

    function IsInitialisedFactory(d) {
        // $q.all([gatewaysAreInitialised.promise]).then(function() {
        //     d.resolve(binarta);
        // });
        return d.promise;
    }
})();