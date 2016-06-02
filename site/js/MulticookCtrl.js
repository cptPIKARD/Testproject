
app.controller('MulticookCtrl', function($scope,  $rootScope, $timeout ,Restangular, UserFactory, AuthInterceptor, $stateParams, $state, ngDialog, modalWindowLoader) {

    Restangular.addFullRequestInterceptor(function (element, operation, what, url, headers, params, httpConfig) {
        return AuthInterceptor.addTokenInterceptor(element, operation, what, url, headers, params, httpConfig);
    });

    UserFactory.getUser().then(function success(response) {
        $scope.user = response.username;
        $scope.getAllCategories();
        $scope.getAllIngredientsAndMeasure();
        if($state.current.name == "categories") {
            $scope.showRecipe($stateParams.id, function() {
                $rootScope.$broadcast('categoriesLoaded', {
                    id : $stateParams.id,
                    name : $state.current.name
                });
            });
        } else if($state.current.name == "categories.recipes") {
            $scope.showRecipe($stateParams.id, function() {
                $rootScope.$broadcast('categoriesLoaded', {
                    id : $stateParams.id,
                    name : $state.current.name
                });
            });
            $scope.showIngredientAndSteps($stateParams.recipeId, function(){
                $rootScope.$broadcast('ingredientsLoaded', {
                    id : $stateParams.id,
                    name : $state.current.name,
                    recipeId : $stateParams.recipeId
                });

            });
        }
    });

    $scope.getAllCategories = function() {
        modalWindowLoader.modalWindowLoaderOpen();
        Restangular.all('categories').getList().then(function(categories) {
            $scope.categories = categories;
            modalWindowLoader.modalWindowLoaderClose();
        }, function (reason) {
            $scope.reason = reason.statusText;
        });
    };


    $scope.getAllIngredientsAndMeasure = function() {
        modalWindowLoader.modalWindowLoaderOpen();
        Restangular.all('ingredients').getList().then(function(ingredients) {
            $scope.ingredients = ingredients;
        }, function (reason) {
            $scope.reason = reason.statusText;
        });
        Restangular.all('unitsofmeasure').getList().then(function(unitsofmeasures) {
            $scope.unitsofmeasures = unitsofmeasures;
            modalWindowLoader.modalWindowLoaderClose();
        }, function (reason) {
            $scope.reason = reason.statusText;
        });
    };

    $scope.login = function(username, password) {
        UserFactory.login(username, password).then(function success(response) {
            $scope.user = response.data.user;
            $scope.loginErrorMessage = null;

            $scope.getAllCategories();
            $scope.getAllIngredientsAndMeasure();

        }, handleError);
    };

    function handleError(response) {
        $scope.loginErrorMessage = response.data;
    }

    $scope.logout = function() {
        UserFactory.logout();
        $scope.user = null;
    };


    $scope.showRecipe = function(id, callback) {
        modalWindowLoader.modalWindowLoaderOpen();
        Restangular.one('categories', id).getList('recipe').then(function(recipes) {
            angular.forEach(recipes, function(value, key) {
                var duration =  moment.duration(value.timeToCook, 'seconds');
                value.timeToCookForTimepicker = duration.hours() +  ":" + duration.minutes();
            });
            $scope.recipes = recipes;
            modalWindowLoader.modalWindowLoaderClose();
            $timeout(function () {
                if(callback != undefined) {
                    callback();
                }
                //var callback =  callback || function() {};
                //callback();
            });
        }, function (reason) {
            $scope.reason = reason.statusText;
        });
    };

    $scope.showIngredientAndSteps = function(id, callback) {
        modalWindowLoader.modalWindowLoaderOpen();
        Restangular.one('recipe', id).getList('ingredients').then(function(ingredients) {
            $scope.ingredients = ingredients;
            $timeout(function () {
                if(callback != undefined) {
                    callback();
                }
                //var callback =  callback || function() {};
                //callback();
            });
        }, function (reason) {
            $scope.reason = reason.statusText;
        });
        Restangular.one('recipe', id).getList('stepstocook').then(function(stepstocook) {
            $scope.stepstocooks = stepstocook;
            modalWindowLoader.modalWindowLoaderClose();
            angular.forEach(stepstocook, function(value, key) {
                var duration =  moment.duration(value.timeForStep, 'seconds');
                value.timeForStepForTimepicker = duration.hours() +  ":" + duration.minutes();
            });
        }, function (reason) {
            $scope.reason = reason.statusText;
        });
        $scope.checkIngredient = true;
    }
});





