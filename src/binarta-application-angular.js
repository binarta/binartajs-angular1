(function () {
    angular.module('binarta-applicationjs-angular1', [
        'ngRoute',
        'binartajs-angular1',
        'binarta-applicationjs-gateways-angular1'
    ])
        .provider('application', ['binartaApplicationGatewayProvider', ApplicationProvider])
        .config(['binartaProvider', 'applicationProvider', ExtendBinarta])
        .factory('binartaApplicationConfigIsInitialised.deferred', ['$q', IsInitialisedDeferredFactory])
        .factory('binartaApplicationCachesAreInitialised.deferred', ['$q', IsInitialisedDeferredFactory])
        .factory('binartaApplicationConfigIsInitialised', ['binartaApplicationConfigIsInitialised.deferred', IsConfigInitialisedFactory])
        .factory('binartaApplicationCachesAreInitialised', ['binartaApplicationCachesAreInitialised.deferred', AreCachesInitialisedFactory])
        .run(['application', WireAngularDependencies])
        .run([
            'binartaGatewaysAreInitialised',
            'binartaConfigIsInitialised',
            'binartaApplicationConfigIsInitialised.deferred',
            'binartaApplicationCachesAreInitialised.deferred',
            'application',
            InitCaches
        ]);

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

    function InitCaches(gatewaysAreInitialised, configIsInitialised, configD, cachesD, application) {
        gatewaysAreInitialised.promise.then(function() {
            application.refresh(configD.resolve);
        });

        configIsInitialised.promise.then(cachesD.resolve);
    }

    function IsInitialisedDeferredFactory($q) {
        return $q.defer();
    }

    function IsConfigInitialisedFactory(d) {
        // $q.all([gatewaysAreInitialised.promise]).then(function() {
        //     d.resolve(binarta);
        // });
        return d.promise;
    }

    function AreCachesInitialisedFactory(d) {
        return d.promise;
    }
})();