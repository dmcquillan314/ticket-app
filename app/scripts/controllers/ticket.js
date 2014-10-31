angular.module('ticketApp')

.controller('TicketCtrl', [ '$q', '$scope', '$location', 'user', 'simpleLogin', 'firebaseUtil', 'authRequired', function($q, $scope, $location, user, simpleLogin, firebaseUtil, authRequired) {
    'use strict';

    $scope.isAnonymous = function() {
        return user.provider === 'anonymous';
    };

    $scope.profile = {};

    if( ! $scope.isAnonymous() ) {
        firebaseUtil.syncObject('users/' + user.uid).$bindTo($scope, 'profile');
    }

    var submitUserInformation = function(profile, id) {
        var ref = firebaseUtil.ref('users', id),
            deferred = $q.defer();

        var userInformation = {
            firstName: profile.firstName,
            lastName: profile.lastName,
            address: profile.address,
            city: profile.city,
            state: profile.state,
            zip: profile.zip,
            phone: profile.phone
        };

        ref.update(userInformation, function(err) {
            if( err ) {
                deferred.reject(err);
            } else {
                deferred.resolve(ref);
                firebaseUtil.syncObject('users/' + user.uid).$bindTo($scope, 'profile');
            }
        });

    };

    $scope.submitTicketInformation = function(ticket) {
        var ref = firebaseUtil.ref('tickets', user.id);

        ref.set(ticket, function(error) {
            if( error ) {
                $scope.error = 'Error uploading ticket information.';
            } else {
                $scope.$apply(function() {
                    firebaseUtil.syncObject('tickets/' + user.id).$bindTo($scope, 'resolvedTicket');
                });
            }
        });
        void(ticket);
    };

    $scope.createUser = function(profile) {
        $scope.error = null;
        if( !profile.pass ) {
            $scope.error = 'Please enter a password';
        }
        else if( profile.pass !== profile.confirm ) {
            $scope.error = 'Passwords do not match';
        }
        else {
            simpleLogin.createAccount(profile.email, profile.pass)
                .then(function(response) {
                    authRequired().then(function(newUser) {
                        user = newUser;
                        submitUserInformation(profile, response.uid);
                    });
                }, function(error) {
                    $scope.error = error;
                });
        }
    };

    $scope.submitUserInformation = function(profile) {
        submitUserInformation(profile, user.uid);
    };
}]);