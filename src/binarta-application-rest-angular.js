(function () {
    angular.module('binarta-applicationjs-rest-angular1', ['config', 'binartajs-angular1'])
        .provider('restBinartaApplicationGateway', proxy(new ApplicationGateway()))
        .factory('binartaApplicationGatewayIsInitialised', ['$q', GatewayIsInitialisedFactory])
        .run(['restBinartaApplicationGateway', 'binartaApplicationGatewayIsInitialised', WireAngularDependencies]);

    function proxy(gateway) {
        return function () {
            this.gateway = gateway;
            this.$get = ['binarta', 'config', '$http', function (binarta, config, $http) {
                this.gateway.binarta = binarta;
                this.gateway.config = config;
                this.gateway.$http = $http;
                return gateway;
            }]
        }
    }

    function toErrorResponse(response) {
        return function (request) {
            if (request.status == 401 && response.unauthenticated)
                response.unauthenticated();
            if (request.status == 403 && response.forbidden)
                response.forbidden();
            if (request.status == 404 && response.notFound)
                response.notFound();
            if (request.status == 412 && response.rejected)
                response.rejected(request.data, request.status);
        };
    }

    function ApplicationGateway() {
        var gateway = this;

        this.fetchApplicationProfile = function (request, response) {
            gateway.$http({
                method: 'GET',
                url: gateway.config.baseUri + 'api/application/' + gateway.config.namespace + '/data/common',
                headers: {'Accept-Language': gateway.binarta.application.locale()}
            }).then(function (it) {
                response.success(it.data);
            });
        };

        this.fetchAdhesiveSnapshot = function (request, response) {
            gateway.$http({
                method: 'GET',
                url: gateway.config.baseUri + 'api/adhesive/reading/snapshot/' + gateway.config.namespace + '/' + request.locale
            }).then(function (it) {
                it.data.timestamp = moment(it.data.timestamp, 'YYYYMMDDHHmmssSSSZ');
                response.success(it.data);
            });
        };

        this.findPublicConfig = function (request, response) {
            gateway.$http({
                method: 'POST',
                url: gateway.config.baseUri + 'api/usecase',
                data: {
                    headers: {
                        usecase: 'resolve.public.config',
                        namespace: gateway.config.namespace,
                        section: gateway.binarta.application.unlocalizedPath()
                    },
                    payload: {
                        key: request.id
                    }
                }
            }).then(function (it) {
                response.success(it.data.value);
            }, toErrorResponse(response));
        };

        this.findConfig = function (request, response) {
            gateway.$http({
                method: 'POST',
                url: gateway.config.baseUri + 'api/usecase',
                data: {
                    headers: {
                        usecase: 'config.resolve',
                        namespace: gateway.config.namespace,
                        section: gateway.binarta.application.unlocalizedPath() // TODO - can the backend ignore this lookup because it's private config?
                    },
                    payload: {
                        key: request.id
                    }
                },
                withCredentials: true
            }).then(function (it) {
                response.success(it.data.value);
            }, toErrorResponse(response));
        };

        this.addConfig = function (request, response) {
            gateway.$http({
                method: 'POST',
                url: gateway.config.baseUri + 'api/config',
                data: {
                    namespace: gateway.config.namespace,
                    id: request.id,
                    value: request.value,
                    scope: request.scope
                },
                withCredentials: true
            }).then(function (it) {
                response.success(it.data.value);
            }, toErrorResponse(response));
        };

        this.submitContactForm = function (request, response) {
            gateway.$http({
                method: 'POST',
                url: gateway.config.baseUri + 'api/contact/us',
                data: request
            }).then(response.success, toErrorResponse(response));
        };

        this.getWidgetAttributes = function (request, response) {
            gateway.$http({
                method: 'POST',
                url: gateway.config.baseUri + 'api/get-widget-attributes',
                data: {
                    headers: {
                        namespace: gateway.config.namespace
                    },
                    payload: {
                        platform: 'web',
                        component: request.component,
                        widget: request.widget
                    }
                },
                withCredentials: true
            }).then(function (it) {
                response.success(it.data || {aspectRatio: {}});
            }, toErrorResponse(response));
        };

        this.saveWidgetAttributes = function (request, response) {
            gateway.$http({
                method: 'POST',
                url: gateway.config.baseUri + 'api/save-widget-attributes',
                data: {
                    headers: {
                        namespace: gateway.config.namespace
                    },
                    payload: {
                        platform: 'web',
                        component: request.component,
                        widget: request.widget,
                        attributes: request.attributes
                    }
                },
                withCredentials: true
            }).then(function (it) {
                response.success(it.data);
            }, toErrorResponse(response));
        }
    }

    function GatewayIsInitialisedFactory($q) {
        return $q.defer();
    }

    function WireAngularDependencies(gateway, isInitialised) {
        isInitialised.resolve();
    }
})();
