// Service fournissant la carte smOl3
seaMe.factory('smOl3Embed', ['$rootScope', function($rootScope){
    // Script de gestion de la carte open Layer
    // Version pour open Layer 3
    /////////////////////////////:

    // Variables globales
    var map; //variable globale contenant la carte, affectée à la div 'map'
    var sourceRoute; // variable globale contenant le tracé des routes, pt GPS etc...
    var sourcePI; // source de la couche contenant les PI
    var sourceNavigations; // source de la couche contenant la liste des navigations
    var id_PI_active= 0; // stockage du PI sélectionné
    var index_image_active= 0; // index de l'image cliquée dans le popup

    // variables du popup
    var popup_container = document.getElementById('popup');
    var popup_content = document.getElementById('popup-content');
    var popup_closer = document.getElementById('popup-closer');
    var overlay= null; // layer contenant le popup

    // Evènement émis lors d'un update
    var updateEvent= 'smOl3Event';

    // Evènement émis lors d'un click sur une image
    var imageEvent= 'smOl3Event.image';

    // Bout de code pour rajouter la fonction getLayer à la carte
    // présent dans ol2 mais pas dans ol 3...
    if (ol.Map.prototype.getLayer === undefined) {
        ol.Map.prototype.getLayer = function (id) {
            var layer;
            this.getLayers().forEach(function (lyr) {
                if (id == lyr.get('name')) {
                    layer = lyr;
                }
            });
            return layer;
        }
    }

    // fonction d'init de la carte, appellée dans le onLoad
    function start_map(div)
    {
        // DEFINITON DE LA CARTE

        //variable globale contenant la carte, affectée à la div 'map'
        // les projections sont essentielles pour le fonctionnement de la couche openSeaMap
        map = new ol.Map({
            view : new ol.View({
                projection : 'EPSG:900913', // OSM projection
                center : ol.proj.transform(
                    CONF_start_center,
                    'EPSG:4326',
                    'EPSG:3857'
                ),
                zoom : CONF_start_zoom,
                minZoom : CONF_min_zoom,
                maxZoom : CONF_max_zoom,
            }),
            target : div,
            loadTilesWhileAnimating: true,
            controls: [],
            interactions: ol.interaction.defaults({altShiftDragRotate:false, pinchRotate:false})
        });

        // DEFINITION DES COUCHES

        // Couche Map Box satelitte
        var coucheMapBoxSatellite= new ol.layer.Tile({
            name: 'MB_satellite',
            source: new ol.source.XYZ({
                tileSize: [512, 512],
                crossOrigin: 'anonymous',
                url: 'https://api.mapbox.com/styles/v1/mapbox/satellite-v9/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoiZ2FicmllbHNhaWxpbmciLCJhIjoiY2lwOXNmODM5MDAyY25xbmxrcjF4OGp4aSJ9.FUmQ7phFCC9kvyZJMXwcgA'
            })
        });

        // ajout à la carte
        map.addLayer( coucheMapBoxSatellite);

        // couche openSeaMap : a déclarer après l'ign pour superposer
        // issu de http://openlayers.org/en/v3.5.0/examples/localized-openstreetmap.html
        var coucheBalisage = new ol.layer.Tile({
            name: "openSeaMap",
            visible: true,
            isBaseLayer: true,
            source: new ol.source.OSM({
                attributions: [
                    new ol.Attribution({
                        html: 'All maps &copy; ' +
                        '<a href="http://www.openseamap.org/">OpenSeaMap</a>'
                    }),
                    ol.source.OSM.ATTRIBUTION
                ],
                crossOrigin: 'anonymous',
                url: 'http://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'
            })
        });

        // ajout à la carte
        map.addLayer(coucheBalisage);

        // couche contenant les routes bateaux
        sourceRoute= new ol.source.Vector();
        var coucheRoute= new ol.layer.Vector({
            name: "Routes",
            source: sourceRoute,
            style: setStylePoint()
        });

        // ajout des couches de base à la carte
        map.addLayer(coucheRoute);

        // couche contenant les feature SURVOLES
        var sourceRouteOverlay= new ol.source.Vector();
        var coucheRouteOverlay= new ol.layer.Vector({
            name: "RoutesOverlay",
            source: sourceRouteOverlay,
            style: setStylePointOverlay()
        });

        // ajout des couches de base à la carte
        map.addLayer(coucheRouteOverlay);

        // couche contenant les points d'intérêt
        sourcePI= new ol.source.Vector();
        var couchePI= new ol.layer.Vector({
            name: "RoutesPI",
            source: sourcePI,
            style: setStylePoint()
        });

        // ajout des couches de base à la carte
        map.addLayer(couchePI);

        // COUCHE CLUSTER POUR LA LISTE DE NAVIGATIONS

        // nbr de navs dans la lister
        var nbr= liste_departs.length;

        // Transformation nécessaire pour bien projeter les points
        var transform = ol.proj.getTransform('EPSG:4326', 'EPSG:3857');

        // feature des navs
        var featuresDepart= new Array( nbr);

        // on extrait les coordonnées & les données dans les features
        for( i=0; i<nbr; i++){

            // coordonnées du point. Le parseFloat est essentiel
            var coordinate = transform([
                parseFloat(liste_departs[i].longitude),
                parseFloat(liste_departs[i].latitude)
            ]);

            // feature aux coordonnées
            featuresDepart[i] = new ol.Feature(new ol.geom.Point(coordinate));

            // ajout des type de point & id_route
            featuresDepart[i].set('type_bdd', 'navigation');
            featuresDepart[i].set('id_bdd', liste_departs[i].id_route);
        }

        // source avec les points de départ des navigations
        sourceNavigations = new ol.source.Vector({
            features: featuresDepart
        });

        // cluster regroupant le départ des navs
        var clusterSource = new ol.source.Cluster({
            distance: 40,
            source: sourceNavigations
        });

        // layer contenant le cluster
        var styleCache = {};
        var coucheNavigations = new ol.layer.Vector({
            name: "listeNavigations",
            source: clusterSource,
            style: function(feature, resolution) {
                var size = feature.get('features').length;
                var style = styleCache[size];
                if (!style) {
                    style = [new ol.style.Style({

                        image: new ol.style.Icon({
                            anchor: [CONF_icon_X_OFFSET, CONF_icon_Y_OFFSET],
                            anchorOrigin: 'bottom-left',
                            anchorXUnits: 'pixels',
                            anchorYUnits: 'pixels',
                            opacity: CONF_icon_opacity,
                            src: CONF_icon_navigation,
                            rotation: 0,
                            scale: 1
                        }),

                        text: new ol.style.Text({
                            text: size.toString(),
                            offsetY:15,
                            offsetX:3,
                            fill: new ol.style.Fill({
                                color: '#fff'
                            })
                        })
                    })];

                    styleCache[size] = style;
                }

                return style;
            }
        });

        map.addLayer(coucheNavigations);

        // COUCHE POPUP

        // Overlay pour le popup
        overlay = new ol.Overlay(({
            element: popup_container,
            autoPan: true,
            autoPanAnimation: {
                duration: 250
            }
        }));

        // handler pour fermer le popup
        popup_closer.onclick = function() {
            overlay.setPosition(undefined);
            popup_closer.blur();
            return false;
        };

        // ajout à la carte
        map.addOverlay(overlay);

        // DEFINITION DES INTERACTIONS

        // interaction au survol de la souris
        map.on('pointermove', function(e) {
            if (e.dragging) return;

            displayOverlay(e);
        });

        // interaction au click souris
        map.on('singleclick', function(evt) {
            if (evt.dragging) {
                return;
            }

            displayInfo(evt);
        });
    }

    // function pour afficher un point
    //Les latitudes / longitudes en degrés décimaux (système EPSG 4326)
    function afficher_point(longitude, latitude, data)
    {
        // argument optionnel
        if( !data)
            data= "";

        // Transformation nécessaire pour bien projeter les points
        var transform = ol.proj.getTransform('EPSG:4326', 'EPSG:3857');

        // coordonnées du point. Le parseFloat est essentiel
        var coordinate = transform([
            parseFloat(longitude),
            parseFloat(latitude)
        ]);

        // chaine d'ajout : création d'un objet geometry, qui donne un feature, qu'on ajoute.
        var geometry = new ol.geom.Point(coordinate);
        var feature = new ol.Feature({geometry: geometry});//, id_bdd: id_point, type_bdd: type_point});

        // ajout des données supplémentaires sur le PI
        if( data != "")
        {
            for( var data_key in data)
                feature.set(data_key, data[ data_key]);
        }

        //feature.setGeometry(geometry);
        sourcePI.addFeature(feature);
    }

    // function pour afficher la route d'un bateau
    //Les latitudes / longitudes en degrés décimaux (système EPSG 4326)
    function afficher_ligne(jsonRoute, id_bdd)
    {
        // Enregistrement des points de la route
        // Transformation nécessaire pour bien projeter les points
        var markers=[];
        for( i=0; i <jsonRoute.length; i++)
        {
            markers.push( ol.proj.transform([
                    parseFloat(jsonRoute[i][0]),
                    parseFloat(jsonRoute[i][1])
                ],
                'EPSG:4326',
                'EPSG:3857'
                )
            );
        }

        // chaine d'ajout : création d'un objet geometry, qui donne un feature, qu'on ajoute.
        var geometry = new ol.geom.LineString(markers);
        var featureLine = new ol.Feature({geometry: geometry, id_bdd: id_bdd, type_bdd: 'route'});

        //feature.setGeometry(geometry);
        sourceRoute.addFeature(featureLine);
    }

    // Fonction pour calculer le style d'un feature(la grammaire est un peu zarb)
    // source: http://openlayers.org/en/v3.9.0/examples/vector-labels.html
    function setStylePoint()
    {
        return function(feature, resolution) {

            // Style pour le type "point"
            if( feature.getGeometry().getType() == "Point")
            {
                // style par défaut
                var style = new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: CONF_point_radius,
                        fill: new ol.style.Fill({color: CONF_point_fill_color}),
                        stroke: new ol.style.Stroke({color: CONF_point_stroke_color, width: CONF_point_stroke_width})
                    }),
                    text: setTextStyle(feature, resolution)
                });

                // Récupération du type de point dans la bdd
                var type_point= feature.get('type_bdd');

                // S'il y a des infos sur le type de point, on crée un style
                if( type_point)
                {
                    // sélection du nom du fichier pour l'icône
                    var icone= "";
                    var couleur= "";
                    var angle= 0;
                    var anchor= [CONF_icon_X_OFFSET, CONF_icon_Y_OFFSET];
                    if(type_point == 'depart') {
                        icone= CONF_icon_start;
                    }
                    else if( type_point == 'arrivee'){
                        icone= CONF_icon_finish;
                    }
                    else if( type_point == 'navigation'){
                        icone= CONF_icon_navigation;
                    }
                    else if( type_point == 'photos'){
                        icone= CONF_icon_camera;
                    }
                    else if( type_point == 'texte'){
                        icone= CONF_icon_texte;
                    }
                    else if(type_point == 'pos_actuelle'){
                        icone= CONF_icon_position;
                        angle= data['cap'];
                        anchor= [CONF_icon_position_X_OFFSET, CONF_icon_position_Y_OFFSET];
                    }

                    // création du style
                    var style = new ol.style.Style({

                        image: new ol.style.Icon({
                            anchor: anchor,
                            anchorOrigin: 'bottom-left',
                            anchorXUnits: 'pixels',
                            anchorYUnits: 'pixels',
                            opacity: CONF_icon_opacity,
                            src: icone,
                            rotation: angle * Math.PI / 180,
                            scale: 1
                        })
                    });
                }

                return [style];
            }
            // Style pour le type "ligne" prév
            else if( feature.getGeometry().getType() == "LineString" && feature.get('type_route') == 'previsionnelle')
            {
                // 2 styles :
                var styles = [
                    //1 pour la bordure (trait plus épais)
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: CONF_ligne_prev_border_color,
                            width: CONF_ligne_prev_width + 2,
                            lineDash:CONF_ligne_prev_lineDash
                        })
                    }),

                    // 1 pour l'intérieur (trait plus fin)
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: CONF_ligne_prev_fill_color,
                            width: CONF_ligne_prev_width,
                            lineDash: CONF_ligne_prev_lineDash
                        })
                    })
                ];

                return styles;
            }
            // Style pour les autres type de ligne
            else
            {
                // 2 styles :
                var styles = [
                    //1 pour la bordure (trait plus épais)
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: CONF_ligne_gps_border_color,
                            width: CONF_ligne_gps_width + 2
                        })
                    }),

                    // 1 pour l'intérieur (trait plus fin)
                    new ol.style.Style({
                        stroke: new ol.style.Stroke({
                            color: CONF_ligne_gps_fill_color,
                            width: CONF_ligne_gps_width
                        })
                    })
                ];

                return styles;
            }
        };

    }

    // Fonction pour calculer le label d'un point (Zarb again)
    // source: http://openlayers.org/en/v3.9.0/examples/vector-labels.html
    function setTextStyle(feature, resolution)
    {
        return new ol.style.Text({
            text:feature.get('name'),
            font: CONF_label_font,
            fill: new ol.style.Fill({color: CONF_label_color}),
            offsetX: CONF_label_offsetX,
            offsetY: CONF_label_offsetY
        });
    }

    // Fonction pour calculer le style d'un feature Highlight(la grammaire est un peu zarb)
    // source: http://openlayers.org/en/v3.9.0/examples/vector-labels.html
    function setStylePointOverlay()
    {
        return function(feature, resolution) {

            // Style pour le type "point"
            if( feature.getGeometry().getType() == "Point")
            {
                // style par défaut
                var style = new ol.style.Style({
                    image: new ol.style.Circle({
                        radius: CONF_point_radius_overlay,
                        fill: new ol.style.Fill({color: CONF_point_fill_color_overlay}),
                        stroke: new ol.style.Stroke({color: CONF_point_stroke_color_overlay, width: CONF_point_stroke_width_overlay})
                    }),
                    text: setTextStyleOverlay(feature, resolution)
                });

                // Récupération du type de point dans la bdd
                var type_point= feature.get('type_bdd');

                return [style];
            }
            // Style pour le type "ligne"
            else if( feature.getGeometry().getType() == "LineString")
            {
                var style= new ol.style.Style({
                    stroke: new ol.style.Stroke({
                        color: CONF_ligne_color_overlay,
                        width: CONF_ligne_width_overlay
                    })
                });

                return [style];
            }
        };
    }

    // Fonction pour calculer le label d'un point Highlight (Zarb again)
    // source: http://openlayers.org/en/v3.9.0/examples/vector-labels.html
    function setTextStyleOverlay(feature, resolution)
    {
        return new ol.style.Text({
            text:feature.get('name'),
            font: CONF_label_font_overlay,
            fill: new ol.style.Fill({color: CONF_label_color_overlay}),
            offsetX: CONF_label_offsetX_overlay,
            offsetY: CONF_label_offsetY_overlay
        });
    }

    // fonction lors du survol d'une feature
    function displayOverlay(evt){

        // récupération de la div contenant la carte
        var div= map.getTarget();

        // Repérer la feature sous la souris
        var coord= map.getEventPixel(evt.originalEvent);
        var feature = map.forEachFeatureAtPixel(coord, function(feature, layer) {
            return feature;
        });

        // si pas de feature on raz le curseur et retourne
        if( !feature){
            document.getElementById(div).style.cursor= "";
            return;
        }
        // sinon curseur en forme de point
        else
            document.getElementById(div).style.cursor= "pointer";
    }

    // Fonction mettant en avant une feature lors d'un survol de la souris
    function displayInfo(evt)
    {

        // Repérer la feature sous la souris
        var coord= map.getEventPixel(evt.originalEvent);
        var feature = map.forEachFeatureAtPixel(coord, function(feature, layer) {
            return feature;
        });

        // si pas de feature on cache le popup & retourne
        if( !feature){
            overlay.setPosition(undefined);
            popup_closer.blur();
            return;
        }

        // Si c'est un cluster, on affiche le popup
        if ( feature.get('features') && feature.get('features').length > 0) {

            // chaine de caractère du popup
            var str="";
            popup_content.innerHTML= "";

            // feature contenues dans le cluster
            var features = feature.get('features');

            // on parcourt les feature pour les ajouter au popup
            var index= 0;
            var button= null;
            for(var i = 0; i < features.length; i++) {

                //id de route représentée par la feature
                id= features[i].get('id_bdd');

                // Bouton avec le nom de la route
                button = document.createElement("p");
                button.id = id;
                button.className = "popup_button";
                button.innerHTML = liste_routes[id]['nom_route'];

                // aajout du parent au popup
                popup_content.appendChild(button);

                // lors du click sur un bouton, fonction
                button.onclick= function() {

                    // on cache le popup
                    overlay.setPosition(undefined);
                    popup_closer.blur();

                    // enregistrement du PI actif
                    id_PI_active= this.id; // pour casser les pointeurs

                    // émission d'un évènement update
                    $rootScope.$emit(updateEvent);
                };

                // on s'arrête à 4 routes contenues dans le popup
                index++;
                if( index == 5) {
                    // bouton
                    button = document.createElement("p");
                    button.className = "popup_button";
                    button.innerHTML = '...';

                    // ajout du bouton au popup
                    popup_content.appendChild(button);

                    break;
                }
            }

            // affichage du popup
            overlay.setPosition(evt.coordinate);
        }

        //si c'est une feature type point, renvoie un event avec l'id
        else if (feature.getGeometry().getType() == "Point")
        {
            // reset du popup
            var str="";
            popup_content.innerHTML= "";

            // récupération de l'id du point, du type et des images
            var id= feature.get('id_bdd');
            var type= feature.get('type_bdd');
            var img_src= feature.get('images_bdd');
            var index_image= feature.get('index_image');

            // si pas d'id, on retourne
            if( !id || id == -1)
                return;

            // enregistrement du PI actif
            id_PI_active= id;

            // détermination de l'icone du popup en fonction du type
            var icon_src= "";
            if( type == 'arrivee')
                icon_src= CONF_icon_finish;
            if( type == 'depart')
                icon_src= CONF_icon_start;
            if( type == 'photos')
                icon_src= CONF_icon_camera;

            // div contenant l'en tête
            var en_tete= document.createElement("div");
            en_tete.className = "popup_en_tete";

            // création de l'icone
            var icon = document.createElement("img");
            icon.className = "popup_icon";
            icon.src= icon_src;

            // ajout de l'icone à l'en tête
            en_tete.appendChild(icon);

            // texte avec le type
            var titre = document.createElement("span");
            titre.className = "popup_titre";
            titre.innerHTML= type;

            // ajout du titre à l'en tête
            en_tete.appendChild(titre);

            // ajout de l'en tête au popup
            popup_content.appendChild(en_tete);

            // récupération de l'image si besoin
            if( type == 'photos'){
                // image dans une div
                var div= document.createElement("div");
                div.className=  "popup_image"
                var img= document.createElement("img");
                img.id = index_image;
                img.src= "http://seame.alwaysdata.net/";
                img.src+= img_src[0];
                div.appendChild(img);
                popup_content.appendChild(div);

                // lors du click sur l'image, fonction
                img.onclick= function() {

                    // enregistrement du PI actif
                    index_image_active= this.id;

                    // émission d'un évènement update: clic image
                    $rootScope.$emit(imageEvent);
                };
            }

            // affichage du popup
            overlay.setPosition(evt.coordinate);

            // émission d'un évènement update
            $rootScope.$emit(updateEvent);
        }
    }

    // Pour remettre à zéro la couche d'affichage
    function clearMap()
    {
        map.getLayer("Routes").getSource().clear(true);
        map.getLayer("RoutesPI").getSource().clear(true);
        map.getLayer("RoutesOverlay").getSource().clear(true);
    }

    return {

        // Fonction d'init de la carte
        smOLTools_startMap: function( div)
        {
            /*
             // on reset les div du popup
             smOl3_popup.reset();

             // Refresh du popup s'il existe déjà
             if( ol_couchePopup){

             // On retire la couche de la carte
             map.removeOverlay(ol_couchePopup);

             // on reset la variable de la couche Overlay
             ol_couchePopup=null;
             }
             */

            // Refresh de la carte si elle existe déjà
            if( map )
            {
                // On supprime la carte
                map.setTarget(null);
                map = null;
            }

            // démarrage de la carte
            start_map(div);

            return true;
        },

        // Fonction remettant à zéro la couche d'affichage
        // Fonction traçant une route sur la carte
        smOLTools_afficher_route: function (json)
        {
            // si json vide, on retourne
            if( !json)
                return;

            // 0. Infos de la route
            if( json['Route'])
            {
                jsonRoute= json['Route'];
                id_route= jsonRoute['id_route'];
            }
            else
                id_route= -1;


            // 1. Tracé de la route
            jsonTrace=json['Points'];

            // Enregistrement des points et de l'id de la route
            var markers=[];
            var markers2=[];
            for( var id in jsonTrace)
            {
                // array pour la fonction afficher_ligne d'smOl3
                var temp= [];
                temp[0]= jsonTrace[id]['longitude'];
                temp[1]= jsonTrace[id]['latitude'];

                markers.push( temp);
            }

            // Affichage de la ligne
            afficher_ligne(markers, id_route);

            //2. dessin des points d'intérêts
            if( !json['PointInteret'] )
                return;

            jsonPI= json['PointInteret'];

            // si pas de point d'intérêt on retourne
            if( jsonPI.length == 0)
                return;

            // Tracé de chaque point de 0 à n
            var data={};
            var index_image=1;
            for(var id in jsonPI)
            {
                // init de l'array contenant les données du PI
                data={};

                // copie des données
                data['id_bdd']= jsonPI[id]['id_pointinteret'];
                data['type_bdd']= jsonPI[id]['type'];
                data['id_locale']=id;

                // chemin des images
                if( jsonPI[id]['images']){
                    // copie des images
                    data['images_bdd']= jsonPI[id]['images'];

                    // index de l'image
                    data['index_image']= index_image;
                    index_image+= jsonPI[id]['images'].length;
                }
                else
                    data['images_bdd']= [];

                // affichage du PI
                afficher_point(
                    jsonPI[id]['longitude'],
                    jsonPI[id]['latitude'],
                    data
                );


            }
        },

        // fonction affichant un point
        smOlTools_afficher_point: function(longitude, latitude, data){
            afficher_point( longitude, latitude, data);
        },

        // Pour afficher la dernière position connue
        smOlTools_afficherDernierePosition: function(lon, lat, cap){
            afficher_point( lon,lat, {'type_bdd':'pos_actuelle', 'cap':cap});
        },

        // Zoom adapté à la route venant d'être dessinée
        smOLTools_zoomLastDraw: function()
        {
            // Variable pour l'animation du déplacement
            var pan=	ol.animation.pan({
                duration: 2000,
                source: (map.getView().getCenter())
            });

            //variable pour l'animation du zoom
            var zoom = ol.animation.zoom({
                resolution: map.getView().getResolution()
            });

            // ajout à la carte
            map.beforeRender(zoom);
            map.beforeRender(pan);

            // zoom sur le layer
            map.getView().fit(sourceRoute.getExtent(), map.getSize());
        },

        // Zoom adapté à la liste des navigations
        smOLTools_zoomListeNavigations: function()
        {
            // Variable pour l'animation du déplacement
            var pan=	ol.animation.pan({
                duration: 2000,
                source: (map.getView().getCenter())
            });

            //variable pour l'animation du zoom
            var zoom = ol.animation.zoom({
                resolution: map.getView().getResolution()
            });

            // ajout à la carte
            map.beforeRender(zoom);
            map.beforeRender(pan);

            // zoom sur le layer
            map.getView().fit(sourceNavigations.getExtent(), map.getSize());
        },

        // pour suivre le service depuis un controller
        smOLTools_subscribe: function(scope, callback) {
            var handler = $rootScope.$on(updateEvent, callback);
            scope.$on('$destroy', handler);
        },

        // pour suivre le service depuis un controller (click sur une image)
        smOLTools_subscribeToImage: function(scope, callback) {
            var handler = $rootScope.$on(imageEvent, callback);
            scope.$on('$destroy', handler);
        },

        // Pour obtenir l'id du PI clické
        smOLTools_getIdPI_active: function(){
            return id_PI_active;
        },

        // Pour obtenir l'index de l'image cliquée
        smOLTools_getIndexImage_active: function(){
            return index_image_active;
        },

        // Pour efface tout ce qui a été dessiné
        smOlTools_clear: function(){
            clearMap();
        },

        // toggle du cluster des navs
        smOlTools_showListeNavigations: function(bool){

            // on montre seulement les navs
            map.getLayer('listeNavigations').setVisible(bool);
            map.getLayer('Routes').setVisible(!bool);
            map.getLayer('RoutesPI').setVisible(!bool);

        }
    };
}]);

