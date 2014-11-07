angular.module('ticketApp')

.controller('TicketCtrl', [ '$q', '$scope', '$location', 'user', 'ticket', 'profile', 'simpleLogin', 'firebaseUtil', 'authRequired', 'TicketService',
function($q, $scope, $location, user, ticket, profile, simpleLogin, firebaseUtil, authRequired, TicketService) {
    'use strict';

    var steps = [
        'ticket-type',
        'ticket-information',
        'additional-information',
        'user-information',
        'agreement',
        'confirmation'
    ];

    var setup = function() {
        if(ticket === null) {
            ticket = {};
        }
        if( ! ticket.image ) {
            ticket.image = {};
        }
        if( ! ticket.additional ) {
            ticket.additional = {};
        }
        if( ! ticket.additional.images ) {
            ticket.additional.images = [
                { id: 1 },
                { id: 2 },
                { id: 3 }
            ];
        }
        if( ! ticket.agreement ) {
            ticket.agreement = {};
        }
        if(profile === null) {
            profile = {};
        }

        $scope.profile = profile;
        $scope.ticket = ticket;
        $scope.agreement = ticket.agreement;
        $scope.additional = ticket.additional;
    };

    $scope.isAnonymous = function() {
        return user.provider === 'anonymous';
    };

    var isNotStepping = true,
        curStep = ticket !== null && typeof ticket.lastSubmittedStep !== 'undefined' && angular.isNumber(ticket.lastSubmittedStep) ?
            ( ticket.lastSubmittedStep + 1 < steps.length ? ticket.lastSubmittedStep + 1 : steps.length - 1 )
            :
            0;

    $scope.step = steps[curStep];

    setup();

    $scope.prevStep = function() {
        if(isNotStepping && curStep > 0) {
            TicketService.retrieve().then(function(ticketObject) {
                ticket = ticketObject;
                setup();
                curStep--;
                $scope.step = steps[curStep];
            });
        }
    };

    $scope.nextStep = function() {
        if(isNotStepping && curStep < steps.length) {
            TicketService.retrieve().then(function(ticketObject) {
                ticket = ticketObject;
                setup();
                curStep++;
                $scope.step = steps[curStep];
            });
        }
    };

    var migrateInfo = function(oldUserId, newUserId) {
        var ref = firebaseUtil.ref('tickets', oldUserId),
            deferred = $q.defer();

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

    var submitTicket = function() {
        var ref = firebaseUtil.ref('tickets', user.uid),
            deferred = $q.defer();

        // copying will remove angular properties
        var ticketCopy = angular.copy(ticket);

        if(ticketCopy.submitted !== true) {
            ticketCopy.lastSubmittedStep = curStep;
        }

        ref.set(ticketCopy, function(error) {
            if( error ) {
                $scope.error = 'Error uploading ticket information.';
            } else {

                if(steps[curStep] === 'agreement' ) {
                    ticketCopy.submitted = true;
                    delete ticketCopy.lastSubmittedStep;

                    submitTicket().then(function() {
                        $scope.nextStep();
                        deferred.resolve();
                    });
                } else {
                    deferred.resolve();
                    $scope.nextStep();
                }
            }
        });

        return deferred.promise;
    };

    var pendingNewUser = null;

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
                ref.once('value', function(snapshot) {
                    angular.extend($scope.profile, snapshot.val());

                    submitTicket().then(function() {
                        deferred.resolve();

                        $scope.$apply(function() {
                            $scope.nextStep();

                            if(pendingNewUser !== null) {
                                user = pendingNewUser;
                                pendingNewUser = null;
                            }
                        });
                    });
                }, function(error) {
                    void(error);
                });
            }
        });

    };

    $scope.submitTicket = submitTicket;

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
                        pendingNewUser = newUser;

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
//
//    $scope.submitAgreement = function(agreement) {
//        var ref = firebaseUtil.ref('tickets', user.uid);
//
//        ref.child('agreeement').set(agreement, function(error) {
//            if( error ) {
//                $scope.error = 'Error uploading ticket information.';
//            } else {
//            }
//        });
//    };
}]);