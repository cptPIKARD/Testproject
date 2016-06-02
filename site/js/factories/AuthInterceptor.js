/**
 * Created by fatality-ap on 15.05.16.
 */
app.factory('AuthInterceptor', function AuthInterceptor(AuthTokenFactory) {
    'use strict';


    function addTokenInterceptor(element, operation, route, url, headers, params, httpConfig){

        var token = AuthTokenFactory.getToken();
        if(token)
        {
            headers.Authorization = 'Bearer ' + token;
        }

        return {
            element: element,
            headers: headers,
            params: params,
            httpConfig: httpConfig
        };
    }

    return {
        addTokenInterceptor : addTokenInterceptor
    }
});