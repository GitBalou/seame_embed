// Configuration javascript

// INITIALISION DES IMAGES PAR DEFAUT
var CONF_AVATAR_DEFAULT= 'style/avatar_default.png';

// INITIALISATION DE LA CARTE OPENLAYER
// Coordonnées de démarrage pour centrer la carte
var CONF_start_center= [-3.2, 47.5];

// Zoom de démarrage de la carte
var CONF_start_zoom= 9;

// Zoom min de la carte
var CONF_min_zoom=0;

// Zoom max de la carte
var CONF_max_zoom= 20;

// STYLE DU POINT GPS
// Rayon du point
var CONF_point_radius= 5;

// couleur de remplissage
var CONF_point_fill_color= 'rgba(3,169,244,0.8)'; // rgb + opacité

// Couleur du contour
var CONF_point_stroke_color= 'rgba(0,0,0,1)'; // rgb + opacité

// épaisseur du contour
var CONF_point_stroke_width= 1;

// STYLE DES TRACES REELLES
// Couleur de la bordure
var CONF_ligne_gps_border_color= 'rgba(0,0,0,1)';//'rgba(3,169,244,1)';

// couleur de l'intérieur du trait
var CONF_ligne_gps_fill_color= 'rgba(3,169,244,1)';

// épaisseur du trait
var CONF_ligne_gps_width= 2;

// STYLE DES TRACES PREVISIONNELLES
// Couleur de la bordure
var CONF_ligne_prev_border_color= 'rgba(0,0,0,0.3)';//'rgba(3,169,244,1)';

// couleur de l'intérieur du trait
var CONF_ligne_prev_fill_color= 'rgba(3,169,244,0.3)';

// épaisseur du trait
var CONF_ligne_prev_width= 2;

// Pointillé
var CONF_ligne_prev_lineDash= [0.1, 10];

// STYLE DU LABEL
// Font (écriture similaire au csss)
var CONF_label_font= '8px Arial, Verdana, Helvetica, sans-serif'

// Couleur du texte
var CONF_label_color= 'rgba(0, 0, 0, 1)';

// X offset
var CONF_label_offsetX=	10;

// Y offset
var CONF_label_offsetY=	10;

// STYLE DU POINT GPS EN highlight( superposition)
// Rayon du point
var CONF_point_radius_overlay= 10;

// couleur de remplissage
var CONF_point_fill_color_overlay= 'rgba(255,255,255, 1)'; // rgb + opacité

// Couleur du contour
var CONF_point_stroke_color_overlay= 'rgba(255,255,255,1)'; // rgb + opacité

// épaisseur du contour
var CONF_point_stroke_width_overlay= 1;

// STYLE DES LIGNES EN highlight
// Couleur du trait
var CONF_ligne_color_overlay= 'rgba(212,18,67,1)';

// épaisseur du trait
var CONF_ligne_width_overlay= 2;

// STYLE DU LABEL EN highlight
// Font (écriture similaire au csss)
var CONF_label_font_overlay= 'bold 15px Arial, Verdana, Helvetica, sans-serif'

// Couleur du texte
var CONF_label_color_overlay= 'rgba(0, 0,0, 1)';

// X offset
var CONF_label_offsetX_overlay=	10;

// Y offset
var CONF_label_offsetY_overlay=	10;

// STYLE DES ICONES

// icone de départ
var CONF_icon_start= "http://seame.alwaysdata.net/style/icon_anchor_start.png";//"style/icon_flag_start.png";

// icone d'arrivée
var CONF_icon_finish=  "http://seame.alwaysdata.net/style/icon_anchor_finish.png";//"style/icon_flag_finish.png";

// icone de navigation
var CONF_icon_navigation= "http://seame.alwaysdata.net/style/icon_sailboat.png";

// icone de waypoint
var CONF_icon_waypoint= "http://seame.alwaysdata.net/style/icon_waypoint.png";
var CONF_icon_waypoint_X_OFFSET=5;
var CONF_icon_waypoint_Y_OFFSET=5;

// icone de photo
var CONF_icon_camera= "http://seame.alwaysdata.net/style/icon_camera.png";

// icone de texte
var CONF_icon_texte= "http://seame.alwaysdata.net/style/icontexte.png";

// icone du port de référence
var CONF_icon_maree= "http://seame.alwaysdata.net/style/iconmaree.png";

// icone pour la position actuelle
var CONF_icon_position= "http://seame.alwaysdata.net/style/icon_fleche.png";
var CONF_icon_position_X_OFFSET= 10;
var CONF_icon_position_Y_OFFSET= 5;

// centrage horizontal des icones (par défaut) (en fraction de la largeur de l'icone)
var CONF_icon_X_OFFSET= 8;

// centrage vertical des icones (par défaut) (en fraction de la hauteur de l'icone)
var CONF_icon_Y_OFFSET= 8;

// opacité des icones (entre 0 et 1)
var CONF_icon_opacity=1;