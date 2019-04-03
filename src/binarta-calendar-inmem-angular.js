(function () {
    var gateways = new BinartaInMemoryGatewaysjs();

    angular.module('binarta-calendarjs-inmem-angular1', [])
        .provider('inmemBinartaCalendarGateway', proxy(gateways.calendar));

    function proxy(gateway) {
        return function() {
            this.gateway = gateway;
            this.$get = function() {
                return gateway;
            }
        }
    }
})();