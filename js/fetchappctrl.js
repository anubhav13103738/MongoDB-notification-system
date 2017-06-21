/**
 * Created by Annu on 4/28/2017.
 */
fApp.controller('fetchctrl',function ($scope,fappfactory) {
    var promise = fappfactory.getDataJson();
    function success(data){
        $scope.charadata = data;
        //console.log(data);
    }
    function error(err){
        $scope.charadata = err;
        //console.log(err);
    }
    promise.then(success,error);
});