var app = angular.module('MulticookApp', ['restangular', 'ui.bootstrap', 'ngAnimate', 'ui.router', 'ngDialog', 'confirm-click', 'Alertify'])

    .config(function ($compileProvider, ngDialogProvider, RestangularProvider, $stateProvider, $urlRouterProvider, ConfirmClickProvider) {
        $compileProvider.debugInfoEnabled(false);

        ngDialogProvider.setDefaults({
            showClose: false,
            closeByDocument: true,
            closeByEscape: true
        });

        ConfirmClickProvider.ask(function (question) {
            var Alertify = angular.element(document.body).injector().get('Alertify');
            return Alertify.confirm(question);
        });

        RestangularProvider.setBaseUrl(multiCookConfig.baseRESTserviceUrl);

        $stateProvider
            .state('categories', {
                url: '/categories/:id',
                controller: 'MulticookCtrl'
            })
            .state('categories.recipes', {
                url: '/recipes/:recipeId',
                controller: 'MulticookCtrl'
            })
    })

    .directive('highlightSelectedRow', function($stateParams, $state) {
        var directive = {
            restrict: 'A',
            replace: false,
            transclude: false,
            link: function(scope, element, attributes) {

                scope.$on('categoriesLoaded',function(event, data) {
                    var id = data.id;
                    $('#category').find('tr' + '[data-categoryId=' + id + "]").addClass("success");
                });

                scope.$on('ingredientsLoaded',function(event, data) {
                    var id = data.recipeId;
                    $('#recipe').find('tr' + '[data-recipeId=' + id + "]").addClass("success");
                });

                element.bind('click', function(ev) {
                    var tr = ev.currentTarget.children;
                    var len = tr.length;
                    for(var i = 0; i < len; i++) {
                        tr[i].removeAttribute('class');
                    }
                    $(ev.target).closest("tr").attr("class", "success");
                })
            }

        };
        return directive;
    });
