(function () {
    angular.module('binarta-shopjs-angular1', [
        'ngRoute',
        'binartajs-angular1',
        'binarta-shopjs-gateways-angular1',
        'binarta-checkpointjs-angular1',
        'binarta-applicationjs-angular1',
        'binarta-checkpointjs-recaptcha-angular1',
        'binarta-shopjs-tpls-angular1'
    ])
        .provider('shop', ['binartaShopGatewayProvider', 'checkpointProvider', 'applicationProvider', ShopProvider])
        .component('binBasket', new BasketComponent())
        .component('binAddress', new AddressComponent())
        .component('binPaymentMethods', new PaymentMethodsComponent())
        .controller('BinartaPaymentMethodsController', ['binarta', PaymentMethodsController])
        .service('CheckoutController.decorator', CheckoutControllerDecorator)
        .controller('CheckoutController', ['binarta', 'CheckoutController.decorator', 'i18nLocation', '$location', '$scope', CheckoutController])
        .component('binCheckoutHeader', new CheckoutHeaderComponent())
        .component('binCheckoutRoadmap', new CheckoutRoadmapComponent())
        .controller('CheckoutRoadmapController', ['binarta', CheckoutRoadmapController])
        .component('binPay', new PaymentComponent())
        .controller('BinartaPaymentController', ['binarta', '$window', '$routeParams', '$timeout', 'sessionStorage', 'resourceLoader', 'applicationBrand', PaymentController])
        .component('binSetupPaymentProvider', new SetupPaymentProviderComponent())
        .controller('SetupPaymentProviderController', ['binarta', '$location', 'sessionStorage', SetupPaymentProviderController])
        .controller('SetupBillingAgreementController', ['binarta', SetupBillingAgreementController])
        .controller('CancelBillingAgreementController', ['binarta', CancelBillingAgreementController])
        .controller('ConfirmBillingAgreementController', ['binarta', '$location', ConfirmBillingAgreementController])
        .component('binCoupon', new CouponComponent())
        .component('binStripeConnect', new StripeConnectComponent())
        .component('binPaymentOnReceiptConfig', new PaymentOnReceiptConfigComponent())
        .component('binCcConfig', new CreditCardConfigComponent())
        .component('binBancontactConfig', new BancontactConfigComponent())
        .component('binDeliveryMethods', new DeliveryMethodsComponent())
        .config(['binartaProvider', 'shopProvider', ExtendBinarta])
        .config(['$routeProvider', InstallRoutes])
        .run(['shop', WireAngularDependencies])
        .run(['binarta', 'CheckoutController.decorator', '$location', InstallCheckpointListener])
        .run(['binarta', 'CheckoutController.decorator', InstallAddressSelectionSupport])
        .run(['binarta', 'CheckoutController.decorator', InstallSummarySupport])
        .run(['binarta', 'CheckoutController.decorator', '$location', InstallPaymentProviderSetupSupport])
        .run(['binarta', 'CheckoutController.decorator', '$location', InstallPaymentSupport])
        .run(['binarta', 'UserProfileController.decorator', InstallProfileExtensions])
        .run(['binartaIsInitialised', 'shop', InitCaches]);

    function ShopProvider(gatewayProvider, checkpointProvider, applicationProvider) {
        this.shop = new BinartaShopjs(checkpointProvider.checkpoint, {application: applicationProvider.application});
        this.shop.gateway = gatewayProvider.gateway;
        this.ui = new UI();
        this.$get = ['$window', '$location', 'localStorage', 'sessionStorage', function ($window, $location, localStorage, sessionStorage) {
            this.shop.localStorage = localStorage;
            this.shop.sessionStorage = sessionStorage;
            this.ui.window = $window;
            this.ui.location = $location;
            this.ui.sessionStorage = sessionStorage;
            return this.shop;
        }];
    }

    function BasketComponent() {
        this.bindings = {
            order: '<',
            item: '<',
            mode: '@'
        };
        this.templateUrl = 'bin-shop-basket.html';
        this.controller = ['binarta', 'viewport', 'i18nLocation', '$timeout', '$scope', function BinartaBasketController(binarta, viewport, $location, $timeout, $scope) {
            var profileEventListener = new ProfileEventListener();
            var basketEventListener = new BasketEventListener();
            var paymentMethodChangeListener = new PaymentMethodChangeListener();
            var self = this, status = 'idle';

            this.viewport = viewport;
            this.quantity = 1;

            function isSummary() {
                return self.mode === 'summary';
            }

            this.$onInit = function () {
                if (['summary', 'detailed', 'link', 'minimal-link', 'add-to-basket-button', 'dropdown-link'].indexOf(self.mode) > -1) {
                    if (isSummary()) {
                        binarta.checkpoint.profile.eventRegistry.add(profileEventListener);
                        binarta.shop.checkout.eventRegistry.add(paymentMethodChangeListener);
                        refreshFromPreview();
                    }
                    if (['detailed', 'link', 'minimal-link', 'add-to-basket-button', 'dropdown-link'].indexOf(self.mode) > -1) {
                        binarta.shop.basket.eventRegistry.add(basketEventListener);
                        refreshFromBasket();
                    }
                    if (this.mode === 'dropdown-link') {
                        this.onDropdownClick = function () {
                            this.isDropdownActive = !this.isDropdownActive;
                        };
                        this.onCloseDropdownClick = function () {
                            this.isDropdownActive = false;
                        };
                        $scope.$on("$routeChangeStart", function () {
                            self.isDropdownActive = false;
                        });
                    }
                }
            };

            this.$onChanges = function () {
                if (isSummary())
                    refreshFromPreview();
            };

            this.$onDestroy = function () {
                binarta.checkpoint.profile.eventRegistry.remove(profileEventListener);
                binarta.shop.basket.eventRegistry.remove(basketEventListener);
                if (isSummary()) {
                    binarta.shop.checkout.eventRegistry.remove(paymentMethodChangeListener);
                }
            };

            this.isDiscounted = function () {
                return self.preview && self.preview.coupon;
            };

            this.addToBasket = function () {
                status = 'adding';
                binarta.shop.basket.add({item: {id: self.item.id, price: self.item.price, quantity: self.quantity}});
            };

            this.checkout = function () {
                binarta.shop.checkout.cancel();
                var order = binarta.shop.basket.toOrder();
                order.clearBasketOnComplete = true;
                binarta.shop.checkout.start(order, [
                    'authentication-required',
                    'address-selection',
                    'summary',
                    'setup-payment-provider',
                    'payment',
                    'completed'
                ]);
                $location.path('/checkout/start');
            };

            function BasketEventListener() {
                this.itemAdded = function () {
                    if (self.mode == 'add-to-basket-button' && status == 'adding') {
                        status = 'idle';
                        self.itemAdded = true;
                        $timeout(function () {
                            self.itemAdded = false
                        }, 1000);
                    }
                    refreshFromBasket();
                };
                this.itemUpdated = refreshFromBasket;
                this.itemRemoved = refreshFromBasket;
                this.cleared = refreshFromBasket;
            }

            function ProfileEventListener() {
                this.updated = refreshFromPreview;
            }

            function PaymentMethodChangeListener() {
                this.onPaymentMethodChange = function(provider) {
                    self.order.provider = provider;
                    refreshFromPreview();
                }
            }

            function refreshFromBasket() {
                self.preview = binarta.shop.basket.toOrder();
            }

            function refreshFromPreview() {
                binarta.shop.previewOrder(self.order, function (order) {
                    self.preview = order;
                });
            }
        }];
    }

    function AddressComponent() {
        this.bindings = {
            mode: '@',
            purpose: '@',
            onSelect: '<',
            default: '<',
            label: '@',
            generateLabel: '@',
            initialAddress: '<'
        };
        this.templateUrl = 'bin-shop-address.html';
        this.controller = ['binarta', binComponentController(function (binarta) {
            var $ctrl = this;

            this.mode = 'display';

            $ctrl.addInitHandler(function () {
                $ctrl.addDestroyHandler(binarta.checkpoint.profile.eventRegistry.observe(new ProfileEventListener($ctrl)).disconnect);
                $ctrl.addDestroyHandler(binarta.shop.deliveryMethods.observe({
                    activeDeliveryMethod: function (it) {
                        $ctrl.status = $ctrl.purpose == 'shipping' && it == 'collect' ? 'disabled' : 'enabled';
                    }
                }));

                if ($ctrl.default && $ctrl.default.label)
                    $ctrl.select($ctrl.default.label);
                if ($ctrl.initialAddress)
                    $ctrl.select($ctrl.initialAddress.label);
            });

            this.$onChanges = function (args) {
                if (!$ctrl.divergedFromDefault && args.default && args.default.currentValue)
                    $ctrl.select(args.default.currentValue.label);
            };

            this.select = function (label) {
                if ($ctrl.default && $ctrl.default.label != label)
                    $ctrl.divergedFromDefault = true;
                $ctrl.label = label || $ctrl.default.label;
                if ($ctrl.onSelect)
                    $ctrl.onSelect(address());
            };

            this.profileStatus = function () {
                return binarta.checkpoint.profile.status();
            };

            this.addressStatus = function () {
                return $ctrl.label ? address().status() : 'awaiting-selection';
            };

            this.new = function () {
                binarta.checkpoint.profile.edit();
                $ctrl.form = binarta.checkpoint.profile.updateRequest().address;
                $ctrl.creatingAddress = true;
            };

            this.isCreatingAddress = function () {
                return $ctrl.creatingAddress && ($ctrl.addressStatus() == 'idle' || $ctrl.addressStatus() == 'awaiting-selection') && ($ctrl.profileStatus() == 'editing' || $ctrl.profileStatus() == 'working');
            };

            this.create = function () {
                $ctrl.awaitingAddressCreation = true;
                binarta.checkpoint.profile.update();
            };

            this.cancelNewAddress = function () {
                if ($ctrl.creatingAddress) {
                    binarta.checkpoint.profile.cancel();
                    $ctrl.creatingAddress = false;
                }
            };

            this.violationReport = function () {
                return binarta.checkpoint.profile.violationReport().address;
            };

            this.edit = function () {
                address().edit();
                $ctrl.form = address().updateRequest();
                $ctrl.editingAddress = true;
            };

            this.isSelectingAddress = function () {
                return ($ctrl.addressStatus() == 'idle' || $ctrl.addressStatus() == 'awaiting-selection' || !$ctrl.editingAddress) && ($ctrl.profileStatus() == 'idle' || !$ctrl.creatingAddress);
            };

            this.isEditingAddress = function () {
                return $ctrl.editingAddress && ($ctrl.addressStatus() == 'editing' || $ctrl.addressStatus() == 'working');
            };

            this.update = function () {
                if ($ctrl.generateLabel)
                    $ctrl.form.generateLabel = true;
                address().update(function () {
                    $ctrl.editingAddress = false;
                    $ctrl.select($ctrl.form.label);
                });
            };

            this.cancel = function () {
                address().cancel();
            };

            this.addresses = function () {
                return binarta.checkpoint.profile.addresses();
            };

            this.countries = function () {
                return binarta.checkpoint.profile.supportedCountries();
            };

            this.addressee = function () {
                return address().addressee;
            };

            this.street = function () {
                return address().street;
            };

            this.number = function () {
                return address().number;
            };

            this.zip = function () {
                return address().zip;
            };

            this.city = function () {
                return address().city;
            };

            this.country = function () {
                return address().country;
            };

            function address() {
                return binarta.checkpoint.profile.addresses().reduce(function (p, c) {
                    if (c.label == $ctrl.label)
                        return c;
                    return p;
                }, {
                    status: function () {
                        return 'awaiting-selection';
                    }
                });
            }

            function ProfileEventListener($ctrl) {
                this.updated = function () {
                    if ($ctrl.awaitingAddressCreation) {
                        $ctrl.select($ctrl.form.label);
                        $ctrl.creatingAddress = false;
                        $ctrl.awaitingAddressCreation = false;
                    }
                }
            }
        })];
    }

    function PaymentMethodsComponent() {
        this.bindings = {
            onSelect: '<',
            default: '<',
            violations: '<'
        };
        this.controller = 'BinartaPaymentMethodsController';
        this.templateUrl = 'bin-shop-payment-methods.html';
    }

    function PaymentMethodsController(binarta) {
        var $ctrl = this;

        $ctrl.$onInit = function () {
            if ($ctrl.default) {
                $ctrl.paymentProvider = $ctrl.default;
                $ctrl.select();
            }
        };

        $ctrl.availablePaymentMethods = function () {
            return binarta.application.profile().availablePaymentMethods;
        };

        $ctrl.select = function () {
            $ctrl.onSelect($ctrl.paymentProvider);
        }
    }

    function CheckoutControllerDecorator() {
        var decorators = [];

        this.add = function (it) {
            decorators.push(it);
        };

        this.decorate = function (ctrl) {
            decorators.forEach(function (it) {
                it(ctrl);
            });
        }
    }

    function CheckoutController(binarta, decorator, i18nLocation, $location, $scope) {
        var self = this;
        var cache = {};
        var eventListener = new EventListener(i18nLocation);
        decorator.decorate(self);

        this.$onInit = function () {
            binarta.shop.checkout.eventRegistry.add(eventListener);
            try {
                var p = /.*\/checkout\/([\w-]+)/.exec($location.path());
                if (p)
                    binarta.shop.checkout.jumpTo(p[1]);
            } catch (ignored) {
            }
        };
        this.$onDestroy = function () {
            binarta.shop.checkout.eventRegistry.remove(eventListener);
        };
        $scope.$on('$destroy', self.$onDestroy);

        this.start = function (replace) {
            if (self.status() != 'idle')
                i18nLocation.url('/checkout/' + self.status());
            if (replace)
                $location.replace();
        };

        this.status = binarta.shop.checkout.status;

        this.order = function () {
            if (!cache.order)
                cache.order = binarta.shop.checkout.context().order;
            return cache.order;
        };

        this.hasPreviousStep = binarta.shop.checkout.hasPreviousStep;
        this.previousStep = binarta.shop.checkout.previousStep;

        function EventListener($location) {
            this.goto = function (step) {
                $location.path('/checkout/' + self.status());
            };

            this.setCouponCode = function (code) {
                cache = {};
            }
        }
    }

    function CheckoutHeaderComponent() {
        this.bindings = {
            subTitleKey: '@'
        };
        this.templateUrl = 'bin-shop-checkout-header.html'
    }

    function CheckoutRoadmapComponent() {
        this.controller = 'CheckoutRoadmapController';
        this.templateUrl = 'bin-shop-checkout-roadmap.html';
    }

    function CheckoutRoadmapController(binarta) {
        var self = this;

        this.$onInit = function () {
            self.roadmap = binarta.shop.checkout.roadmap();
            self.currentStep = binarta.shop.checkout.status();
        }
    }

    function PaymentComponent() {
        this.bindings = {
            provider: '@',
            order: '<',
            onConfirmed: '<',
            onCanceled: '<'
        };
        this.controller = 'BinartaPaymentController';
        this.templateUrl = 'bin-shop-payment.html';
    }

    function PaymentController(binarta, $window, $routeParams, $timeout, sessionStorage, resourceLoader, brand) {
        var $ctrl = this;
        var dialog, observer, stripe, card;

        $ctrl.$onInit = function () {
            $ctrl.providerTemplate = 'bin-shop-payment-' + $ctrl.provider + '.html';
            $ctrl.validationReport = {};
            if ($routeParams.token || $routeParams.id) {
                sessionStorage.removeItem('binartaJSAwaitingConfirmationWithPaymentProvider');
                $ctrl.onConfirmed($routeParams);
            }
            else if ($ctrl.order) {
                var approvalUrl = $ctrl.order.signingContext ? $ctrl.order.signingContext.approvalUrl : undefined;
                if (approvalUrl) {
                    if (sessionStorage.binartaJSAwaitingConfirmationWithPaymentProvider) {
                        sessionStorage.removeItem('binartaJSAwaitingConfirmationWithPaymentProvider');
                        $ctrl.onCanceled();
                    } else
                        $timeout(function () {
                            sessionStorage.setItem('binartaJSAwaitingConfirmationWithPaymentProvider', 'yes');
                            $window.location = approvalUrl;
                        }, 3000);
                }
            }
        };

        $ctrl.$onDestroy = function () {
            if (dialog)
                dialog.close();
            if (observer)
                observer.disconnect()
        };

        $ctrl.open = function () {
            function doOpen() {
                resourceLoader.getScript('https://js.stripe.com/v3').then(function () {
                    $ctrl.cardHolderName = $ctrl.order.billing.addressee;
                    stripe = Stripe($ctrl.order.signingContext.apiKey, {
                        stripeAccount: $ctrl.order.signingContext.accountId,
                        locale: $ctrl.order.signingContext.locale
                    });
                    card = stripe.elements().create('card', {hidePostalCode: true});
                    card.mount('#card-element');
                });
            }

            if (binarta.checkpoint.profile.isAuthenticated())
                doOpen();
            else
                observer = binarta.checkpoint.profile.eventRegistry.observe({signedin: doOpen});
        };

        $ctrl.pay = function () {
            $ctrl.validationReport = {};
            stripe.handleCardPayment($ctrl.order.signingContext.clientSecret, card, {
                payment_method_data: {
                    billing_details: {
                        name: $ctrl.cardHolderName,
                        email: binarta.checkpoint.profile.email(),
                        address: {
                            line1: $ctrl.order.billing.street + ' ' + $ctrl.order.billing.number,
                            postal_code: $ctrl.order.billing.zip,
                            city: $ctrl.order.billing.city,
                            country: $ctrl.order.billing.country
                        }
                    }
                }
            }).then(function (result) {
                if (result.error) {
                    $timeout(function () {
                        $ctrl.validationReport = {
                            payment: [
                                {description: result.error.message}
                            ]
                        };
                    });
                } else {
                    result.id = $ctrl.order.signingContext.payment;
                    result.token = result.paymentIntent.id;
                    $ctrl.onConfirmed(result);
                }
            });
        };

        $ctrl.cancel = function() {
            sessionStorage.removeItem('binartaJSAwaitingConfirmationWithPaymentProvider');
            $ctrl.onCanceled();
        }
    }

    function SetupPaymentProviderComponent() {
        this.bindings = {
            provider: '@',
            method: '@',
            onConfirmed: '<'
        };
        this.controller = 'SetupPaymentProviderController';
        this.templateUrl = 'bin-shop-setup-payment-provider.html';
    }

    function SetupPaymentProviderController(binarta, $location, sessionStorage) {
        var self = this;

        this.$onInit = function () {
            if (binarta.checkpoint.profile.billing.isComplete()) {
                self.onConfirmed();
            } else {
                sessionStorage.setItem('binartaJSSetupBillingAgreementReturnUrl', $location.path());
                binarta.checkpoint.profile.billing.initiate(self.provider);
            }
        }
    }

    function SetupBillingAgreementController(binarta) {
        this.status = binarta.checkpoint.profile.billing.isComplete() ? 'complete' : 'incomplete';

        this.submit = function () {
            this.status = 'working';
            binarta.checkpoint.profile.billing.initiate(this.paymentProvider);
        }
    }

    function CancelBillingAgreementController(binarta) {
        this.execute = function () {
            binarta.checkpoint.profile.billing.cancel();
        }
    }

    function ConfirmBillingAgreementController(binarta, $location) {
        this.execute = function () {
            binarta.checkpoint.profile.billing.confirm({
                paymentProvider: this.paymentProvider,
                confirmationToken: $location.search().token
            });
        }
    }

    function StripeConnectComponent() {
        this.templateUrl = 'bin-shop-stripe-connect-component.html';
        this.controller = ['binarta', '$window', function (binarta, $window) {
            var $ctrl = this;
            var observer;

            $ctrl.$onInit = function () {
                observer = binarta.shop.stripe.observe({
                    status: function (it) {
                        $ctrl.status = it;
                    },
                    goto: function (it) {
                        $window.location = it;
                    },
                    connected: function (it) {
                        $ctrl.id = it;
                    }
                });
            };

            $ctrl.$onDestroy = function () {
                observer.disconnect();
            };

            $ctrl.connect = binarta.shop.stripe.connect;
            $ctrl.disconnect = binarta.shop.stripe.disconnect;
        }];
    }

    function PaymentOnReceiptConfigComponent() {
        this.templateUrl = 'bin-shop-payment-on-receipt-config-component.html';
        this.controller = ['binarta', binComponentController(function (binarta) {
            var $ctrl = this;

            $ctrl.addInitHandler(function () {
                $ctrl.addDestroyHandler(binarta.shop.paymentOnReceipt.observe({
                    status: function (it) {
                        $ctrl.status = it;
                    },
                    params: function (it) {
                        $ctrl.params = it;
                    }
                }).disconnect);
            });

            $ctrl.configure = function () {
                binarta.shop.paymentOnReceipt.configure($ctrl.params);
            };

            $ctrl.disable = function () {
                binarta.shop.paymentOnReceipt.disable();
            }
        })];
    }

    function CreditCardConfigComponent() {
        this.templateUrl = 'bin-shop-cc-config-component.html';
        this.controller = ['binarta', function (binarta) {
            var $ctrl = this;

            $ctrl.$onInit = function () {
                observer = binarta.shop.cc.observe({
                    status: function (it) {
                        $ctrl.status = it;
                    },
                    params: function (it) {
                        $ctrl.params = it;
                    },
                    rejected: function (it) {
                        $ctrl.violationReport = it;
                    }
                });
            };

            $ctrl.$onDestroy = function () {
                observer.disconnect();
            };

            $ctrl.configure = function () {
                $ctrl.violationReport = undefined;
                binarta.shop.cc.configure($ctrl.params);
            };

            $ctrl.disable = function () {
                $ctrl.violationReport = undefined;
                binarta.shop.cc.disable();
            }
        }];
    }

    function BancontactConfigComponent() {
        this.templateUrl = 'bin-shop-bancontact-config-component.html';
        this.controller = ['binarta', function (binarta) {
            var $ctrl = this;

            $ctrl.$onInit = function () {
                observer = binarta.shop.bancontact.observe({
                    status: function (it) {
                        $ctrl.status = it;
                    },
                    params: function (it) {
                        $ctrl.params = it;
                    },
                    rejected: function (it) {
                        $ctrl.violationReport = it;
                    }
                });
            };

            $ctrl.$onDestroy = function () {
                observer.disconnect();
            };

            $ctrl.configure = function () {
                $ctrl.violationReport = undefined;
                binarta.shop.bancontact.configure($ctrl.params);
            };

            $ctrl.disable = function () {
                $ctrl.violationReport = undefined;
                binarta.shop.bancontact.disable();
            }
        }];
    }

    function DeliveryMethodsComponent() {
        this.templateUrl = 'bin-shop-delivery-methods-component.html';
        this.controller = ['binarta', binComponentController(function (binarta) {
            var $ctrl = this;

            $ctrl.addInitHandler(function () {
                $ctrl.addDestroyHandler(binarta.shop.deliveryMethods.observe({
                    status: function (it) {
                        $ctrl.status = it;
                    },
                    supportedDeliveryMethods: function (it) {
                        $ctrl.supportedMethods = it;
                    },
                    activeDeliveryMethod: function (it) {
                        $ctrl.activeMethod = it;
                    }
                }).disconnect);
            });

            $ctrl.activate = function () {
                binarta.shop.deliveryMethods.activate($ctrl.activeMethod);
            };
        })];
    }

    function CouponComponent() {
        this.bindings = {
            verification: '@',
            required: '@'
        };
        this.controller = ['binarta', function (binarta) {
            var $ctrl = this;

            $ctrl.isRequired = function () {
                if ($ctrl.required)
                    return true;
                var reqs = binarta.application.profile().purchaseOrderRequirements;
                return reqs ? reqs.some(function (it) {
                    return it.name == 'coupon';
                }) : false;
            };

            $ctrl.verify = function () {
                $ctrl.resetCouponValidation();
                binarta.shop.couponDictionary.contains($ctrl.couponCode, {
                    success: function () {
                        $ctrl.couponValid = true;
                        binarta.shop.checkout.setCouponCode($ctrl.couponCode);
                    },
                    notFound: function () {
                        $ctrl.couponInvalid = true;
                    }
                });
            };

            $ctrl.resetCouponValidation = function () {
                $ctrl.couponValid = false;
                $ctrl.couponInvalid = false;
                if ($ctrl.isVerificationDisabled())
                    binarta.shop.checkout.setCouponCode($ctrl.couponCode);
            };

            $ctrl.isVerificationDisabled = function () {
                return $ctrl.verification == 'disabled';
            }
        }];
        this.templateUrl = 'bin-shop-coupon-component.html';
    }

    function UI() {
        var self = this;

        this.approveBillingAgreement = function (args) {
            self.window.location = args.url;
        };

        this.confirmedBillingAgreement = function () {
            var returnUrl = self.sessionStorage.getItem('binartaJSSetupBillingAgreementReturnUrl');
            if (returnUrl)
                self.location.path(returnUrl);
        }
    }

    function ExtendBinarta(binarta, shopProvider) {
        binarta.addSubSystems({shop: shopProvider.shop});
        binarta.ui.approveBillingAgreement = shopProvider.ui.approveBillingAgreement;
        binarta.ui.confirmedBillingAgreement = shopProvider.ui.confirmedBillingAgreement;
    }

    function WireAngularDependencies() {
    }

    function InstallCheckpointListener(binarta, decorator, $location) {
        decorator.add(function (ctrl) {
            ctrl.checkpointListener = new CheckpointListener(binarta, ctrl);
        });

        function CheckpointListener(binarta, ctrl) {
            this.success = function () {
                binarta.shop.checkout.retry();
                ctrl.start();
                $location.replace();
            }
        }
    }

    function InstallAddressSelectionSupport(binarta, decorator) {
        decorator.add(function (ctrl) {
            var isAwaitingSelection = true;
            var order = binarta.shop.checkout.context().order;

            ctrl.addresses = {};
            if (order && order.billing)
                ctrl.addresses.billing = order.billing;
            if (order && order.shipping)
                ctrl.addresses.shipping = order.shipping;

            ctrl.setBillingAddress = function (it) {
                ctrl.addresses.billing = it;
                isAwaitingSelection = false;
            };
            ctrl.setShippingAddress = function (it) {
                ctrl.addresses.shipping = it;
            };
            ctrl.isAwaitingSelection = function () {
                return isAwaitingSelection;
            };
            ctrl.selectAddresses = function () {
                binarta.shop.checkout.selectAddresses(ctrl.addresses);
            };
        });
    }

    function InstallSummarySupport(binarta, decorator) {
        decorator.add(function (ctrl) {
            ctrl.confirm = function () {
                if (ctrl.comment) {
                    var ctx = binarta.shop.checkout.context();
                    ctx.order.comment = ctrl.comment;
                    binarta.shop.checkout.persist(ctx);
                }
                binarta.shop.checkout.confirm(function () {
                    sessionStorage.removeItem('binartaJSAwaitingConfirmationWithPaymentProvider');
                    ctrl.start();
                });
            };

            ctrl.violationReport = function () {
                return binarta.shop.checkout.violationReport();
            };

            ctrl.getPaymentProvider = function () {
                return binarta.shop.checkout.getPaymentProvider();
            };

            ctrl.setPaymentProvider = function (provider) {
                binarta.shop.checkout.setPaymentProvider(provider);
            };
        });
    }

    function InstallPaymentProviderSetupSupport(binarta, decorator, $location) {
        decorator.add(function (ctrl) {
            ctrl.setup = function () {
                binarta.shop.checkout.setup();
            };
            ctrl.retry = function () {
                binarta.shop.checkout.retry(function () {
                    ctrl.start();
                    $location.replace();
                });
            };
        });
    }

    function InstallPaymentSupport(binarta, decorator, $location) {
        decorator.add(function ($ctrl) {
            $ctrl.confirmPayment = function (it) {
                var request = it && it.id ? it : $location.search();
                binarta.shop.checkout.confirm(request, function () {
                    $ctrl.start();
                    $location.search({});
                    $location.replace();
                });
            };

            $ctrl.cancelPayment = function () {
                binarta.shop.checkout.cancelPayment(function () {
                    $ctrl.start();
                });
            }
        });
    }

    function InstallProfileExtensions(binarta, decorator) {
        decorator.add(function (ctrl) {
            ctrl.vat = binarta.checkpoint.profile.billing.vatNumber;
        });
    }

    function InitCaches(binartaIsInitialised, shop) {
        binartaIsInitialised.then(function () {
            shop.basket.refresh();
        });
    }

    function InstallRoutes($routeProvider) {
        $routeProvider
            .when('/basket', {templateUrl: 'bin-shop-basket-details.html'})
            .when('/checkout/start', {
                templateUrl: 'bin-shop-checkout-start.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/checkout/authentication-required', {
                templateUrl: 'bin-shop-checkout-authentication-required.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/checkout/address-selection', {
                templateUrl: 'bin-shop-checkout-address-selection.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/checkout/summary', {
                templateUrl: 'bin-shop-checkout-summary.html',
                controller: 'CheckoutController as $ctrl'
            })
            .when('/checkout/setup-payment-provider', {
                templateUrl: 'bin-shop-checkout-setup-payment-provider.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/checkout/payment', {
                templateUrl: 'bin-shop-checkout-payment.html',
                controller: 'CheckoutController as $ctrl',
                reloadOnSearch: false
            })
            .when('/checkout/completed', {
                templateUrl: 'bin-shop-checkout-completed.html',
                controller: 'CheckoutController as checkout',
                reloadOnSearch: false
            })
            .when('/:locale/basket', {templateUrl: 'bin-shop-basket-details.html'})
            .when('/:locale/checkout/start', {
                templateUrl: 'bin-shop-checkout-start.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/:locale/checkout/authentication-required', {
                templateUrl: 'bin-shop-checkout-authentication-required.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/:locale/checkout/address-selection', {
                templateUrl: 'bin-shop-checkout-address-selection.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/:locale/checkout/summary', {
                templateUrl: 'bin-shop-checkout-summary.html',
                controller: 'CheckoutController as $ctrl'
            })
            .when('/:locale/checkout/setup-payment-provider', {
                templateUrl: 'bin-shop-checkout-setup-payment-provider.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/:locale/checkout/payment', {
                templateUrl: 'bin-shop-checkout-payment.html',
                controller: 'CheckoutController as $ctrl'
            })
            .when('/:locale/checkout/completed', {
                templateUrl: 'bin-shop-checkout-completed.html',
                controller: 'CheckoutController as checkout',
                reloadOnSearch: false
            });
    }
})();