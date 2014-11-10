angular.module('ticketApp')

.controller('TicketCtrl', [ '$q', '$scope', '$location', 'user', 'tickets', 'profile', 'simpleLogin', 'firebaseUtil', 'authRequired', 'TicketService',
function($q, $scope, $location, user, tickets, profile, simpleLogin, firebaseUtil, authRequired, TicketService) {
    'use strict';

    var steps = [
        'ticket-type',
        'ticket-information',
        'additional-information',
        'user-information',
        'agreement',
        'summary',
        'confirmation'
    ];

    tickets = tickets || [];

    var ticket = null,
        ticketIndex = null;

    var setup = function() {

        var filteredTickets = _.filter(tickets, function(ticket) {
            return typeof ticket.submitted === 'undefined' && ticket.submitted !== true;
        });

        if( filteredTickets.length > 0 ) {
            ticket = filteredTickets[filteredTickets.length - 1];
            var index = _.indexOf(tickets, ticket);
            if(index !== -1 ) {
                ticketIndex = index;
            }
        }

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

    setup();

    var isNotStepping = true,
        curStep = ticket !== null && typeof ticket.lastSubmittedStep !== 'undefined' && angular.isNumber(ticket.lastSubmittedStep) ?
            ( ticket.lastSubmittedStep + 1 < steps.length ? ticket.lastSubmittedStep + 1 : steps.length - 1 )
            :
            0;

    $scope.step = steps[curStep];

    $scope.prevStep = function() {
        var deferred = $q.defer();
        if(isNotStepping && curStep > 0) {
            return TicketService.retrieve().then(function(ticketsArray) {
                tickets = ticketsArray;
                setup();
                curStep--;
                $scope.step = steps[curStep];

                return;
            });
        }
        deferred.resolve();
        return deferred.promise;
    };

    $scope.nextStep = function() {
        var deferred = $q.defer();
        if(isNotStepping && curStep < steps.length) {
            TicketService.retrieve().then(function(ticketsArray) {
                tickets = ticketsArray;
                setup();
                curStep++;
                $scope.step = steps[curStep];
            });
        }
        deferred.resolve();
        return deferred.promise;
    };

    var migrateInfo = function(oldUserId, newUserId) {
        var ref = firebaseUtil.ref('tickets', oldUserId),
            deferred = $q.defer();

        ref.once('value', function(snapshot) {
            var valueToMigrate = snapshot.val();
            ref = firebaseUtil.ref('tickets', oldUserId);

            ref.remove(function() {
                var updateRef = firebaseUtil.ref('tickets', newUserId);
                updateRef.set(valueToMigrate, function(err) {
                    if(err) {
                        deferred.reject(err);
                    } else {
                        deferred.resolve();
                    }
                });
            });
        }, function(error) {
            deferred.reject(error);
        });

        return deferred.promise;
    };

    var submitTicket = function() {
        var deferred = $q.defer();

        // copying will remove angular properties
        var ticketCopy = angular.copy(ticket);

        if(ticketCopy.submitted !== true) {
            ticketCopy.lastSubmittedStep = curStep;
        }

        if(ticketIndex === null) {
            tickets.push(ticketCopy);
        } else {
            tickets[ticketIndex] = ticketCopy;
        }

        var ref = firebaseUtil.ref('tickets', user.uid);
        ref.set(tickets, function(error) {
            if( error ) {
                deferred.reject(error);
            } else {
                deferred.resolve(tickets);
            }
        });

        return deferred.promise;
    };

    var pendingNewUser = null;

    var submitUserInformation = function(profile, id, form, shouldSubmitTicket) {
        void(form);

        var deferred = $q.defer();

        var userInformation = {
            firstName: profile.firstName,
            lastName: profile.lastName,
            address: profile.address,
            city: profile.city,
            state: profile.state,
            zip: profile.zip,
            phone: profile.phone
        };

        var ref = firebaseUtil.ref('users', id);

        ref.update(userInformation, function(err) {
            if( err ) {
                deferred.reject(err);
            } else {
                if(shouldSubmitTicket) {
                    submitTicket().then(function() {
                        deferred.resolve();
                    }).catch(function() {
                        deferred.reject();
                    });
                } else {
                    deferred.resolve();
                }
            }
        });

        return deferred.promise;
    };

    $scope.submitTicket = function() {
        submitTicket().then(function() {
            if(steps[curStep] === 'summary') {
                ticket.submitted = true;
                delete ticket.lastSubmittedStep;

                submitTicket().then(function() {
                    $scope.nextStep();
                });
            } else {
                $scope.nextStep();
            }
        });
    };

    $scope.createUser = function(profile, form) {

        simpleLogin.createAccount(profile.email, profile.pass)
            .then(function() {
                authRequired().then(function(newUser) {

                    var oldUserId = user.uid;
                    pendingNewUser = newUser;

                    $q.all([
                        migrateInfo(oldUserId, newUser.uid),
                        submitUserInformation(profile, newUser.uid, form, false)
                    ]).then(function() {
                        $scope.nextStep().then(function() {
                            user = pendingNewUser;
                        });
                    });
                });
            }, function(error) {
                form.resetCustomValidity();

                if(error.code === 'EMAIL_TAKEN') {
                    form.email.setCustomValidity(error.code, false);
                }
            });
    };

    $scope.submitUserInformation = function(profile, form) {
        submitUserInformation(profile, user.uid, form, true).then(function() {
            $scope.nextStep();
        });
    };

}]);