(function () {
    angular.module('binarta-checkpointjs-rest-angular1', ['config', 'rest.client'])
        .provider('restBinartaCheckpointGateway', proxy(new CheckpointGateway()))
        .run(['restBinartaCheckpointGateway', WireAngularDependencies]);

    function proxy(gateway) {
        return function() {
            this.gateway = gateway;
            this.$get = ['config', 'restServiceHandler', function(config, rest) {
                this.gateway.config = config;
                this.gateway.rest = rest;
                return gateway;
            }]
        }
    }

    function CheckpointGateway() {
        this.initiateBillingAgreement = function(provider, ui) {
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

        this.confirmBillingAgreement = function(ctx, ui) {
            this.rest({
                params: {
                    method: 'POST',
                    url: (this.config.baseUri || '') + 'api/usecase',
                    withCredentials: true,
                    data: {
                        headers: {usecase: 'create.billing.agreement'},
                        payload: {paymentProvider: ctx.paymentProvider, confirmationToken:ctx.confirmationToken}
                    }
                },
                success: ui.confirmedBillingAgreement
            })
        }
    }

    function WireAngularDependencies() {
    }
})();