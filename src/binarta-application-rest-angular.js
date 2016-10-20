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

    function toErrorResponse(response) {
        return function (request) {
            if (request.status == 404)
                response.notFound();
        };
    }

    function ApplicationGateway() {
        var gateway = this;

        this.fetchApplicationProfile = function (request, response) {
            gateway.$http({
                method: 'GET',
                url: gateway.config.baseUri + 'api/application/' + gateway.config.namespace + '/data/common',
                headers: {'Accept-Language': gateway.binarta.application.locale()}
            }).then(function (it) {
                response.success(it.data);
            });
        };

        this.fetchSectionData = function (request, response) {
            gateway.$http({
                method: 'GET',
                url: gateway.config.baseUri + 'api/adhesive/reading/stream/' + gateway.config.namespace + '/' + gateway.binarta.application.localeForPresentation() + '/section' + request.id
            }).then(function (it) {
                response.success(it.data);
            });
        };

        this.findPublicConfig = function (request, response) {
            gateway.$http({
                method: 'POST',
                url: gateway.config.baseUri + 'api/usecase',
                data: {
                    headers: {
                        usecase: 'resolve.public.config',
                        namespace: gateway.config.namespace,
                        section: gateway.binarta.application.unlocalizedPath()
                    },
                    payload: {
                        key: request.id
                    }
                }
            }).then(function (it) {
                response.success(it.data.value);
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