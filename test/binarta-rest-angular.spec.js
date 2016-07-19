(function () {
    describe('binartajs-rest-angular1', function () {
        var $http, rest, config, ui, expectedHttpRequest, request, response;

        beforeEach(module('binartajs-rest-angular1-spec'));
        beforeEach(inject(function (_config_, restServiceHandler, $httpBackend) {
            config = _config_;
            rest = restServiceHandler;
            $http = $httpBackend;

            config.namespace = 'n';
            config.baseUri = 'http://host/';

            ui = new UI();
            response = jasmine.createSpyObj('response', [
                'success',
                'rejected',
                'unauthenticated',
                'activeAccountMetadata'
            ]);
        }));

        afterEach(function () {
            $http.verifyNoOutstandingExpectation();
            $http.verifyNoOutstandingRequest();
        });

        describe('checkpoint gateway', function () {
            var gateway;

            beforeEach(inject(function (restBinartaCheckpointGateway) {
                gateway = restBinartaCheckpointGateway;
            }));

            describe('signin', function () {
                beforeEach(function () {
                    request = {
                        username: 'u',
                        password: 'p',
                        rememberMe: 'r'
                    };
                    expectedHttpRequest = $http.expectPOST('http://host/api/checkpoint', {
                        namespace: 'n',
                        username: 'u',
                        password: 'p',
                        rememberMe: 'r'
                    });
                });

                it('success', function () {
                    expectedHttpRequest.respond(200);
                    gateway.signin(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalled();
                });

                it('rejected', function () {
                    expectedHttpRequest.respond(412);
                    gateway.signin(request, response);
                    $http.flush();
                    expect(response.rejected).toHaveBeenCalled();
                });
            });

            describe('register', function () {
                beforeEach(function () {
                    request = {
                        username: 'u',
                        password: 'p'
                    };
                    expectedHttpRequest = $http.expectPUT('http://host/api/accounts', {
                        namespace: 'n',
                        username: 'u',
                        password: 'p'
                    });
                });

                it('success', function () {
                    expectedHttpRequest.respond(201);
                    gateway.register(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalled();
                });

                it('rejected', function () {
                    expectedHttpRequest.respond(412, 'violation-report');
                    gateway.register(request, response);
                    $http.flush();
                    expect(response.rejected).toHaveBeenCalledWith('violation-report');
                });
            });

            describe('fetchAccountMetadata', function () {
                beforeEach(function () {
                    expectedHttpRequest = $http.expectGET('http://host/api/account/metadata', function (headers) {
                        return headers['X-Namespace'] == config.namespace;
                    });
                });

                it('success', function () {
                    expectedHttpRequest.respond(200, 'metadata');
                    gateway.fetchAccountMetadata(response);
                    $http.flush();
                    expect(response.activeAccountMetadata).toHaveBeenCalledWith('metadata');
                });

                it('rejected', function () {
                    expectedHttpRequest.respond(401);
                    gateway.fetchAccountMetadata(response);
                    $http.flush();
                    expect(response.unauthenticated).toHaveBeenCalled();
                });
            });
        });

        describe('shop gateway', function () {
            var gateway;

            beforeEach(inject(function (restBinartaShopGateway) {
                gateway = restBinartaShopGateway;
            }));

            describe('fetch billing profile', function () {
                beforeEach(function () {
                    expectedHttpRequest = $http.expectGET('http://host/api/customer');
                });

                it('unauthenticated', function () {
                    expectedHttpRequest.respond(401);
                    gateway.fetchBillingProfile(response);
                    $http.flush();
                    expect(response.unauthenticated).toHaveBeenCalled();
                });

                it('success', function () {
                    expectedHttpRequest.respond(200, 'billing-profile');
                    gateway.fetchBillingProfile(response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith('billing-profile');
                });
            });

            describe('update billing profile', function () {
                beforeEach(function () {
                    request = {vat: 'BE1234567890'};
                    expectedHttpRequest = $http.expectPOST('http://host/api/customer', {vat: 'BE1234567890'});
                });

                it('unauthenticated', function () {
                    expectedHttpRequest.respond(401);
                    gateway.updateBillingProfile(request, response);
                    $http.flush();
                    expect(response.unauthenticated).toHaveBeenCalled();
                });

                it('success', function () {
                    expectedHttpRequest.respond(200);
                    gateway.updateBillingProfile(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalled();
                });
            });

            describe('fetch addresses', function () {
                beforeEach(function () {
                    expectedHttpRequest = $http.expectGET('http://host/api/query/customer-address/listByPrincipal');
                });

                it('unauthenticated', function () {
                    expectedHttpRequest.respond(401);
                    gateway.fetchAddresses(response);
                    $http.flush();
                    expect(response.unauthenticated).toHaveBeenCalled();
                });

                it('success', function () {
                    expectedHttpRequest.respond(200, 'addresses');
                    gateway.fetchAddresses(response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith('addresses');
                });
            });

            describe('add address', function () {
                beforeEach(function () {
                    request = 'address';
                    expectedHttpRequest = $http.expectPUT('http://host/api/entity/customer-address', 'address');
                });

                it('unauthenticated', function () {
                    expectedHttpRequest.respond(401);
                    gateway.addAddress(request, response);
                    $http.flush();
                    expect(response.unauthenticated).toHaveBeenCalled();
                });

                it('rejected', function () {
                    expectedHttpRequest.respond(412, 'violation-report');
                    gateway.addAddress(request, response);
                    $http.flush();
                    expect(response.rejected).toHaveBeenCalledWith('violation-report');
                });

                it('success', function () {
                    expectedHttpRequest.respond(201);
                    gateway.addAddress(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalled();
                });
            });

            describe('update address', function () {
                beforeEach(function () {
                    request = 'address';
                    expectedHttpRequest = $http.expectPOST('http://host/api/entity/customer-address', 'address');
                });

                it('unauthenticated', function () {
                    expectedHttpRequest.respond(401);
                    gateway.updateAddress(request, response);
                    $http.flush();
                    expect(response.unauthenticated).toHaveBeenCalled();
                });

                it('rejected', function () {
                    expectedHttpRequest.respond(412, 'violation-report');
                    gateway.updateAddress(request, response);
                    $http.flush();
                    expect(response.rejected).toHaveBeenCalledWith('violation-report');
                });

                it('success', function () {
                    expectedHttpRequest.respond(200);
                    gateway.updateAddress(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalled();
                });
            });

            describe('preview order', function () {
                beforeEach(function () {
                    request = {
                        items: [
                            {id: 'i'}
                        ]
                    };
                    expectedHttpRequest = $http.expectPOST('http://host/api/echo/purchase-order', {
                        namespace: 'n',
                        items: [
                            {id: 'i'}
                        ]
                    }, function (headers) {
                        return true;
                        // return headers['Accept-Language'] == '???'; // TODO - can we find a nice way to expose the chosen language?
                    });
                });

                it('success', function () {
                    expectedHttpRequest.respond(200, 'previewed-order');
                    gateway.previewOrder(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith('previewed-order');
                });
            });

            describe('submit order', function () {
                beforeEach(function () {
                    request = {
                        provider: 'p'
                    };
                    expectedHttpRequest = $http.expectPUT('http://host/api/entity/purchase-order', {
                        provider: 'p'
                    }, function (headers) {
                        return true;
                        // return headers['Accept-Language'] == '???'; // TODO - can we find a nice way to expose the chosen language?
                    });
                });

                it('success', function () {
                    expectedHttpRequest.respond(201);
                    gateway.submitOrder(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalled();
                });

                it('rejected', function () {
                    expectedHttpRequest.respond(412, 'violation-report');
                    gateway.submitOrder(request, response);
                    $http.flush();
                    expect(response.rejected).toHaveBeenCalledWith('violation-report');
                });
            });

            describe('initiate billing agreement', function () {
                beforeEach(function () {
                    gateway.initiateBillingAgreement('p', ui);
                });

                it('performs rest request', function () {
                    expect(capturedRequest(0).params.method).toEqual('POST');
                    expect(capturedRequest(0).params.url).toEqual('http://host/api/usecase');
                    expect(capturedRequest(0).params.withCredentials).toEqual(true);
                    expect(capturedRequest(0).params.data.headers.usecase).toEqual('initiate.billing.agreement');
                    expect(capturedRequest(0).params.data.payload.paymentProvider).toEqual('p');
                });

                it('on success', function () {
                    capturedRequest(0).success('r');
                    expect(ui.approveBillingAgreementRequest).toEqual('r');
                });
            });

            describe('confirm billing agreement', function () {
                beforeEach(function () {
                    gateway.confirmBillingAgreement({
                        paymentProvider: 'p',
                        confirmationToken: 't'
                    }, ui);
                });

                it('performs rest request', function () {
                    expect(capturedRequest(0).params.method).toEqual('POST');
                    expect(capturedRequest(0).params.url).toEqual('http://host/api/usecase');
                    expect(capturedRequest(0).params.withCredentials).toEqual(true);
                    expect(capturedRequest(0).params.data.headers.usecase).toEqual('create.billing.agreement');
                    expect(capturedRequest(0).params.data.payload.paymentProvider).toEqual('p');
                    expect(capturedRequest(0).params.data.payload.confirmationToken).toEqual('t');
                });

                it('on success', function () {
                    capturedRequest(0).success();
                    expect(ui.confirmedBillingAgreementRequest).toBeTruthy();
                });
            });
        });

        function capturedRequest(idx) {
            return rest.calls.argsFor(idx)[0];
        }
    });

    angular.module('binartajs-rest-angular1-spec', [
        'binarta-checkpointjs-rest-angular1',
        'binarta-shopjs-rest-angular1'
    ]);

    function UI() {
        var self = this;

        this.approveBillingAgreement = function (request) {
            self.approveBillingAgreementRequest = request;
        };

        this.confirmedBillingAgreement = function () {
            self.confirmedBillingAgreementRequest = true;
        }
    }
})();