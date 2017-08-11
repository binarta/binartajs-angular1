(function () {
    angular.module('binarta-mediajs-angular1', [
        'binarta-checkpointjs-angular1'
    ])
        .provider('media', ['checkpointProvider', MediaProvider])
        .config(['binartaProvider', 'mediaProvider', ExtendBinarta]);

    function MediaProvider(provider) {
        this.media = new BinartaMediajs({checkpointjs:provider.checkpoint});
        this.ui = new UI();
        this.$get = ['$window', '$location', function ($window, $location) {
            this.ui.window = $window;
            this.ui.location = $location;
            return this.media;
        }]
    }

    function UI() {
        var self = this;
    }

    function ExtendBinarta(binarta, provider) {
        binarta.addSubSystems({media: provider.media});
    }
})();