(function () {
    angular.module('binarta-shopjs-angular1', [
        'ngRoute',
        'binartajs-angular1'//,
        // 'binarta-checkpointjs-gateways-angular1'
    ])
        .provider('shop', [/*'binartaCheckpointGatewayProvider', */ShopProvider])
        .controller('CheckoutController', ['binarta', CheckoutController])
        // .controller('CancelBillingAgreementController', ['binarta', CancelBillingAgreementController])
        // .controller('ConfirmBillingAgreementController', ['binarta', '$location', ConfirmBillingAgreementController])
        .config(['binartaProvider', 'shopProvider', ExtendBinarta])
        .run(['shop', WireAngularDependencies]);
        // .config(['$routeProvider', InstallRoutes])

    function ShopProvider(provider) {
        this.shop = new BinartaShopjs();
        // this.checkpoint.gateway = provider.gateway;
        this.ui = new UI();
        this.$get = ['$window', '$location', function ($window, $location) {
            this.ui.window = $window;
            this.ui.location = $location;
            return this.shop;
        }]
    }

    function CheckoutController(binarta) {
        this.status = binarta.shop.checkout.status;
    }

    function UI() {
        var self = this;
    }

    function ExtendBinarta(binarta, shopProvider) {
        binarta.addSubSystems({shop: shopProvider.shop});
        // binarta.ui.approveBillingAgreement = shopProvider.ui.approveBillingAgreement;
    }

    function WireAngularDependencies() {
    }

    // function InstallRoutes($routeProvider) {
    //     $routeProvider
    //         .when('/billing/agreement/confirm', {
    //             templateUrl: 'checkpoint-confirm-billing-agreement.html',
    //             controller: 'ConfirmBillingAgreementController as ctrl'
    //         })
    //         .when('/billing/agreement/cancel', {
    //             templateUrl: 'checkpoint-cancel-billing-agreement.html',
    //             controller: 'CancelBillingAgreementController as ctrl'
    //         })
    //         .when('/:locale/billing/agreement/confirm', {
    //             templateUrl: 'checkpoint-confirm-billing-agreement.html',
    //             controller: 'ConfirmBillingAgreementController as ctrl'
    //         })
    //         .when('/:locale/billing/agreement/cancel', {
    //             templateUrl: 'checkpoint-cancel-billing-agreement.html',
    //             controller: 'CancelBillingAgreementController as ctrl'
    //         });
    // }
})();