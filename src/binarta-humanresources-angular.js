(function () {
    angular.module('binarta-humanresourcesjs-angular1', ['binarta-applicationjs-angular1', 'binarta-humanresourcesjs-gateways-angular1'])
        .provider('binartaHumanResources', ['binartaHumanResourcesGatewayProvider', 'applicationProvider', HRProvider])
        .factory('extendBinartaHumanResourcesFactory', ['binarta', ExtendBinartaHRFactory])
        .config(['binartaProvider', 'binartaHumanResourcesProvider', ExtendBinarta])
        .run(['binartaHumanResources', Init]);

    function HRProvider(gatewayProvider, applicationProvider) {
        this.hr = new BinartaHumanResourcesjs({
            applicationjs: applicationProvider.application
        });
        this.hr.db = gatewayProvider.gateway;
        this.ui = new UI();
        this.$get = ['$window', '$location', 'extendBinartaHumanResourcesFactory', function ($window, $location, extend) {
            this.ui.window = $window;
            this.ui.location = $location;
            extend(this.hr);
            return this.hr;
        }]
    }

    function ExtendBinartaHRFactory(binarta) {
        return function (hr) {
        }
    }

    function UI() {
        var self = this;
    }

    function ExtendBinarta(binarta, provider) {
        binarta.addSubSystems({humanresources: provider.hr});
    }

    function Init(media) {
    }
})();