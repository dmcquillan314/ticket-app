angular.module('firebase.config', [])

.constant('FIREBASE_URL', 'https://ticket-app.firebaseio.com')
.constant('SIMPLE_LOGIN_PROVIDERS', [ 'password', 'anonymous' ])
.constant('LOGIN_REDIRECT_PATH', '/');