// controller
seaMe.controller("carteCtrl",['$scope', 'smOl3Embed', 'smPSWGallery','$timeout', function($scope, smOl3Embed,smPSWGallery, $timeout) {

    // VARIABLES DU CONTROLLER

    // enregistrement du mode de fonctionnement du widget
    $scope.mode= 'liste_navigations';

    // navigation affichée dans le controller
    $scope.navigation={};

    // PI affiché dans le controller
    $scope.PI= {};

    // Images affichées dans le controller
    $scope.liste_images= liste_images;

    // affichage de colonne d'infos
    $scope.showInfosNav= false;
    $scope.showInfosPI= false;

    // FONCTIONS DU CONTROLLER
    // fonction d'affichage de la liste des nav dans la carte
    $scope.listeNavigations= function(){

        // RAZ de la couche d'affichage
        smOl3Embed.smOlTools_clear();

        // affichage des départs de navigation
        smOl3Embed.smOlTools_showListeNavigations(true);

        // centrage
        smOl3Embed.smOLTools_zoomListeNavigations();

        //on cache les colonnes d'infos
        $scope.showInfosNav= false;
        $scope.showInfosPI= false;

        // on signale le nouveau mode
        $scope.mode="liste_navigations";
    }

    // fonction d'affichage d'une nav dans la carte
    $scope.showNavigation= function(id_nav){

        // raz de la gallerie photo
        smPSWGallery.reset();

        // init de la gallerie psw
        smPSWGallery.init( $scope.liste_images[id_nav].images);

        // navigation demandée dans le scope
        $scope.navigation= liste_routes[id_nav];

        // RAZ de la couche d'affichage
        smOl3Embed.smOlTools_clear();

        // cache les départs de navigation
        smOl3Embed.smOlTools_showListeNavigations(false);

        // affichage de la nav du scope
        smOl3Embed.smOLTools_afficher_route($scope.navigation);

        // centrage
        smOl3Embed.smOLTools_zoomLastDraw();

        //on montre la colonne d'infos
        $scope.showInfosNav= true;
        $scope.showInfosPI= false;

        // on signale le nouveau mode
        $scope.mode="show_navigation";
    }

    // COMPORTEMENT DU CONTROLLER
    // démarrage de la carte
    smOl3Embed.smOLTools_startMap("seame_embed_map");

    // on affiche la liste des navigations
    $scope.listeNavigations();

    // listener sur la carte pour les clics sur PI
    smOl3Embed.smOLTools_subscribe($scope, function(){

        // récupération de l'index sélectionné
        var index= smOl3Embed.smOLTools_getIdPI_active();

        // dans un timeout pour maj le scope
        $timeout(function(){

            // si on est en mode'affichage des nav', on affiche la route demandée
            if( $scope.mode == 'liste_navigations'){

                // affichage de la navigation dans la carte
                $scope.showNavigation(index);
            }
            // Si on est en mode 'affichage d'une nav', on affiche le PI demandé
            else if( $scope.mode == 'show_navigation'){
                // PI dans le scope
                $scope.PI= $scope.navigation.PointInteret[index];

                // on montre la colonne d'infos
                $scope.showInfosPI= true;
                $scope.showInfosNav= false;
            }
        });
    });

    // listener sur la carte pour les clics sur les images
    smOl3Embed.smOLTools_subscribeToImage($scope, function(){

        // récupération de l'index sélectionné
        var index= smOl3Embed.smOLTools_getIndexImage_active();

        // affichage de la gallerie
        smPSWGallery.show(index);

    });
}]);/**
 * Created by Gaby on 03/03/2017.
 */
