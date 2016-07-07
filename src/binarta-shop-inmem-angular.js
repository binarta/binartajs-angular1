(function () {
    var gateways = new BinartaInMemoryGatewaysjs();

    angular.module('binarta-shopjs-inmem-angular1', [])
        .provider('inmemBinartaShopGateway', proxy(gateways.shop));

    function proxy(gateway) {
        return function() {
            this.gateway = gateway;
            this.$get = function() {
                return gateway;
            }
        }
    }
})();