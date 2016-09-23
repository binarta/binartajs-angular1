(function () {
    angular.module('binartajs-angular1', ['web.storage'])
        .provider('binarta', [BinartaProvider])
        .factory('binartaGatewaysAreInitialised', ['$q', GatewaysAreInitialisedFactory])
        .factory('binartaConfigIsInitialised', ['$q', 'binartaGatewaysAreInitialised', ConfigIsInitialisedFactory])
        .factory('binartaCachesAreInitialised', ['$q', 'binartaConfigIsInitialised', CachesAreInitialisedFactory])
        .factory('binartaIsInitialised', ['$q', 'binarta', 'binartaGatewaysAreInitialised', 'binartaConfigIsInitialised', 'binartaCachesAreInitialised', IsInitialisedFactory])
        .component('binContentHeader', new ContentHeaderComponent())
        .controller('ContentHeaderController', ['binarta', ContentHeaderController]);

    function BinartaProvider() {
        this.ui = new UI();

        var factory = new BinartajsFactory();
        factory.addUI(this.ui);
        this.addSubSystems = factory.addSubSystems;

        this.$get = ['localStorage', 'sessionStorage', function (localStorage, sessionStorage) {
            var binartajs = factory.create();
            binartajs.localStorage = localStorage;
            binartajs.sessionStorage = sessionStorage;
            return binartajs;
        }]
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

    function IsInitialisedFactory($q, binarta, gatewaysAreInitialised, configIsInitialised, cachesAreInitialised) {
        var d = $q.defer();
        $q.all([gatewaysAreInitialised.promise, configIsInitialised.promise, cachesAreInitialised.promise]).then(function () {
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
