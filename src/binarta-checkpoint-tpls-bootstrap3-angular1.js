angular.module("binarta-checkpointjs-tpls-angular1", []).run(["$templateCache", function($templateCache) {$templateCache.put("bin-checkpoint-cancel-billing-agreement.html","<div ng-init=\"ctrl.execute();\"></div>");
$templateCache.put("bin-checkpoint-confirm-billing-agreement.html","<div ng-init=\"ctrl.execute();\"></div>");
$templateCache.put("bin-checkpoint-form.html","{{$ctrl.status()}}<form class=\"bin-checkpoint-form\" ng-submit=\"$ctrl.submit()\" ng-if=\"$ctrl.mode == \'signin\'\"><div class=\"form-group\"><i class=\"fa fa-user addon\"></i> <label class=\"hidden\" for=\"binUsername\" i18n=\"\" code=\"checkpoint.username.email.label\" var=\"usernameLabel\" read-only=\"\">{{::var}}</label> <input type=\"text\" id=\"binUsername\" class=\"form-control\" placeholder=\"{{::usernameLabel}}\" ng-model=\"$ctrl.username\" required=\"\" autofocus=\"\"></div><div class=\"form-group\"><i class=\"fa fa-eye-slash addon\"></i> <label class=\"hidden\" for=\"binPassword\" i18n=\"\" code=\"checkpoint.password.label\" var=\"passwordLabel\" read-only=\"\">{{::var}}</label> <input type=\"password\" id=\"binPassword\" class=\"form-control\" placeholder=\"{{::passwordLabel}}\" ng-model=\"$ctrl.password\" required=\"\"></div><p class=\"text-danger\" ng-if=\"$ctrl.status() == \'rejected\'\"><span i18n=\"\" code=\"checkpoint.{{::checkpoint.violation}}\" default=\"{{::checkpoint.violation}}\" read-only=\"\">{{::var}}</span></p><button type=\"submit\" class=\"btn btn-lg btn-primary btn-block\" i18n=\"\" code=\"checkpoint.login.submit\" read-only=\"\">{{::var}}</button> - {{$ctrl.status()}}<div class=\"links\"><div><a ng-href=\"#!{{::localePrefix}}/password/recover\" i18n=\"\" code=\"checkpoint.recover.password.link\" read-only=\"\">{{::var}}</a></div></div></form>");}]);