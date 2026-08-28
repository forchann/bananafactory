# 🍌 Banana Factory

Un jeu incrémental jouable dans le navigateur : vous cliquez sur une banane, puis
la plantation prend le relais. **Chaque « découverte » achetée ajoute une vraie
mécanique de jeu ou un minijeu complet** — pas seulement un chiffre qui monte.

Tout tourne en local : aucun serveur, aucun compte, la progression est stockée
dans le `localStorage` du navigateur.

## Lancer le jeu

Ouvrez simplement `index.html` dans un navigateur. Aucune installation, aucune
étape de build : le jeu est en HTML/CSS/JavaScript sans dépendance.

Pour un serveur local (utile si votre navigateur restreint `file://`) :

```sh
npx http-server -p 8080 .   # puis http://127.0.0.1:8080
```

## Contenu

| | |
|---|---|
| Producteurs | 12, du Singe Cueilleur au Trou Noir à Bananes |
| Découvertes | 19, chacune ouvre une mécanique ou un minijeu |
| Minijeux | 7, entièrement jouables |
| Améliorations | 81 |
| Défis | 50, dont 12 débloquent une banane rare exclusive |
| Bananes rares | 54, chacune avec un bonus permanent |
| Reliques | 10, améliorables sur plusieurs dizaines de niveaux |
| Sprites PixelLab | 121 |

### Les 19 découvertes

Elles s'achètent avec des bananes (les deux dernières avec des Graines d'Or) et
apparaissent au fil de la progression :

1. **Gants Antidérapants** — combo de clics
2. **Machette Affûtée** — coups critiques
3. **Loupe du Botaniste** — bananes rares et Album
4. **Filet à Papillons** — bananes dorées qui traversent l'écran
5. **Table de Tri** — minijeu *Tri Express*
6. **Carnet de Défis** — les 50 défis
7. **Mixeur à Smoothies** — boosts actifs à déclencher soi-même
8. **Éplucheuse Turbo** — minijeu *Peel Rush*
9. **Tambours du Chef** — minijeu *Mémoire du Singe*
10. **Comptoir du Marché** — cours de la banane, ventes, lots rares
11. **Trieuse Optique** — minijeu *Banana Match*
12. **Chambre de Mutation** — forcer une rareté contre des jetons
13. **Carte au Trésor** — minijeu *Chasse au Trésor*
14. **Registre de la Coopérative** — contrats chronométrés à série
15. **Autel de la Grande Récolte** — prestige et Graines d'Or
16. **Roue de la Fortune** — minijeu *Roue*
17. **Piste de la Jungle** — minijeu *Course de la Jungle*
18. **Sanctuaire des Reliques** — arbre permanent acheté en Graines d'Or
19. **Contremaître Robot** — achat automatique du meilleur producteur

### Les 7 minijeux

| Minijeu | Principe |
|---|---|
| Tri Express | Trier les bananes sur un tapis roulant qui accélère ; 3 erreurs et c'est fini |
| Peel Rush | 20 s pour éplucher un maximum de bananes dans le bon sens |
| Mémoire du Singe | Reproduire une séquence de tambours qui s'allonge |
| Banana Match | Match-3 sur grille 7×7 avec cascades, 45 s |
| Chasse au Trésor | Grille à creuser façon démineur, avec retraite possible |
| Course de la Jungle | Runner : sauter, glisser, ramasser |
| Roue de la Fortune | Un jeton par tour, douze cases dont une banane rare |

### Les bananes rares

54 spécimens répartis en cinq raretés (peu commune → mythique). Chacun accorde un
bonus permanent qui **survit aux Grandes Récoltes**. Les doublons sont convertis
en jetons. Cinq sources différentes :

- **au hasard** en récoltant (avec un délai minimal entre deux trouvailles) ;
- **12 défis** en offrent une, introuvable autrement ;
- les **minijeux** et les **contrats** ;
- le **Marché**, qui met un lot en vente régulièrement ;
- les **Grandes Récoltes**, pour deux d'entre elles.

La **Chambre de Mutation** permet de cibler une rareté minimale contre des jetons,
pour ne pas rester bloqué sur les derniers spécimens.

## Bruitages

Tous les sons sont **synthétisés à la volée** avec l'API Web Audio : pas un seul
fichier audio à télécharger, et le jeu reste sonore hors-ligne. 26 sons couvrent
le clic (dont la hauteur monte avec le combo), les coups critiques, les achats,
les découvertes, les bananes rares (la fanfare s'allonge avec la rareté), les
bananes dorées, les défis, les contrats, la Grande Récolte et chacun des sept
minijeux.

Le contexte audio n'est créé qu'au premier geste de l'utilisateur, comme
l'exigent les navigateurs. L'onglet **Options** propose une case *Bruitages* et
un curseur de volume, tous deux sauvegardés. Un limiteur borne le nombre de voix
simultanées et espace les sons répétitifs, pour que le clic frénétique reste
supportable.

## Durée de vie

Une simulation d'équilibrage (`tools/`) donne, pour un joueur actif : première
banane rare vers 11 min, premier minijeu vers 23 min, marché vers 57 min,
contrats vers 1 h 40, première Grande Récolte vers 2 h 36. Un joueur passif
atteint la Grande Récolte vers 3 h 27. S'ajoutent ensuite la boucle de prestige,
l'arbre de reliques et la complétion de l'Album, qui portent la durée de vie bien
au-delà de trois heures.

## Structure

```
index.html            page unique
css/style.css         thème pixel art tropical
js/assets.js          résolution des sprites (local / PixelLab / cache), généré
js/audio.js           bruitages synthétisés (Web Audio, sans fichier)
js/util.js            formatage, aléatoire, helpers DOM
js/data-*.js          données : producteurs, rares, découvertes,
                      améliorations, défis, reliques
js/game.js            moteur : économie, rares, contrats, prestige, sauvegarde
js/minigames.js       les 7 minijeux
js/ui.js              onglets, listes, effets, modales
js/main.js            amorçage et boucle principale
assets/               sprites PixelLab
tools/assets.tsv      manifeste sprite → job PixelLab (source de vérité)
tools/download-assets.{sh,ps1,mjs}  récupèrent les PNG, trois systèmes
tools/gen-assets-js.mjs    régénère js/assets.js
tools/gen-downloaders.mjs  régénère les trois scripts de téléchargement
tools/check-assets.mjs     vérifie que chaque sprite référencé existe
```

## Sauvegarde

- Sauvegarde automatique toutes les 12 secondes, ainsi qu'à la fermeture de l'onglet.
- Production hors-ligne : jusqu'à 8 h (12 h avec l'amélioration *Veilleur de Nuit*),
  à rendement réduit.
- Export / import par code texte, et effacement complet, dans l'onglet **Options**.

## Sprites et images

Les 121 visuels sont générés avec [PixelLab](https://pixellab.ai). Le jeu sait
les charger de deux façons, et bascule tout seul :

1. **PNG présents dans `assets/`** — ils sont utilisés directement, aucun réseau
   n'est nécessaire, même au tout premier lancement.
2. **`assets/` vide** — les sprites sont chargés depuis PixelLab (URLs publiques,
   sans compte ni clé), puis **mis en cache dans IndexedDB**. Dès le deuxième
   lancement, le jeu fonctionne intégralement hors-ligne.

Si les deux échouent, l'interface reste jouable et bascule sur un repli
graphique : cadre en bois pour les icônes, aplats colorés dans les minijeux.

### Télécharger les images sur votre machine

Trois scripts autonomes, au choix — ils créent l'arborescence `assets/` complète
et peuvent être relancés sans risque (seuls les fichiers manquants sont repris) :

```sh
# macOS / Linux
tools/download-assets.sh

# Windows (PowerShell)
powershell -ExecutionPolicy Bypass -File tools\download-assets.ps1

# n'importe quel système, avec Node 18+
node tools/download-assets.mjs
```

Options communes : `--force` pour tout retélécharger, `--out CHEMIN`
(`-Out` en PowerShell) pour écrire ailleurs. Par défaut, les scripts écrivent
dans le dossier du jeu s'ils le trouvent, sinon dans le dossier courant.

L'arborescence produite :

```
assets/generators/   12 sprites   producteurs
assets/minigames/    21 sprites   icônes et éléments des minijeux
assets/misc/          7 sprites   banane principale, décor, jetons, graines…
assets/rares/        54 sprites   la collection complète
assets/upgrades/     27 sprites   améliorations, découvertes, reliques
```

### Maintenance des sprites

`tools/assets.tsv` est la source de vérité (chemin ↔ identifiant de job
PixelLab). Après l'avoir modifié, régénérez ce qui en dépend :

```sh
node tools/gen-assets-js.mjs     # met à jour js/assets.js
node tools/gen-downloaders.mjs   # met à jour les trois scripts
node tools/check-assets.mjs      # vérifie que rien n'est référencé sans sprite
```
