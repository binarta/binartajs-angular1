(function () {
    angular.module('binarta-shopjs-rest-angular1', ['config'])
        .provider('restBinartaShopGateway', proxy(new ShopGateway()))
        .factory('binartaShopGatewayIsInitialised', ['$q', GatewayIsInitialisedFactory])
        .run(['restBinartaShopGateway', 'binartaShopGatewayIsInitialised', WireAngularDependencies]);

    function proxy(gateway) {
        return function () {
            this.gateway = gateway;
            this.$get = ['config', '$http', function (config, $http) {
                this.gateway.config = config;
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
    }

    function GatewayIsInitialisedFactory($q) {
        return $q.defer();
    }

    function WireAngularDependencies(gateway, isInitialised) {
        isInitialised.resolve();
    }
})();