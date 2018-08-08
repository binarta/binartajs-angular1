angular.module("binarta-checkpointjs-tpls-angular1", []).run(["$templateCache", function($templateCache) {$templateCache.put("bin-checkpoint-cancel-billing-agreement.html","<div ng-init=\"ctrl.execute();\"></div>");
$templateCache.put("bin-checkpoint-confirm-billing-agreement.html","<div ng-init=\"ctrl.execute();\"></div>");
$templateCache.put("bin-checkpoint-delete-profile-component.html","<form ng-submit=\"$ctrl.submit();\"><div class=\"alert alert-warning\" role=\"alert\"><button type=\"button\" class=\"btn btn-danger pull-right\" ng-disabled=\"$ctrl.working\" i18n=\"\" code=\"shop.account.deletion.confirmation.label\" read-only=\"\" ng-click-confirm=\"$ctrl.submit();\" confirm-message=\"{{::var}}\" ng-if=\"::var\"><span ng-show=\"$ctrl.working\"><i class=\"fa fa-spinner fa-spin fa-fw\"></i></span> <span ng-hide=\"$ctrl.working\"><i class=\"fa fa-check fa-fw\"></i></span> <span class=\"inline\" i18n=\"\" code=\"shop.account.deletion.button\" read-only=\"\">{{::var}}</span></button> <span i18n=\"\" code=\"shop.account.deletion.info\" read-only=\"\"><i class=\"fa fa-exclamation-triangle\"></i> {{::var}}</span></div></form>");
$templateCache.put("bin-checkpoint-form.html","<form class=\"bin-checkpoint-form\" ng-submit=\"$ctrl.submit()\" ng-if=\"$ctrl.mode == \'signin\'\"><div class=\"form-group\"><i class=\"fa fa-user addon\"></i> <label class=\"hidden\" for=\"binUsername\" i18n=\"\" code=\"checkpoint.username.email.label\" var=\"usernameLabel\" read-only=\"\">{{::var}}</label> <input type=\"text\" id=\"binUsername\" class=\"form-control\" placeholder=\"{{::usernameLabel}}\" ng-model=\"$ctrl.username\" required=\"\" autofocus=\"\"></div><div class=\"form-group\"><i class=\"fa fa-eye-slash addon\"></i> <label class=\"hidden\" for=\"binPassword\" i18n=\"\" code=\"checkpoint.password.label\" var=\"passwordLabel\" read-only=\"\">{{::var}}</label> <input type=\"password\" id=\"binPassword\" class=\"form-control\" placeholder=\"{{::passwordLabel}}\" ng-model=\"$ctrl.password\" required=\"\"></div><p class=\"text-danger\" ng-if=\"$ctrl.status() == \'rejected\'\"><span i18n=\"\" code=\"checkpoint.{{::$ctrl.violationReport()}}\" default=\"{{::$ctrl.violationReport()}}\" read-only=\"\">{{::var}}</span></p><button type=\"submit\" class=\"btn btn-lg btn-primary btn-block\" i18n=\"\" code=\"checkpoint.login.submit\" read-only=\"\">{{::var}}</button><hr><button type=\"button\" ng-click=\"$ctrl.switchToRegistrationMode()\" class=\"btn btn-lg btn-default btn-block\" i18n=\"\" code=\"checkpoint.create.account.link\" read-only=\"\">{{::var}}</button><div class=\"links\"><div><a bin-href=\"/password/recover\" i18n=\"\" code=\"checkpoint.recover.password.link\" read-only=\"\">{{::var}}</a></div></div></form><form class=\"bin-checkpoint-form\" ng-submit=\"$ctrl.submit()\" name=\"registrationForm\" ng-if=\"$ctrl.mode == \'registration\'\"><div class=\"form-group\" ng-class=\"{\'has-error\': $ctrl.violationReport().email}\"><i class=\"fa fa-envelope-o addon\"></i> <label class=\"hidden\" for=\"email\" i18n=\"\" code=\"checkpoint.email.label\" var=\"emailLabel\" read-only=\"\">{{::var}}</label> <input type=\"email\" id=\"email\" name=\"email\" class=\"form-control\" placeholder=\"{{::emailLabel}}\" ng-model=\"$ctrl.email\" autofocus=\"\"><p class=\"help-block\" ng-repeat=\"v in $ctrl.violationReport().email\" i18n=\"\" code=\"checkpoint.email.{{::v}}\" default=\"E-mail {{::v}}\" read-only=\"\">{{::var}}</p></div><div class=\"form-group\" ng-class=\"{\'has-error\': $ctrl.violationReport().password}\"><i class=\"fa fa-eye-slash addon\"></i> <label class=\"hidden\" for=\"password\" i18n=\"\" code=\"checkpoint.password.label\" var=\"passwordLabel\" read-only=\"\">{{::var}}</label> <input type=\"password\" id=\"password\" name=\"password\" class=\"form-control\" placeholder=\"{{::passwordLabel}}\" ng-model=\"$ctrl.password\" autofocus=\"\"><p class=\"help-block\" ng-repeat=\"v in $ctrl.violationReport().password\" i18n=\"\" code=\"checkpoint.password.{{::v}}\" default=\"Password {{::v}}\" read-only=\"\">{{::var}}</p></div><hr><div class=\"checkbox\"><label><input type=\"checkbox\" name=\"company\" ng-model=\"$ctrl.company\" ng-true-value=\"\'yes\'\" ng-false-value=\"\'no\'\"> <span i18n=\"\" code=\"checkpoint.i.represent.a.company\" read-only=\"\">{{::var}}</span></label></div><div class=\"form-group\" ng-class=\"{\'has-error\': violations.vat}\" ng-if=\"$ctrl.company == \'yes\'\"><i class=\"fa fa-building-o addon\"></i> <label class=\"hidden\" for=\"vat\" i18n=\"\" code=\"checkpoint.vat.label\" var=\"vatLabel\" read-only=\"\">{{::var}}</label> <input type=\"text\" id=\"vat\" name=\"vat\" class=\"form-control\" placeholder=\"{{::vatLabel}}\" ng-model=\"$ctrl.vat\" autofocus=\"\"> <small class=\"help-block\" i18n=\"\" code=\"checkpoint.vat.help\" read-only=\"\"><i class=\"fa fa-question-circle fa-fw\"></i> {{::var}}</small><p class=\"help-block\" ng-repeat=\"v in $ctrl.violationReport().vat\" i18n=\"\" code=\"checkpoint.vat.{{::v}}\" default=\"VAT {{::v}}\" read-only=\"\">{{::var}}</p></div><hr><div class=\"form-group\" ng-class=\"{\'has-error\': violations.captcha}\"><div class=\"captcha\" vc-recaptcha=\"\" ng-model=\"$ctrl.captcha\" key=\"$ctrl.recaptchaPublicKey\" theme=\"white\"></div><p class=\"help-block\" ng-repeat=\"v in $ctrl.violationReport().captcha\" i18n=\"\" code=\"checkpoint.captcha.{{::v}}\" default=\"Captcha {{::v}}\" read-only=\"\">{{::var}}</p></div><div class=\"form-group\"><button class=\"btn btn-lg btn-primary btn-block\" type=\"submit\" i18n=\"\" code=\"checkpoint.register.submit\" read-only=\"\">{{::var}}</button> <small class=\"help-block\" i18n=\"\" code=\"checkpoint.register.terms.agreement\" read-only=\"\"><i class=\"fa fa-info-circle fa-fw\"></i> {{::var}}</small><hr><button type=\"button\" ng-click=\"$ctrl.switchToSigninMode()\" class=\"btn btn-lg btn-default btn-block\" i18n=\"\" code=\"checkpoint.login.link\" read-only=\"\">{{::var}}</button></div></form>");
$templateCache.put("bin-checkpoint-profile-component.html","<div class=\"panel panel-default panel-profile\"><div class=\"panel-heading\" i18n=\"\" code=\"profile.panel.title\" read-only=\"\"><i class=\"fa fa-user fa-fw\"></i> {{::var}} <button class=\"btn\" ng-if=\"$ctrl.status() == \'idle\'\" ng-click=\"$ctrl.edit()\">edit</button></div><div class=\"panel-body\" ng-if=\"$ctrl.status() == \'idle\'\"><label i18n=\"\" code=\"customer.profile.email.label\" read-only=\"\">{{::var}}</label><div>{{::$ctrl.email()}}</div><hr><label i18n=\"\" code=\"customer.profile.vat.label\" read-only=\"\">{{::var}}</label><div>{{::$ctrl.vat() || \'/\'}}</div></div><form class=\"panel-body form-horizontal\" name=\"customerProfileForm\" ng-submit=\"$ctrl.update()\" ng-if=\"$ctrl.status() == \'editing\'\"><div class=\"form-group\" ng-class=\"{\'has-error\': $ctrl.violationReport().vat}\"><label class=\"control-label col-xs-5 text-right\" for=\"vat\" i18n=\"\" code=\"customer.profile.vat.label\" default=\"VAT\" read-only=\"\">{{var}}</label><div class=\"col-xs-7\"><input id=\"vat\" class=\"form-control\" ng-model=\"$ctrl.form.vat\" placeholder=\"BE1234\"><p class=\"help-block\" i18n=\"\" code=\"customer.profile.vat.info\"><small><i class=\"fa fa-info-circle fa-fw\"></i> {{var}}</small></p><p class=\"help-block\" ng-repeat=\"v in $ctrl.violationReport().vat\" i18n=\"\" code=\"customer.profile.vat.{{::v}}\" default=\"VAT {{::v}}\" read-only=\"\">{{::var}}</p></div></div><div class=\"form-group\"><div class=\"col-xs-12\"><div class=\"pull-right\"><button type=\"submit\" class=\"btn btn-success\" ng-disabled=\"$ctrl.status() == \'working\' || customerProfileForm.$pristine\"><span ng-show=\"$ctrl.status() == \'working\'\"><i class=\"fa fa-spinner fa-spin fa-fw\"></i></span> <span ng-hide=\"$ctrl.status() == \'working\'\"><i class=\"fa fa-check fa-fw\"></i></span> <span class=\"inline\" i18n=\"\" code=\"save.button\" default=\"Save\">{{var}}</span></button> <button type=\"button\" class=\"btn btn-danger\" ng-click=\"$ctrl.cancel()\" ng-disabled=\"working\"><i class=\"fa fa-times fa-fw\"></i> <span class=\"inline\" i18n=\"\" code=\"cancel.button\" default=\"Cancel\">{{var}}</span></button></div></div></div></form></div>");}]);