angular.module('alert')

    .controller('AlertController', [ '$scope', '$timeout', 'AlertService', function($scope, $timeout, AlertService) {

        var processCallbackResponse = function(response, isSuccessful) {

            $scope.$broadcast('ppdLoadingActionFinish', {});

            if( ( angular.isDefined(response.successful) && response.successful) || (angular.isUndefined(response.successful) && isSuccessful ) ) {
                AlertService.removeAlert();
            } else {
                $scope.showActionError = true;

                $timeout(function() {
                    $scope.showActionError = false;
                }, 3000);
            }
        };

        $scope.alert = null;

        $scope.submitAction = function(actionType) {

            if( ! $scope.alert[actionType] || ! $scope.alert[actionType].callback ) {
                AlertService.removeAlert();
            } else {
                // handle promise callback
                var response = $scope.alert[actionType].callback();

                if( response ) {
                    if( response.then ) {
                        response
                            .then(function(responseData) {
                                processCallbackResponse(responseData, true);
                            })
                            .catch(function(errorData) {
                                processCallbackResponse(errorData, false);
                            });
                    } else {
                        var booleanValue = !! response;
                        processCallbackResponse({ successful: booleanValue });
                    }
                } else {
                    AlertService.removeAlert();
                }
            }

        };

        $scope.isAlertPresent = function() {
            return AlertService.size() > 0;
        };

        $scope.$watch(function() {
            return AlertService.size();
        }, function(numberOfAlerts) {
            if( numberOfAlerts > 0 ) {

                if( $scope.alert === null ) {
                    $scope.alert = AlertService.nextAlert();
                } else {

                    // used to delay transition to new alert
                    $scope.alert = null;

                    $timeout(function() {
                        $scope.alert = AlertService.nextAlert();
                    }, 500);
                }

            } else {
                $scope.alert = null;
            }
        });

    }]);