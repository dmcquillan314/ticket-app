angular.module('ticketApp')

.controller('TicketCtrl', [ '$scope', '$location', 'user', 'simpleLogin', function($scope, $location, user, simpleLogin) {
    'use strict';

    void(user);

    $scope.createAccount = function(email, pass, confirm) {
        $scope.err = null;
        if( !pass ) {
            $scope.err = 'Please enter a password';
        }
        else if( pass !== confirm ) {
            $scope.err = 'Passwords do not match';
        }
        else {
            simpleLogin.createAccount(email, pass/*, name*/)
                .then(function() {
                    $location.path('/account');
                }, function(err) {
                    $scope.err = err;
                });
        }
    };
}]);