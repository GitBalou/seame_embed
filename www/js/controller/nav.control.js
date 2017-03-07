// controller de la nav bar
seaMe.controller("navCtrl",['$scope', function($scope) {

    // infos de l'utilisateur
    $scope.user= infos_user;

    // bouton à afficher
    $scope.afficheCarte = false;

    // réaction à la navigation
    $scope.$on('$stateChangeStart', function(e, toState){

        if(toState.name == 'carte') {
            $scope.afficheCarte = true;
        } else {
            $scope.afficheCarte = false;
        }

    });
}]);
