(function () {
    angular.module('binarta-humanresourcesjs-rest-angular1', ['config', 'rest.client', 'binartajs-angular1'])
        .provider('restBinartaHumanResourcesGateway', proxy(new HRDB()))
        .factory('binartaHumanResourcesGatewayIsInitialised', ['$q', GatewayIsInitialisedFactory])
        .run(['restBinartaHumanResourcesGateway', 'binartaHumanResourcesGatewayIsInitialised', WireAngularDependencies]);

    function proxy(gateway) {
        return function () {
            this.gateway = gateway;
            this.$get = ['binarta', 'config', 'restServiceHandler', '$http', function (binarta, config, rest, $http) {
                this.gateway.binarta = binarta;
                this.gateway.config = config;
                this.gateway.rest = rest;
                this.gateway.$http = $http;
                return gateway;
            }]
        }
    }

    function toErrorResponse(response) {
        return function (request) {
            response.rejected(request.data);
        };
    }

    function HRDB() {
        var self = this;

        this.search = function (request, response) {
            self.$http({
                method: 'GET',
                url: self.config.baseUri + 'api/vacancies/' + this.config.namespace + '/' + request.locale
            }).then(function (it) {
                response.success(it.data);
            }, toErrorResponse(response));
        };

        this.get = function (request, response) {
            self.$http({
                method: 'GET',
                url: self.config.baseUri + 'api/vacancies/' + this.config.namespace + '/' + request.id + '/' + request.locale
            }).then(function (it) {
                response.success(it.data);
            }, toErrorResponse(response));
        }
    }

    function GatewayIsInitialisedFactory($q) {
        return $q.defer();
    }

    function WireAngularDependencies(gateway, isInitialised) {
        isInitialised.resolve();
    }
})();