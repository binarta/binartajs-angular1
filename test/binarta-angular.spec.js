(function () {
    var ui;

    describe('binartajs-angular', function () {
        var binarta, $location;

        beforeEach(function () {
            ui = new UI();
        });
        beforeEach(module('binartajs-angular1-spec'));
        beforeEach(inject(function (_binarta_, _$location_) {
            binarta = _binarta_;
            $location = _$location_;

            binarta.checkpoint.profile.signout();
        }));

        it('binarta is initialised promise only resolves when gateways are initialised', inject(function ($rootScope, binartaIsInitialised, binartaGatewaysAreInitialised) {
            var initialisedBinarta;
            binartaGatewaysAreInitialised.resolve();
            binartaIsInitialised.then(function (binarta) {
                initialisedBinarta = binarta;
            });
            $rootScope.$digest();
            expect(initialisedBinarta).toEqual(binarta);
        }));

        describe('binarta-checkpointjs-angular1', function () {
            var db;

            beforeEach(inject(function (binartaCheckpointGateway) {
                db = binartaCheckpointGateway;
            }));

            it('binarta is extended with checkpoint', function () {
                expect(binarta.checkpoint).toBeDefined();
            });

            it('on profile refresh is authenticated', function () {
                binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                binarta.checkpoint.profile.refresh();
                expect(binarta.checkpoint.profile.isAuthenticated()).toEqual(true);
            });

            describe('CheckpointController', function () {
                var ctrl;

                beforeEach(inject(function ($controller) {
                    ctrl = $controller('CheckpointController');
                }));

                it('submit is not supported before an operation mode is chosen', function () {
                    expect(ctrl.submit).toThrowError('checkpoint.submit.requires.an.operation.mode.to.be.selected')
                });

                it('while no operation mode is selected the system is in idle state', function () {
                    expect(ctrl.status()).toEqual('idle');
                });

                describe('when initialised for signin', function () {
                    beforeEach(function () {
                        ctrl.mode = 'signin';
                        ctrl.$onInit();
                    });

                    it('then system is still in idle state', function () {
                        expect(ctrl.status()).toEqual('idle');
                    });

                    it('then form submission with invalid credentials is rejected', function () {
                        ctrl.username = '-';
                        ctrl.password = '-';
                        ctrl.submit();
                        expect(ctrl.status()).toEqual('rejected');
                    });

                    it('then form submission with valid credentials is accepted', function () {
                        db.register({username: 'valid', password: 'credentials'}, new ExpectSuccessResponse());

                        ctrl.username = 'valid';
                        ctrl.password = 'credentials';
                        ctrl.submit();

                        expect(ctrl.status()).toEqual('authenticated');
                    });

                    it('then form submission with valid credentials triggers an optional event listener', function () {
                        db.register({username: 'valid', password: 'credentials'}, new ExpectSuccessResponse());
                        var listener = jasmine.createSpyObj('listener', ['success']);

                        ctrl.listener = listener;
                        ctrl.username = 'valid';
                        ctrl.password = 'credentials';
                        ctrl.submit();

                        expect(listener.success).toHaveBeenCalled();
                    });

                    it('then controller can be switched to registration mode', function () {
                        ctrl.switchToRegistrationMode();
                        expect(ctrl.mode).toEqual('registration');
                    });
                });

                describe('when initialised for registration', function () {
                    beforeEach(function () {
                        ctrl.mode = 'registration';
                        ctrl.$onInit();
                    });

                    it('then system is still in idle state', function () {
                        expect(ctrl.status()).toEqual('idle');
                    });

                    it('then form submission with invalid credentials is rejected', function () {
                        ctrl.password = 'invalid';
                        ctrl.submit();
                        expect(ctrl.status()).toEqual('rejected');
                        expect(ctrl.violationReport()).toEqual({password: ['invalid']});
                    });

                    it('then form submission with valid credentials is accepted', function () {
                        ctrl.email = 'valid';
                        ctrl.password = 'credentials';
                        ctrl.submit();
                        expect(ctrl.status()).toEqual('registered');
                    });

                    it('then form submission with valid credentials triggers an optional event listener', function () {
                        var listener = jasmine.createSpyObj('listener', ['success']);

                        ctrl.listener = listener;
                        ctrl.email = 'valid';
                        ctrl.password = 'credentials';
                        ctrl.submit();

                        expect(listener.success).toHaveBeenCalled();
                    });

                    it('then controller can be switched to signin mode', function () {
                        ctrl.switchToSigninMode();
                        expect(ctrl.mode).toEqual('signin');
                    });
                });
            });
        });

        describe('binarta-shopjs-angular1', function () {
            it('binarta is extended with shop', function () {
                expect(binarta.shop).toBeDefined();
            });

            describe('CheckoutController', function () {
                var ctrl;

                beforeEach(inject(function ($controller) {
                    ctrl = $controller('CheckoutController');
                }));

                it('exposes the checkout status', function () {
                    expect(ctrl.status()).toEqual(binarta.shop.checkout.status());
                });

                it('exposes the checkout order', function () {
                    expect(ctrl.order()).toEqual(binarta.shop.checkout.context().order);
                });

                it('starting while idle has no effect', function () {
                    $location.path('/checkout/start');
                    ctrl.start();
                    expect($location.path()).toEqual('/checkout/start');
                });

                it('starting while started redirects to the appropriate route', function () {
                    binarta.shop.checkout.start({}, ['authentication-required']);
                    $location.path('/checkout/start');
                    ctrl.start();
                    expect($location.path()).toEqual('/checkout/authentication-required');
                });

                it('retry authentication-required using checkpoint listener', function () {
                    binarta.shop.checkout.start({}, ['authentication-required', 'completed']);
                    binarta.checkpoint.registrationForm.submit({username: 'u', password: 'p'});
                    binarta.checkpoint.profile.refresh();

                    ctrl.checkpointListener.success();

                    expect(ctrl.status()).toEqual('completed');
                    expect($location.path()).toEqual('/checkout/completed');
                });

                describe('restoring checkout state from location', function () {
                    it('ignore non checkout locations', function () {
                        $location.path('/');
                        ctrl.$onInit();
                        expect(binarta.shop.checkout.status()).toEqual('idle');
                    });

                    it('ignore unknown states', function () {
                        $location.path('/checkout/unknown');
                        ctrl.$onInit();
                        expect(binarta.shop.checkout.status()).toEqual('idle');
                    });

                    it('simple state', function () {
                        $location.path('/checkout/completed');
                        ctrl.$onInit();
                        expect(binarta.shop.checkout.status()).toEqual('completed');
                    });

                    it('state with dashes', function () {
                        $location.path('/checkout/authentication-required');
                        ctrl.$onInit();
                        expect(binarta.shop.checkout.status()).toEqual('authentication-required');
                    });
                });

                it('supports decorators', inject(['$controller', 'CheckoutController.decorator', function ($controller, decorator) {
                    decorator.add(function (ctrl) {
                        ctrl.decoratedAttribute = 'd';
                    });
                    expect($controller('CheckoutController').decoratedAttribute).toEqual('d');
                }]));

                it('on summary step order confirmation can be rejected', function () {
                    binarta.shop.checkout.start({provider: 'with-insufficient-funds'}, ['summary', 'completed']);

                    ctrl.confirm();

                    expect(ctrl.status()).toEqual('summary');
                    expect(ctrl.violationReport()).toEqual('violation-report');
                });

                it('on summary step order confirmation success', function () {
                    binarta.shop.checkout.start({provider: 'with-sufficient-funds'}, ['summary', 'completed']);

                    ctrl.confirm();

                    expect(ctrl.status()).toEqual('completed');
                    expect($location.path()).toEqual('/checkout/completed');
                });

                it('on setup payment provider retry will redeliver the order and proceed to next step', function () {
                    binarta.shop.checkout.start({provider: 'with-sufficient-funds'}, ['setup-payment-provider', 'completed']);

                    ctrl.retry();

                    expect(ctrl.status()).toEqual('completed');
                    expect($location.path()).toEqual('/checkout/completed');
                });
            });

            describe('CheckoutRoadmapController', function () {
                var ctrl;

                beforeEach(inject(function ($controller) {
                    binarta.shop.checkout.start({}, ['summary', 'completed']);
                    ctrl = $controller('CheckoutRoadmapController');
                    ctrl.$onInit();
                }));

                it('exposes current roadmap', function () {
                    expect(ctrl.roadmap).toEqual([
                        {name: 'summary', locked: false, unlocked: true},
                        {name: 'completed', locked: true, unlocked: false}
                    ]);
                });

                it('exposes current step', function () {
                    expect(ctrl.currentStep).toEqual('summary');
                });
            });

            describe('BasketController', function () {
                var ctrl;

                beforeEach(inject(function ($controller) {
                    ctrl = $controller('BinartaBasketController');
                    ctrl.order = {items: [{id: 'i', quantity: 1}]};
                    ctrl.$onInit();
                }));

                it('exposes the previewed order', function () {
                    expect(ctrl.preview).toEqual(ctrl.order);
                });

                it('exposes the viewport', inject(function (viewport) {
                    expect(ctrl.viewport).toEqual(viewport);
                }));
            });

            describe('SetupPaymentProviderController', function () {
                var ctrl;

                beforeEach(inject(function ($controller, $location) {
                    ctrl = $controller('SetupPaymentProviderController');
                    $location.path('/custom/page');
                }));

                describe('setup billing agreement', function () {
                    var onConfirmed;

                    beforeEach(function () {
                        onConfirmed = jasmine.createSpy('on-confirmed');

                        ctrl.provider = 'p';
                        ctrl.method = 'billing-agreement';
                        ctrl.onConfirmed = onConfirmed;
                    });

                    describe('when initiating', function () {
                        beforeEach(function () {
                            ctrl.$onInit();
                        });

                        it('redirects to payment provider', inject(function ($window) {
                            expect($window.location).toEqual('http://p/billing/agreement?token=t');
                        }));

                        it('stores current route in session storage', function () {
                            expect(sessionStorage.binartaJSSetupBillingAgreementReturnUrl).toEqual('/custom/page');
                        });

                        it('on confirmed callback is not executed', function () {
                            expect(onConfirmed).not.toHaveBeenCalled();
                        });
                    });

                    describe('when confirmed', function () {
                        beforeEach(function () {
                            binarta.checkpoint.profile.billing.confirm({token: 't'});
                            ctrl.$onInit();
                        });

                        it('does not redirect to payment provider', inject(function ($window) {
                            expect($window.location).toBeUndefined();
                        }));

                        it('execute confirmation listener', function () {
                            expect(onConfirmed).toHaveBeenCalled();
                        });
                    });
                });
            });

            describe('SetupBillingAgreementController', function () {
                var ctrl;

                beforeEach(inject(function ($controller) {
                    ctrl = $controller('SetupBillingAgreementController')
                }));

                it('exposes the fact billing details are incomplete', function () {
                    expect(ctrl.status).toEqual('incomplete');
                });

                it('exposes the fact billing details are complete', inject(function ($controller) {
                    binarta.checkpoint.profile.billing.confirm({paymentProvider: 'p', confirmationToken: 't'});
                    expect($controller('SetupBillingAgreementController').status).toEqual('complete');
                }));

                describe('initiate billing details', function () {
                    beforeEach(function () {
                        ctrl.paymentProvider = 'p';
                        ctrl.submit();
                    });

                    it('changes status to working', function () {
                        expect(ctrl.status).toEqual('working');
                    });

                    it('redirects to external approval url', inject(function ($window) {
                        expect($window.location).toEqual('http://p/billing/agreement?token=t');
                    }));
                });
            });

            describe('CancelBillingAgreementController', function () {
                var ctrl;

                beforeEach(inject(function ($controller) {
                    ctrl = $controller('CancelBillingAgreementController');
                }));

                it('on execute cancel billing agreement', inject(function ($location) {
                    ctrl.execute();
                    expect(ui.receivedCanceledBillingAgreementRequest).toBeTruthy();
                }));
            });

            describe('ConfirmBillingAgreementController', function () {
                var ctrl;

                beforeEach(inject(function ($controller) {
                    ctrl = $controller('ConfirmBillingAgreementController');
                    sessionStorage.setItem('binartaJSSetupBillingAgreementReturnUrl', '');
                }));

                it('on execute confirm billing agreement', inject(function ($location) {
                    $location.path('/billing/agreement/confirm').search({token: 't'}); // TODO - as we begin supporting different payment providers we may need a strategy for this
                    ctrl.execute();
                    expect(ui.confirmedBillingAgreementRequest).toBeTruthy();
                    expect($location.path()).toEqual('/billing/agreement/confirm');
                }));

                it('on execute if a return url is stored in session storage then return to it', inject(function ($location) {
                    sessionStorage.setItem('binartaJSSetupBillingAgreementReturnUrl', '/custom/page');
                    $location.path('/billing/agreement/confirm').search({token: 't'});
                    ctrl.execute();
                    expect($location.path()).toEqual('/custom/page');
                }));
            });

            describe('UserProfileController', function () {
                var ctrl;

                beforeEach(inject(function ($controller) {
                    binarta.checkpoint.registrationForm.submit({email: 'e', password: 'p'});
                    binarta.checkpoint.profile.refresh();
                    ctrl = $controller('UserProfileController');
                }));

                it('expose email', function () {
                    expect(ctrl.email()).toEqual('e');
                });

                it('expose VAT number', function () {
                    expect(ctrl.vat()).toEqual('BE1234567890');
                });

                it('expose profile status', function () {
                    expect(ctrl.status()).toEqual('idle');
                });

                describe('when in edit mode', function () {
                    beforeEach(function () {
                        ctrl.edit();
                    });

                    it('expose updated status', function () {
                        expect(ctrl.status()).toEqual('editing');
                    });

                    it('expose update request as form', function () {
                        expect(ctrl.form).toEqual({vat: 'BE1234567890', address: {}});
                    });

                    it('update the profile', function () {
                        ctrl.form.vat = 'BE0987654321';
                        ctrl.update();
                        expect(ctrl.vat()).toEqual('BE0987654321');
                    });

                    it('cancel editing', function () {
                        ctrl.cancel();
                        expect(ctrl.status()).toEqual('idle');
                    });
                });
            });

            describe('AddressController', function () {
                var ctrl;

                beforeEach(inject(function ($controller) {
                    binarta.checkpoint.profile.edit();
                    binarta.checkpoint.profile.updateRequest().address.label = 'home';
                    binarta.checkpoint.profile.updateRequest().address.addressee = 'John Doe';
                    binarta.checkpoint.profile.updateRequest().address.street = 'Johny Lane';
                    binarta.checkpoint.profile.updateRequest().address.number = '1';
                    binarta.checkpoint.profile.updateRequest().address.zip = '1000';
                    binarta.checkpoint.profile.updateRequest().address.city = 'Johnyville';
                    binarta.checkpoint.profile.updateRequest().address.country = 'BE';
                    binarta.checkpoint.profile.update();
                    ctrl = $controller('BinartaAddressController');
                    ctrl.label = 'home';
                }));

                it('expose address status', function () {
                    expect(ctrl.status()).toEqual('idle');
                });

                it('expose attributes', function () {
                    expect(ctrl.addressee()).toEqual('John Doe');
                    expect(ctrl.street()).toEqual('Johny Lane');
                    expect(ctrl.number()).toEqual('1');
                    expect(ctrl.zip()).toEqual('1000');
                    expect(ctrl.city()).toEqual('Johnyville');
                    expect(ctrl.country()).toEqual('BE');
                });

                describe('when in edit mode', function () {
                    beforeEach(function () {
                        ctrl.edit();
                    });

                    it('expose updated status', function () {
                        expect(ctrl.status()).toEqual('editing');
                    });

                    it('expose update request as form', function () {
                        expect(ctrl.form).toEqual({
                            id: {label: 'home'},
                            label: 'home',
                            addressee: 'John Doe',
                            street: 'Johny Lane',
                            number: '1',
                            zip: '1000',
                            city: 'Johnyville',
                            country: 'BE'
                        });
                    });

                    it('update the address', function () {
                        ctrl.form.addressee = 'Jane Smith';
                        ctrl.update();
                        expect(ctrl.addressee()).toEqual('Jane Smith');
                    });

                    it('cancel editing', function () {
                        ctrl.cancel();
                        expect(ctrl.status()).toEqual('idle');
                    });
                });
            });
        });
    });

    installBackendStrategy('inmem');
    angular.module('binartajs-angular1-spec', [
        'binarta-checkpointjs-angular1', 'binarta-checkpointjs-gateways-angular1',
        'binarta-shopjs-angular1', 'binarta-shopjs-gateways-angular1'
    ])
        .service('$window', MockWindow)
        .factory('i18nLocation', MockI18nLocationFactory)
        .service('viewport', MockViewport)
        .config(ExtendBinarta);

    function MockWindow() {
    }

    function MockI18nLocationFactory($location) {
        return $location;
    }

    function MockViewport() {
    }

    function ExtendBinarta(binartaProvider, shopProvider) {
        binartaProvider.ui.initiatingBillingAgreement = ui.initiatingBillingAgreement;
        binartaProvider.ui.canceledBillingAgreement = ui.canceledBillingAgreement;
        binartaProvider.ui.confirmedBillingAgreement = function () {
            ui.confirmedBillingAgreement();
            shopProvider.ui.confirmedBillingAgreement();
        };
    }

    function UI() {
        var self = this;

        this.initiatingBillingAgreement = function () {
        };

        this.canceledBillingAgreement = function () {
            self.receivedCanceledBillingAgreementRequest = true;
        };

        this.confirmedBillingAgreement = function () {
            self.confirmedBillingAgreementRequest = true;
        }
    }

    function installBackendStrategy(strategy) {
        angular.module('binarta-checkpointjs-gateways-angular1', ['binarta-checkpointjs-' + strategy + '-angular1'])
            .provider('binartaCheckpointGateway', [strategy + 'BinartaCheckpointGatewayProvider', proxy]);
        angular.module('binarta-shopjs-gateways-angular1', ['binarta-shopjs-' + strategy + '-angular1'])
            .provider('binartaShopGateway', [strategy + 'BinartaShopGatewayProvider', proxy]);

        function proxy(gateway) {
            return gateway;
        }
    }

    function ExpectSuccessResponse() {
        this.success = function () {
        };
        this.rejected = function () {
            throw new Error('request.rejected');
        };
    }
})();

var $ = function () {
    return {
        trigger: function () {
        }
    }
};