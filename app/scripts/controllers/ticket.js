angular.module('ticketApp')

.controller('TicketCtrl', [ '$q', '$scope', '$location', 'user', 'simpleLogin', 'firebaseUtil', 'authRequired', function($q, $scope, $location, user, simpleLogin, firebaseUtil, authRequired) {
    'use strict';

    $scope.isAnonymous = function() {
        return user.provider === 'anonymous';
    };

    $scope.profile = {};
    $scope.agreement = {};

    if( ! $scope.isAnonymous() ) {
        firebaseUtil.syncObject('users/' + user.uid).$bindTo($scope, 'profile');
    }

    var migrateInfo = function(oldUserId, newUserId) {
        var ref = firebaseUtil.ref('tickets', oldUserId),
            deferred = $q.defer();

        console.log(newUserId);

        ref.once('value', function(snapshot) {
            var valueToMigrate = snapshot.val();

            ref.remove();
            ref = firebaseUtil.ref('tickets', newUserId);
            ref.set(valueToMigrate, function(err) {
                if(err) {
                    console.log('error migrating user', err);
                } else {
                    deferred.resolve();
                }
            });
        }, function(error) {
            console.log(error);
        });

        return deferred.promise;
    };

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
                deferred.resolve();
                firebaseUtil.syncObject('users/' + user.uid).$bindTo($scope, 'profile');
            }
        });

    };

    $scope.submitTicketInformation = function(ticket) {
        var ref = firebaseUtil.ref('tickets', user.uid);

        ref.set(ticket, function(error) {
            if( error ) {
                $scope.error = 'Error uploading ticket information.';
            } else {
            }
        });
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
                .then(function() {
                    authRequired().then(function(newUser) {

                        var oldUserId = user.uid;
                        user = newUser;

                        $q.all([
                            migrateInfo(oldUserId, newUser.uid),
                            submitUserInformation(profile, newUser.uid)
                        ]);
                    });
                }, function(error) {
                    $scope.error = error;
                });
        }
    };

    $scope.submitUserInformation = function(profile) {
        submitUserInformation(profile, user.uid);
    };

    $scope.submitAgreement = function(agreement) {
        var ref = firebaseUtil.ref('tickets', user.uid);

        ref.child('agreeement').set(agreement, function(error) {
            if( error ) {
                $scope.error = 'Error uploading ticket information.';
            } else {
            }
        });
    };
}]);