/**
 * Created by fatality-ap on 16.05.16.
 */
app.factory('UserFactory', function UserFactory($http, AuthTokenFactory, $q, Restangular, AuthInterceptor) {
    'use strict';
    return {
        login: login,
        logout: logout,
        getUser: getUser
    };

    Restangular.addFullRequestInterceptor(function (element, operation, what, url, headers, params, httpConfig) {
        return AuthInterceptor.addTokenInterceptor(element, operation, what, url, headers, params, httpConfig);
    });

    function login(username, password) {
        return $http.post(Restangular.configuration.baseUrl + '/login', {
            username: username,
            password: password
        }).then(function success(response) {
            AuthTokenFactory.setToken(response.data.token);
            return response;
        });
    }

    function logout() {
        AuthTokenFactory.setToken();
    }

    function getUser() {
        if (AuthTokenFactory.getToken()) {
            return Restangular.one('me').get();
        } else {
            return $q.reject({ data: 'client has no auth token' });
        }
    }

});