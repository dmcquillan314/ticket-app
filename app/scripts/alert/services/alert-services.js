angular.module('alert')

/**
 * @ngdoc service
 * @name alert.service:AlertService
 *
 * @description used to manage alert messages to be sent to the user and uses an iterator like pattern
 *
 * @property {function} addAlert(alertObject) adds alert object to the stack of alert messages to be process
 *
 * @property {function} removeAlert() removes the alert object at index 0
 *
 * @property {function} size() returns the amount of alerts currently present in the service
 *
 * @property {function} nextAlert() returns the zeroth alert from the stack
 */

/**
 * @ngdoc event
 * @name alert.service:gmMarkers#alert:addAlert
 * @eventOf alert.service:AlertService
 * @eventType listen on root scope
 *
 * @description used to add a alert to be shown globally
 *
 * @param {object} object alert to be added to the stack.  The secondary, type, and color attributes are optional.  As for the button object, the callback is optional.
 * Available colors are:
 * <ul>
 *     <li>white</li>
 *     <li>light-grey</li>
 *     <li>lightest-grey</li>
 *     <li>darker-grey</li>
 *     <li>orange</li>
 *     <li>green</li>
 *     <li>red</li>
 *     <li>dark-green</li>
 *     <li>light-green</li>
 *     <li>blue</li>
 * </ul>
 * @example
 * ```js
 * $scope.$emit('alert:addAlert', {
 *  header: 'header text',
 *  body: 'body text',
 *  type: 'error',
 *  color: 'red' // default is blue
 *  primary: {
 *      text: 'Ok',
 *      callback: function() {
 *          var deferred = $q.defer();
 *
 *          $timeout(function() {
 *              deferred.resolve({
 *                  successful: true
 *              });
 *          });
 *      }
 *  }
 *  secondary: {
 *      text: 'Ok',
 *      callback: function() {
 *          var deferred = $q.defer();
 *
 *          $timeout(function() {
 *              deferred.resolve({
 *                  successful: true
 *              });
 *          });
 *      }
 *  }
 * });
 * ```
 * ```js
 * $scope.$emit('alert:addAlert', {
 *  header: 'header text',
 *  body: 'body text',
 *  type: 'error',
 *  primary: {
 *      text: 'Ok',
 *      callback: function() {
 *          return true;
 *      }
 *  }
 * });
 * ```
 * ```js
 * $scope.$emit('alert:addAlert', {
 *  header: 'header text',
 *  body: 'body text',
 *  type: 'error',
 *  primary: {
 *      text: 'Ok',
 *  }
 *  secondary: {
 *      text: 'Ok',
 *  }
 * });
 * ```
 */
    .service('AlertService', [ '$q', '$timeout', '$rootScope', '$sce', function($q, $timeout, $rootScope, $sce) {
        var _service = this,
            _alerts = [];

        var _processAlert = function(alert) {
            if(alert.processAsHTML) {
                alert.body = $sce.trustAsHtml(alert.body);
                alert.header = $sce.trustAsHtml(alert.header);
            }
        };

        _service.addAlert = function(alertObject) {
            _processAlert(alertObject);
            _alerts.push(alertObject);
        };

        _service.removeAlert = function() {
            if( _alerts.length > 0 ) {
                _alerts.splice(0,1);
            }
        };

        _service.size = function() {
            return _alerts.length;
        };

        _service.nextAlert = function() {
            return _alerts[0];
        };

        $rootScope.$on('alert:addAlert', function(event, data) {
            void(event);

            _service.addAlert(data);
        });

    }]);