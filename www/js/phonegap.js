/**
 * Created by emnity on 5/10/15.
 */
angular.module('PhoneGap', [])
    .factory('PhoneGap', function ($q, $rootScope, $document) {
        var deferred = $q.defer();

        $document.bind('deviceready', function () {
            $rootScope.$apply(deferred.resolve);
        });

        return {
            ready: function () {
                return deferred.promise;
            }
        };
    })
    .run(function (PhoneGap) {});