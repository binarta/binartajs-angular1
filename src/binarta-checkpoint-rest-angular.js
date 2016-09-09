(function () {
    angular.module('binarta-checkpointjs-rest-angular1', ['config', 'rest.client', 'binartajs-angular1'])
        .provider('restBinartaCheckpointGateway', proxy(new CheckpointGateway()))
        .factory('binartaCheckpointGatewayIsInitialised', ['$q', GatewayIsInitialisedFactory])
        .run(['restBinartaCheckpointGateway', 'binartaCheckpointGatewayIsInitialised', WireAngularDependencies]);

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

    function CheckpointGateway() {
        var self = this;

        this.register = function (request, response) {
            request.namespace = this.config.namespace;
            self.$http({
                method: 'PUT',
                url: self.config.baseUri + 'api/accounts',
                headers: {'Accept-Language': self.binarta.application.locale()},
                data: request
            }).then(response.success, toErrorResponse(response));
        };

        this.signin = function (request, response) {
            request.namespace = this.config.namespace;
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/checkpoint',
                headers: {'Accept-Language': self.binarta.application.locale()},
                data: request,
                withCredentials: true
            }).then(response.success, response.rejected);
        };

        this.signout = function (response) {
            self.$http({
                method: 'DELETE',
                url: self.config.baseUri + 'api/checkpoint',
                withCredentials: true
            }).then(response.unauthenticated);
        };

        this.fetchAccountMetadata = function (response) {
            self.$http({
                method: 'GET',
                url: self.config.baseUri + 'api/account/metadata',
                withCredentials: true,
                headers: {'X-Namespace': self.config.namespace}
            }).then(function (it) {
                response.activeAccountMetadata(it.data)
            }, response.unauthenticated);
        };

        this.fetchPermissions = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/query/permission/list',
                data: {
                    filters: {
                        namespace: self.config.namespace,
                        owner: request.principal
                    }
                },
                withCredentials: true
            }).then(function (it) {
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