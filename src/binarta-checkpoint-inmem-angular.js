(function () {
    var gateways = new BinartaInMemoryGatewaysjs();

    angular.module('binarta-checkpointjs-inmem-angular1', [])
        .provider('inmemBinartaCheckpointGateway', proxy(gateways.checkpoint));

    function proxy(gateway) {
        return function() {
            this.gateway = gateway;
            this.$get = function() {
                return gateway;
            }
        }
    }
})();