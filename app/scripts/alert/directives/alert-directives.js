angular.module('alert')

    .directive('alert', [ function() {

        return {
            restrict: 'A',
            controller: 'AlertController'
        };

    }]);