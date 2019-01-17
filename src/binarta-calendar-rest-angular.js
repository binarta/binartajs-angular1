(function () {
    angular.module('binarta-calendarjs-rest-angular1', ['config', 'rest.client'])
        .provider('restBinartaCalendarGateway', proxy(new CalendarGateway()))
        .factory('binartaCalendarGatewayIsInitialised', ['$q', GatewayIsInitialisedFactory])
        .run(['restBinartaCalendarGateway', 'binartaCalendarGatewayIsInitialised', WireAngularDependencies]);

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

    function CalendarGateway() {
        var self = this;

        self.findUpcomingEvents = function (request, response) {
            self.$http({
                method: 'POST',
                url: self.config.baseUri + 'api/usecase',
                withCredentials: true,
                data: {
                    headers: {
                        namespace: self.config.namespace,
                        usecase: "find.upcoming.events"
                    },
                    payload: {
                        type: "shows",
                        startDate: request.startDate.format('YYYY-MM-DD'),
                        max: 5
                    }
                }
            }).then(function (it) {
                response.success(it.data);
            }, toErrorResponse(response));
        };
    }

    function GatewayIsInitialisedFactory($q) {
        return $q.defer();
    }

    function WireAngularDependencies(gateway, isInitialised) {
        isInitialised.resolve();
    }
})();