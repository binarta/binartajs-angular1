(function () {
    angular.module('binarta-shopjs-angular1', [
        'ngRoute',
        'binartajs-angular1',
        'binarta-shopjs-gateways-angular1'
    ])
        .provider('shop', ['binartaShopGatewayProvider', 'checkpointProvider', ShopProvider])
        .component('binBasket', new BasketComponent())
        .controller('BinartaBasketController', ['binarta', 'viewport', BinartaBasketController])
        .component('binAddress', new AddressComponent())
        .controller('BinartaAddressController', ['binarta', BinartaAddressController])
        .service('CheckoutController.decorator', CheckoutControllerDecorator)
        .controller('CheckoutController', ['binarta', 'CheckoutController.decorator', 'i18nLocation', '$location', CheckoutController])
        .component('binCheckoutRoadmap', new CheckoutRoadmapComponent())
        .controller('CheckoutRoadmapController', ['binarta', CheckoutRoadmapController])
        .component('binSetupPaymentProvider', new SetupPaymentProviderComponent())
        .controller('SetupPaymentProviderController', ['binarta', '$location', SetupPaymentProviderController])
        .controller('SetupBillingAgreementController', ['binarta', SetupBillingAgreementController])
        .controller('CancelBillingAgreementController', ['binarta', CancelBillingAgreementController])
        .controller('ConfirmBillingAgreementController', ['binarta', '$location', ConfirmBillingAgreementController])
        .config(['binartaProvider', 'shopProvider', ExtendBinarta])
        .config(['$routeProvider', InstallRoutes])
        .run(['shop', WireAngularDependencies])
        .run(['binarta', 'CheckoutController.decorator', '$location', InstallCheckpointListener])
        .run(['binarta', 'CheckoutController.decorator', InstallSummarySupport])
        .run(['binarta', 'CheckoutController.decorator', '$location', InstallPaymentProviderSetupSupport])
        .run(['binarta', 'UserProfileController.decorator', InstallProfileExtensions]);

    function ShopProvider(gatewayProvider, checkpointProvider) {
        this.shop = new BinartaShopjs(checkpointProvider.checkpoint);
        this.shop.gateway = gatewayProvider.gateway;
        this.ui = new UI();
        this.$get = ['$window', '$location', function ($window, $location) {
            this.ui.window = $window;
            this.ui.location = $location;
            return this.shop;
        }]
    }

    function BasketComponent() {
        this.bindings = {
            order: '<',
            mode: '@'
        };
        this.controller = 'BinartaBasketController';
        this.templateUrl = 'bin-shop-basket.html';
    }

    function BinartaBasketController(binarta, viewport) {
        var self = this;
        this.viewport = viewport;

        this.$onInit = function () {
            binarta.shop.previewOrder(this.order, function (order) {
                console.log('preview(' + JSON.stringify(order) + ')');
                self.preview = order;
            })
        }
    }

    function AddressComponent() {
        this.bindings = {
            label: '@'
        };
        this.controller = 'BinartaAddressController';
        this.templateUrl = 'bin-shop-address.html';
    }

    function BinartaAddressController(binarta) {
        var self = this;

        function address() {
            return binarta.checkpoint.profile.addresses().reduce(function (p, c) {
                if (c.label == self.label)
                    return c;
                return p;
            }, {});
        }

        this.status = function() {
            return address().status();
        };

        this.edit = function() {
            address().edit();
            self.form = address().updateRequest();
        };

        this.update = function() {
            address().update();
        };

        this.cancel = function() {
            address().cancel();
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

    function CheckoutController(binarta, decorator, i18nLocation, $location) {
        var self = this;
        var cache = {};
        decorator.decorate(self);

        this.$onInit = function () {
            try {
                var p = /.*\/checkout\/([\w-]+)/.exec($location.path());
                if (p)
                    binarta.shop.checkout.jumpTo(p[1]);
            } catch (ignored) {
            }
        };

        this.start = function (replace) {
            if (self.status() != 'idle')
                i18nLocation.path('/checkout/' + self.status());
            if (replace)
                $location.replace();
        };

        this.status = binarta.shop.checkout.status;

        this.order = function () {
            if (!cache.order)
                cache.order = binarta.shop.checkout.context().order;
            return cache.order;
        };
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

    function SetupPaymentProviderComponent() {
        this.bindings = {
            provider: '@',
            method: '@',
            onConfirmed: '<'
        };
        this.controller = 'SetupPaymentProviderController';
        this.templateUrl = 'bin-shop-setup-payment-provider.html';
    }

    function SetupPaymentProviderController(binarta, $location) {
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

    function UI() {
        var self = this;

        this.approveBillingAgreement = function (args) {
            self.window.location = args.url;
        };

        this.confirmedBillingAgreement = function () {
            var returnUrl = sessionStorage.getItem('binartaJSSetupBillingAgreementReturnUrl');
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

    function InstallSummarySupport(binarta, decorator) {
        decorator.add(function (ctrl) {
            ctrl.confirm = function () {
                binarta.shop.checkout.confirm(function () {
                    ctrl.start();
                });
            };

            ctrl.violationReport = function () {
                return binarta.shop.checkout.violationReport();
            }
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

    function InstallProfileExtensions(binarta, decorator) {
        decorator.add(function (ctrl) {
            ctrl.vat = binarta.checkpoint.profile.billing.vatNumber;
        });
    }

    function InstallRoutes($routeProvider) {
        $routeProvider
            .when('/basket', {
                templateUrl: 'bin-shop-basket-details.html'
            })
            .when('/checkout/start', {
                templateUrl: 'bin-shop-checkout-start.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/checkout/authentication-required', {
                templateUrl: 'bin-shop-checkout-authentication-required.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/checkout/summary', {
                templateUrl: 'bin-shop-checkout-summary.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/checkout/setup-payment-provider', {
                templateUrl: 'bin-shop-checkout-setup-payment-provider.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/checkout/completed', {
                templateUrl: 'bin-shop-checkout-completed.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/:locale/basket', {
                templateUrl: 'bin-shop-basket-details.html'
            })
            .when('/:locale/checkout/start', {
                templateUrl: 'bin-shop-checkout-start.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/:locale/checkout/authentication-required', {
                templateUrl: 'bin-shop-checkout-authentication-required.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/:locale/checkout/summary', {
                templateUrl: 'bin-shop-checkout-summary.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/:locale/checkout/setup-payment-provider', {
                templateUrl: 'bin-shop-checkout-setup-payment-provider.html',
                controller: 'CheckoutController as checkout'
            })
            .when('/:locale/checkout/completed', {
                templateUrl: 'bin-shop-checkout-completed.html',
                controller: 'CheckoutController as checkout'
            });
    }
})();