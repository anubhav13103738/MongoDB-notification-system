/**
 * Created by Annu on 4/27/2017.
 */
dApp.factory('dappfactory',function ($http,$q) {
    var object = {
        getDataJson: function () {
            var defered = $q.defer();
            $http.get('/dropdown').success(function (data) {
                characters = data;
                defered.resolve(data);
                //alert("hit server");
            }).
            error(function (error) {
                characters = error;
                defered.reject(error);
            });
            return defered.promise;
        }
    }

    return object;
});