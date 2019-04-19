(function () {
    angular.module('binarta-publisherjs-angular1', [
        'ngRoute',
        'binarta-i18njs-angular1',
        'binarta-publisherjs-gateways-angular1',
        'binarta-publisherjs-tpls-angular1'
    ])
        .provider('publisher', ['binartaPublisherGatewayProvider', 'applicationProvider', 'binI18nProvider', PublisherProvider])
        .component('binBlogMore', new BlogMoreComponent())
        .component('binBlogSpotlight', new BlogSpotlightComponent())
        .component('binBlogFeed', new BlogFeedComponent())
        .component('binBlogDraftFeed', new BlogDraftFeedComponent())
        .directive('binBlogFeedResults', blogFeedResults)
        .component('binBlogPost', new BlogPostComponent())
        .component('binBlogPostCoverImage', new BlogPostAttributeComponent('coverImageURI', BlogPostCoverImageComponent))
        .component('binBlogPostBreadcrumb', new BlogPostAttributeComponent('title', BlogPostBreadcrumbComponent))
        .component('binBlogPostTitle', new BlogPostAttributeComponent('title', BlogPostTitleComponent))
        .component('binBlogPostPublicationTime', new BlogPostAttributeComponent('publicationTime', BlogPostPublicationTimeComponent))
        .component('binBlogPostRawPublicationTime', new BlogPostRawPublicationTimeComponent())
        .component('binBlogPostLink', new BlogPostAttributeComponent('uri', BlogPostLinkComponent))
        .component('binAddBlogPost', new AddBlogPostComponent())
        .component('binDisplayBlogPost', new DisplayBlogPostComponent())
        .directive('binDisplayBlogPostResult', displayBlogPostResult)
        .component('binDisplayBlogTitle', new DisplayBlogAttributeComponent('title'))
        .component('binDisplayBlogLead', new DisplayBlogAttributeComponent('lead'))
        .component('binDisplayBlogBody', new DisplayBlogAttributeComponent('body'))
        .component('binBlogFeedWidget', new BlogFeedWidgetComponent())
        .component('binBlogSearch', new BlogSearchComponent())
        .directive('binBlogSearchableFeed', BinBlogSearchableFeedDirectiveFactory)
        .controller('BinDisplayBlogPostRouteController', ['binarta', '$routeParams', 'BinDisplayBlogPostRouteController.config', DisplayBlogPostRouteController])
        .service('BinDisplayBlogPostRouteController.config', DisplayBlogPostRouteControllerConfig)
        .controller('BinSearchBlogPostsRouteController', ['binarta', '$scope', '$routeParams', 'BinSearchBlogPostsRouteController.config', SearchBlogPostsRouteController])
        .service('BinSearchBlogPostsRouteController.config', ['binarta', SearchBlogPostsRouteControllerConfig])
        .config(['binartaProvider', 'publisherProvider', ExtendBinarta])
        .config(['$routeProvider', InstallBinartaPublisherRoutes])
        .run(['publisher', WireAngularDependencies]);

    function BlogMoreComponent() {
        this.bindings = {
            mode: '@'
        };
        this.templateUrl = 'bin-publisher-blog-more.html';
    }

    function BlogSpotlightComponent() {
        this.bindings = {
            max: '@',
            postTemplateUrl: '@'
        };
        this.templateUrl = 'bin-publisher-blog-spotlight.html';
        this.controller = [binComponentController(function () {
            var $ctrl = this;

            $ctrl.addInitHandler(function () {
                $ctrl.max = $ctrl.max || 8;
            });
        })];
    }

    function BlogFeedComponent() {
        this.bindings = {
            autoload: '@',
            count: '@',
            max: '@',
            postTemplate: '@',
            type: '<?type'
        };
        this.require = {
            searchableFeed: '?^^binBlogSearchableFeed'
        };
        this.templateUrl = 'bin-publisher-blog-feed.html';
        this.controller = ['$location', 'binarta', binComponentController(function ($location, binarta) {
            var $ctrl = this;

            $ctrl.posts = [];

            function loadPosts(overrides) {
                var request = {type: $ctrl.type};
                Object.keys(overrides || {}).forEach(function (key) {
                    request[key] = overrides[key];
                });
                var handle = binarta.publisher.blog.published(request, {
                    status: function (it) {
                        $ctrl.status = it;
                    },
                    more: function (it) {
                        $ctrl.posts = $ctrl.posts.concat(it);
                    }
                });

                $ctrl.more = handle.more;
                if ($ctrl.count || $ctrl.max)
                    handle.subset.max = 1 * ($ctrl.count || $ctrl.max);

                $ctrl.posts = [];
                handle.more();
            }

            binarta.schedule(function () {
                var subscription;

                $ctrl.addInitHandler(function () {
                    if ($ctrl.searchableFeed)
                        subscription = $ctrl.searchableFeed.events.observe({
                            search: loadPosts
                        });
                });
                $ctrl.addInitHandler(function () {
                    $ctrl.autoload = $ctrl.autoload || 'true';
                    if ($ctrl.autoload === 'true')
                        loadPosts();
                });
                $ctrl.addDestroyHandler(function () {
                    if (subscription)
                        subscription.disconnect();
                });
            });
        })]
    }

    function BlogDraftFeedComponent() {
        this.bindings = {
            count: '@',
            type: '<?type'
        };

        this.templateUrl = 'bin-publisher-blog-draft-feed.html';
        this.controller = ['binarta', binComponentController(function (binarta) {
            var $ctrl = this;

            $ctrl.posts = [];

            binarta.schedule(function () {
                $ctrl.addInitHandler(function () {
                    var handle = binarta.publisher.blog.drafts({type: $ctrl.type}, {
                        status: function (it) {
                            $ctrl.status = it;
                        },
                        more: function (it) {
                            $ctrl.posts = $ctrl.posts.concat(it);
                        }
                    });

                    $ctrl.more = handle.more;
                    if ($ctrl.count)
                        handle.subset.max = 1 * $ctrl.count;

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
            template: '@',
            linkMode: '@'
        };
        this.templateUrl = 'bin-publisher-blog-post.html';
        this.controller = binComponentController(function () {
            var $ctrl = this;

            $ctrl.addInitHandler(function () {
                $ctrl.postTemplate = $ctrl.template || 'bin-publisher-blog-post-default.html';
                $ctrl.linkMode = $ctrl.linkMode || 'to-details';
            });
        })
    }

    function BlogPostAttributeComponent(attributeName, Child) {
        var parent = this;
        this.templateUrl = 'bin-publisher-blog-post-attribute.html';
        this.require = {$parent: '^^binBlogPost'};
        Child.apply(parent, []);
        var ChildController = this.controller;
        this.controller = binComponentController(function () {
            var $ctrl = this;

            $ctrl.addInitHandler(function () {
                $ctrl.value = $ctrl.$parent.post[attributeName];
            });

            if (ChildController)
                ChildController.apply($ctrl);
        });
    }

    function BlogPostCoverImageComponent() {
        this.templateUrl = 'bin-publisher-blog-post-cover-image.html';
    }

    function BlogPostBreadcrumbComponent() {
        this.templateUrl = 'bin-publisher-blog-post-breadcrumb.html';
    }

    function BlogPostTitleComponent() {
    }

    function BlogPostPublicationTimeComponent() {
        this.bindings = {format: '@', templateUrl: '@'};
        this.require = {$parent: '^^binBlogPost'};
        this.templateUrl = 'bin-publisher-blog-post-publication-time.html';
        this.controller = function () {
            var $ctrl = this;

            $ctrl.addInitHandler(function () {
                $ctrl.format = $ctrl.format || 'LL';
            });
        };
    }

    function BlogPostRawPublicationTimeComponent() {
        this.require = {$parent: '^^binBlogPostPublicationTime'};
        this.templateUrl = 'bin-publisher-blog-post-publication-time-raw.html';
    }

    function BlogPostLinkComponent() {
        this.bindings = {labelTemplateUrl: '@'};
        this.templateUrl = 'bin-publisher-blog-post-link.html';
        this.controller = function () {
            var $ctrl = this;

            $ctrl.addInitHandler(function () {
                $ctrl.labelTemplateUrl = $ctrl.labelTemplateUrl || 'bin-publisher-blog-post-link-label.html';
                $ctrl.linkMode = $ctrl.$parent.linkMode;
                if ($ctrl.linkMode == 'from-details')
                    $ctrl.value = '/blog';
            });
        };
    }

    function AddBlogPostComponent() {
        this.templateUrl = 'bin-publisher-add-post.html';
        this.bindings = {
            type: '<?type'
        };
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
                        type: $ctrl.type
                    }, {
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
            template: '@',
            headerTemplate: '@',
            sidebarTemplate: '@'
        };
        this.templateUrl = ['$attrs', function($attrs) {
            return $attrs.templateUrl || 'bin-publisher-display-blog-post.html';
        }];
        this.controller = ['binarta', 'i18nLocation', '$q', '$routeParams', binComponentController(function (binarta, $location, $q, $routeParams) {
            var $ctrl = this;
            var handle;

            $ctrl.addInitHandler(function () {
                $ctrl.id = '/' + $routeParams.part1 + '/' + $routeParams.part2;
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
                    $ctrl.post = it;
                },
                deleted: function () {
                    $location.path('/blog');
                },
                withdrawn: angular.noop
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

            $ctrl.setType = function () {
                handle.setType($ctrl.post.type);
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
        this.bindings = {
            openedTemplate: '@',
            closedTemplate: '@'
        };
        this.templateUrl = 'bin-publisher-display-blog-' + attr + '.html';
        this.controller = function () {
            this.$onInit = function () {
                if (!this.openedTemplate)
                    this.openedTemplate = 'bin-publisher-display-blog-' + attr + '-opened-default.html';
                if (!this.closedTemplate)
                    this.closedTemplate = 'bin-publisher-display-blog-' + attr + '-closed-default.html';
            };
        };
    }

    function BlogFeedWidgetComponent() {
        this.bindings = {
            postTemplateUrl: '@'
        };
        this.templateUrl = 'bin-publisher-blog-feed-widget.html';
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

    function BlogSearchComponent() {
        this.templateUrl = 'bin-publisher-blog-search.html';
        this.require = {
            searchableFeed: '?^^binBlogSearchableFeed'
        };
        this.controller = ['$location', 'binarta', binComponentController(function ($location, binarta) {
            var $ctrl = this;

            binarta.schedule(function () {
                $ctrl.addInitHandler(function () {
                    $ctrl.content = $location.search().content;
                    notify();
                });
            });

            $ctrl.search = function () {
                $location.search('content', getContent());
                notify();
            };

            function notify() {
                if ($ctrl.searchableFeed)
                    $ctrl.searchableFeed.events.notify('search', {content: getContent()});
            }

            function getContent() {
                return $ctrl.content === '' ? undefined : $ctrl.content;
            }
        })];
    }

    function BinBlogSearchableFeedDirectiveFactory() {
        return {
            restrict: 'A',
            scope: true,
            bindToController: true,
            controller: function () {
                this.events = new ReplayableBinartaRX();
            }
        }
    }

    function PublisherProvider(db, applicationProvider, i18nProvider) {
        this.publisher = new BinartaPublisherjs({
            application: applicationProvider.application,
            i18n: i18nProvider.i18n
        });
        this.publisher.db = this.publisher.newRoutingByApplicationLockDB(this.publisher.newCachingDB(db.gateway), db.gateway);
        this.ui = new UI();
        this.$get = [function () {
            return this.publisher;
        }];
    }

    function DisplayBlogPostRouteController(binarta, $routeParams, legacyConfig) {
        var config = binarta.pages.BlogPost || {};
        var $ctrl = this;

        $ctrl.id = '/' + $routeParams.part1 + '/' + $routeParams.part2;
        $ctrl.decoratorTemplate = legacyConfig.decoratorTemplate;
        $ctrl.pageTemplate = config.useLibraryTemplate && config.templateUrl ? config.templateUrl : 'bin-publisher-blog-post-route.html';
        $ctrl.template = legacyConfig.template;
        $ctrl.headerTemplate = legacyConfig.headerTemplate;
        $ctrl.sidebarTemplate = legacyConfig.sidebarTemplate;
    }

    function DisplayBlogPostRouteControllerConfig() {
        this.decoratorTemplate = 'bin-all-route-decorator.html';
        this.template = 'bin-publisher-display-blog-post-details.html';
    }

    function SearchBlogPostsRouteController(binarta, $scope, $routeParams, legacyConfig) {
        var config = binarta.pages.BlogSearch || {};
        var $ctrl = this;

        $ctrl.decoratorTemplate = config.useLibraryTemplate ? config.templateUrl || legacyConfig.decoratorTemplate : 'partials/blog/index.html';
        if (config.useLibraryTemplate) {
            $ctrl.type = $routeParams.blogType;
            $ctrl.pageTemplate = 'bin-publisher-blog-search-route.html';
        } else
            $scope.blogType = $routeParams.blogType;
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

    function WireAngularDependencies() {
    }
})();

function InstallBinartaPublisherRoutes($routeProvider) {
    [
        {
            controller: 'BinSearchBlogPostsRouteController',
            controllerAs: '$ctrl',
            routes: [
                '/blog',
                '/:locale/blog',
                '/blog/:blogType',
                '/:locale/blog/:blogType'
            ]
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
                controllerAs: it.controllerAs,
                reloadOnSearch: false
            })
        })
    });
}