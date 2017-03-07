// service de gestion de la bibliothèque d'image PSW
seaMe.factory('smPSWGallery', [ function(){

    // variables globales
    var listImagesGallerie=[]; // variable globale contenant les infos sur les images à afficher
    var gallery; // gallerie pws

    // Fonction remettant la galerie à zéro si nécessaire
    function PSWresetGallerie()
    {
        listImagesGallerie=[];
    }

    // Fonction ajoutant une image à la gallerie
    function PSWpushImage( src)
    {
        // init de l'image
        var img = new Image();

        // au chargement de l'image, calcul des dimensions et ajout à la gallerie
        img.onload = function(){
            var temp= {src: src, w:this.width, h: this.height};

            listImagesGallerie.push(temp);
        };

        // chargement de l'image
        img.src = src;
    }


    // fonction de lancement d'une galleriePhotoSwipe
    // prend en paramètre un array avec les photoswipe
    // items : [ {src: chemin1, w: largeur1, h: hauteur1}, {src: chemin2, w: largeur2, h: hauteur2}]
    function PSWGallerie()
    {
        // si pas d'image on retourne
        if (listImagesGallerie.length ==0)
            return;

        // div pswp (fournit par le include de photoswipe_include)
        var pswpElement = document.querySelectorAll('.pswp')[0];

        // options
        var options = {
            // history & focus options are disabled on CodePen
            history: false,
            focus: false,
            //closeOnVerticalDrag:false,
            showAnimationDuration: 0,
            hideAnimationDuration: 0

        };

        // Affichage de la gallerie photo
        gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, listImagesGallerie, options);
        gallery.init();
    }

    return {
        reset: function(){
            return PSWresetGallerie();
        },

        init: function(images){
            // Ajout des images à la gallerie
            for( var i=0; i < images.length; i++)
            {
                PSWpushImage("http://seame.alwaysdata.net/" + images[i]);
            }
        },

        show: function(index){
            // Affichage de la gallerie
            PSWGallerie();

            // déplacment à l'index demandé
            gallery.goTo(index-1); // il faut un -1 pour un bug de photoswipe
        }

    };
}]);
