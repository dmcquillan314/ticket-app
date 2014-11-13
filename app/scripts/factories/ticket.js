angular.module('ticketApp')

.service('TicketService', [ '$q', 'authRequired', 'firebaseUtil', function($q, authRequired, firebaseUtil) { 'use strict';
    return {
        retrieve: function() {
            var deferred = $q.defer();

            authRequired().then(function(user) {
                var ref = firebaseUtil.ref('tickets', user.uid);

                ref.once('value', function(snapshot) {
                    deferred.resolve(snapshot.val());
                },function(error) {
                    if( error ) {
                        deferred.reject(error);
                    }
                });
            })
            .catch(function() {
                deferred.resolve(null);
            });

            return deferred.promise;
        }
    };
}])

.service('SubmittedTicketDataTransferService', [ function() { 'use strict';
    var service = this;

    service.submittedTickets = null;
}]);