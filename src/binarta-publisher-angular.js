(function () {
    angular.module('binarta-publisherjs-angular1', [
        'ngRoute',
        'binartajs-angular1',
        'binarta-publisherjs-gateways-angular1',
        'binarta-publisherjs-tpls-angular1'
    ])
        .provider('publisher', ['binartaPublisherGatewayProvider', PublisherProvider])
        .component('binBlogFeed', new BlogFeedComponent())
        .directive('binBlogFeedResults', blogFeedResults)
        .component('binBlogPost', new BlogPostComponent())
        .component('binAddBlogPost', new AddBlogPostComponent())
        .component('binDisplayBlogPost', new DisplayBlogPostComponent())
        .directive('binDisplayBlogPostResult', displayBlogPostResult)
        .component('binDisplayBlogTitle', new DisplayBlogAttributeComponent('title'))
        .component('binDisplayBlogLead', new DisplayBlogAttributeComponent('lead'))
        .component('binDisplayBlogBody', new DisplayBlogAttributeComponent('body'))
        .controller('BinDisplayBlogPostRouteController', ['$routeParams', 'BinDisplayBlogPostRouteController.config', DisplayBlogPostRouteController])
        .service('BinDisplayBlogPostRouteController.config', DisplayBlogPostRouteControllerConfig)
        .config(['binartaProvider', 'publisherProvider', ExtendBinarta])
        .config(['$routeProvider', InstallRoutes])
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
            controller: function () {
            },
            controllerAs: '$ctrl',
            bindToController: true,
            link: function (scope, el, attrs, ctrl) {
                scope.$ctrl.posts = ctrl.posts;
            }
        }
    }

    function BlogPostComponent() {
        this.bindings = {
            post: '<',
            templateUrl: '@'
        };
        this.templateUrl = 'bin-publisher-default-post.html';
        this.controller = function () {

        }
    }

    function AddBlogPostComponent() {
        this.templateUrl = 'bin-publisher-add-post.html';
        this.controller = ['binarta', 'i18nLocation', binComponentController(function (binarta, $location) {
            var $ctrl = this;
            var $lock, $status = 'disabled';

            $ctrl.status = $status;

            $ctrl.profile.addWithPermissionHandler('new.blog.post', {
                gained: function () {
                    $status = 'idle';
                    evaluateStatus();
                },
                lost: function () {
                    $status = 'disabled';
                    evaluateStatus();
                }
            });

            $ctrl.lock.addHandler({
                editing: function () {
                    $lock = 'editing';
                    evaluateStatus();
                },
                viewing: function () {
                    $lock = 'viewing';
                    evaluateStatus();
                }
            });

            $ctrl.add = function () {
                if ($ctrl.status == 'idle') {
                    $ctrl.status = 'drafting';
                    binarta.publisher.blog.add({
                        success: function (id) {
                            $ctrl.status = 'idle';
                            $location.path('/blog/post' + id)
                        }
                    });
                }
            };

            function evaluateStatus() {
                $ctrl.status = $lock == 'editing' && $status != 'disabled' ? $status : 'disabled';
            }
        })]
    }

    function DisplayBlogPostComponent() {
        this.bindings = {
            id: '@',
            template: '@'
        };
        this.templateUrl = 'bin-publisher-display-blog-post.html';
        this.controller = ['binarta', 'i18nLocation', '$q', binComponentController(function (binarta, $location, $q) {
            var $ctrl = this;
            var handle;

            $ctrl.addInitHandler(function () {
                if (!$ctrl.template)
                    $ctrl.template = 'bin-publisher-display-blog-post-details.html';
            });

            var display = {
                status: function (it) {
                    $ctrl.status = it;
                },
                notFound: function () {
                    $location.path('/blog');
                },
                post: function (it) {
                    $ctrl.post = it
                }
            };

            $ctrl.publish = function () {
                return $q(function (s, f) {
                    setTimeout(function () {
                        display.published = s;
                        display.canceled = f;
                        handle.publish();
                    });
                });
            };

            $ctrl.withdraw = function () {
                return $q(function (s) {
                    setTimeout(function () {
                        display.published = s;
                        handle.withdraw();
                    });
                });
            };

            binarta.schedule(function () {
                $ctrl.addInitHandler(function () {
                    handle = binarta.publisher.blog.get($ctrl.id).connect(display);
                    handle.render();
                    $ctrl.addDestroyHandler(handle);
                });
            });
        })];
    }

    function DisplayBlogAttributeComponent(attr) {
        this.require = {
            parent: '^^binDisplayBlogPost'
        };
        this.templateUrl = 'bin-publisher-display-blog-' + attr + '.html';
    }

    function displayBlogPostResult() {
        return {
            restrict: 'E',
            scope: true,
            require: '^^binDisplayBlogPost',
            bindToController: true,
            link: function (scope, el, attrs, ctrl) {
                scope.$ctrl = ctrl;
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

    function DisplayBlogPostRouteController($routeParams, config) {
        var $ctrl = this;
        $ctrl.id = '/' + $routeParams.part1 + '/' + $routeParams.part2;
        $ctrl.decoratorTemplate = config.decoratorTemplate;
        $ctrl.pageTemplate = 'bin-publisher-blog-post-route-page.html';
        $ctrl.template = config.template;
    }

    function DisplayBlogPostRouteControllerConfig() {
        this.decoratorTemplate = 'bin-publisher-blog-post-route-decorator.html';
        this.template = 'bin-publisher-display-blog-post-details.html';
    }

    function UI() {
        var self = this;
    }

    function ExtendBinarta(binarta, publisherProvider) {
        binarta.addSubSystems({publisher: publisherProvider.publisher});
    }

    function InstallRoutes($routeProvider) {
        $routeProvider
            .when('/blog/post/:part1/:part2', {
                templateUrl: 'bin-publisher-blog-post-route.html',
                controller: 'BinDisplayBlogPostRouteController',
                controllerAs: '$ctrl'
            })
            .when('/:locale/blog/post/:part1/:part2', {
                templateUrl: 'bin-publisher-blog-post-route.html',
                controller: 'BinDisplayBlogPostRouteController',
                controllerAs: '$ctrl'
            });
    }

    function WireAngularDependencies() {
    }
})();