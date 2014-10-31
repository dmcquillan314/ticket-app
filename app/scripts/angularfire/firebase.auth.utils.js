'use strict';

angular.module('firebase.auth.utils', [ 'firebase', 'firebase.utils', 'firebase.config' ])

.factory('authRequired', [ '$q', 'simpleLogin', function($q, simpleLogin) {
    return function() {
        return simpleLogin.getUser().then(function(user) {
            return user ? user : $q.reject({ authRequired: true });
        });
    };
}])

.factory('simpleLogin', [ '$q', '$rootScope', '$firebaseSimpleLogin', 'firebaseUtil', 'createProfile', 'changeEmail',  function($q, $rootScope, $firebaseSimpleLogin, firebaseUtil, createProfile, changeEmail) {
    var auth = $firebaseSimpleLogin(firebaseUtil.ref()),
        listeners = [];

    function statusChange() {
        fns.initialized = true;
        fns.user = auth.user || null;
        angular.forEach(listeners, function(fn) {
            fn(fns.user);
        });
    }

    var fns = {
        user: null,

        initialized: false,

        getUser: function() {
            return auth.$getCurrentUser();
        },

        login: function(provider, opts) {
            return auth.$login(provider, opts);
        },

        logout: function() {
            auth.$logout();
        },

        createAccount: function(email, pass) {
            return auth.$createUser(email, pass)
                .then(function() {
                    return fns.login('password', {
                        email: email,
                        password: pass
                    });
                })
                .then(function(user) {
                    return createProfile(user.uid, email)
                        .then(function() {
                            return user;
                        });
                });
        },

        changePassword: function(email, oldpass, newpass) {
            return auth.$changePassword(email, oldpass, newpass);
        },

        changeEmail: function(password, newEmail) {
            return changeEmail(password, fns.user.email, newEmail, this);
        },

        removeUser: function(email, pass) {
            return auth.$removeUser(email, pass);
        },

        watch: function(callback, $scope) {
            listeners.push(callback);
            fns.getUser().then(function(user) {
                callback(user);
            });

            var unbind = function() {
                var i = listeners.indexOf(callback);
                if(i > -1) { listeners.splice(i, 1); }
            };

            if($scope) {
                $scope.$on('$destroy', unbind);
            }
            return unbind;
        }
    };

    $rootScope.$on('$firebaseSimpleLogin:login', statusChange);
    $rootScope.$on('$firebaseSimpleLogin:logout', statusChange);
    $rootScope.$on('$firebaseSimpleLogin:error', statusChange);

    auth.$getCurrentUser(statusChange);

    return fns;
}])

.factory('createProfile', [ '$q', '$timeout', 'firebaseUtil', function($q, $timeout, firebaseUtil) {
    return function(id, email) {
        var ref = firebaseUtil.ref('users', id),
            deferred = $q.defer();

        ref.set({ email: email }, function(err) {
            $timeout(function() {
                if( err ) {
                    deferred.reject(err);
                } else {
                    deferred.resolve(ref);
                }
            });
        });

        return deferred.promise;
    };
}])

.factory('changeEmail', [ '$q', '$log', 'firebaseUtil', function($q, $log, firebaseUtil) {
    return function(password, oldEmail, newEmail, simpleLogin) {
        var context = {
            old: {
                email: oldEmail
            },
            curr: {
                email: newEmail
            }
        };

        return authOldAccount()
            .then( loadOldProfile)
            .then( createNewAccount )
            .then( copyProfile )
            .then( authOldAccount )
            .then( removeOldProfile )
            .then( removeOldLogin )
            .then( authNewAccount )
            .catch( function(err) {
                $log.error(err);
                return $q.reject(err);
            });

        function authOldAccount() {
            return simpleLogin.login('password', {
                    email: context.old.email,
                    password: password
                })
                .then(function(user) {
                    context.old.uid = user.uid;
                });
        }

        function loadOldProfile() {
            var deferred = $q.defer();
            context.old.ref = firebaseUtil.ref('users', context.old.uid);
            context.old.ref.once('value', function(snap) {
                var data = snap.val();
                if( data === null ) {
                    deferred.reject(oldEmail + ' not found' );
                } else {
                    context.old.name = data.name;
                    context.curr.name = data.name;
                    deferred.resolve();
                }
            }, function(err) {
                deferred.reject(err);
            });

            return deferred.promise;
        }

        function createNewAccount() {
            return simpleLogin.createAccount(context.curr.email, password, context.old.name)
                .then(function(user) {
                    context.curr.uid = user.uid;
                });
        }

        function copyProfile() {
            var deferred = $q.defer();
            context.curr.ref = firebaseUtil.ref('users', context.curr.uid);

            var profile = {
                email: context.curr.email,
                name: context.curr.name
            };

            context.curr.ref.set(profile, function(err) {
                if(err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve();
                }
            });

            return deferred.promise;
        }

        function removeOldProfile() {
            var deferred = $q.defer();

            context.old.ref.remove(function(err) {
                if(err) {
                    deferred.reject(err);
                } else {
                    deferred.resolve();
                }
            });

            return deferred.promise;
        }

        function removeOldLogin() {
            var deferred = $q.defer();
            simpleLogin.removeUser(context.old.email, password)
                .then(function() {
                    deferred.resolve();
                }, function(err) {
                    deferred.reject(err);
                });

            return deferred.promise;
        }

        function authNewAccount() {
            return simpleLogin.login('password', {
                email: context.curr.email,
                password: password
            });
        }
    };

}]);