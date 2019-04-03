(function () {
    angular.module('binarta-calendarjs-angular1', [
        'binartajs-angular1',
        'binarta-calendarjs-gateways-angular1',
        'binarta-calendarjs-tpls-angular1'
    ])
        .provider('calendar', ['binartaCalendarGatewayProvider', CalendarProvider])
        .component('binCalendarUpcomingEvents', new UpcomingEventsComponent())
        .config(['binartaProvider', 'calendarProvider', ExtendBinarta])
        .run(['calendar', WireAngularDependencies]);

    function CalendarProvider(db) {
        this.calendar = new BinartaCalendarjs({});
        this.calendar.gateway = db.gateway;
        this.ui = new UI();
        this.$get = [function () {
            return this.calendar;
        }];
    }

    function UpcomingEventsComponent() {
        this.bindings = {
            titleTemplate: '@',
            eventTemplate: '@',
            discriminator: '<'
        };
        this.templateUrl = 'bin-calendar-upcoming-events-component.html';
        this.controller = ['binarta', binComponentController(function (binarta) {
            var $ctrl = this;

            $ctrl.events = [];

            $ctrl.addInitHandler(function () {
                if (!$ctrl.titleTemplate)
                    $ctrl.titleTemplate = 'bin-calendar-upcoming-events-component-title.html';
                if (!$ctrl.eventTemplate)
                    $ctrl.eventTemplate = 'bin-calendar-upcoming-events-component-record.html';
                $ctrl.addDestroyHandler(binarta.calendar.upcoming.observe({
                    events: function (it) {
                        $ctrl.events = it;
                    }
                }, $ctrl.discriminator));
            });
        })];
    }

    function UI() {
        var self = this;
    }

    function ExtendBinarta(binarta, calendarProvider) {
        binarta.addSubSystems({calendar: calendarProvider.calendar});
    }

    function WireAngularDependencies() {
    }
})();