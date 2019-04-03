(function () {
    angular.module('binarta-publisherjs-inmem-angular1', [])
        .provider('inmemBinartaPublisherGateway', proxy({}));

    function proxy(gateway) {
        return function() {
            this.gateway = gateway;
            this.$get = function() {
                return gateway;
            }
        }
    }
})();