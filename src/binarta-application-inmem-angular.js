(function () {
    var gateways = new BinartaInMemoryGatewaysjs();

    angular.module('binarta-applicationjs-inmem-angular1', [])
        .provider('inmemBinartaApplicationGateway', proxy(gateways.application));

    function proxy(gateway) {
        return function() {
            this.gateway = gateway;
            this.$get = function() {
                return gateway;
            }
        }
    }
})();