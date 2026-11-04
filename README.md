# Fouquet Terrain – hub de terrain

Application web légère pour les relevés de terrain de Fouquet Conseils Environnement. Elle fonctionne sur téléphone, tablette et ordinateur, sans serveur : tout s'exécute dans le navigateur.

Une page d'accueil (le **hub**) donne accès à un module par type de fiche.

| Module | Dossier | État |
|---|---|---|
| Sondages de sol | `sol/` | Disponible |
| Eaux superficielles et sédiments | `eaux-sed/` | Disponible |
| Eaux souterraines | `eaux-sout/` | Disponible |
| Gaz du sol | `gaz-sol/` | Disponible |
| Air ambiant | `air-ambiant/` | Disponible |
| Fiche de visite | `visite/` | Disponible |
| Analyse de risques | `analyse-risques/` | Disponible |

## Structure du dépôt

```
index.html              Hub (liste des modules, liste MODULES en bas du fichier)
manifest.webmanifest    Installation sur l'écran d'accueil
sw.js                   Service worker (fonctionnement hors ligne)
assets/                 Logo et icônes, partagés par tous les modules
sol/                    Module « Sondages de sol »
eaux-sed/               Module « Eaux superficielles et sédiments »
eaux-sout/              Module « Eaux souterraines »
gaz-sol/                Module « Gaz du sol »
air-ambiant/            Module « Air ambiant »
analyse-risques/        Module « Analyse de risques » (fiche de préparation d'intervention)
                        catalogue-ssp.js = textes et risques ; à remplacer pour une autre déclinaison (ex. diagnostic PEMD)
visite/                 Module « Fiche de visite » (questionnaire de visite de site)
  (chaque module : index.html  app.js  style.css)
.nojekyll               Désactive Jekyll sur GitHub Pages
```

## Mise en ligne (GitHub Pages)

1. Déposer tous les fichiers à la racine du dépôt, sur la branche `main`.
2. Settings → Pages → Source : *Deploy from a branch* → branche `main`, dossier `/ (root)` → Save.
3. Après une à deux minutes, le site est disponible à `https://<compte>.github.io/<dépôt>/`.

Première mise en ligne en ligne de commande :

```
git init
git add .
git commit -m "Hub de terrain"
git branch -M main
git remote add origin https://github.com/<compte>/<dépôt>.git
git push -u origin main
```

GitHub Pages sert le site en HTTPS, condition nécessaire pour la caméra, le GPS et l'installation sur l'écran d'accueil.

## Utilisation sur le terrain

- **Installer** : ouvrir l'adresse sur le téléphone, puis Android : menu ⋮ → *Installer l'application* ; iPhone : Partager → *Sur l'écran d'accueil*.
- **Hors ligne** : après un premier chargement avec réseau, l'application s'ouvre sans réseau.
- **Mise à jour** : la nouvelle version s'affiche au chargement suivant (fermer et rouvrir l'application).

## Données et sauvegarde

- Les données sont stockées **dans le navigateur de l'appareil**, séparément pour chaque module : `localStorage` pour les fiches (clés `rs1`, `eaux1`, `esout1`, `gsol1`, `air1`, `ar1`, `visite1`), `IndexedDB` pour les photos et, dans le module visite, le croquis. Il n'y a pas de synchronisation entre appareils.
- Vider les données du navigateur ou désinstaller l'application **efface les données**.
- **Sauvegarde et transfert entre appareils (ordinateur ↔ tablette)** : dans chaque module, le bouton flottant 💾 (en bas à gauche) ouvre le panneau de transfert. *Télécharger* (ordinateur) ou *Partager* (tablette) crée une archive `.zip` contenant les fiches, **les photos, les croquis et les signatures**, pour tout le module, le projet en cours ou la fiche en cours. Sur l'autre appareil : 💾 → *Importer* → choisir l'archive. Le fichier se transmet par mail, cloud (OneDrive, Teams…) ou câble ; il n'y a pas de synchronisation automatique (aucun serveur).
- Règle de fusion à l'import : la version la plus récente d'une fiche l'emporte, fiche entière (comparaison des horodatages, donc heure des appareils à vérifier) ; les photos s'ajoutent. Une archive d'un autre module est refusée. Éviter de modifier la même fiche sur deux appareils en parallèle.
- Les anciens boutons *Partager tout (.json)* restent disponibles (données seules, sans photos ni croquis).
- Stockage : un navigateur peut effacer les données d'un site peu utilisé (**à vérifier** pour Safari/iPadOS, qui applique un délai d'inactivité). Le panneau 💾 permet de demander le stockage durable ; dans tous les cas, exporter régulièrement.
- Chaque module a sa propre base : la sauvegarde se fait module par module.

## Ajouter un module

1. Créer un dossier (ex. `eaux-sed/`) avec `index.html`, `app.js`, `style.css`. Utiliser des chemins relatifs et une clé de stockage propre au module (ex. `localStorage` clé `eaux1`, base IndexedDB `eaux-photos`) ; les modules `eaux-sed/` et `visite/` peuvent servir de base.
2. Ajouter un lien de retour `<a href="../">← Hub de terrain</a>` et la ligne `<link rel="manifest" href="../manifest.webmanifest">`.
3. Dans `index.html` (racine) : passer `etat:'soon'` à `etat:'ok'` et renseigner `url:'eaux-sed/'`.
4. Dans `sw.js` : ajouter les fichiers du module dans `SHELL` et **incrémenter `VERSION`**.

## Points à vérifier avant usage terrain

- **Scan des codes (QR, Code 128, DataMatrix…) par la caméra** : si le navigateur n'a pas l'API native `BarcodeDetector` (cas de tous les navigateurs sur iPhone), l'application charge le lecteur `barcode-detector` (ZXing-C++ en WebAssembly) depuis le CDN jsDelivr, à la première utilisation (réseau requis), puis le service worker le conserve pour le hors ligne. Documentation : https://github.com/Sec-ant/barcode-detector. **À faire** : figer une version exacte dans `BD_URL` (`sol/app.js` et `eaux-sed/app.js`) ou copier les fichiers dans le dépôt (`vendor/`) ; à tester sur vos étiquettes réelles (taille, éclairage, distance). Sans lecteur : saisie manuelle ou douchette Bluetooth en mode clavier.
- **Fond de carte IGN sur l'export** : choisi par projet (Aucun / Orthophoto / Plan IGN), demandé en Lambert-93 au service WMS-raster de la Géoplateforme (`https://data.geopf.fr/wms-r`). Réseau requis à l'export. À vérifier : autorisation CORS du serveur (sinon la carte s'exporte sans fond, avec un message), nom de la couche « Plan IGN », ordre des axes du BBOX, limites d'usage (https://geoservices.ign.fr/usages). La mention « © IGN – Géoplateforme » figure sur la carte.
- **Fond IGN sur les plans** (modules `eaux-sed/` et `visite/`) : l'image du fond est affichée directement depuis la Géoplateforme (même service WMS-raster que ci-dessus), sans export canevas. Mêmes points à vérifier : nom des couches (`ORTHOIMAGERY.ORTHOPHOTOS.BDORTHO`, `GEOGRAPHICALGRIDSYSTEMS.PLANIGNV2`), ordre des axes du BBOX, limites d'usage. Sans réseau, le plan s'affiche sans fond.
- **Météo préremplie** (module `eaux-sed/`) : appel au service Open-Meteo (https://open-meteo.com/en/docs) avec la position GPS : conditions du jour et cumul de pluie sur 3 et 20 jours. **À vérifier** : paramètres de l'API, correspondance des codes météo avec les libellés de la fiche, conditions d'usage pour un usage professionnel. Réseau requis ; sinon saisie manuelle. Les valeurs restent modifiables.
- **Calculs de purge** (module `eaux-sout/`) : capacité en eau = π × (diamètre/2)² × (PT − NS) ; volume minimum = nombre de volumes × capacité (5 par défaut, repris du modèle maison, champ modifiable) ; volume extrait = durée × débit. **À vérifier** : le nombre de volumes à renouveler et la norme de référence (le modèle indique seulement « norme »), et le repère commun de PT, NS et profondeur de pompage. La coupe de l'ouvrage (repère, NS, PT) et les calculs se mettent à jour à chaque saisie. Les formules du modèle Excel d'origine utilisaient un diamètre fixe de 51,4 mm et π = 3,14 : l'application utilise le diamètre saisi.
- **Gaz du sol** (module `gaz-sol/`) : volume mort = π × (d/2)² × profondeur + volume du tuyau de prélèvement ; volume purgé = temps × débit ; volume pompé = durée × moyenne de Qmi et Qmf. Le modèle d'origine ne donne aucune formule : **à valider avec votre procédure**. Le nombre de volumes morts à purger est laissé vide (aucune valeur dans le modèle) ; l'avertissement ne s'affiche que s'il est renseigné. Le libellé « Mercure v… » du modèle est tronqué : « Mercure vapeur » à confirmer.
- **Air ambiant** (module `air-ambiant/`) : la correspondance entre les listes cachées du modèle intérieur/extérieur et les champs a été déduite de la position dans la fiche (par ex. chauffage, source de combustion, revêtements) : **à vérifier**. Dates et heures de pose et de récupération saisies avec la date (un prélèvement passif peut durer plusieurs jours). Volume pompé par ligne = temps × débit individuel ; le total est multiplié par le nombre de pompes si renseigné : à valider.
- **Analyse de risques** (module `analyse-risques/`) : les textes juridiques et le catalogue de risques sont repris à l'identique du document Word d'origine (fichier `catalogue-ssp.js`), y compris ses fautes éventuelles : à corriger à la source. **À faire valider** par la personne compétente (références au Code du travail, valeur d'une signature manuscrite saisie sur écran). La pagination « Page x sur y » à l'impression repose sur la prise en charge des marges de page par le navigateur (contrôlée avec Chromium).
- **Croquis tactile** (module `visite/`) : enregistré en PNG dans IndexedDB de l'appareil ; à tester au doigt et au stylet sur vos appareils.
- **GPS** : précision d'un téléphone de l'ordre de quelques mètres, affichée dans la fiche. Conversion WGS84 vers Lambert-93 (EPSG:2154), France métropolitaine uniquement. Le Z (NGF) reste en saisie manuelle (l'altitude GPS d'un téléphone est peu fiable).
- **Fiche imprimable, PDF, JPEG** : le partage de fichiers dépend du navigateur ; sinon, utiliser l'aperçu puis Imprimer.
- Application **non testée sur appareils réels** au moment de la rédaction : faire un essai complet avant une campagne.

## Licence

Code **propriétaire** : © 2026 Fouquet Conseils Environnement, tous droits réservés. Aucune réutilisation, copie ni modification sans autorisation écrite préalable. Voir le fichier `LICENSE`. Les composants et services tiers (lecteur de codes-barres, Open-Meteo, Géoplateforme IGN) restent soumis à leurs propres conditions.
