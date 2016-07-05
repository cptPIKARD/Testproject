angular.module('MulticookApp')

.directive('fileChanged', function () {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function ($scope, element, attrs, ngModel) {
            if (!ngModel) {
                return;
            }

            ngModel.$render = angular.noop;

            element.bind('change', function (event) {
                ngModel.$setViewValue(event.target.files[0]);
                $scope.$apply();
            });
        }
    };
})
.factory('FileReader', function ($q, $window) {

    if (!$window.FileReader) {
        throw new Error('Browser does not support FileReader');
    }

    function readAsDataUrl(file) {
        var deferred = $q.defer(),
            reader = new $window.FileReader();

        reader.onload = function () {
            deferred.resolve(reader.result);
        };

        reader.onerror = function () {
            deferred.reject(reader.error);
        };

        reader.readAsDataURL(file);

        return deferred.promise;
    }

    return {
        readAsDataUrl: readAsDataUrl
    };
})
.directive('filePreview', function (FileReader) {
    return {
        restrict: 'A',
        scope: {
            filePreview: '='
        },
        link: function (scope, element, attrs) {
            scope.$watch('filePreview', function (filePreview) {
                if (filePreview && filePreview.name) {
                    FileReader.readAsDataUrl(filePreview).then(function (result) {
                        element.attr('src', result);
                    });
                }
            });
        }
    };
});