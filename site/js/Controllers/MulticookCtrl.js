
app.controller('MulticookCtrl', function($scope,  $rootScope, $timeout ,Restangular, UserFactory, AuthInterceptor, $stateParams, $state, ngDialog, modalWindowLoader) {
    
    Restangular.addFullRequestInterceptor(function (element, operation, what, url, headers, params, httpConfig) {
        return AuthInterceptor.addTokenInterceptor(element, operation, what, url, headers, params, httpConfig);
    });

    UserFactory.getUser().then(function success(response) {
        $scope.user = response.username;
        $scope.getAllCategories();
        $scope.getAllIngredients();
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

        $scope.isCategoryModificationShown = false;
    };


    $scope.getAllIngredients = function() {
        modalWindowLoader.modalWindowLoaderOpen();
        Restangular.all('ingredients').getList().then(function(ingredients) {
            $scope.ingredients = ingredients;
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
            $scope.getAllIngredients();

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
        $scope.isCategoryModificationShown = false;
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
    };

    // Block of the create category

    $scope.showCategoryAddition = function() {
        $scope.isSuccessCategoryAddition = false;
        $scope.isErrorCategoryAddition = false;
        $scope.isCategoryModificationShown = false;
        $scope.isErrorCategoryAdditionShown = $scope.isErrorCategoryAdditionShown == true ? false : true;
    };

    $scope.addCategory = function() {

        $scope.categoryAdd.$setSubmitted();

        if($scope.categoryAdd.$invalid) {
            return
        }

        var newCategory = {
            name : $scope.newCategoryName
        };

        modalWindowLoader.modalWindowLoaderOpen();
        $scope.categories.post(newCategory).then(function(response) {
            $scope.isSuccessCategoryModification = true;
            $scope.isErrorCategoryModification = false;
            $scope.successCategoryMessage = response.userMessage;
            modalWindowLoader.modalWindowLoaderClose();
            $scope.getAllCategories();
            $scope.isErrorCategoryAdditionShown = false;
        }, function(error) {
            $scope.isSuccessCategoryModification = false;
            $scope.isErrorCategoryModification = true;
            $scope.errorCategoryMessage = error.data.userMessage;
            modalWindowLoader.modalWindowLoaderClose();

        });
    };

    // Block of the modification category

    $scope.deleteCategory = function(id) {

        modalWindowLoader.modalWindowLoaderOpen();
        Restangular.one("categories", id).remove().then(function(response) {

            $scope.isSuccessCategoryModification = true;
            $scope.isErrorCategoryModification = false;
            $scope.successCategoryMessage = response.userMessage;
            modalWindowLoader.modalWindowLoaderClose();

            $scope.getAllCategories();

        }, function(error) {

            $scope.isSuccessCategoryModification = false;
            $scope.isErrorCategoryModification = true;
            $scope.errorCategoryMessage = error.data.userMessage;

            modalWindowLoader.modalWindowLoaderClose();

        });
    };

    $scope.editCategory = function(id, name) {
        $scope.categoryForEditId = id;
        $scope.editCategoryName = name;
        $scope.isCategoryModificationShown = true;
        $scope.isErrorCategoryAdditionShown = false;
    };

    $scope.saveEditedCategory = function() {
        $scope.categoryModification.$setSubmitted();
        if($scope.categoryModification.$invalid) {
            return
        }
        modalWindowLoader.modalWindowLoaderOpen();
        Restangular.one("categories", $scope.categoryForEditId).customPUT({"name": $scope.editCategoryName}).then(function(response) {
            $scope.isSuccessCategoryModification = true;
            $scope.isErrorCategoryModification = false;
            $scope.successCategoryMessage = response.userMessage;
            modalWindowLoader.modalWindowLoaderClose();
            $scope.getAllCategories();
        }, function(error) {
            $scope.isSuccessCategoryModification = false;
            $scope.isErrorCategoryModification = true;
            $scope.errorCategoryMessage = error.data.userMessage;
            modalWindowLoader.modalWindowLoaderClose();

        });
    };

    // Block of the create recipe

    $scope.showRecipeAddition = function() {
        $scope.isSuccessRecipeAddition = false;
        $scope.isErrorRecipeAddition = false;
        $scope.isRecipeModificationShown = false;
        $scope.isErrorRecipeAdditionShown = $scope.isErrorRecipeAdditionShown == true ? false : true;
    };
    
    $scope.addRecipe = function() {
        $scope.recipeAdd.$setSubmitted();
        if($scope.recipeAdd.$invalid) {
            return
        }
        var hoursOfRecipeTimeToCook =  moment($scope.newRecipeTimeToCook).hour();
        var minutesOfRecipeTimeToCook =  moment($scope.newRecipeTimeToCook).minute();
        var secondsOfRecipeTimeToCook =  moment.duration(moment.duration(hoursOfRecipeTimeToCook, 'hours') + moment.duration(minutesOfRecipeTimeToCook, 'minutes')).asSeconds();

        var newRecipe = {
            name : $scope.newRecipeName,
            energyValue : $scope.newRecipeEnergyValue,
            timeToCook : secondsOfRecipeTimeToCook,
            description : $scope.newRecipeDescription,
            categoryId : $stateParams.id
        };
        modalWindowLoader.modalWindowLoaderOpen();
        Restangular.all('recipe').post(newRecipe).then(function(response) {
            $scope.isSuccessRecipeModification = true;
            $scope.isErrorRecipeModification = false;
            $scope.successRecipeMessage = response.userMessage;
            $scope.showRecipe($stateParams.id, function() {
                $rootScope.$broadcast('categoriesLoaded', {
                    id : $stateParams.id,
                    name : $state.current.name
                });
            });
            modalWindowLoader.modalWindowLoaderClose();
            $scope.isErrorRecipeAdditionShown = false;
        }, function(error) {
            $scope.isSuccessRecipeModification = false;
            $scope.isErrorRecipeModification = true;
            $scope.errorRecipeMessage = error.data.userMessage;
            modalWindowLoader.modalWindowLoaderClose();

        });
    };

    // Block of the modification recipe

    $scope.deleteRecipe = function(id) {
        modalWindowLoader.modalWindowLoaderOpen();
        Restangular.one("recipe", id).remove().then(function(response) {
            $scope.isSuccessRecipeModification = true;
            $scope.isErrorRecipeModification = false;
            $scope.successRecipeMessage = response.userMessage;
            $scope.showRecipe($stateParams.id, function() {
                $rootScope.$broadcast('categoriesLoaded', {
                    id : $stateParams.id,
                    name : $state.current.name
                });
            });
            modalWindowLoader.modalWindowLoaderClose();
        }, function(error) {
            $scope.isSuccessRecipeModification = false;
            $scope.isErrorRecipeModification = true;
            $scope.errorRecipeMessage = error.data.userMessage;
            modalWindowLoader.modalWindowLoaderClose();
        });
    };

    $scope.editRecipe = function(id) {
        $scope.recipeForEditId = id;
        $scope.isRecipeModificationShown = true;
        $scope.isErrorRecipeAdditionShown = false;
    };

    $scope.saveEditedRecipe = function() {
        $scope.recipeModification.$setSubmitted();
        if($scope.recipeModification.$invalid) {
            return
        }
        var hoursOfEditRecipeTimeToCook =  moment($scope.editRecipeTimeToCook).hour();
        var minutesOfEditRecipeTimeToCook =  moment($scope.editRecipeTimeToCook).minute();
        var secondsOfEditRecipeTimeToCook =  moment.duration(moment.duration(hoursOfEditRecipeTimeToCook, 'hours') + moment.duration(minutesOfEditRecipeTimeToCook, 'minutes')).asSeconds();
        $scope.editRecipeObj = {
            name : $scope.editRecipeName,
            energyValue : $scope.editRecipeEnergyValue,
            timeToCook : secondsOfEditRecipeTimeToCook,
            description : $scope.editRecipeDescription
        };
        modalWindowLoader.modalWindowLoaderOpen();
        Restangular.one("recipe", $scope.recipeForEditId).customPUT($scope.editRecipeObj).then(function(response) {
            $scope.isSuccessRecipeModification = true;
            $scope.isErrorRecipeModification = false;
            $scope.successRecipeMessage = response.userMessage;
            modalWindowLoader.modalWindowLoaderClose();
            $scope.showRecipe($stateParams.id, function() {
                $rootScope.$broadcast('categoriesLoaded', {
                    id : $stateParams.id,
                    name : $state.current.name
                });
            });
            $scope.isRecipeModificationShown = false;
        }, function(error) {
            $scope.isSuccessRecipeModification = false;
            $scope.isErrorRecipeModification = true;
            $scope.errorRecipeMessage = error.data.userMessage;
            modalWindowLoader.modalWindowLoaderClose();
            $scope.isRecipeModificationShown = false;
        });
    };
//Timepicker settings
    $scope.mytime = new Date();
    $scope.hstep = 1;
    $scope.mstep = 1;
});






