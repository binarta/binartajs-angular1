(function () {
    angular.module('binarta-publisherjs-angular1', [
        'ngRoute',
        'binartajs-angular1',
        'binarta-publisherjs-gateways-angular1'
    ])
        .provider('publisher', ['binartaPublisherGatewayProvider', PublisherProvider])
        .component('binBlogFeed', new BlogFeedComponent())
        .directive('binBlogFeedResults', blogFeedResults)
        .config(['binartaProvider', 'publisherProvider', ExtendBinarta])
        .run(['publisher', WireAngularDependencies]);

    function BlogFeedComponent() {
        this.bindings = {
            count: '@'
        };

        this.controller = ['binarta', binComponentController(function (binarta) {
            var $ctrl = this;

            $ctrl.addInitHandler(function () {
                $ctrl.posts = function () {
                    return binarta.publisher.blog.published.posts({max: $ctrl.count || 5});
                }
            });

            binarta.schedule(function () {
                $ctrl.addInitHandler(function () {
                    binarta.publisher.blog.published.init();
                });
            });
        })]
    }

    function blogFeedResults() {
        return {
            restrict: 'E',
            scope: true,
            require: '^^binBlogFeed',
            controller: function() {},
            controllerAs: '$ctrl',
            bindToController: true,
            link: function (scope, el, attrs, ctrl) {
                scope.$ctrl.posts = ctrl.posts;
            }
        }
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