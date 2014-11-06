angular.module('form', [])

.config( [ '$provide', function($provide) { 'use strict';

    $provide.decorator('ngSubmitDirective', [ '$delegate', '$parse', 'AlertService', function($delegate, $parse, AlertService) {


        var directive = $delegate[0];

        directive.require = '?form';

        directive.compile = function($element, attrs) {

            void($element, attrs);

            var fn = $parse(attrs.ngSubmit);

            return function ngEventHandler(scope, element, attrs, ctrl) {

                void(attrs);

                element.on('submit', function(event) {

                    var callback = function() {
                        fn(scope, {$event:event});
                    };

                    if(ctrl) {

                        ctrl.blurFormElements();

                        if(ctrl.$invalid) {
                            scope.$apply(function() {
                                AlertService.addAlert({
                                    header: 'Uh Oh!',
                                    body: 'There were issues with your information. See highlighted areas.',
                                    type: 'error'
                                });
                            });
                        } else {
                            scope.$apply(function() {
                                scope.$broadcast('triggerFormAnimation', ctrl);
                                callback();
                            });
                        }
                    } else {
                        scope.$apply(callback);
                    }
                });
            };
        };

        return $delegate;
    }]);
}] )

/**
 * @ngdoc service
 * @name form.service:FormHelperService
 *
 * @description Contains a set of methods to be injected into the scope of a controller using the ?????? method.
 *
 * @property {function} resetFormErrorsForCode(formController, code) given a form and a code it will reset all errors but the given code.
 */
.service('FormHelperService', [ '$timeout', function($timeout) { 'use strict';
    var service = this;

    service.formControllerComponentRegex = /^\$.*$/;

    service.resetFormErrorsForField = function(ngFormFieldController) {
        if( !!ngFormFieldController && !!(ngFormFieldController.setCustomValidity) ) {

            ngFormFieldController.$customMessages = [];

            _.each(_.keys(ngFormFieldController.$customError), function (errorCode) {
                ngFormFieldController.setCustomValidity(errorCode, true);
            });
        }
    };

    service.resetFormErrors = function(ngFormController) {

        for( var key in ngFormController ) {
            if( service.formControllerComponentRegex.test(key) === false ) {
                service.resetFormErrorsForField(ngFormController[key]);
            }
        }
    };

    var resetStateByName = function(ngFormController, name, value) {

        for( var key in ngFormController ) {
            if( service.formControllerComponentRegex.test(key) === false && angular.isDefined(ngFormController[key][name]) ) {
                ngFormController[key][name] = value;
            }
        }
    };

    service.resetUntouchedState = function(ngFormController) {
        resetStateByName(ngFormController, '$untouched', true);
    };

    service.resetDirtyState = function(ngFormController) {
        resetStateByName(ngFormController, '$dirty', false);
    };

    service.createFormBaseDirective = function(ctrl) {
         ctrl.$$recheckCustomErrors = function() {
            var newValue = false;
            _.each(_.values(ctrl.$customError), function(error) {
                if( error === true ) {
                    newValue = true;
                }
            });
            ctrl.$customInvalid = newValue;

            ctrl.$customValid = ! ctrl.$customInvalid;
        };

        ctrl.$customError = {};

        ctrl.setCustomValidity = function(code, value) {

            if(angular.isDefined(ctrl.$customMessages) && arguments.length >= 3) {
                ctrl.$customMessages.push( arguments[2] );
            }

            ctrl.$customError[code] = ! value;

            ctrl.$$recheckCustomErrors();

            if(angular.isDefined(ctrl.$$afterSetCustomValidity)) {
                ctrl.$$afterSetCustomValidity(code, value);
            }
        };

    };

    service.createFormInputDirective = function(ctrl, element) {
        if(ctrl) {

            service.createFormBaseDirective(ctrl);

            ctrl.$customMessages = [];

            ctrl.$$parentForm = element.inheritedData('$formController') || null;

            ctrl.$customError = {};

            ctrl.$$afterSetCustomValidity = function(code, value) {
                if( ctrl.$$parentForm !== null ) {
                    ctrl.$$parentForm.setCustomValidity(code, value);
                }
            };

            ctrl.resetFormErrors = function() {
                service.resetFormErrorsForField(ctrl);
            };

            ctrl.blur = function() {
                // wait for $$digest cycle to complete
                $timeout(function() {
                    element[0].blur();
                });
            };

            ctrl.$$recheckCustomErrors();

            element.on('focus', ctrl.resetFormErrors);
        }
    };

}])

/**
 * @ngdoc service
 * @name form.direct:form
 *
 * @description extends the existing form directive to add custom error messaging functionality
 *
 * @property {function} showError(controller, code, [formController=null]) returns true|false dependent on the state of the form controller
 * the third parameter for this function is optional and when provided it will check the $submitted property in order to determine
 * if the error message should be shown
 */
.directive('form', [ '$timeout', 'FormHelperService', function($timeout, FormHelperService) { 'use strict';
    return {
        restrict: 'EAC',
        require: 'form',
        priority: 1, // should run before the default directive
        link: function(scope, element, attr, ctrl) {
            if(ctrl) {
                FormHelperService.createFormBaseDirective(ctrl);

                ctrl.resetCustomValidity = function() {
                    FormHelperService.resetFormErrors(ctrl);
                };

                ctrl.resetDirtyState = function() {
                    FormHelperService.resetDirtyState(ctrl);
                };

                ctrl.resetUntouchedState = function() {
                    FormHelperService.resetUntouchedState(ctrl);
                };

                ctrl.triggerSubmit = function() {
                    ctrl.$formProcessing = true;

                    // reset so that it may be called again
                    $timeout(function() {
                        ctrl.$formProcessing = false;
                    });
                };

                ctrl.blurFormElements = function() {
                    _.each(_.keys(ctrl), function (key) {
                        if( FormHelperService.formControllerComponentRegex.test(key) === false && angular.isDefined(ctrl[key].blur ) ) {
                            ctrl[key].blur();
                        }
                    });
                };

                ctrl.$$recheckCustomErrors();

                scope.isInvalid = function(ngModelController) {
                    if(ngModelController) {
                        return ngModelController.$invalid;
                    }
                };

                scope.getCssClasses = function(ngModelController) {
                    return {
                        'has-error': (ngModelController.$invalid || ngModelController.$customInvalid) && ( ( ngModelController.$dirty && ngModelController.$touched ) || ctrl.$submitted ),
                        'has-success': ngModelController.$valid && ngModelController.$customValid && ngModelController.$touched
                    };
                };

                scope.showClientValidationError = function(ngModelController) {
                    if(ngModelController) {
                        return ngModelController.$invalid && ( ( ngModelController.$dirty && ngModelController.$touched ) || ctrl.$submitted );
                    }
                };

                scope.isControllerInErrorState = function(ngModelController) {
                    if(ngModelController) {
                        return (ngModelController.$invalid || ngModelController.$customInvalid) && ( ( ngModelController.$dirty && ngModelController.$touched ) || ctrl.$submitted );
                    }
                };
            }
        }
    };
}])

.directive('input', [ 'FormHelperService', function(FormHelperService) { 'use strict';
    return {
        restrict: 'E',
        require: '?ngModel',
        priority: 1, // should run after the default directive
        link: function(scope, element, attrs, ctrl) {
            void(scope, attrs);

            FormHelperService.createFormInputDirective(ctrl, element);
        }
    };
}])

.directive('textarea', [ 'FormHelperService', function(FormHelperService) { 'use strict';

    return {
        restrict: 'E',
        require: '?ngModel',
        priority: 1, // should run after the default directive
        link: function(scope, element, attrs, ctrl) {
            void(scope, attrs);

            FormHelperService.createFormInputDirective(ctrl, element);
        }
    };
}])

.directive('select', [ 'FormHelperService', function(FormHelperService) { 'use strict';

    return {
        restrict: 'E',
        require: '?ngModel',
        priority: 1, // should run after the default directive
        link: function(scope, element, attrs, ctrl) {
            void(scope, attrs);

            FormHelperService.createFormInputDirective(ctrl, element);
        }
    };
}]);

