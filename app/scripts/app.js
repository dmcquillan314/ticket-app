'use strict';

/**
 * @ngdoc overview
 * @name ticketAppApp
 * @description
 * # ticketAppApp
 *
 * Main module of the application.
 */
angular
  .module('ticketApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });

  });
