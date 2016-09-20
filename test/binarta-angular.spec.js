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
            binarta.shop.basket.clear();

            localStorage.removeItem('binartaJSPaymentProvider');
            sessionStorage.removeItem('binartaJSAwaitingConfirmationWithPaymentProvider');
        }));

        describe('binarta is initialised promise', function() {
            var initialisedBinarta, $rootScope, binartaIsInitialised, binartaGatewaysAreInitialised, binartaConfigIsInitialised, binartaCachesAreInitialised;

            beforeEach(inject(function(_$rootScope_, _binartaIsInitialised_, _binartaGatewaysAreInitialised_, _binartaConfigIsInitialised_, _binartaCachesAreInitialised_) {
                $rootScope = _$rootScope_;
                binartaIsInitialised = _binartaIsInitialised_;
                binartaGatewaysAreInitialised = _binartaGatewaysAreInitialised_;
                binartaConfigIsInitialised = _binartaConfigIsInitialised_;
                binartaCachesAreInitialised = _binartaCachesAreInitialised_;

                binartaIsInitialised.then(function (binarta) {
                    initialisedBinarta = binarta;
                });
            }));

            it('does not resolve when only gateways are initialised', function () {
                binartaGatewaysAreInitialised.resolve();
                $rootScope.$digest();
                expect(initialisedBinarta).toBeUndefined();
            });

            it('does not resolve when only config is initialised', function () {
                binartaConfigIsInitialised.resolve();
                $rootScope.$digest();
                expect(initialisedBinarta).toBeUndefined();
            });

            it('does not resolve when only gateways and config are initialised', function () {
                binartaGatewaysAreInitialised.resolve();
                binartaConfigIsInitialised.resolve();
                $rootScope.$digest();
                expect(initialisedBinarta).toBeUndefined();
            });

            it('resolves when gateways and config and caches are initialised', function () {
                binartaGatewaysAreInitialised.resolve();
                binartaConfigIsInitialised.resolve();
                binartaCachesAreInitialised.resolve();
                $rootScope.$digest();
                expect(initialisedBinarta).toEqual(binarta);
            });

            it('config is initialised promise does not resolve when gateways are not initialised', function() {
                var spy = jasmine.createSpy('spy');
                binartaConfigIsInitialised.promise.then(spy);
                binartaConfigIsInitialised.resolve();
                $rootScope.$digest();
                expect(spy).not.toHaveBeenCalled();
            });

            it('caches are initialised promise does not resolve when gateways are not initialised', function() {
                var spy = jasmine.createSpy('spy');
                binartaCachesAreInitialised.promise.then(spy);
                binartaCachesAreInitialised.resolve();
                $rootScope.$digest();
                expect(spy).not.toHaveBeenCalled();
            });

            it('caches are initialised promise does not resolve when config is not initialised', function() {
                var spy = jasmine.createSpy('spy');
                binartaCachesAreInitialised.promise.then(spy);
                binartaGatewaysAreInitialised.resolve();
                binartaCachesAreInitialised.resolve();
                $rootScope.$digest();
                expect(spy).not.toHaveBeenCalled();
            });
        });

        describe('ContentHeaderController', function() {
            var $ctrl;

            beforeEach(inject(function($controller) {
                $ctrl = $controller('ContentHeaderController');
            }));

            it('titles are not inverted by default', function() {
                $ctrl.$onInit();
                expect($ctrl.inverted).toBeFalsy();
            });

            it('titles can be inverted by setting the inverted header titles flage on binarta', function() {
                binarta.invertedHeaderTitles = true;
                $ctrl.$onInit();
                expect($ctrl.inverted).toBeTruthy();
            });
        });

        describe('binarta-applicationjs-angular1', function () {
            var $rootScope, binartaApplicationConfigIsInitialised, binartaApplicationCachesAreInitialised, binartaApplicationIsInitialised, binartaGatewaysAreInitialised, binartaConfigIsInitialised;
            var isApplicationConfigInitialisedListener, areApplicationCachesInitialisedListener, applicationIsInitialisedListener;

            beforeEach(inject(function (_$rootScope_, _binartaApplicationConfigIsInitialised_, _binartaApplicationCachesAreInitialised_, _binartaApplicationIsInitialised_, _binartaGatewaysAreInitialised_, _binartaConfigIsInitialised_) {
                $rootScope = _$rootScope_;
                binartaApplicationConfigIsInitialised = _binartaApplicationConfigIsInitialised_;
                binartaApplicationCachesAreInitialised = _binartaApplicationCachesAreInitialised_;
                binartaApplicationIsInitialised = _binartaApplicationIsInitialised_;
                binartaGatewaysAreInitialised = _binartaGatewaysAreInitialised_;
                binartaConfigIsInitialised = _binartaConfigIsInitialised_;

                isApplicationConfigInitialisedListener = jasmine.createSpy('is-application-config-initialised');
                binartaApplicationConfigIsInitialised.then(isApplicationConfigInitialisedListener);

                areApplicationCachesInitialisedListener = jasmine.createSpy('are-application-caches-initialised');
                binartaApplicationCachesAreInitialised.then(areApplicationCachesInitialisedListener);

                applicationIsInitialisedListener = jasmine.createSpy('is-application-initialised');
                binartaApplicationIsInitialised.then(applicationIsInitialisedListener);
            }));

            it('application config is not initialised before the binarta gateways are initialised', function () {
                expect(isApplicationConfigInitialisedListener).not.toHaveBeenCalled();
            });

            it('when binarta gateways are initialised then application config is also initialised', function () {
                binartaGatewaysAreInitialised.resolve();
                $rootScope.$digest();
                expect(isApplicationConfigInitialisedListener).toHaveBeenCalled();
            });

            it('application caches are not initialised before the binarta config is initialised', function () {
                expect(areApplicationCachesInitialisedListener).not.toHaveBeenCalled();
            });

            it('when binarta gateways and config are initialised then application caches are also initialised', function () {
                binartaGatewaysAreInitialised.resolve();
                binartaConfigIsInitialised.resolve();
                $rootScope.$digest();
                expect(areApplicationCachesInitialisedListener).toHaveBeenCalled();
            });

            it('when binarta gateways and config are initialised then application is also initialised', function () {
                binartaGatewaysAreInitialised.resolve();
                binartaConfigIsInitialised.resolve();
                $rootScope.$digest();
                expect(applicationIsInitialisedListener).toHaveBeenCalled();
            });
        });

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
                        expect(ctrl.violationReport()).toEqual('credentials.mismatch');
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

                    it('switching to registration mode resets input', function () {
                        ctrl.email = 'e';
                        ctrl.username = 'u';
                        ctrl.password = 'p';
                        ctrl.company = 'c';
                        ctrl.vat = 'v';
                        ctrl.captcha = 'c';

                        ctrl.switchToRegistrationMode();

                        expect(ctrl.email).toBeUndefined();
                        expect(ctrl.username).toBeUndefined();
                        expect(ctrl.password).toBeUndefined();
                        expect(ctrl.company).toBeUndefined();
                        expect(ctrl.vat).toBeUndefined();
                        expect(ctrl.captcha).toBeUndefined();
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

                    it('switching to signin mode resets input', function () {
                        ctrl.email = 'e';
                        ctrl.username = 'u';
                        ctrl.password = 'p';
                        ctrl.company = 'c';
                        ctrl.vat = 'v';
                        ctrl.captcha = 'c';

                        ctrl.switchToSigninMode();

                        expect(ctrl.email).toBeUndefined();
                        expect(ctrl.username).toBeUndefined();
                        expect(ctrl.password).toBeUndefined();
                        expect(ctrl.company).toBeUndefined();
                        expect(ctrl.vat).toBeUndefined();
                        expect(ctrl.captcha).toBeUndefined();
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

                beforeEach(inject(function ($controller, $rootScope) {
                    ctrl = $controller('CheckoutController', {$scope: $rootScope.$new()});
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

                it('supports decorators', inject(['$controller', '$rootScope', 'CheckoutController.decorator', function ($controller, $rootScope, decorator) {
                    decorator.add(function (ctrl) {
                        ctrl.decoratedAttribute = 'd';
                    });
                    expect($controller('CheckoutController', {$scope: $rootScope.$new()}).decoratedAttribute).toEqual('d');
                }]));

                describe('on address selection step', function () {
                    beforeEach(function () {
                        binarta.shop.checkout.start({}, ['address-selection', 'completed']);
                        ctrl.$onInit();
                    });

                    it('set billing address updates the exposed addresses context', function () {
                        ctrl.setBillingAddress({label: 'b', addressee: 'a'});
                        expect(ctrl.addresses.billing).toEqual({label: 'b', addressee: 'a'});
                    });

                    it('set shipping address updates the exposed addresses context', function () {
                        ctrl.setShippingAddress({label: 's', addressee: 'a'});
                        expect(ctrl.addresses.shipping).toEqual({label: 's', addressee: 'a'});
                    });

                    it('when selecting addresses then proceed to next step', function () {
                        ctrl.addresses.billing = {label: 'b', addressee: 'a'};
                        ctrl.selectAddresses();
                        expect($location.path()).toEqual('/checkout/completed');
                    });

                    it('when no address is selected then is awaiting selection flag is set to true', function () {
                        expect(ctrl.isAwaitingSelection()).toBeTruthy();
                    });

                    it('when billing address is selected then is awaiting selection flag is set to false', function () {
                        ctrl.setBillingAddress({label: 'b', addressee: 'a'});
                        expect(ctrl.isAwaitingSelection()).toBeFalsy();
                    });

                    it('when shipping address is selected then is awaiting selection flag is set to true', function () {
                        ctrl.setShippingAddress({label: 's', addressee: 'a'});
                        expect(ctrl.isAwaitingSelection()).toBeTruthy();
                    });
                });

                it('on address selection step addresses can be preselected', inject(function ($controller, $rootScope) {
                    binarta.shop.checkout.start({
                        billing: {label: 'b', addressee: 'a'},
                        shipping: {label: 's', addressee: 'a'}
                    }, ['address-selection', 'completed']);

                    var ctrl = $controller('CheckoutController', {$scope: $rootScope.$new()});

                    expect(ctrl.addresses.billing).toEqual({label: 'b', addressee: 'a'});
                    expect(ctrl.addresses.shipping).toEqual({label: 's', addressee: 'a'});
                }));

                describe('on summary step', function () {
                    beforeEach(function () {
                        binarta.shop.checkout.start({}, ['summary', 'completed']);
                    });

                    it('expose payment provider', function () {
                        expect(ctrl.getPaymentProvider()).toEqual('wire-transfer');
                    });

                    it('step set payment provider', function () {
                        ctrl.setPaymentProvider('payment-provider');
                        expect(ctrl.order().provider).toEqual('payment-provider');
                    });
                });

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

                it('on payment step payment confirmation can be rejected', function () {
                    binarta.shop.checkout.start({}, ['payment', 'completed']);

                    $location.search({token: 'invalid'});
                    ctrl.confirmPayment();

                    expect(ctrl.status()).toEqual('payment');
                    expect(ctrl.violationReport()).toEqual({token: ['invalid']});
                });

                it('on payment step payment confirmation success', function () {
                    binarta.shop.checkout.start({}, ['payment', 'completed']);

                    $location.search({token: '-'});
                    ctrl.confirmPayment();

                    expect(ctrl.status()).toEqual('completed');
                    expect($location.path()).toEqual('/checkout/completed');
                    expect($location.search()).toEqual({});
                });

                it('on payment step cancel the payment', function() {
                    binarta.shop.checkout.start({}, ['payment', 'completed']);

                    ctrl.cancelPayment();

                    expect(ctrl.status()).toEqual('summary');
                    expect($location.path()).toEqual('/checkout/summary');
                });

                it('expose previous step details', function() {
                    binarta.shop.checkout.start({}, ['summary', 'payment', 'completed']);
                    binarta.shop.checkout.next();
                    expect(ctrl.hasPreviousStep()).toBeTruthy();
                    expect(ctrl.previousStep()).toEqual('summary');
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
                }));

                it('exposes the viewport', inject(function (viewport) {
                    expect(ctrl.viewport).toEqual(viewport);
                }));

                describe('in summary mode', function () {
                    beforeEach(function () {
                        ctrl.mode = 'summary';
                        ctrl.order = {items: [{id: 'i', quantity: 1}]};
                        ctrl.$onInit();
                    });

                    it('exposes the previewed order', function () {
                        expect(ctrl.preview).toEqual(ctrl.order);
                    });
                });

                describe('in detailed mode', function () {
                    beforeEach(function () {
                        ctrl.mode = 'detailed';
                        binarta.shop.basket.add({
                            item: {id: 'i', price: 100, quantity: 1}
                        });
                        ctrl.$onInit();
                    });

                    it('exposes the previewed order', function () {
                        expect(ctrl.preview.items[0].id).toEqual('i');
                        expect(ctrl.preview.items[0].quantity).toEqual(1);
                    });

                    describe('on checkout', function () {
                        beforeEach(function () {
                            ctrl.checkout();
                        });

                        it('then checkout is started with the previewed order', function () {
                            expect(binarta.shop.checkout.context().order.items).toEqual(JSON.parse(JSON.stringify(binarta.shop.basket.toOrder().items)));
                            expect(binarta.shop.checkout.context().order.quantity).toEqual(JSON.parse(JSON.stringify(binarta.shop.basket.toOrder().quantity)));
                        });

                        it('then checkout status is set to the first step', function () {
                            expect(binarta.shop.checkout.status()).toEqual('authentication-required');
                        });

                        it('then roadmap is set', function () {
                            expect(binarta.shop.checkout.roadmap().map(function (it) {
                                return it.name;
                            })).toEqual([
                                'address-selection',
                                'summary',
                                'completed'
                            ]);
                        });

                        it('then the user is redirected to the checkout page', function () {
                            expect($location.path()).toEqual('/checkout/start');
                        });
                    });

                    it('checkout will cancel an existing checkout', function () {
                        binarta.shop.checkout.start({}, ['summary', 'completed']);
                        ctrl.checkout();
                        expect(binarta.shop.checkout.status()).toEqual('authentication-required');
                    });

                    it('$onInit installs a basket event listener', function () {
                        expect(binarta.shop.basket.eventRegistry.isEmpty()).toBeFalsy();
                    });

                    it('$onDestroy will remove basket event listener', function () {
                        ctrl.$onDestroy();
                        expect(binarta.shop.basket.eventRegistry.isEmpty()).toBeTruthy();
                    });
                });

                [
                    'link',
                    'minimal-link'
                ].forEach(function (mode) {
                    describe('in ' + mode + ' mode', function () {
                        beforeEach(function () {
                            ctrl.mode = mode;
                            binarta.shop.basket.add({
                                item: {id: 'i', price: 100, quantity: 1}
                            });
                            ctrl.$onInit();
                        });

                        it('preview exposes the order from the basket', function () {
                            expect(ctrl.preview.items[0].id).toEqual('i');
                        });

                        it('increment item quantity', function () {
                            ctrl.preview.items[0].incrementQuantity();
                            ctrl.preview.items[0].incrementQuantity();
                            expect(ctrl.preview.quantity).toEqual(3);
                            expect(binarta.shop.basket.toOrder().quantity).toEqual(3);
                        });

                        it('decrement item quantity', function () {
                            ctrl.preview.items[0].incrementQuantity();
                            ctrl.preview.items[0].incrementQuantity();

                            ctrl.preview.items[0].decrementQuantity();
                            expect(ctrl.preview.quantity).toEqual(2);
                            expect(binarta.shop.basket.toOrder().quantity).toEqual(2);

                            ctrl.preview.items[0].decrementQuantity();
                            expect(ctrl.preview.quantity).toEqual(1);
                            expect(binarta.shop.basket.toOrder().quantity).toEqual(1);
                        });

                        it('update to a specific quantity', function () {
                            ctrl.preview.items[0].quantity = 10;

                            ctrl.preview.items[0].update();

                            expect(ctrl.preview.quantity).toEqual(10);
                            expect(binarta.shop.basket.toOrder().quantity).toEqual(10);
                        });

                        it('remove an item from the basket', function () {
                            ctrl.preview.items[0].remove();

                            expect(ctrl.preview.quantity).toEqual(0);
                            expect(binarta.shop.basket.toOrder().items.length).toEqual(0);
                        });

                        it('when basket is cleared previewed contents are updated', function () {
                            binarta.shop.basket.clear();
                            expect(ctrl.preview.quantity).toEqual(0);
                        });

                        it('$onInit installs a basket event listener', function () {
                            expect(binarta.shop.basket.eventRegistry.isEmpty()).toBeFalsy();
                        });

                        it('$onDestroy will remove basket event listener', function () {
                            ctrl.$onDestroy();
                            expect(binarta.shop.basket.eventRegistry.isEmpty()).toBeTruthy();
                        });
                    });
                });

                describe('in add-to-basket-button mode', function () {
                    beforeEach(function () {
                        ctrl.mode = 'add-to-basket-button';
                        ctrl.$onInit();
                    });

                    // it('$onInit does not install a basket event listener', function () {
                    //     expect(binarta.shop.basket.eventRegistry.isEmpty()).toBeTruthy();
                    // });

                    describe('when adding an item to the basket', function () {
                        var ctrl2;

                        beforeEach(inject(function ($controller) {
                            ctrl2 = $controller('BinartaBasketController');
                            ctrl2.mode = 'detailed';
                            ctrl2.$onInit();
                        }));

                        beforeEach(function () {
                            ctrl.item = {id: 'i', price: 100};
                            ctrl.addToBasket();
                        });

                        it('the item is added to the basket', function () {
                            expect(binarta.shop.basket.toOrder().quantity).toEqual(1);
                        });

                        it('other basket controllers reflect the addition', function () {
                            expect(ctrl2.preview.quantity).toEqual(1);
                        });

                        it('then expose item added flag', function() {
                            expect(ctrl.itemAdded).toBeTruthy();
                        });

                        it('when flushing timeout then item added flag is reset', inject(function($timeout) {
                            $timeout.flush();
                            expect(ctrl.itemAdded).toBeFalsy();
                        }));
                    });
                });
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
                    ctrl.onSelect = jasmine.createSpy('on-select');
                }));

                it('mode defaults to display', function () {
                    expect(ctrl.mode).toEqual('display');
                });

                it('expose profile status', function () {
                    expect(ctrl.profileStatus()).toEqual('idle');
                });

                it('expose address status', function () {
                    expect(ctrl.addressStatus()).toEqual('awaiting-selection');
                });

                it('expose all addresses', function () {
                    expect(ctrl.addresses().map(function (it) {
                        return it.label;
                    })).toEqual(['home']);
                });

                it('when selecting an address then the selection listener is triggered', function () {
                    ctrl.select('home');
                    expect(ctrl.onSelect.calls.argsFor(0)[0].label).toEqual('home');
                });

                it('when an undefined initial address is specified', function () {
                    ctrl.initialAddress = undefined;
                    ctrl.$onInit();
                    expect(ctrl.onSelect).not.toHaveBeenCalled();
                });

                it('when a known initial address is specified', function () {
                    ctrl.initialAddress = {label: 'home'};
                    ctrl.$onInit();
                    expect(ctrl.onSelect.calls.argsFor(0)[0].label).toEqual('home');
                });

                it('when the initial address matches the default then changes to the default change the selection', function () {
                    ctrl.default = {label: 'home'};
                    ctrl.initialAddress = {label: 'home'};
                    ctrl.$onInit();
                    ctrl.$onChanges({default: {currentValue: {label: 'work'}}});
                    expect(ctrl.label).toEqual('work');
                });

                it('when the initial address does not match the default then changes to the default are ignored', function () {
                    ctrl.default = {label: 'work'};
                    ctrl.initialAddress = {label: 'home'};
                    ctrl.$onInit();
                    ctrl.$onChanges({default: {currentValue: {label: 'work'}}});
                    expect(ctrl.label).toEqual('home');
                });

                describe('when a specific address is selected', function () {
                    beforeEach(function () {
                        ctrl.select('home');
                    });

                    it('expose address status', function () {
                        expect(ctrl.addressStatus()).toEqual('idle');
                    });

                    it('expose attributes', function () {
                        expect(ctrl.addressee()).toEqual('John Doe');
                        expect(ctrl.street()).toEqual('Johny Lane');
                        expect(ctrl.number()).toEqual('1');
                        expect(ctrl.zip()).toEqual('1000');
                        expect(ctrl.city()).toEqual('Johnyville');
                        expect(ctrl.country()).toEqual('BE');
                    });

                    it('expose countries', function () {
                        expect(ctrl.countries().length > 0).toBeTruthy();
                    });

                    describe('when in edit mode', function () {
                        beforeEach(function () {
                            ctrl.edit();
                        });

                        it('expose updated status', function () {
                            expect(ctrl.addressStatus()).toEqual('editing');
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

                        it('regenerate the address label on update', function () {
                            ctrl.generateLabel = true;

                            ctrl.update();

                            expect(ctrl.form.label).toEqual('(1000) Johny Lane 1');
                            expect(ctrl.addressee()).toEqual('John Doe');
                        });

                        it('cancel editing', function () {
                            ctrl.cancel();
                            expect(ctrl.addressStatus()).toEqual('idle');
                        });
                    });
                });

                describe('when specifying a default address', function () {
                    beforeEach(function () {
                        ctrl.default = {label: 'home'};
                        ctrl.$onInit();
                    });

                    it('then the corresponding address is selected', function () {
                        expect(ctrl.label).toEqual('home');
                    });

                    it('then the selection listener is triggered', function () {
                        expect(ctrl.onSelect.calls.argsFor(0)[0].label).toEqual('home');
                    });

                    it('when the default address is changed then the selected address also changes', function () {
                        ctrl.$onChanges({default: {currentValue: {label: 'work'}}});
                        expect(ctrl.label).toEqual('work');
                    });

                    it('when something other than the default address is changed then the selected address remains as is', function () {
                        ctrl.$onChanges({purpose: {currentValue: '-'}});
                        expect(ctrl.label).toEqual('home');
                    });

                    it('when selecting null then fallback to default label', function () {
                        ctrl.select(null);
                        expect(ctrl.label).toEqual('home');
                    });

                    it('when a selection is made changes to the default address are ignored', function () {
                        ctrl.select('neighbour');
                        ctrl.$onChanges({default: {currentValue: {label: 'work'}}});
                        expect(ctrl.label).toEqual('neighbour');
                    });
                });

                it('cancel new address has no effect when profile is in editing mode but this controller did not cause it', function () {
                    binarta.checkpoint.profile.edit();
                    ctrl.cancelNewAddress();
                    expect(ctrl.profileStatus()).toEqual('editing');
                });

                describe('when entering create a new address mode', function () {
                    beforeEach(function () {
                        ctrl.$onInit();
                        ctrl.new();
                    });

                    it('then profile status changes to editing', function () {
                        expect(ctrl.profileStatus()).toEqual('editing');
                    });

                    it('then expose profile update request', function () {
                        expect(ctrl.form).toEqual(binarta.checkpoint.profile.updateRequest().address);
                    });

                    describe('when creating a new address', function() {
                        var ctrl2;

                        beforeEach(inject(function($controller) {
                            ctrl2 = $controller('BinartaAddressController');
                            ctrl2.$onInit();

                            ctrl.form.label = 'work';
                            ctrl.form.addressee = 'John Doe';
                            ctrl.form.street = 'Johny Lane';
                            ctrl.form.number = '1';
                            ctrl.form.zip = '1000';
                            ctrl.form.city = 'Johnyville';
                            ctrl.form.country = 'BE';

                            ctrl.create();
                        }));

                        it('then the address is added to the profile', function() {
                            expect(binarta.checkpoint.profile.addresses().map(function (it) {
                                return it.label
                            })).toEqual(['home', 'work']);
                        });

                        it('then the newly created address is selected', function() {
                            expect(ctrl.label).toEqual('work');
                        });
                    });

                    it('when create address is rejected then expose the violation report', function () {
                        ctrl.form.label = 'invalid';
                        ctrl.create();
                        expect(ctrl.violationReport()).toEqual({label: ['invalid']});
                    });

                    it('then it can be canceled', function () {
                        ctrl.cancelNewAddress();
                        expect(ctrl.profileStatus()).toEqual('idle');
                    });
                });
            });

            describe('PaymentMethodsController', function () {
                var $ctrl;

                beforeEach(inject(function ($controller) {
                    $ctrl = $controller('BinartaPaymentMethodsController');
                    $ctrl.onSelect = jasmine.createSpy('on-select');
                }));

                it('exposes available payment methods', function () {
                    binarta.application.profile().availablePaymentMethods = 'available-payment-methods';
                    expect($ctrl.availablePaymentMethods()).toEqual('available-payment-methods');
                });

                it('initially no payment method is selected', function () {
                    expect($ctrl.onSelect).not.toHaveBeenCalled();
                });

                it('selecting a payment method', function () {
                    $ctrl.paymentProvider = 'payment-method';
                    $ctrl.select();
                    expect($ctrl.onSelect).toHaveBeenCalledWith('payment-method');
                });

                it('specify a default payment method', function () {
                    $ctrl.default = 'payment-method';
                    $ctrl.$onInit();
                    expect($ctrl.onSelect).toHaveBeenCalledWith('payment-method');
                });
            });

            describe('PaymentController', function () {
                var $ctrl;

                beforeEach(inject(function ($controller) {
                    $ctrl = $controller('BinartaPaymentController');
                    $ctrl.onConfirmed = jasmine.createSpy('on-confirmed');
                    $ctrl.onCanceled = jasmine.createSpy('on-canceled');
                }));

                describe('given an order with approval url when controller is initialised', function() {
                    beforeEach(inject(function($timeout) {
                        $ctrl.order = {approvalUrl: 'approval-url'};
                        $ctrl.$onInit();
                        $timeout.flush();
                    }));

                    it('then visit approval url', inject(function ($window) {
                        expect($window.location).toEqual('approval-url');
                    }));

                    it('then on confirmed listener is not yet invoked', function () {
                        expect($ctrl.onConfirmed).not.toHaveBeenCalled();
                    });

                    describe('and reinitialised', function() {
                        beforeEach(inject(function($window) {
                            $window.location = undefined;
                            $ctrl.$onInit();
                        }));

                        it('then the payment is canceled', function() {
                            expect($ctrl.onCanceled).toHaveBeenCalled();
                        });

                        it('then the user is not redirected to the approval url', inject(function($timeout) {
                            $timeout.verifyNoPendingTasks();
                        }));

                        it('and reinitialised again then visit the approval url', inject(function($timeout, $window) {
                            $ctrl.$onInit();
                            $timeout.flush();
                            expect($window.location).toEqual('approval-url');
                        }));
                    });
                });

                it('given a token as route parameter when controller is initialised then confirm payment', inject(function ($routeParams) {
                    $routeParams.token = 't';
                    $ctrl.$onInit();
                    expect($ctrl.onConfirmed).toHaveBeenCalledWith({token: 't'});
                }));
            })
        });
    });

    installBackendStrategy('inmem');
    angular.module('binartajs-angular1-spec', [
        'binarta-applicationjs-angular1',
        'binarta-checkpointjs-angular1',
        'binarta-shopjs-angular1'
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
        angular.module('binarta-applicationjs-gateways-angular1', ['binarta-applicationjs-' + strategy + '-angular1'])
            .provider('binartaApplicationGateway', [strategy + 'BinartaApplicationGatewayProvider', proxy]);
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