(function () {
    var ui;

    describe('binartajs-angular', function () {
        var binarta;

        beforeEach(function() {
            ui = new UI();
        });
        beforeEach(module('binartajs-angular1-spec'));
        beforeEach(inject(function (_binarta_) {
            binarta = _binarta_;
        }));

        describe('binarta-checkpointjs-angular1', function() {
            it('binarta is extended with checkpoint', function () {
                expect(binarta.checkpoint).toBeDefined();
            });

            describe('SetupBillingAgreementController', function() {
                var ctrl;

                beforeEach(inject(function($controller) {
                    ctrl = $controller('SetupBillingAgreementController')
                }));

                it('exposes the fact billing details are incomplete', function() {
                    expect(ctrl.status).toEqual('incomplete');
                });

                it('exposes the fact billing details are complete', inject(function($controller) {
                    binarta.checkpoint.profile.billing.confirm({paymentProvider:'p', confirmationToken:'t'});
                    expect($controller('SetupBillingAgreementController').status).toEqual('complete');
                }));

                describe('initiate billing details', function() {
                    beforeEach(function() {
                        ctrl.paymentProvider = 'p';
                        ctrl.submit();
                    });

                    it('changes status to working', function() {
                        expect(ctrl.status).toEqual('working');
                    });

                    it('redirects to external approval url', inject(function($window) {
                        expect($window.location).toEqual('http://p/billing/agreement?token=t');
                    }));
                });
            });

            describe('CancelBillingAgreementController', function() {
                var ctrl;

                beforeEach(inject(function($controller) {
                    ctrl = $controller('CancelBillingAgreementController');
                }));

                it('on execute cancel billing agreement', inject(function($location) {
                    ctrl.execute();
                    expect(ui.receivedCanceledBillingAgreementRequest).toBeTruthy();
                }));
            });

            describe('ConfirmBillingAgreementController', function() {
                var ctrl;

                beforeEach(inject(function($controller) {
                    ctrl = $controller('ConfirmBillingAgreementController');
                }));

                it('on execute confirm billing agreement', inject(function($location) {
                    $location.search({token:'t'}); // TODO - as we begin supporting different payment providers we may need a strategy for this
                    ctrl.execute();
                    expect(ui.confirmedBillingAgreementRequest).toBeTruthy();
                }));
            });
        });
    });

    installBackendStrategy('inmem');
    angular.module('binartajs-angular1-spec', ['binarta-checkpointjs-angular1', 'binarta-checkpointjs-gateways-angular1'])
        .service('$window', MockWindow)
        .config(ExtendBinarta);

    function MockWindow() {
    }

    function ExtendBinarta(binartaProvider) {
        binartaProvider.ui.canceledBillingAgreement = ui.canceledBillingAgreement;
        binartaProvider.ui.confirmedBillingAgreement = ui.confirmedBillingAgreement;
    }

    function UI() {
        var self = this;

        this.canceledBillingAgreement = function() {
            self.receivedCanceledBillingAgreementRequest = true;
        };

        this.confirmedBillingAgreement = function() {
            self.confirmedBillingAgreementRequest = true;
        }
    }

    function installBackendStrategy(strategy) {
        angular.module('binarta-checkpointjs-gateways-angular1', ['binarta-checkpointjs-' + strategy + '-angular1'])
            .provider('binartaCheckpointGateway', [strategy + 'BinartaCheckpointGatewayProvider', proxy]);

        function proxy(gateway) {
            return gateway;
        }
    }
})();