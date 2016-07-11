(function () {
    angular.module('binarta-checkpointjs-rest-angular1', ['config', 'rest.client', 'binartajs-angular1'])
        .provider('restBinartaCheckpointGateway', proxy(new CheckpointGateway()))
        .factory('binartaCheckpointGatewayIsInitialised', ['$q', GatewayIsInitialisedFactory])
        .run(['restBinartaCheckpointGateway', 'binartaCheckpointGatewayIsInitialised', WireAngularDependencies]);

    function proxy(gateway) {
        return function () {
            this.gateway = gateway;
            this.$get = ['config', 'restServiceHandler', '$http', function (config, rest, $http) {
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
                data: request
            }).then(response.success, toErrorResponse(response));
        };

        this.signin = function (request, response) {
            request.namespace = this.config.namespace;
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/checkpoint',
                data: request,
                withCredentials: true
            }).then(response.success, response.rejected);
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

        this.initiateBillingAgreement = function (provider, ui) {
            self.rest({
                params: {
                    method: 'POST',
                    url: (self.config.baseUri || '') + 'api/usecase',
                    withCredentials: true,
                    data: {
                        headers: {usecase: 'initiate.billing.agreement'},
                        payload: {paymentProvider: provider}
                    }
                },
                success: ui.approveBillingAgreement
            })
        };

        this.confirmBillingAgreement = function (ctx, ui) {
            self.rest({
                params: {
                    method: 'POST',
                    url: (self.config.baseUri || '') + 'api/usecase',
                    withCredentials: true,
                    data: {
                        headers: {usecase: 'create.billing.agreement'},
                        payload: {paymentProvider: ctx.paymentProvider, confirmationToken: ctx.confirmationToken}
                    }
                },
                success: ui.confirmedBillingAgreement
            })
        }
    }

    function GatewayIsInitialisedFactory($q) {
        return $q.defer();
    }

    function WireAngularDependencies(gateway, isInitialised) {
        isInitialised.resolve();
    }
})();