(function () {
    angular.module('binarta-checkpointjs-rest-angular1', ['config', 'rest.client'])
        .provider('restBinartaCheckpointGateway', proxy(new CheckpointGateway()));

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
                    url: (this.config.baseUri || '') + 'api/echo/purchase-order',
                    withCredentials: true,
                    data: {
                        headers: {usecase: 'initiate.billing.agreement'},
                        payload: {paymentProvider: provider}
                    }
                },
                success: ui.approveBillingAgreement
            })
        }
    }
})();