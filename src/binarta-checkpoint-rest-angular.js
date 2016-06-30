(function () {
    angular.module('binarta-checkpointjs-rest-angular1', ['config', 'rest.client'])
        .provider('restBinartaCheckpointGateway', proxy(new CheckpointGateway()))
        .run(['restBinartaCheckpointGateway', WireAngularDependencies]);

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
        return function(request) {
            response.rejected(request.data);
        };
    }

    function CheckpointGateway() {
        this.register = function (request, response) {
            request.namespace = this.config.namespace;
            this.$http({
                method: 'PUT',
                url: this.config.baseUri + 'api/accounts',
                data: request
            }).then(response.success).catch(toErrorResponse(response));
        };

        this.signin = function (request, response) {
            request.namespace = this.config.namespace;
            this.$http({
                method: 'POST',
                url: this.config.baseUri + 'api/checkpoint',
                data: request,
                withCredentials: true
            }).then(response.success).catch(response.rejected);
        };

        this.initiateBillingAgreement = function (provider, ui) {
            this.rest({
                params: {
                    method: 'POST',
                    url: (this.config.baseUri || '') + 'api/usecase',
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
            this.rest({
                params: {
                    method: 'POST',
                    url: (this.config.baseUri || '') + 'api/usecase',
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

    function WireAngularDependencies() {
    }
})();