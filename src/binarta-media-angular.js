(function () {
    angular.module('binarta-mediajs-angular1', [
        'binarta-checkpointjs-angular1'
    ])
        .provider('binartaMedia', ['applicationProvider', 'checkpointProvider', MediaProvider])
        .factory('extendBinartaMediaFactory', ['binarta', ExtendBinartaMediaFactory])
        .config(['binartaProvider', 'binartaMediaProvider', ExtendBinarta])
        .run(['binartaMedia', Init]);

    function MediaProvider(applicationProvider, checkpointProvider) {
        this.media = new BinartaMediajs({
            applicationjs: applicationProvider.application,
            checkpointjs: checkpointProvider.checkpoint
        });
        this.ui = new UI();
        this.$get = ['$window', '$location', 'extendBinartaMediaFactory', function ($window, $location, extend) {
            this.ui.window = $window;
            this.ui.location = $location;
            extend(this.media);
            return this.media;
        }]
    }

    function ExtendBinartaMediaFactory(binarta) {
        function toURL(delegate) {
            return function (args) {
                args.section = binarta.application.unlocalizedPath();
                return delegate(args);
            }
        }

        return function (media) {
            media.images.toURL = toURL(media.images.toURL);
        }
    }

    function UI() {
        var self = this;
    }

    function ExtendBinarta(binarta, provider) {
        binarta.addSubSystems({media: provider.media});
    }

    function Init(media) {
    }
})();