angular.module('viewHelper', [])

    .controller('viewHelperController', ['$scope', '$rootScope', '$window', '$location', '$filter', 'AlertService', function ($scope, $rootScope, $window, $location, $filter, AlertService ) {

        $scope.activeView = '';

        $scope.$on('$routeChangeSuccess', function() {
            $scope.subHeader = '';
            $scope.applyAnimations = false;
            $scope.openNamedView('');
        });

        $scope.$on('$routeChangeError', function(event, current, previous, rejection) {
            void(event, current, previous, rejection);

            AlertService.addAlert({
                header: 'We\'re Sorry!',
                body: 'An error has occurred. Please try your request again.',
                type: 'error',
                primary: {
                    text: 'Continue'
                }
            });

        });

        function openNamedView(viewName, modalName, subViewId) {

            $scope.activeNamedModal = modalName;
            $scope.activeView = viewName;
            $scope.activeSubView = subViewId;
        }

        $scope.openNamedView = function( viewName, subViewId ) {
            openNamedView(viewName, '', subViewId);
        };

        $scope.openNamedView = function( viewName ) {
            openNamedView(viewName, '', 0);
        };

        $scope.openRootView = function() {
            openNamedView('', '', 0);
        };

        $scope.openNamedModalView = function( viewName, modalName, subViewId ) {
            openNamedView(viewName, modalName, subViewId);
        };

        $scope.openNamedModalView = function( viewName, modalName ) {
            openNamedView(viewName, modalName, 0);
        };

        $scope.setActiveSubView = function( activeSubView ) {
            $scope.activeSubView = activeSubView;
        };

        $scope.back = function() {
            $window.history.back();
        };

        $scope.go = function(path){
            var oldPath = $location.path();
            $location.url(path);

            if( oldPath === $location.path() ) {
                $scope.$broadcast( 'ppdLoadingActionFinish', {} );
                $scope.openNamedView('');
            }
        };

        $scope.encodeURIComponent = function(text){
            return encodeURIComponent(text);
        };

        $rootScope.$on('$locationChangeSuccess', function() {
            $rootScope.actualLocation = $location.path();
        });        

        $rootScope.$watch(function () {
            return $location.path();
        }, function (newLocation) {
            if($rootScope.actualLocation === newLocation) {
                $scope.isBack = true;
                $scope.isForward = false;
            } else {
                $scope.isForward = true;
                $scope.isBack = false;
            }
        });
    }]);
