# Fouquet Terrain – hub de terrain

Application web légère pour les relevés de terrain de Fouquet Conseils Environnement. Elle fonctionne sur téléphone, tablette et ordinateur, sans serveur : tout s'exécute dans le navigateur.

Une page d'accueil (le **hub**) donne accès à un module par type de fiche.

| Module | Dossier | État |
|---|---|---|
| Sondages de sol | `sol/` | Disponible |
| Eaux | – | À venir |
| Sédiments | – | À venir |
| Fiche de visite | – | À venir |
| Analyse des risques | – | À venir |

## Structure du dépôt

```
index.html              Hub (liste des modules, liste MODULES en bas du fichier)
manifest.webmanifest    Installation sur l'écran d'accueil
sw.js                   Service worker (fonctionnement hors ligne)
assets/                 Logo et icônes, partagés par tous les modules
sol/                    Module « Sondages de sol »
  index.html  app.js  style.css
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
git commit -m "Hub de terrain : module sondages de sol"
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

- Les données sont stockées **dans le navigateur de l'appareil** (`localStorage` pour les fiches, `IndexedDB` pour les photos). Il n'y a pas de synchronisation entre appareils.
- Vider les données du navigateur ou désinstaller l'application **efface les données**.
- Sauvegarde et transfert : module Sondages de sol → page Projets → *Partager tout (.json)* ; import sur l'autre appareil avec *Importer un fichier*. Les photos ne sont pas incluses dans le JSON : utiliser *Partager les photos du sondage* (onglet Export).
- Règle de fusion à l'import : la version la plus récente d'un sondage l'emporte (comparaison des horodatages). Vérifier que l'heure des appareils est correcte.

## Ajouter un module

1. Créer un dossier (ex. `eaux/`) avec `index.html`, `app.js`, `style.css`. Utiliser des chemins relatifs et une clé de stockage propre au module (ex. `localStorage` clé `eaux1`, base IndexedDB `eaux-photos`).
2. Ajouter un lien de retour `<a href="../">← Hub de terrain</a>` et la ligne `<link rel="manifest" href="../manifest.webmanifest">`.
3. Dans `index.html` (racine) : passer `etat:'soon'` à `etat:'ok'` et renseigner `url:'eaux/'`.
4. Dans `sw.js` : ajouter les fichiers du module dans `SHELL` et **incrémenter `VERSION`**.

## Points à vérifier avant usage terrain

- **Scan de codes-barres par la caméra** : repose sur l'API `BarcodeDetector`, absente de Safari sur iPhone. Sans elle : saisie manuelle ou douchette Bluetooth. Compatibilité : https://developer.mozilla.org/docs/Web/API/BarcodeDetector
- **GPS** : précision d'un téléphone de l'ordre de quelques mètres, affichée dans la fiche. Conversion WGS84 vers Lambert-93 (EPSG:2154), France métropolitaine uniquement. Le Z (NGF) reste en saisie manuelle.
- **Fiche imprimable, PDF, JPEG** : le partage de fichiers dépend du navigateur ; sinon, utiliser l'aperçu puis Imprimer.
- Application **non testée sur appareils réels** au moment de la rédaction : faire un essai complet avant une campagne.
