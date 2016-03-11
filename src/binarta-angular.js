(function() {
    angular.module('binartajs-angular1', [])
        .provider('binarta', BinartaProvider);

    function BinartaProvider() {
        this.ui = new UI();

        var factory = new BinartajsFactory();
        factory.addUI(this.ui);
        this.addSubSystems = factory.addSubSystems;

        this.$get = function() {
            return factory.create();
        }
    }

    function UI() {

    }
})();
