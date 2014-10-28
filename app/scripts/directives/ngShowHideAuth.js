angular.module('ticketApp')

.factory('ngShowHideDirective', [ 'simpleLogin', '$timeout', function(simpleLogin, $timeout) {
    'use strict';

    return function(showIfLoggedIn) {
        var isLoggedIn;
        simpleLogin.watch(function(user) {
            isLoggedIn = !!user;
        });

        return {
            restrict: 'A',
            link: function(scope, el) {
                el.addClass('ng-cloak'); // hide until we process it

                function update() {
                    // sometimes if ngCloak exists on same element, they argue, so make sure that
                    // this one always runs last for reliability
                    $timeout(function () {
                        el.toggleClass('ng-cloak', showIfLoggedIn ? !isLoggedIn : isLoggedIn !== false );
                    }, 0);
                }

                simpleLogin.watch(update, scope);
                simpleLogin.getUser(update);
            }
        };

    };
}] )

.directive('ngShowAuth', ['ngShowHideDirective', function (ngShowHideDirective) {
    'use strict';

    return ngShowHideDirective(true);
}])

.directive('ngHideAuth', [ 'ngShowHideDirective', function(ngShowHideDirective) {
    'use strict';

    return ngShowHideDirective(false);
}]);