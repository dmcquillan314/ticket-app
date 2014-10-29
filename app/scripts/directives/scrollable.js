angular.module('ticketApp')

/**
 * @ngdoc directive
 * @name scrollable.directive:scrollableContent
 *
 * @description This directive adds a scroller trait to this dom element.  It will also
 * support legacy devices by adding the overthrow polyfill to this element.
 *
 * This directive is overloaded and will broadcast the current scroll position.
 *
 * This directive accepts the following events:
 * <br><b>scrollToElement</b> - This will scroll to an element specified in the data parameters (e.g. { element: <element> }.
 *
 * This directive broadcasts the following events:
 * <br><b>scrollPositionUpdated</b> - This broadcasts the current scroll position (e.g. {
                            currentPosition: currentScrollPosition,
                            maxScrollPosition: maxScrollPosition
                        } )
 *
 */
    .directive('scrollableContent', [
        function() {
            'use strict';

            return {
                replace: false,
                restrict: 'C',
                controller: [ '$scope', '$element', function($scope, $element) {
                    var controller = this;

                    controller.scrollTo = function(data) {
                        if (angular.isDefined( data.scrollTo )) {
                            setTimeout(function() {
                                $element.scrollTo(0, data.scrollTo, 0 );
                            }, 0);
                        } else if( angular.isDefined( data.element )) {
                            setTimeout(function() {
                                $element.scrollToElement(angular.element(data.element), 0, 1000 );
                            }, 0);
                        }
                    };

                    controller.getScrollHeight = function() {
                        return $element[0].scrollHeight;
                    };

                    controller.getScrollPosition = function() {
                        return $element[0].scrollTop;
                    };

                }],
                link: function(scope, element, attr, controller) {

                    void(attr);

                    var broadcastCurrentScroll = function( currentScrollPosition, maxScrollPosition ) {

                        currentScrollPosition = Math.abs( currentScrollPosition < 0 ? 0 : currentScrollPosition );
                        currentScrollPosition = currentScrollPosition > maxScrollPosition ? maxScrollPosition : currentScrollPosition;

                        scope.$broadcast('scrollPositionUpdated', {
                            currentPosition: currentScrollPosition,
                            maxScrollPosition: maxScrollPosition
                        });
                        scope.$apply();
                    };

                    element.on('scroll', function() {
                        broadcastCurrentScroll( controller.getScrollPosition() + element[0].offsetHeight, controller.getScrollHeight() );
                    });

                    scope.$on('scrollTo', function( $event, data ) {
                        controller.scrollTo(data);
                    });

                    if (overthrow.support !== 'native') {
                        element.addClass('overthrow');
                        overthrow.forget();
                        return overthrow.set();
                    }
                }
            };
        }
    ]);
