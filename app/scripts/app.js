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
        'ngMessages',
        'ngTouch',
        'duScroll',
        'firebase.config',
        'firebase.utils',
        'firebase.auth.utils',
        'image',
        'viewHelper',
        'signature',
        'alert',
        'form',
        'ui.bootstrap'
    ]);
