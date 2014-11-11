'use strict';
/**
 * @ngdoc function
 * @name ticketHelperAppApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Manages authentication to any active providers.
 */
angular.module('ticketApp')
    .controller('MainCtrl', [ '$scope', 'tickets', 'simpleLogin', '$location', function ($scope, tickets, simpleLogin, $location) {

        $scope.logout = simpleLogin.logout;

        $scope.submittedTickets = _.filter(tickets, function(ticket) {
            return ticket.submitted;
        });

        var pendingTickets = _.difference(tickets, $scope.submittedTickets);
        $scope.pendingTicket = pendingTickets.length > 0 ? pendingTickets[0] : null;

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