/**
 * Created by Annu on 4/27/2017.
 */
dApp.controller('dropctrl',function ($scope,dappfactory) {
    var promise = dappfactory.getDataJson();
    function success(data){
        $scope.characters = data;
        //console.log(data);
    }
    function error(err){
        $scope.characters = err;
        //console.log(err);
    }
    promise.then(success,error);
});