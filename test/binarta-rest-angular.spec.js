(function () {
    describe('binartajs-rest-angular1', function () {
        var rest, config, ui;

        beforeEach(module('binartajs-rest-angular1-spec'));
        beforeEach(inject(function (_config_, restServiceHandler) {
            config = _config_;
            rest = restServiceHandler;

            config.namespace = 'n';
            config.baseUri = 'http://host/';

            ui = new UI();
        }));

        describe('checkpoint gateway', function() {
            var gateway;

            beforeEach(inject(function(restBinartaCheckpointGateway) {
                gateway = restBinartaCheckpointGateway;
            }));

            describe('initiate billing agreement', function() {
                beforeEach(function() {
                    gateway.initiateBillingAgreement('p', ui);
                });

                it('performs rest request', function() {
                    expect(request(0).params.method).toEqual('POST');
                    expect(request(0).params.url).toEqual('http://host/api/echo/purchase-order');
                    expect(request(0).params.withCredentials).toEqual(true);
                    expect(request(0).params.data.headers.usecase).toEqual('initiate.billing.agreement');
                    expect(request(0).params.data.payload.paymentProvider).toEqual('p');
                });

                it('on success', function() {
                    request(0).success('r');
                    expect(ui.approveBillingAgreementRequest).toEqual('r');
                });
            });
        });

        function request(idx) {
            return rest.calls.argsFor(idx)[0];
        }
    });

    angular.module('binartajs-rest-angular1-spec', ['binarta-checkpointjs-rest-angular1']);

    function UI() {
        var self = this;

        this.approveBillingAgreement = function(request) {
            self.approveBillingAgreementRequest = request;
        }
    }
})();