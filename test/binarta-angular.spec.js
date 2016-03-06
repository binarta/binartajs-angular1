(function() {
    describe('binartajs-angular', function() {
        var binarta;

        beforeEach(module('binartajs-angular1-spec'));
        beforeEach(inject(function(_binarta_) {
            binarta = _binarta_;
        }));

        it('is extended with checkpoint', function() {
            expect(binarta.checkpoint).toBeDefined();
        });
    });

    angular.module('binartajs-angular1-spec', ['binarta-checkpointjs-angular1'])
        .provider('ui', UIProvider)
        .config(ExtendBinarta);

    function UIProvider() {
        this.ui = new UI();
        this.$get = function() {
            return this.ui;
        }
    }

    function UI() {
        this.showGreeting = function(greeting) {
            this.receivedGreeting = greeting;
        }
    }

    function ExtendBinarta(binartaProvider, uiProvider) {
        binartaProvider.addUI(uiProvider.ui);
    }
})();