(function () {
    angular.module('binarta-publisherjs-angular1', [
        'ngRoute',
        'binartajs-angular1',
        'binarta-publisherjs-gateways-angular1'
    ])
        .provider('publisher', ['binartaPublisherGatewayProvider', PublisherProvider])
        .component('binBlogFeed', new BlogFeedComponent())
        .directive('binBlogFeedResults', blogFeedResults)
        .component('binBlogPost', new BlogPostComponent())
        .component('binAddBlogPost', new AddBlogPostComponent())
        .component('binDisplayBlogPost', new DisplayBlogPostComponent())
        .directive('binDisplayBlogPostResult', displayBlogPostResult)
        .controller('BinDisplayBlogPostRouteController', ['$routeParams', DisplayBlogPostRouteController])
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
                            $location.path('/view' + id)
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
            id: '@'
        };
        this.controller = ['binarta', 'i18nLocation', binComponentController(function (binarta, $location) {
            var $ctrl = this;
            var post = {};
            var $lock = 'viewing', publishable, withdrawable;

            $ctrl.status = function() {
                return binarta.publisher.blog.get($ctrl.id).status;
            };

            $ctrl.post = function () {
                return post;
            };

            $ctrl.isPublishable = function () {
                return publishable && $lock == 'editing' && post.status == 'draft';
            };

            $ctrl.isWithdrawable = function () {
                return withdrawable && $lock == 'editing' && post.status == 'published';
            };

            $ctrl.publish = function() {
                binarta.publisher.blog.get($ctrl.id).publish($ctrl.now());
            };

            $ctrl.now = function() {
                return moment();
            };

            binarta.schedule(function () {
                $ctrl.addInitHandler(function () {
                    binarta.publisher.blog.get($ctrl.id).render({
                        post: function (it) {
                            post = it;
                            // $ctrl.status = 'idle';
                        },
                        notFound: function () {
                            $location.path('/blog');
                        }
                    });
                });
            });

            $ctrl.profile.addWithPermissionHandler('publish.blog.post', {
                gained: function () {
                    publishable = true;
                },
                lost: function () {
                    publishable = false;
                }
            });

            $ctrl.profile.addWithPermissionHandler('withdraw.blog.post', {
                gained: function () {
                    withdrawable = true;
                },
                lost: function () {
                    withdrawable = false;
                }
            });

            $ctrl.lock.addHandler({
                editing: function () {
                    $lock = 'editing';
                },
                viewing: function () {
                    $lock = 'viewing';
                }
            });
        })];
    }

    function displayBlogPostResult() {
        return {
            restrict: 'E',
            scope: true,
            require: '^^binDisplayBlogPost',
            controller: function () {
            },
            controllerAs: '$ctrl',
            bindToController: true,
            link: function (scope, el, attrs, ctrl) {
                scope.$ctrl.post = ctrl.post;
                scope.$ctrl.status = ctrl.status;
                scope.$ctrl.publish = ctrl.publish;
                scope.$ctrl.withdraw = ctrl.withdraw;
                scope.$ctrl.isPublishable = ctrl.isPublishable;
                scope.$ctrl.isWithdrawable = ctrl.isWithdrawable;
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

    function DisplayBlogPostRouteController($routeParams) {
        var $ctrl = this;
        $ctrl.id = '/' + $routeParams.part1 + '/' + $routeParams.part2;
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
                templateUrl: 'partials/blog/post.html',
                controller: 'BinDisplayBlogPostRouteController',
                controllerAs: '$ctrl'
            })
            .when('/:locale/blog/post/:part1/:part2', {
                templateUrl: 'partials/blog/post.html',
                controller: 'BinDisplayBlogPostRouteController',
                controllerAs: '$ctrl'
            });
    }

    function WireAngularDependencies() {
    }
})();