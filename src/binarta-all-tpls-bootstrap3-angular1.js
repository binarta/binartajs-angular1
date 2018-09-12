angular.module("binarta-alljs-tpls-angular1", []).run(["$templateCache", function($templateCache) {$templateCache.put("bin-all-platform-signature.html","<span ng-switch=\"::$ctrl.signature\" ng-class=\"::$ctrl.getModeClass()\"><span ng-switch-when=\"binarta\"><a href=\"https://binarta.com\" target=\"_blank\">Powered by <strong>Binarta</strong></a></span> <span ng-switch-when=\"websters\"><a href=\"https://websters.be\" target=\"_blank\"><svg width=\"15px\" height=\"15px\" viewbox=\"0 0 15 15\" version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" ng-if=\"::$ctrl.mode === \'full\'\"><g fill=\"currentColor\"><polyline points=\"5.43296089 1.2849162 5.43296089 0.153631285 5.27932961 0 2.08100559 0 1.9273743 0.153631285 1.9273743 1.2849162\"></polyline><polyline points=\"14.8324022 1.94134078 13.7709497 1.94134078 13.7709497 5.41899441 14.8324022 5.41899441 14.9860335 5.26536313 14.9860335 2.09497207\"></polyline><polygon points=\"8.93854749 1.94134078 0.153631285 1.94134078 0 2.09497207 0 5.26536313 0.153631285 5.41899441 8.93854749 5.41899441\"></polygon><polyline points=\"9.60893855 13.7430168 9.60893855 14.8463687 9.76256983 15 12.9608939 15 13.1145251 14.8463687 13.1145251 13.7430168\"></polyline><polygon points=\"13.1145251 8.92458101 13.1145251 0.153631285 12.9608939 0 9.76256983 0 9.60893855 0.153631285 9.60893855 8.92458101\"></polygon><polyline points=\"1.25698324 9.59497207 0.153631285 9.59497207 0 9.74860335 0 12.9189944 0.153631285 13.0726257 1.25698324 13.0726257\"></polyline><polygon points=\"14.8463687 9.59497207 6.08938547 9.59497207 6.08938547 13.0726257 14.8463687 13.0726257 15 12.9189944 15 9.74860335\"></polygon><polygon points=\"5.43296089 6.08938547 1.9273743 6.08938547 1.9273743 14.8463687 2.08100559 15 5.27932961 15 5.43296089 14.8463687\"></polygon></g></svg><span i18n=\"\" code=\"platform.signature.websters\" read-only=\"\" ng-bind-html=\"var\"></span></a></span></span>");
$templateCache.put("bin-all-signin.html","<a bin-href=\"/signin\" ng-if=\"!$ctrl.authenticated\"><i class=\"fa fa-user fa-fw\"></i> <span i18n=\"\" code=\"checkpoint.login.link\" read-only=\"\" ng-bind=\"var\"></span></a> <a bin-href=\"/\" ng-click=\"$ctrl.signout()\" ng-if=\"$ctrl.authenticated\"><i class=\"fa fa-user fa-fw\"></i> <span i18n=\"\" code=\"checkpoint.logout.link\" read-only=\"\" ng-bind=\"var\"></span></a>");
$templateCache.put("bin-all-application-lock.html","Hello World!");
$templateCache.put("bin-all-content-header-subtitle.html","<section id=\"breadcrumb\"><div class=\"container\"><div class=\"row\"><ol class=\"breadcrumb\" ng-if=\"!viewport.xs\"><li i18n=\"\" code=\"{{::$ctrl.subTitleKey}}\" read-only=\"\" ng-bind=\"::var\"></li></ol></div></div></section>");
$templateCache.put("bin-all-content-header-title.html","<div class=\"page-header-wrapper\"><div class=\"container\"><div class=\"row\"><div class=\"col-xs-12\"><div class=\"page-header\"><h1 i18n=\"\" code=\"{{::$ctrl.titleKey}}\" read-only=\"\" ng-bind=\"::var\"></h1></div></div></div></div></div>");
$templateCache.put("bin-all-content-header.html","<div ng-if=\"!$ctrl.inverted\"><div ng-include=\"\'bin-all-content-header-title.html\'\"></div><div ng-if=\"::$ctrl.subTitleKey\" ng-include=\"\'bin-all-content-header-subtitle.html\'\"></div></div><div ng-if=\"$ctrl.inverted\"><div ng-if=\"::$ctrl.subTitleKey\" ng-include=\"\'bin-all-content-header-subtitle.html\'\"></div><div ng-include=\"\'bin-all-content-header-title.html\'\"></div></div>");
$templateCache.put("bin-all-cookie-notice.html","<div id=\"binarta-cookie-notice-wrapper\" ng-if=\"$ctrl.status != \'permission-granted\' && $ctrl.status != \'permission-revoked\'\"><div id=\"binarta-cookie-notice\"><div class=\"binarta-cookie-notice-message\" ng-if=\"$ctrl.status == \'permission.storage.disabled\'\"><p i18n=\"\" code=\"configure.cookies.notice.message\" read-only=\"\" ng-bind-html=\"::var\"></p></div><div class=\"binarta-cookie-notice-message\" ng-if=\"$ctrl.status == \'permission-required\'\"><p i18n=\"\" code=\"cookie.notice.message\" read-only=\"\" ng-bind-html=\"::var\"></p><button ng-click=\"$ctrl.grant()\" class=\"btn btn-primary btn-lg\" i18n=\"\" code=\"cookie.notice.accept\" read-only=\"\" ng-bind=\"::var\"></button> <a ng-click=\"$ctrl.revoke()\" href=\"\" class=\"cookies-reject-link\" i18n=\"\" code=\"cookie.notice.reject\" read-only=\"\" ng-bind=\"::var\"></a></div></div></div>");
$templateCache.put("bin-all-violations.html","<div class=\"help-block text-danger\" ng-repeat=\"v in $ctrl.src\" i18n=\"\" code=\"{{::$ctrl.codePrefix+\'.\'+v}}\" default=\"{{::v}}\" read-only=\"\" ng-bind=\"::var\"></div>");}]);