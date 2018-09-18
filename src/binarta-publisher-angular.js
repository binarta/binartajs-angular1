(function () {
    angular.module('binarta-publisherjs-angular1', [
        'ngRoute',
        'binartajs-angular1',
        'binarta-publisherjs-gateways-angular1',
        'binarta-publisherjs-tpls-angular1'
    ])
        .provider('publisher', ['binartaPublisherGatewayProvider', PublisherProvider])
        .component('binBlogFeed', new BlogFeedComponent())
        .component('binBlogDraftFeed', new BlogDraftFeedComponent())
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
        .controller('BinSearchBlogPostsRouteController', ['BinSearchBlogPostsRouteController.config', SearchBlogPostsRouteController])
        .service('BinSearchBlogPostsRouteController.config', SearchBlogPostsRouteControllerConfig)
        .config(['binartaProvider', 'publisherProvider', ExtendBinarta])
        .config(['$routeProvider', InstallRoutes])
        .run(['publisher', WireAngularDependencies]);

    function BlogFeedComponent() {
        this.bindings = {
            count: '@',
            max: '@',
            postTemplate: '@'
        };

        this.templateUrl = 'bin-publisher-blog-feed.html';
        this.controller = ['binarta', binComponentController(function (binarta) {
            var $ctrl = this, statusUpdater;
            var handle = binarta.publisher.blog.published({
                status: function (it) {
                    $ctrl.status = it;
                    if (statusUpdater)
                        statusUpdater(it);
                },
                more: function (it) {
                    $ctrl.posts = $ctrl.posts.concat(it);
                }
            });

            $ctrl.posts = [];
            $ctrl.more = handle.more;
            if ($ctrl.count || $ctrl.max)
                handle.subset.max = 1 * ($ctrl.count || $ctrl.max);
            $ctrl.installStatusUpdater = function (it) {
                statusUpdater = it;
            };

            binarta.schedule(function () {
                $ctrl.addInitHandler(function () {
                    handle.more();
                });
            });
        })]
    }

    function BlogDraftFeedComponent() {
        this.bindings = {
            count: '@'
        };

        this.templateUrl = 'bin-publisher-blog-draft-feed.html';
        this.controller = ['binarta', binComponentController(function (binarta) {
            var $ctrl = this, statusUpdater;
            var handle = binarta.publisher.blog.drafts({
                status: function (it) {
                    $ctrl.status = it;
                    if (statusUpdater)
                        statusUpdater(it);
                },
                more: function (it) {
                    $ctrl.posts = $ctrl.posts.concat(it);
                }
            });

            $ctrl.posts = [];
            $ctrl.more = handle.more;
            if ($ctrl.count)
                handle.subset.max = 1 * $ctrl.count;
            $ctrl.installStatusUpdater = function (it) {
                statusUpdater = it;
            };

            binarta.schedule(function () {
                $ctrl.addInitHandler(function () {
                    handle.more();
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
            template: '@'
        };
        this.templateUrl = 'bin-publisher-blog-post.html';
        this.controller = binComponentController(function () {
            $ctrl = this;

            $ctrl.addInitHandler(function () {
                $ctrl.postTemplate = $ctrl.template || 'bin-publisher-blog-post-default.html';
            });
        })
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
                },
                deleted: function () {
                    $location.path('/blog');
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

            $ctrl.draft = function () {
                return $q(function (s) {
                    setTimeout(function () {
                        display.drafted = s;
                        handle.draft();
                    });
                });
            };

            $ctrl.delete = function () {
                handle.delete();
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
        $ctrl.pageTemplate = 'bin-publisher-blog-post-route.html';
        $ctrl.template = config.template;
    }

    function DisplayBlogPostRouteControllerConfig() {
        this.decoratorTemplate = 'bin-all-route-decorator.html';
        this.template = 'bin-publisher-display-blog-post-details.html';
    }

    function SearchBlogPostsRouteController(config) {
        var $ctrl = this;
        $ctrl.decoratorTemplate = config.decoratorTemplate;
        $ctrl.pageTemplate = 'bin-publisher-blog-search-route.html';
        $ctrl.publicationTemplate = config.publicationTemplate;
    }

    function SearchBlogPostsRouteControllerConfig() {
        this.decoratorTemplate = 'bin-all-route-decorator.html';
        this.template = 'bin-publisher-display-blog-post-details.html';
    }

    function UI() {
        var self = this;
    }

    function ExtendBinarta(binarta, publisherProvider) {
        binarta.addSubSystems({publisher: publisherProvider.publisher});
    }

    function InstallRoutes($routeProvider) {
        [
            {
                controller: 'BinSearchBlogPostsRouteController',
                controllerAs: '$ctrl',
                routes: ['/blog', '/:locale/blog']
            },
            {
                controller: 'BinDisplayBlogPostRouteController',
                controllerAs: '$ctrl',
                routes: ['/blog/post/:part1/:part2', '/:locale/blog/post/:part1/:part2']
            }
        ].forEach(function (it) {
            it.routes.forEach(function (route) {
                $routeProvider.when(route, {
                    templateUrl: 'bin-all-route.html',
                    controller: it.controller,
                    controllerAs: it.controllerAs
                })
            })
        });
    }

    function WireAngularDependencies() {
    }
})();