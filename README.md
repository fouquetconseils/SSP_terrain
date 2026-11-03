# Fouquet Terrain – hub de terrain

Application web légère pour les relevés de terrain de Fouquet Conseils Environnement. Elle fonctionne sur téléphone, tablette et ordinateur, sans serveur : tout s'exécute dans le navigateur.

Une page d'accueil (le **hub**) donne accès à un module par type de fiche.

| Module | Dossier | État |
|---|---|---|
| Sondages de sol | `sol/` | Disponible |
| Eaux superficielles et sédiments | `eaux-sed/` | Disponible |
| Fiche de visite | `visite/` | Disponible |
| Eaux souterraines | – | À venir |
| Analyse des risques | – | À venir |

## Structure du dépôt

```
index.html              Hub (liste des modules, liste MODULES en bas du fichier)
manifest.webmanifest    Installation sur l'écran d'accueil
sw.js                   Service worker (fonctionnement hors ligne)
assets/                 Logo et icônes, partagés par tous les modules
sol/                    Module « Sondages de sol »
eaux-sed/               Module « Eaux superficielles et sédiments »
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

- Les données sont stockées **dans le navigateur de l'appareil**, séparément pour chaque module : `localStorage` pour les fiches (clés `rs1`, `eaux1`, `visite1`), `IndexedDB` pour les photos et, dans le module visite, le croquis. Il n'y a pas de synchronisation entre appareils.
- Vider les données du navigateur ou désinstaller l'application **efface les données**.
- Sauvegarde et transfert : dans chaque module, page Projets → *Partager tout (.json)* ; import sur l'autre appareil avec *Importer un fichier*. Les photos (et le croquis du module visite) ne sont **pas** inclus dans le JSON : utiliser les boutons de partage de l'onglet Export de chaque fiche.
- Règle de fusion à l'import : la version la plus récente d'une fiche l'emporte (comparaison des horodatages). Vérifier que l'heure des appareils est correcte.

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
- **Croquis tactile** (module `visite/`) : enregistré en PNG dans IndexedDB de l'appareil ; à tester au doigt et au stylet sur vos appareils.
- **GPS** : précision d'un téléphone de l'ordre de quelques mètres, affichée dans la fiche. Conversion WGS84 vers Lambert-93 (EPSG:2154), France métropolitaine uniquement. Le Z (NGF) reste en saisie manuelle (l'altitude GPS d'un téléphone est peu fiable).
- **Fiche imprimable, PDF, JPEG** : le partage de fichiers dépend du navigateur ; sinon, utiliser l'aperçu puis Imprimer.
- Application **non testée sur appareils réels** au moment de la rédaction : faire un essai complet avant une campagne.

## Licence

Code **propriétaire** : © 2026 Fouquet Conseils Environnement, tous droits réservés. Aucune réutilisation, copie ni modification sans autorisation écrite préalable. Voir le fichier `LICENSE`. Les composants et services tiers (lecteur de codes-barres, Open-Meteo, Géoplateforme IGN) restent soumis à leurs propres conditions.
