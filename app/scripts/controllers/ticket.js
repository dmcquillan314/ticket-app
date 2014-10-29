angular.module('ticketApp')

.controller('TicketCtrl', [ '$scope', 'user', function($scope, user) {
    'use strict';

    void($scope, user);
}]);