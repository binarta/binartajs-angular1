(function () {
    angular.module('binarta-publisherjs-rest-angular1', ['config', 'rest.client'])
        .provider('restBinartaPublisherGateway', proxy(new PublisherGateway()))
        .factory('binartaPublisherGatewayIsInitialised', ['$q', GatewayIsInitialisedFactory])
        .run(['restBinartaPublisherGateway', 'binartaPublisherGatewayIsInitialised', WireAngularDependencies]);

    function proxy(gateway) {
        return function () {
            this.gateway = gateway;
            this.$get = ['binarta', 'config', 'restServiceHandler', '$http', function (binarta, config, rest, $http) {
                this.gateway.binarta = binarta;
                this.gateway.config = config;
                this.gateway.rest = rest;
                this.gateway.$http = $http;
                return gateway;
            }]
        }
    }

    function toSuccessResponse(response) {
        return function (it) {
            if (response.success)
                response.success(it.data);
        }
    }

    function toErrorResponse(response) {
        return function (request) {
            if (request.status == 401)
                response.unauthenticated();
            if (request.status == 404)
                response.notFound();
            if (request.status == 412)
                response.rejected(request.data);
        };
    }

    function PublisherGateway() {
        var self = this;

        self.findAllPublishedBlogsForLocale = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/usecase',
                withCredentials: true,
                data: {
                    headers: {
                        usecase: 'find.all.published.blogs.for.locale',
                        namespace: self.config.namespace,
                        locale: request.locale
                    },
                    payload: {
                        type: request.type,
                        content: request.content,
                        subset: request.subset
                    }
                }
            }).then(function (it) {
                response.success(it.data);
            }, toErrorResponse(response));
        };

        self.findAllBlogsInDraftForLocale = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/usecase',
                withCredentials: true,
                data: {
                    headers: {
                        usecase: 'find.all.blogs.in.draft.for.locale',
                        namespace: self.config.namespace,
                        locale: request.locale
                    },
                    payload: {
                        type: request.type,
                        subset: request.subset
                    }
                }
            }).then(function (it) {
                response.success(it.data);
            }, toErrorResponse(response));
        };

        self.add = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/usecase',
                withCredentials: true,
                data: {
                    headers: {
                        usecase: 'new.blog.post',
                        namespace: self.config.namespace,
                        locale: request.locale
                    },
                    payload: {
                        type: request.type
                    }
                }
            }).then(function (it) {
                response.success(it.data);
            }, toErrorResponse(response));
        };

        self.get = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/usecase',
                withCredentials: true,
                data: {
                    headers: {
                        usecase: 'display.blog.post',
                        namespace: self.config.namespace,
                        locale: request.locale
                    },
                    payload: {
                        id: request.id
                    }
                }
            }).then(function (it) {
                response.success(it.data)
            }, toErrorResponse(response));
        };

        self.publish = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/usecase',
                withCredentials: true,
                data: {
                    headers: {
                        usecase: 'publish.blog.post',
                        namespace: self.config.namespace,
                        locale: request.locale
                    },
                    payload: {
                        id: request.id,
                        timestamp: moment(request.timestamp, 'lll').format()
                    }
                }
            }).then(function (it) {
                response.success();
            }, toErrorResponse(response));
        };

        self.withdraw = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/usecase',
                withCredentials: true,
                data: {
                    headers: {
                        usecase: 'withdraw.blog.post',
                        namespace: self.config.namespace,
                        locale: request.locale
                    },
                    payload: {
                        id: request.id
                    }
                }
            }).then(function () {
                response.success();
            }, toErrorResponse(response));
        };

        self.draftInAnotherLanguage = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/usecase',
                withCredentials: true,
                data: {
                    headers: {
                        usecase: 'draft.blog.post.in.another.language',
                        namespace: self.config.namespace
                    },
                    payload: {
                        id: request.id,
                        locale: request.locale
                    }
                }
            }).then(function () {
                response.success();
            }, toErrorResponse(response));
        };

        self.delete = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/usecase',
                withCredentials: true,
                data: {
                    headers: {
                        usecase: 'delete.blog.post',
                        namespace: self.config.namespace
                    },
                    payload: {
                        id: request.id
                    }
                }
            }).then(function () {
                response.success();
            }, toErrorResponse(response));
        };

        self.setType = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/usecase',
                withCredentials: true,
                data: {
                    headers: {
                        usecase: 'update.type.for.blog',
                        namespace: self.config.namespace
                    },
                    payload: {
                        id: request.id,
                        type: request.type
                    }
                }
            }).then(response.success).catch(toErrorResponse(response));
        }
    }

    function GatewayIsInitialisedFactory($q) {
        return $q.defer();
    }

    function WireAngularDependencies(gateway, isInitialised) {
        isInitialised.resolve();
    }
})();