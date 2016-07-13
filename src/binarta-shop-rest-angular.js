(function () {
    angular.module('binarta-shopjs-rest-angular1', ['config', 'rest.client'])
        .provider('restBinartaShopGateway', proxy(new ShopGateway()))
        .factory('binartaShopGatewayIsInitialised', ['$q', GatewayIsInitialisedFactory])
        .run(['restBinartaShopGateway', 'binartaShopGatewayIsInitialised', WireAngularDependencies]);

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

    function ShopGateway() {
        var self = this;

        this.previewOrder = function (request, response) {
            request.namespace = this.config.namespace;
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/echo/purchase-order',
                withCredentials: true,
                data: request
            }).then(function (it) {
                response.success(it.data);
            });
        };

        this.submitOrder = function (request, response) {
            self.$http({
                method: 'PUT',
                url: self.config.baseUri + 'api/entity/purchase-order',
                withCredentials: true,
                data: request
            }).then(response.success, toErrorResponse(response));
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
        };
    }

    function GatewayIsInitialisedFactory($q) {
        return $q.defer();
    }

    function WireAngularDependencies(gateway, isInitialised) {
        isInitialised.resolve();
    }
})();