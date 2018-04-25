(function () {
    var gateways = new BinartaInMemoryGatewaysjs();

    angular.module('binarta-humanresourcesjs-inmem-angular1', [])
        .provider('inmemBinartaHumanResourcesGateway', proxy(gateways.hr));

    function proxy(gateway) {
        return function() {
            this.gateway = gateway;
            this.$get = function() {
                return gateway;
            }
        }
    }
})();