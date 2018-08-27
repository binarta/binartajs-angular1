(function () {
    angular.module('binarta-publisherjs-angular1', [
        'ngRoute',
        'binartajs-angular1',
        'binarta-publisherjs-gateways-angular1'
    ])
        .provider('publisher', ['binartaPublisherGatewayProvider', PublisherProvider])
        .component('binBlogPreviews', new BlogPreviewsComponent())
        .config(['binartaProvider', 'publisherProvider', ExtendBinarta])
        .run(['publisher', WireAngularDependencies]);

    function BlogPreviewsComponent() {
        this.templateUrl = 'bin-publisher-blog-previews.html';
        this.controller = ['binarta', binComponentController(function (binarta) {
            var $ctrl = this;

            $ctrl.addInitHandler(function () {
                $ctrl.previews = function () {
                    return binarta.publisher.blog.published.posts({max: 5});
                }
            });

            binarta.schedule(function () {
                $ctrl.addInitHandler(function () {
                    binarta.publisher.blog.published.init();
                });
            });
        })]
    }

    function PublisherProvider(db) {
        this.publisher = new BinartaPublisherjs();
        this.publisher.db = db.gateway;
        this.ui = new UI();
        this.$get = [function () {
            return this.publisher;
        }];
    }

    function UI() {
        var self = this;
    }

    function ExtendBinarta(binarta, publisherProvider) {
        binarta.addSubSystems({publisher: publisherProvider.publisher});
    }

    function WireAngularDependencies() {
    }
})();