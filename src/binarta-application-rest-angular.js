(function () {
    angular.module('binarta-applicationjs-rest-angular1', ['config', 'binartajs-angular1'])
        .provider('restBinartaApplicationGateway', proxy(new ApplicationGateway()))
        .factory('binartaApplicationGatewayIsInitialised', ['$q', GatewayIsInitialisedFactory])
        .run(['restBinartaApplicationGateway', 'binartaApplicationGatewayIsInitialised', WireAngularDependencies]);

    function proxy(gateway) {
        return function () {
            this.gateway = gateway;
            this.$get = ['binarta', 'config', '$http', function (binarta, config, $http) {
                this.gateway.binarta = binarta;
                this.gateway.config = config;
                this.gateway.$http = $http;
                return gateway;
            }]
        }
    }

    function ApplicationGateway() {
        var gateway = this;

        this.fetchApplicationProfile = function (request, response) {
            gateway.$http({
                method: 'GET',
                url: gateway.config.baseUri + 'api/application/' + gateway.config.namespace + '/data/common',
                headers: {'Accept-Language': gateway.binarta.application.locale()}
            }).then(function(it) {
                response.success(it.data);
            });
        };

        this.fetchSectionData = function(request, response) {
            gateway.$http({
                method: 'GET',
                url: gateway.config.baseUri + 'api/usecase?h.usecase=adhesive.stream&h.locale=' + gateway.binarta.application.locale() + '&p.namespace=' + gateway.config.namespace + '&p.section=' + request.id
            }).then(function(it) {
                response.success(it.data);
            });
        }
    }

    function GatewayIsInitialisedFactory($q) {
        return $q.defer();
    }

    function WireAngularDependencies(gateway, isInitialised) {
        isInitialised.resolve();
    }
})();