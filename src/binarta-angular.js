(function () {
    angular.module('binartajs-angular1', [])
        .provider('binarta', BinartaProvider)
        .factory('binartaGatewaysAreInitialised', ['$q', GatewaysAreInitialisedFactory])
        .factory('binartaIsInitialised', ['$q', 'binarta', 'binartaGatewaysAreInitialised', IsInitialisedFactory]);

    function BinartaProvider() {
        this.ui = new UI();

        var factory = new BinartajsFactory();
        factory.addUI(this.ui);
        this.addSubSystems = factory.addSubSystems;

        this.$get = function () {
            return factory.create();
        }
    }

    function GatewaysAreInitialisedFactory($q) {
        return $q.defer();
    }

    function IsInitialisedFactory($q, binarta, gatewaysAreInitialised) {
        var d = $q.defer();
        $q.all([gatewaysAreInitialised.promise]).then(function() {
            d.resolve(binarta);
        });
        return d.promise;
    }

    function UI() {

    }
})();
