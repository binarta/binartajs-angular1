(function () {
    angular.module('binarta-shopjs-rest-angular1', ['config', 'rest.client'])
        .provider('restBinartaShopGateway', proxy(new ShopGateway()))
        .factory('binartaShopGatewayIsInitialised', ['$q', GatewayIsInitialisedFactory])
        .run(['restBinartaShopGateway', 'binartaShopGatewayIsInitialised', WireAngularDependencies]);

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

    function toSuccessResponse(response) {
        return function (it) {
            if (response.success)
                response.success(it.data);
        }
    }

    function toErrorResponse(response) {
        return function (request) {
            if (request.status == 401)
                response.unauthenticated();
            if (request.status == 404)
                response.notFound();
            if (request.status == 412)
                response.rejected(request.data);
        };
    }

    function ShopGateway() {
        var self = this;

        this.fetchBillingProfile = function (response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/view-customer-profile',
                withCredentials: true,
                headers: {'Accept-Language': self.binarta.application.locale()}
            }).then(function (it) {
                response.success(it.data);
            }, toErrorResponse(response));
        };

        this.updateBillingProfile = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/customer',
                withCredentials: true,
                headers: {'Accept-Language': self.binarta.application.locale()},
                data: request
            }).then(response.success, toErrorResponse(response));
        };

        this.fetchAddresses = function (response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/query/customer-address/listByPrincipal',
                withCredentials: true,
                headers: {'Accept-Language': self.binarta.application.locale()},
                data: {"args": {"dummy": "dummy"}}
            }).then(function (it) {
                response.success(it.data);
            }, toErrorResponse(response));
        };

        this.addAddress = function (request, response) {
            self.$http({
                method: 'PUT',
                url: self.config.baseUri + 'api/entity/customer-address',
                withCredentials: true,
                headers: {'Accept-Language': self.binarta.application.locale()},
                data: request
            }).then(response.success, toErrorResponse(response));
        };

        this.updateAddress = function (request, response) {
            request.context = 'update';
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/entity/customer-address',
                withCredentials: true,
                headers: {'Accept-Language': self.binarta.application.locale()},
                data: request
            }).then(response.success, toErrorResponse(response));
        };

        this.previewOrder = function (request, response) {
            request.namespace = this.config.namespace;
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/echo/purchase-order',
                withCredentials: true,
                headers: {'Accept-Language': self.binarta.application.locale()},
                data: request
            }).then(function (it) {
                response.success(it.data);
            });
        };

        this.validateOrder = function (request, response) {
            request.namespace = this.config.namespace;
            request.reportType = 'complex';
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/validate/purchase-order',
                withCredentials: true,
                headers: {'Accept-Language': self.binarta.application.locale()},
                data: request
            }).then(response.success, toErrorResponse(response));
        };

        this.submitOrder = function (request, response) {
            self.$http({
                method: 'PUT',
                url: self.config.baseUri + 'api/entity/purchase-order',
                withCredentials: true,
                headers: {'Accept-Language': self.binarta.application.locale()},
                data: request
            }).then(toSuccessResponse(response), toErrorResponse(response));
        };

        this.cancelOrder = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/entity/purchase-order',
                withCredentials: true,
                headers: {'Accept-Language': self.binarta.application.locale()},
                data: {
                    context: 'updateStatusAsCustomer',
                    id: request.id,
                    status: 'canceled',
                    treatInputAsId: true
                }
            }).then(toSuccessResponse(response), toErrorResponse(response));
        };

        this.confirmPayment = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/purchase-order-payment/' + request.id + '/approve',
                withCredentials: true,
                headers: {'Accept-Language': self.binarta.application.locale()},
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

        this.findCouponById = function (request, response) {
            self.$http({
                method: 'GET',
                url: self.config.baseUri + 'api/entity/coupon?namespace=' + this.config.namespace + '&code=' + request.id + '&treatInputAsId=true'
            }).then(function (it) {
                response.success(it.data);
            }, toErrorResponse(response));
        };

        this.containsCoupon = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/usecase',
                withCredentials: true,
                data: {
                    headers: {usecase: 'market.shop.coupon.dictionary.contains'},
                    payload: {id: request.id}
                }
            }).then(function (it) {
                it.data.contains ? response.success() : response.notFound()
            }, toErrorResponse(response));
        };

        this.stripeConnect = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/stripe/initiate',
                withCredentials: true,
                data: {
                    headers: {locale: request.locale}
                }
            }).then(function (it) {
                response.success(it.data);
            }, toErrorResponse(response));
        };

        this.stripeConnected = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/stripe/account',
                withCredentials: true,
                data: {}
            }).then(function (it) {
                response.success(it.data.id);
            }, toErrorResponse(response));
        };

        this.stripeDisconnect = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/stripe/disconnect',
                withCredentials: true,
                data: {}
            }).then(function () {
                response.success();
            }, toErrorResponse(response));
        };

        this.configureCC = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/cc/configure',
                withCredentials: true,
                data: {
                    payload: {
                        bankId: request.bankId
                    }
                }
            }).then(function () {
                response.success();
            }, toErrorResponse(response));
        };

        this.configureBancontact = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/bancontact/configure',
                withCredentials: true,
                data: {
                    payload: {
                        ownerName: request.owner,
                        bankId: request.bankId
                    }
                }
            }).then(function () {
                response.success();
            }, toErrorResponse(response));
        };

        this.getCCParams = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/cc/params',
                withCredentials: true,
                data: {}
            }).then(function (it) {
                response.success(it.data);
            }, toErrorResponse(response));
        };

        this.getBancontactParams = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/bancontact/params',
                withCredentials: true,
                data: {}
            }).then(function (it) {
                response.success(it.data);
            }, toErrorResponse(response));
        };

        this.disablePaymentMethod = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/payment/method/disable',
                withCredentials: true,
                data: {
                    payload: {
                        id: request.id
                    }
                }
            }).then(function () {
                response.success();
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