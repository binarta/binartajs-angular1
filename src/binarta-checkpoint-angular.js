(function () {
    angular.module('binarta-checkpointjs-angular1', [
            'ngRoute',
            'binartajs-angular1',
            'binarta-checkpointjs-gateways-angular1'
        ])
        .provider('checkpoint', ['binartaCheckpointGatewayProvider', CheckpointProvider])
        .controller('SetupBillingAgreementController', ['binarta', SetupBillingAgreementController])
        .controller('CancelBillingAgreementController', ['binarta', CancelBillingAgreementController])
        .controller('ConfirmBillingAgreementController', ['binarta', '$location', ConfirmBillingAgreementController])
        .config(['binartaProvider', 'checkpointProvider', ExtendBinarta])
        .config(['$routeProvider', InstallRoutes])
        .run(['checkpoint', WireAngularDependencies]);

    function CheckpointProvider(provider) {
        this.checkpoint = new BinartaCheckpointjs();
        this.checkpoint.gateway = provider.gateway;
        this.ui = new UI();
        this.$get = ['$window', '$location', function ($window, $location) {
            this.ui.window = $window;
            this.ui.location = $location;
            return this.checkpoint;
        }]
    }

    function UI() {
        var self = this;

        this.approveBillingAgreement = function (args) {
            self.window.location = args.url;
        }
    }

    function SetupBillingAgreementController(binarta) {
        this.status = binarta.checkpoint.profile.billing.isComplete() ? 'complete' : 'incomplete';

        this.submit = function () {
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

    function ExtendBinarta(binarta, checkpointProvider) {
        binarta.addSubSystems({checkpoint: checkpointProvider.checkpoint});
        binarta.ui.approveBillingAgreement = checkpointProvider.ui.approveBillingAgreement;
    }

    function WireAngularDependencies() {
    }

    function InstallRoutes($routeProvider) {
        $routeProvider
            .when('/billing/agreement/confirm', {
                templateUrl: 'checkpoint-confirm-billing-agreement.html',
                controller: 'ConfirmBillingAgreementController as ctrl'
            })
            .when('/billing/agreement/cancel', {
                templateUrl: 'checkpoint-cancel-billing-agreement.html',
                controller: 'CancelBillingAgreementController as ctrl'
            })
            .when('/:locale/billing/agreement/confirm', {
                templateUrl: 'checkpoint-confirm-billing-agreement.html',
                controller: 'ConfirmBillingAgreementController as ctrl'
            })
            .when('/:locale/billing/agreement/cancel', {
                templateUrl: 'checkpoint-cancel-billing-agreement.html',
                controller: 'CancelBillingAgreementController as ctrl'
            });
    }
})();