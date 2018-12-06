(function () {
    describe('binartajs-rest-angular1', function () {
        var binarta, $rootScope, $http, $location, rest, config, ui, expectedHttpRequest, request, response;

        beforeEach(module('binartajs-rest-angular1-spec'));
        beforeEach(inject(function (_binarta_, _$rootScope_, _$location_, _config_, restServiceHandler, $httpBackend) {
            binarta = _binarta_;
            $location = _$location_;
            config = _config_;
            rest = restServiceHandler;
            $http = $httpBackend;
            $rootScope = _$rootScope_;

            config.namespace = 'n';
            config.baseUri = 'http://host/';

            $http.expectGET('http://host/api/adhesive/reading/snapshot/n/default').respond(200, {
                timestamp: '20170906121510300+05:00',
                stream: []
            });
            binarta.application.setLocale('default');
            binarta.application.setLocaleForPresentation('en');
            $http.flush();

            ui = new UI();
            response = jasmine.createSpyObj('response', [
                'success',
                'rejected',
                'unauthenticated',
                'forbidden',
                'activeAccountMetadata',
                'notFound'
            ]);
        }));

        afterEach(function () {
            $http.verifyNoOutstandingExpectation();
            $http.verifyNoOutstandingRequest();
        });

        function expectHeaders(expectations) {
            return function (headers) {
                expectations.forEach(function (it) {
                    it(headers);
                });
                return true;
            }
        }

        function expectHeader(key, value) {
            return function (headers) {
                if (headers[key] != value)
                    throw new Error(key + " != '" + value + "'! [" + headers[key] + "]");
            }
        }

        describe('application gateway', function () {
            var gateway;

            beforeEach(inject(function (restBinartaApplicationGateway) {
                gateway = restBinartaApplicationGateway;
            }));

            describe('fetchApplicationProfile', function () {
                beforeEach(function () {
                    expectedHttpRequest = $http.expectGET('http://host/api/application/n/data/common', expectHeaders([
                        expectHeader('Accept-Language', binarta.application.locale())
                    ]));
                });

                it('success', function () {
                    expectedHttpRequest.respond(200, 'application-profile');
                    gateway.fetchApplicationProfile(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith('application-profile');
                });
            });

            describe('fetchAdhesiveSnapshot', function () {
                beforeEach(function () {
                    request = {locale: 'en'};
                    expectedHttpRequest = $http.expectGET('http://host/api/adhesive/reading/snapshot/n/en');
                });

                it('success', function () {
                    expectedHttpRequest.respond(200, {timestamp: '20170907121510300+05:00', stream: 'stream'});
                    gateway.fetchAdhesiveSnapshot(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith({
                        timestamp: moment('20170907121510300+05:00', 'YYYYMMDDHHmmssSSSZ'),
                        stream: 'stream'
                    });
                });
            });

            describe('submitContactForm', function () {
                beforeEach(function () {
                    request = {
                        name: 'Jan',
                        email: 'jan@company.com',
                        subject: "Hello",
                        text: "I would like more info"
                    };
                    expectedHttpRequest = $http.expectPOST('http://host/api/contact/us', request);
                });

                it('success', function () {
                    expectedHttpRequest.respond(200, '');
                    gateway.submitContactForm(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalled();
                });

                it('rejected', function () {
                    expectedHttpRequest.respond(412, 'error');
                    gateway.submitContactForm(request, response);
                    $http.flush();
                    expect(response.rejected).toHaveBeenCalledWith('error', 412);
                });

                it('rejected and response handler is not given', function () {
                    expectedHttpRequest.respond(412, 'error');
                    gateway.submitContactForm(request, {});
                    $http.flush();
                });
            });

            describe('addConfig', function () {
                beforeEach(function () {
                    request = {id: 'k', value: 'v', scope: 's'};
                    expectedHttpRequest = $http.expectPOST('http://host/api/config', {
                        namespace: "n",
                        id: "k",
                        value: 'v',
                        scope: 's'
                    });
                });

                it('unauthorized', function () {
                    expectedHttpRequest.respond(401);
                    gateway.addConfig(request, response);
                    $http.flush();
                    expect(response.unauthenticated).toHaveBeenCalled();
                });

                it('forbidden', function () {
                    expectedHttpRequest.respond(403);
                    gateway.addConfig(request, response);
                    $http.flush();
                    expect(response.forbidden).toHaveBeenCalled();
                });

                it('rejected', function () {
                    expectedHttpRequest.respond(412, 'violations');
                    gateway.addConfig(request, response);
                    $http.flush();
                    expect(response.rejected).toHaveBeenCalledWith('violations', 412);
                });

                it('success', function () {
                    expectedHttpRequest.respond(200, {value: 'v'});
                    gateway.addConfig(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith('v');
                });
            });

            ['/', '/en/'].forEach(function (path) {
                describe('findPublicConfig on ' + path, function () {
                    beforeEach(function () {
                        $location.path(path);
                        request = {id: 'k'};
                        expectedHttpRequest = $http.expectPOST('http://host/api/usecase', {
                            headers: {
                                usecase: "resolve.public.config",
                                namespace: "n",
                                section: '/'
                            },
                            payload: {
                                key: "k"
                            }
                        });
                    });

                    it('success', function () {
                        expectedHttpRequest.respond(200, {value: 'v'});
                        gateway.findPublicConfig(request, response);
                        $http.flush();
                        expect(response.success).toHaveBeenCalledWith('v');
                    });

                    it('not found', function () {
                        expectedHttpRequest.respond(404);
                        gateway.findPublicConfig(request, response);
                        $http.flush();
                        expect(response.notFound).toHaveBeenCalled();
                    });

                    it('not found and response handler is not given', function () {
                        expectedHttpRequest.respond(404);
                        gateway.findPublicConfig(request, {});
                        $http.flush();
                    });
                });

                describe('findConfig on ' + path, function () {
                    beforeEach(function () {
                        $location.path(path);
                        request = {id: 'k'};
                        expectedHttpRequest = $http.expectPOST('http://host/api/usecase', {
                            headers: {
                                usecase: "config.resolve",
                                namespace: "n",
                                section: '/'
                            },
                            payload: {
                                key: "k"
                            }
                        });
                    });

                    it('unauthorized', function () {
                        expectedHttpRequest.respond(401);
                        gateway.findConfig(request, response);
                        $http.flush();
                        expect(response.unauthenticated).toHaveBeenCalled();
                    });

                    it('forbidden', function () {
                        expectedHttpRequest.respond(403);
                        gateway.findConfig(request, response);
                        $http.flush();
                        expect(response.forbidden).toHaveBeenCalled();
                    });

                    it('success', function () {
                        expectedHttpRequest.respond(200, {value: 'v'});
                        gateway.findConfig(request, response);
                        $http.flush();
                        expect(response.success).toHaveBeenCalledWith('v');
                    });

                    it('not found', function () {
                        expectedHttpRequest.respond(404);
                        gateway.findConfig(request, response);
                        $http.flush();
                        expect(response.notFound).toHaveBeenCalled();
                    });

                    it('not found and response handler is not given', function () {
                        expectedHttpRequest.respond(404);
                        gateway.findConfig(request, {});
                        $http.flush();
                    });
                });
            });
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
                    }, expectHeaders([
                        expectHeader('Accept-Language', binarta.application.locale())
                    ]));
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

            describe('signout', function () {
                beforeEach(function () {
                    expectedHttpRequest = $http.expectDELETE('http://host/api/checkpoint');
                });

                it('success', function () {
                    expectedHttpRequest.respond(200);
                    gateway.signout(response);
                    $http.flush();
                    expect(response.unauthenticated).toHaveBeenCalled();
                });
            });

            describe('delete', function () {
                beforeEach(function () {
                    expectedHttpRequest = $http.expectPOST('http://host/api/usecase', {
                        headers: {usecase: 'user.profile.remove'}
                    });
                });

                it('success', function () {
                    expectedHttpRequest.respond(200);
                    gateway.delete(response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalled();
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
                    }, expectHeaders([
                        expectHeader('Accept-Language', binarta.application.locale())
                    ]));
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
                    expectedHttpRequest = $http.expectGET('http://host/api/account/metadata', expectHeaders([
                        expectHeader('X-Namespace', config.namespace)
                    ]));
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

            describe('fetchPermissions', function () {
                beforeEach(function () {
                    request = {
                        principal: 'p'
                    };
                    expectedHttpRequest = $http.expectPOST('http://host/api/query/permission/list', {
                        filter: {
                            namespace: 'n',
                            owner: 'p'
                        }
                    });
                });

                it('success', function () {
                    expectedHttpRequest.respond(200, 'permissions');
                    gateway.fetchPermissions(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith('permissions');
                });
            })
        });

        describe('publisher gateway', function () {
            var db;

            beforeEach(inject(function (restBinartaPublisherGateway) {
                db = restBinartaPublisherGateway;
                response = jasmine.createSpyObj('response', ['success']);
            }));

            describe('findAllPublishedBlogsForLocale', function () {
                beforeEach(function () {
                    expectedHttpRequest = $http.expect('POST', 'http://host/api/usecase', {
                        headers: {
                            usecase: 'find.all.published.blogs.for.locale',
                            namespace: 'n',
                            locale: 'en'
                        },
                        payload: {
                            subset: {offset: 0, max: 5}
                        }
                    });
                    request = {locale: 'en', subset: {offset: 0, max: 5}}
                });

                it('returns blog posts', function () {
                    expectedHttpRequest.respond(200, 'posts');
                    db.findAllPublishedBlogsForLocale(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith('posts')
                });
            });

            describe('findAllBlogsInDraftForLocale', function () {
                beforeEach(function () {
                    expectedHttpRequest = $http.expect('POST', 'http://host/api/usecase', {
                        headers: {
                            usecase: 'find.all.blogs.in.draft.for.locale',
                            namespace: 'n',
                            locale: 'en'
                        },
                        payload: {
                            subset: {offset: 0, max: 5}
                        }
                    });
                    request = {locale: 'en', subset: {offset: 0, max: 5}}
                });

                it('returns blog posts', function () {
                    expectedHttpRequest.respond(200, 'posts');
                    db.findAllBlogsInDraftForLocale(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith('posts')
                });
            });

            describe('add', function () {
                beforeEach(function () {
                    expectedHttpRequest = $http.expect('POST', 'http://host/api/usecase', {
                        headers: {
                            usecase: 'new.blog.post',
                            namespace: 'n',
                            locale: 'en'
                        }
                    });
                });

                it('returns newly created id', function () {
                    expectedHttpRequest.respond(200, 'id');
                    db.add({locale: 'en'}, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith('id')
                });
            });

            describe('delete', function () {
                beforeEach(function () {
                    expectedHttpRequest = $http.expect('POST', 'http://host/api/usecase', {
                        headers: {
                            usecase: 'delete.blog.post',
                            namespace: 'n'
                        },
                        payload: {
                            id: 'b'
                        }
                    });
                });

                it('executes', function () {
                    expectedHttpRequest.respond(200);
                    db.delete({id: 'b'}, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalled()
                });
            });

            describe('get', function () {
                beforeEach(function () {
                    expectedHttpRequest = $http.expect('POST', 'http://host/api/usecase', {
                        headers: {
                            usecase: 'display.blog.post',
                            namespace: 'n',
                            locale: 'en'
                        },
                        payload: {
                            id: 'b'
                        }
                    });
                });

                it('returns blog post', function () {
                    expectedHttpRequest.respond(200, 'p');
                    db.get({locale: 'en', id: 'b'}, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith('p');
                });
            });

            describe('publish', function () {
                var now;

                beforeEach(function () {
                    now = moment();
                    expectedHttpRequest = $http.expect('POST', 'http://host/api/usecase', {
                        headers: {
                            usecase: 'publish.blog.post',
                            namespace: 'n',
                            locale: 'en'
                        },
                        payload: {
                            id: 'b',
                            timestamp: moment(now, 'lll').format()
                        }
                    });
                });

                it('completes sucessfully', function () {
                    expectedHttpRequest.respond(200);
                    db.publish({locale: 'en', id: 'b', timestamp: now}, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith();
                });
            });

            describe('withdraw', function () {
                beforeEach(function () {
                    expectedHttpRequest = $http.expect('POST', 'http://host/api/usecase', {
                        headers: {
                            usecase: 'withdraw.blog.post',
                            namespace: 'n',
                            locale: 'en'
                        },
                        payload: {
                            id: 'b'
                        }
                    });
                });

                it('completes sucessfully', function () {
                    expectedHttpRequest.respond(200);
                    db.withdraw({locale: 'en', id: 'b'}, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalled();
                });
            });

            describe('draft in another language', function () {
                beforeEach(function () {
                    expectedHttpRequest = $http.expect('POST', 'http://host/api/usecase', {
                        headers: {
                            usecase: 'draft.blog.post.in.another.language',
                            namespace: 'n'
                        },
                        payload: {
                            id: 'b',
                            locale: 'en'
                        }
                    });
                });

                it('completes sucessfully', function () {
                    expectedHttpRequest.respond(200);
                    db.draftInAnotherLanguage({locale: 'en', id: 'b'}, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalled();
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
                    expectedHttpRequest = $http.expectPOST('http://host/api/view-customer-profile', undefined, expectHeaders([
                        expectHeader('Accept-Language', binarta.application.locale())
                    ]));
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
                    expectedHttpRequest = $http.expectPOST('http://host/api/customer', {vat: 'BE1234567890'}, expectHeaders([
                        expectHeader('Accept-Language', binarta.application.locale())
                    ]));
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
                    expectedHttpRequest = $http.expectPOST('http://host/api/query/customer-address/listByPrincipal', {"args": {"dummy": "dummy"}}, expectHeaders([
                        expectHeader('Accept-Language', binarta.application.locale())
                    ]));
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
                    expectedHttpRequest = $http.expectPUT('http://host/api/entity/customer-address', 'address', expectHeaders([
                        expectHeader('Accept-Language', binarta.application.locale())
                    ]));
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
                    request = {label: 'l'};
                    expectedHttpRequest = $http.expectPOST('http://host/api/entity/customer-address', {
                        context: 'update',
                        label: 'l'
                    }, expectHeaders([
                        expectHeader('Accept-Language', binarta.application.locale())
                    ]));
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
                    }, expectHeaders([
                        expectHeader('Accept-Language', binarta.application.locale())
                    ]));
                });

                it('success', function () {
                    expectedHttpRequest.respond(200, 'previewed-order');
                    gateway.previewOrder(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith('previewed-order');
                });
            });

            describe('validate order', function () {
                beforeEach(function () {
                    request = {
                        items: [
                            {id: 'i'}
                        ]
                    };
                    expectedHttpRequest = $http.expectPOST('http://host/api/validate/purchase-order', {
                        namespace: 'n',
                        reportType: 'complex',
                        items: [
                            {id: 'i'}
                        ]
                    }, expectHeaders([
                        expectHeader('Accept-Language', binarta.application.locale())
                    ]));
                });

                it('rejected', function () {
                    expectedHttpRequest.respond(412, 'violation-report');
                    gateway.validateOrder(request, response);
                    $http.flush();
                    expect(response.rejected).toHaveBeenCalledWith('violation-report');
                });

                it('success', function () {
                    expectedHttpRequest.respond(200);
                    gateway.validateOrder(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalled();
                });
            });

            describe('submit order', function () {
                beforeEach(function () {
                    request = {
                        provider: 'p'
                    };
                    expectedHttpRequest = $http.expectPUT('http://host/api/entity/purchase-order', {
                        provider: 'p'
                    }, expectHeaders([
                        expectHeader('Accept-Language', binarta.application.locale())
                    ]));
                });

                it('success', function () {
                    expectedHttpRequest.respond(201, {id: 'order-id'});
                    gateway.submitOrder(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith({id: 'order-id'});
                });

                it('rejected', function () {
                    expectedHttpRequest.respond(412, 'violation-report');
                    gateway.submitOrder(request, response);
                    $http.flush();
                    expect(response.rejected).toHaveBeenCalledWith('violation-report');
                });
            });

            describe('cancel order', function () {
                beforeEach(function () {
                    request = {
                        id: 'i'
                    };
                    expectedHttpRequest = $http.expectPOST('http://host/api/entity/purchase-order', {
                        context: 'updateStatusAsCustomer',
                        id: 'i',
                        status: 'canceled',
                        treatInputAsId: true
                    }, expectHeaders([
                        expectHeader('Accept-Language', binarta.application.locale())
                    ]));
                });

                it('success', function () {
                    expectedHttpRequest.respond(200);
                    gateway.cancelOrder(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalled();
                });

                it('rejected', function () {
                    expectedHttpRequest.respond(412, 'violation-report');
                    gateway.cancelOrder(request, response);
                    $http.flush();
                    expect(response.rejected).toHaveBeenCalledWith('violation-report');
                });
            });

            describe('confirm payment', function () {
                beforeEach(function () {
                    request = {
                        id: 'i',
                        token: 'p'
                    };
                    expectedHttpRequest = $http.expectPOST('http://host/api/purchase-order-payment/i/approve', {
                        id: 'i',
                        token: 'p'
                    }, expectHeaders([
                        expectHeader('Accept-Language', binarta.application.locale())
                    ]));
                });

                it('success', function () {
                    expectedHttpRequest.respond(201);
                    gateway.confirmPayment(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalled();
                });

                it('rejected', function () {
                    expectedHttpRequest.respond(412, 'violation-report');
                    gateway.confirmPayment(request, response);
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

            describe('find coupon by id', function () {
                beforeEach(function () {
                    expectedHttpRequest = $http.expectGET('http://host/api/entity/coupon?namespace=n&code=c&treatInputAsId=true');
                    gateway.findCouponById({id: 'c'}, response);
                });

                it('on success', function () {
                    expectedHttpRequest.respond(200, 'coupon');
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith('coupon');
                });

                it('on not found', function () {
                    expectedHttpRequest.respond(404);
                    $http.flush();
                    expect(response.notFound).toHaveBeenCalled();
                });
            });

            describe('contains coupon', function () {
                beforeEach(function () {
                    expectedHttpRequest = $http.expectPOST('http://host/api/usecase', {
                        headers: {usecase: 'market.shop.coupon.dictionary.contains'},
                        payload: {id: 'c'}
                    });
                    gateway.containsCoupon({id: 'c'}, response);
                });

                it('on success', function () {
                    expectedHttpRequest.respond(200, {contains: true});
                    $http.flush();
                    expect(response.success).toHaveBeenCalled();
                });

                it('on not found', function () {
                    expectedHttpRequest.respond(200, {contains: false});
                    $http.flush();
                    expect(response.notFound).toHaveBeenCalled();
                });
            });

            describe('stripe connect', function () {
                beforeEach(function () {
                    request = {
                        locale: 'en'
                    };
                    expectedHttpRequest = $http.expectPOST('http://host/api/stripe/initiate', {
                        headers: {
                            locale: 'en'
                        }
                    });
                });

                it('success', function () {
                    expectedHttpRequest.respond(200, {uri: 'stripe-connect-uri'});
                    gateway.stripeConnect(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith({uri: 'stripe-connect-uri'});
                });
            });

            describe('stripe connected', function () {
                beforeEach(function () {
                    request = {};
                    expectedHttpRequest = $http.expectPOST('http://host/api/stripe/account', {});
                });

                it('success', function () {
                    expectedHttpRequest.respond(200, {id: 'stripe-account-id'});
                    gateway.stripeConnected(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith('stripe-account-id');
                });

                it('not found', function () {
                    expectedHttpRequest.respond(404);
                    gateway.stripeConnected(request, response);
                    $http.flush();
                    expect(response.notFound).toHaveBeenCalled();
                });
            });

            describe('stripe disconnect', function () {
                beforeEach(function () {
                    request = {};
                    expectedHttpRequest = $http.expectPOST('http://host/api/stripe/disconnect', {});
                });

                it('success', function () {
                    expectedHttpRequest.respond(200);
                    gateway.stripeDisconnect(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalled();
                });
            });

            describe('configure cc', function () {
                beforeEach(function () {
                    request = {
                        bankId: 'piggybank'
                    };
                    expectedHttpRequest = $http.expectPOST('http://host/api/cc/configure', {
                        payload: {
                            bankId: 'piggybank'
                        }
                    });
                });

                it('success', function () {
                    expectedHttpRequest.respond(200);
                    gateway.configureCC(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalled();
                });
            });

            describe('configure bancontact', function () {
                beforeEach(function () {
                    request = {
                        owner: 'John Doe',
                        bankId: 'piggybank'
                    };
                    expectedHttpRequest = $http.expectPOST('http://host/api/bancontact/configure', {
                        payload: {
                            ownerName: 'John Doe',
                            bankId: 'piggybank'
                        }
                    });
                });

                it('success', function () {
                    expectedHttpRequest.respond(200);
                    gateway.configureBancontact(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalled();
                });
            });

            describe('get cc params', function () {
                beforeEach(function () {
                    request = {};
                    expectedHttpRequest = $http.expectPOST('http://host/api/cc/params', {});
                });

                it('success', function () {
                    expectedHttpRequest.respond(200, 'params');
                    gateway.getCCParams(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith('params');
                });
            });

            describe('get bancontact params', function () {
                beforeEach(function () {
                    request = {};
                    expectedHttpRequest = $http.expectPOST('http://host/api/bancontact/params', {});
                });

                it('success', function () {
                    expectedHttpRequest.respond(200, 'params');
                    gateway.getBancontactParams(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith('params');
                });
            });

            describe('disable payment method', function () {
                beforeEach(function () {
                    request = {id: 'piggybank'};
                    expectedHttpRequest = $http.expectPOST('http://host/api/payment/method/disable', {
                        payload: {
                            id: 'piggybank'
                        }
                    });
                });

                it('success', function () {
                    expectedHttpRequest.respond(200);
                    gateway.disablePaymentMethod(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalled();
                });
            })
        });

        describe('human resources db', function () {
            var db;

            beforeEach(inject(function (restBinartaHumanResourcesGateway) {
                db = restBinartaHumanResourcesGateway;
            }));

            describe('search', function () {
                beforeEach(function () {
                    expectedHttpRequest = $http.expectGET('http://host/api/vacancies/n/l');
                });

                it('success', function () {
                    expectedHttpRequest.respond(200, 'search-results');
                    request.locale = 'l';
                    db.search(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith('search-results');
                });
            });

            describe('get', function () {
                beforeEach(function () {
                    expectedHttpRequest = $http.expectGET('http://host/api/vacancies/n/i/l');
                });

                it('success', function () {
                    expectedHttpRequest.respond(200, 'position');
                    request.id = 'i';
                    request.locale = 'l';
                    db.get(request, response);
                    $http.flush();
                    expect(response.success).toHaveBeenCalledWith('position');
                });
            });
        });

        function capturedRequest(idx) {
            return rest.calls.argsFor(idx)[0];
        }
    });

    angular.module('binarta-applicationjs-gateways-angular1', ['binarta-applicationjs-rest-angular1'])
        .provider('binartaApplicationGateway', ['restBinartaApplicationGatewayProvider', function (it) {
            return it;
        }]);

    angular.module('binartajs-rest-angular1-spec', [
        'binarta-applicationjs-angular1',
        'binarta-applicationjs-rest-angular1',
        'binarta-checkpointjs-rest-angular1',
        'binarta-publisherjs-rest-angular1',
        'binarta-shopjs-rest-angular1',
        'binarta-humanresourcesjs-rest-angular1'
    ]).factory('binartaReadRouteOnLocaleChange', function () {
        return false;
    });

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
