'use strict';
/**
 * @ngdoc function
 * @name ticketHelperAppApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Manages authentication to any active providers.
 */
angular.module('ticketApp')
    .controller('MainCtrl', [ '$scope', 'simpleLogin', '$location', function ($scope, simpleLogin, $location) {

        $scope.logout = simpleLogin.logout;

        $scope.oauthlogin = function(provider) {
            login(provider, {
                rememberMe: true
            });
        };

        $scope.passwordLogin = function(email, pass) {
            login('password', {
                email: email,
                password: pass,
                rememberMe: true
            });
        };

        function login(provider, opts) {
            $scope.err = null;
            simpleLogin.login(provider, opts).then(
                function() {
                    $location.path('/account');
                },
                function(err) {
                    $scope.err = err;
                }
            );
        }

    }]);