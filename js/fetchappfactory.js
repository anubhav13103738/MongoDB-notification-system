/**
 * Created by Annu on 4/28/2017.
 */
/**
 * Created by Annu on 4/27/2017.
 */
fApp.factory('fappfactory',function ($http,$q) {
    var object = {
        getDataJson: function () {
            var defered = $q.defer();
            $http.get('/fetch').success(function (data) {
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