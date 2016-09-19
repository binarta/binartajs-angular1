(function () {
    angular.module('binartajs-angular1', [])
        .provider('binarta', [BinartaProvider])
        .factory('binartaGatewaysAreInitialised', ['$q', GatewaysAreInitialisedFactory])
        .factory('binartaConfigIsInitialised', ['$q', 'binartaGatewaysAreInitialised', ConfigIsInitialisedFactory])
        .factory('binartaCachesAreInitialised', ['$q', 'binartaConfigIsInitialised', CachesAreInitialisedFactory])
        .factory('binartaIsInitialised', ['$q', 'binarta', 'binartaGatewaysAreInitialised', 'binartaConfigIsInitialised', IsInitialisedFactory])
        .component('binContentHeader', new ContentHeaderComponent())
        .controller('ContentHeaderController', ['binarta', ContentHeaderController]);

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

    function ConfigIsInitialisedFactory($q, gatewaysAreInitialised) {
        var d = $q.defer();
        return {resolve:d.resolve, promise:$q.all([gatewaysAreInitialised.promise, d.promise])};
    }

    function CachesAreInitialisedFactory($q, configIsInitialised) {
        var d = $q.defer();
        return {resolve:d.resolve, promise:$q.all([configIsInitialised.promise, d.promise])};
    }

    function IsInitialisedFactory($q, binarta, gatewaysAreInitialised, configIsInitialised) {
        var d = $q.defer();
        $q.all([gatewaysAreInitialised.promise]).then(function () {
            d.resolve(binarta);
        });
        return d.promise;
    }

    function UI() {

    }

    function ContentHeaderComponent() {
        this.bindings = {
            titleKey: '@',
            subTitleKey: '@'
        };
        this.controller = 'ContentHeaderController';
        this.templateUrl = 'bin-all-content-header.html'
    }

    function ContentHeaderController(binarta) {
        this.$onInit = function () {
            this.inverted = binarta.invertedHeaderTitles;
        }
    }
})();
