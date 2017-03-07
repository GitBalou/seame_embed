// app
var seaMe= angular.module("embed_seame",['ui.router']);

// configuration d'ui-router
seaMe.config(['$stateProvider','$urlRouterProvider',function($stateProvider, $urlRouterProvider){

    // configurations des routes
    $stateProvider

        // vue carte
        .state('carte', {
            url: '/carte',
            templateUrl: 'views/carte.html',
            controller : 'carteCtrl'
        })

        // vue 'a propos'
        .state('about', {
            url: '/about',
            templateUrl: 'views/about.html'
        });

    // Par défaut : vue carte
    $urlRouterProvider.otherwise('/carte');
}]);