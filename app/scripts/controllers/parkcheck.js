angular.module('ticketApp').
    controller('ParkCheckCtrl', [ '$scope', '$window', '$resource', '$interpolate',
            function ($scope, $window, $resource, $interpolate) {

                var MONTH = 'MONTH_';
                var months = [ "Blank", "January", "February", "March", "April",
                        "May", "June", "July", "August", "September", "October",
                        "November", "December"];

                var fusionAPIInfo = {
                    doc: '1Jp5Phmt8M5VVeaYc5a503XHkzJH7IVhuFEpIzuTE',
                    meters : 600,
                    key : 'AIzaSyBplU6gnImrAc5yntmJKVCyWHsgl7FRN98',
                    lat : '{{lat}}',
                    lng : '{{lng}}' 
                };

                var fusionQueryExpression = $interpolate(
                    "https://www.googleapis.com/fusiontables/v1/query?sql=select description from {{doc}} WHERE ST_INTERSECTS (geometry, CIRCLE (LATLNG ({{lat}}, {{lng}}), {{meters}}))&key={{key}}");

                var fusionTableQuery = fusionQueryExpression(fusionAPIInfo);

                $scope.supportsLocation = $window.navigator;

                if ($scope.supportsLocation) {

                    $window.navigator.geolocation.getCurrentPosition(function(position)
                        {
                            console.log(position.coords.latitude + " " + position.coords.longitude);

                            $scope.lat = 41.87811;
                            $scope.lng = -87.62980;

                            //$scope.lat = position.coords.latitude;
                            //$scope.lng = position.coords.longitude;
                            
                            checkWarnings($scope.lat, $scope.lng);
                            $scope.map = {center: {latitude: $scope.lat, longitude: $scope.lng}, zoom: 15};

                            $scope.marker = {
                                    id: 0,
                                    coords: {
                                        latitude: $scope.lat,
                                        longitude: $scope.lng
                                      }};

                        }, function(error) {
                            $scope.supportsLocation = false; 
                        });
                } 

                function checkWarnings(latitude, longitude) {

                    var queryExp = $interpolate(fusionTableQuery);
                    var query = queryExp({lat:latitude, lng:longitude});
                    
                    var fusionTable = $resource(query, {callback: "JSON_CALLBACK"}, {get: {method: "JSONP"}});

                    var result = fusionTable.get();
            
                    result.$promise.then(function(results) {
                            var rows = results.rows;
                           
                            for (var row in rows) {
                                console.log(rows[row][0]);
                                var streetCleaningDates = getStreetCleaningDates(angular.fromJson(rows[row][0]));

                                if (streetCleaningDates.length > 0) {
                                    $scope.streetCleaningDates = streetCleaningDates;
                                    break;
                                }
                            }
                        });
                }

                function getStreetCleaningDates(rawWarning) {

                    var dates = [];

                    for (var i = 4; i < 12; i++) {

                        var monthDays = rawWarning[MONTH + i];
                        var monthName = months[i];

                        if (monthDays) {
                            dates.push({name : monthName, days:monthDays});
                        }
                    }
                    return dates;
                }
            }
        ]);
