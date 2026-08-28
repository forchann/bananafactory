#!/usr/bin/env bash
#
# Banana Factory — telecharge les 121 sprites PixelLab dans assets/
#
#   ./download-assets.sh              # ecrit dans le dossier du jeu
#   ./download-assets.sh --force      # retelecharge meme si le fichier existe
#   ./download-assets.sh --out CHEMIN # ecrit ailleurs
#
# Necessite bash et curl. Aucun compte ni cle d API : les URLs sont publiques.
# Script genere par tools/gen-downloaders.mjs — ne pas editer a la main.

set -uo pipefail

BASE="https://api.pixellab.ai/mcp/images/"
FORCE=0
OUT=""

while [ $# -gt 0 ]; do
  case "$1" in
    --force) FORCE=1; shift ;;
    --out)   OUT="${2:-}"; shift 2 ;;
    -h|--help) sed -n "3,7p" "$0" | sed "s/^# \{0,1\}//"; exit 0 ;;
    *) echo "option inconnue : $1"; exit 2 ;;
  esac
done

# Racine : le dossier du jeu si on le trouve, sinon le dossier courant.
if [ -z "$OUT" ]; then
  here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
  if   [ -f "$here/../index.html" ]; then OUT="$(cd "$here/.." && pwd)"
  elif [ -f "$here/index.html" ];    then OUT="$here"
  else OUT="$PWD"; fi
fi

command -v curl >/dev/null 2>&1 || { echo "curl est requis mais introuvable."; exit 1; }

echo "Banana Factory — 121 sprites"
echo "Destination : $OUT/assets"
echo

ok=0; skip=0; fail=0; i=0; failed_list=""

fetch() {
  job="$1"; dest="$OUT/$2"; i=$((i+1))
  printf "\r  [%3d/121] %-42s" "$i" "$(basename "$dest")"
  if [ -s "$dest" ] && [ "$FORCE" -eq 0 ]; then skip=$((skip+1)); return; fi
  mkdir -p "$(dirname "$dest")"
  for attempt in 1 2 3; do
    code=$(curl -fsSL --retry 2 --max-time 60 -w "%{http_code}" -o "$dest.part" "$BASE$job/download" 2>/dev/null) || code=000
    if [ "$code" = "200" ] && [ -s "$dest.part" ]; then
      mv -f "$dest.part" "$dest"; ok=$((ok+1)); return
    fi
    sleep "$attempt"
  done
  rm -f "$dest.part"; fail=$((fail+1)); failed_list="$failed_list%%$2"
}

fetch 5f6842df-8bf5-4eff-8f8e-9d7faf5717db assets/generators/labo.png
fetch 0116fc98-5234-4136-ab80-7d29413c034d assets/generators/orbitale.png
fetch 7e41f7a4-c7ce-451a-adf5-c853da2f8beb assets/generators/plantation.png
fetch 32eba6d5-5cd2-4551-a664-aba1cf99e93e assets/generators/portail.png
fetch c25b51ba-5fa4-4d8e-afae-c776c56b2650 assets/generators/presse.png
fetch 18ee3e02-d584-4f3d-947a-b867f7e36902 assets/generators/robot.png
fetch 0a16a032-ef9c-4f2d-bad8-ab7c9e0b00c1 assets/generators/serre.png
fetch 6db394a3-d469-402c-bc2a-3752055140a6 assets/generators/singe.png
fetch 752cdce8-5ac2-4a6d-8fb5-7005ebff1ba2 assets/generators/tapis.png
fetch 71699829-78d3-42b1-9ede-8d52ca3f47f2 assets/generators/temple.png
fetch 03779999-4c44-4409-bba2-c6e11bf21234 assets/generators/trounoir.png
fetch 90089deb-216d-4e6f-ad98-99846d895b3e assets/generators/usine.png
fetch d7a81b5b-d762-48f3-b0af-95c7db59866a assets/minigames/b_mure.png
fetch 27877f51-1b3e-415e-9d34-56a0f783cf9a assets/minigames/b_or.png
fetch 84ec634c-b3bb-49a8-b50b-3ee094c9b69d assets/minigames/b_pourrie.png
fetch 170838b8-09a8-4ecb-8df2-720ae0098dc9 assets/minigames/b_verte.png
fetch 56fc826d-772e-4c5e-9b14-2860ada9c8eb assets/minigames/coffre.png
fetch b20deade-2f4b-4f76-9d28-3c1bf30304fc assets/minigames/f_ananas.png
fetch 04c820ac-e01e-4153-b3ba-44e0e439f086 assets/minigames/f_banane.png
fetch 34a98dbf-7b1c-4fa4-9a6b-cb43b3d2c195 assets/minigames/f_cerise.png
fetch 6d01faf4-7c86-4ba1-9e18-b21d156eec39 assets/minigames/f_coco.png
fetch 7643475d-ded4-4275-bc32-97e8375c944e assets/minigames/f_fraise.png
fetch ff55ded6-aecf-46cd-9ea3-719d9d093d66 assets/minigames/f_kiwi.png
fetch cac37e5e-9622-4297-9538-7af9c2e4c280 assets/minigames/liane.png
fetch 58ff742f-9c99-4a15-bf7a-a09def546349 assets/minigames/mg_course.png
fetch 2d7ca0de-6eb6-49e8-8db3-5198d2676094 assets/minigames/mg_match.png
fetch baec597d-7f9e-40c8-b593-0bb1914daa0d assets/minigames/mg_memoire.png
fetch b47cc3ca-61b3-4062-8f3c-969d70c3fb99 assets/minigames/mg_peel.png
fetch 46ed2f94-d9c6-47b8-bf7c-229c054da4bf assets/minigames/mg_roue.png
fetch 436c4b69-75d5-424d-9920-f3edd47e0edf assets/minigames/mg_tresor.png
fetch cc385479-ccc0-4d7d-a6cf-d5806f7a5032 assets/minigames/mg_tri.png
fetch 13fb5c2c-2c21-4a5d-bc01-7c71baf8192d assets/minigames/rocher.png
fetch 4bfc4c7c-a35e-4464-9608-06bdbc4cc542 assets/minigames/singe_court.png
fetch 0448f110-c740-4d22-8889-f348529cc6f2 assets/misc/banana_gold.png
fetch 913f3fda-5142-4919-9282-94e27311ee7c assets/misc/banana_hero.png
fetch 9a0efffe-41ae-4021-a90f-a65375220bd4 assets/misc/bg_plantation.png
fetch 8ee476e5-5e2e-45a6-bdfe-257fa882159d assets/misc/book.png
fetch 1adc2b72-1321-423c-81d2-205bd16b43c6 assets/misc/seed_gold.png
fetch d8176fd0-3330-4c6a-b538-ebdd6e19edd2 assets/misc/token.png
fetch ee4a8545-44d9-4dbd-8452-96eb71e7ef17 assets/misc/trophy.png
fetch b57df838-a849-4a89-95f0-e12b69b6d1a7 assets/rares/alphaomega.png
fetch 6db8ade1-e2ec-40e6-b8a1-a460b0e6d15a assets/rares/arcenciel.png
fetch 06e2a447-c0a1-49e3-8146-a82208e4d653 assets/rares/astronaute.png
fetch 46a91d30-a80f-4ec6-9443-0f4db5b45012 assets/rares/bleue.png
fetch 8f927295-1ec4-4955-917c-3aa637ebd365 assets/rares/bonbon.png
fetch da3311f2-bd43-4a67-81f2-6c5a4cdf1d0b assets/rares/boomerang.png
fetch e07420a7-e352-4be5-9aab-c6a4b7100b40 assets/rares/cactus.png
fetch b70e6377-be48-4973-b4ec-05e6617efc66 assets/rares/carree.png
fetch eb7e2400-afcb-475b-a3cd-88d33d0481c2 assets/rares/celeste.png
fetch 8376c240-c237-4047-b54f-c5be922dc1cf assets/rares/champignon.png
fetch b46980c7-81be-43a6-8a83-342e336c103c assets/rares/chaos.png
fetch 11d8dc42-8b40-4baf-9c34-4934f5b9882a assets/rares/chevalier.png
fetch 1737b9a2-3c0f-451f-bd84-d47ac80a542f assets/rares/cristal.png
fetch e6ba3a70-2a60-438a-b601-5194fd861f03 assets/rares/diamant.png
fetch 25386239-fef1-45f7-9f14-c7b512201c31 assets/rares/divine.png
fetch f1174eab-d341-421f-ab24-6f08fa0e43c1 assets/rares/doree.png
fetch 15ad4531-d123-4024-aac9-9c49e98f3be4 assets/rares/dragon.png
fetch 6bd1e82c-053e-4fef-9f1c-c90592637dfe assets/rares/electrique.png
fetch 8b16a9eb-c0d2-425b-8907-da4461643c62 assets/rares/eternelle.png
fetch 31c71af6-acb2-4e19-92b6-44e6d06e008b assets/rares/fantome.png
fetch edb8dcd0-fe72-4888-8f88-b38256f73432 assets/rares/galactique.png
fetch 8f70d2ce-8945-4fd7-a8d8-da0f8129cc04 assets/rares/givree.png
fetch 09e2aedd-2dee-47e9-b90e-66689ef3cfc2 assets/rares/infinie.png
fetch 29a17395-108b-4844-a0c5-ed35143c5b98 assets/rares/jumelle.png
fetch 60c1c425-b4a5-4bcb-bd14-eb1b773324f7 assets/rares/leviathan.png
fetch 80c694b5-61a4-4cd3-a201-02081ec790da assets/rares/meduse.png
fetch f6b667f3-85d9-4379-92bc-b9184f1305e0 assets/rares/momie.png
fetch f6d33243-029f-40e8-bb8d-2296ddf6490d assets/rares/naine.png
fetch 8a53e990-fbbd-40c2-9c66-5970f396a133 assets/rares/ninja.png
fetch ebb3a855-7dbd-4dce-8ee1-d78cc2e4ab16 assets/rares/originelle.png
fetch c245e60d-541b-4440-9855-c5707ed15c0d assets/rares/phenix.png
fetch 23d4d4fe-1082-4973-ae87-c952c0e506fa assets/rares/pirate.png
fetch 4cf2295c-9843-4e68-b840-600c31469777 assets/rares/pixel.png
fetch 4bb1f7fb-606f-4cc1-bdea-c08416ca2f1c assets/rares/plantain.png
fetch 556bf276-8171-4431-b64c-06b20614b9f1 assets/rares/poilue.png
fetch 16fed6df-3541-48bc-9557-8ca15ffd8e94 assets/rares/prismatique.png
fetch 1cde9d0a-7d54-4447-b914-6618ed2afafb assets/rares/quantique.png
fetch 576fdcf5-80c0-4ded-837e-04f77bd683a7 assets/rares/radioactive.png
fetch 2480adf8-1a7d-4007-9bd2-29048d8dd24a assets/rares/ratatinee.png
fetch e7485a23-c4f8-4afd-b081-5bbc20d60391 assets/rares/robotique.png
fetch 4567342c-399d-4991-9a46-e4e3009c928f assets/rares/rouge.png
fetch 2910c8cf-804f-4426-bba1-4589d4ed5901 assets/rares/royale.png
fetch d87e0396-0e46-4257-9cdd-2ebc02cb1af8 assets/rares/salee.png
fetch d52c3815-22d8-4d3d-a6ab-9c477e8af431 assets/rares/samourai.png
fetch b5459949-02e5-430e-bceb-2de4ac4f0a36 assets/rares/sirene.png
fetch 4e986df4-6026-4382-9887-b17d3424e16d assets/rares/sorciere.png
fetch 2d9b87de-7d39-4c27-a664-cccd650d8535 assets/rares/tachetee.png
fetch 4240d8e2-f29c-46bf-9ff7-b7e664f68fa7 assets/rares/temporelle.png
fetch b8e948c0-5d72-41eb-b748-df8a1acc8e96 assets/rares/titan.png
fetch 3ceefc87-8499-444c-99aa-483484dcaeb1 assets/rares/vampire.png
fetch ddbbc016-24c5-4e48-821a-80cbd4dbb9ec assets/rares/verte.png
fetch 88ef363b-0fba-4d69-9a8e-e478d2f56765 assets/rares/vide.png
fetch 12eee8e2-d2d0-48c2-b974-05de4f8f4147 assets/rares/volcanique.png
fetch e3151f01-fe66-4575-8ba9-6068d75f6f6b assets/rares/zombie.png
fetch 15b80c23-63f8-41ec-9fa4-8fe6a9aca435 assets/upgrades/aimant.png
fetch 7f358de4-e0b2-47e5-b047-6bbc917b9a82 assets/upgrades/arrosoir.png
fetch 8e196f57-fb84-4176-b857-6a86f95e1124 assets/upgrades/autel.png
fetch 189fbd64-65b0-432e-9993-d00714ca9c79 assets/upgrades/batterie.png
fetch 5864ba22-53a2-4b19-bac2-a60ebbd648c3 assets/upgrades/cafe.png
fetch 31c30a2e-f874-4c81-9f07-60e8e864b6ff assets/upgrades/camion.png
fetch 3a560f70-364e-4567-a55a-72e91a3e360b assets/upgrades/comptoir.png
fetch 7d4f777f-253d-4b42-a8d6-e7bc4f1de255 assets/upgrades/contremaitre.png
fetch 595de815-db23-40a7-b130-600c5269f075 assets/upgrades/cristal.png
fetch 6ce159fe-1bc4-4554-91a0-f0ff0b0e3fb3 assets/upgrades/dna.png
fetch 21700807-ea86-4824-85a2-8b11aca13dd5 assets/upgrades/echelle.png
fetch 7fef7e11-6bba-49bf-b65d-a13c36af7e87 assets/upgrades/engrais.png
fetch a03b71f4-67a5-4657-92a0-fd432c4909ac assets/upgrades/engrenage.png
fetch 221afd03-38b5-4d04-a4df-dda823f2c883 assets/upgrades/filet.png
fetch 95ee2ff1-4157-47ac-b321-2bdf0663a263 assets/upgrades/fusee.png
fetch 528b87e4-3519-4e2a-b849-dec79924262e assets/upgrades/gant.png
fetch f9742202-4a67-48bd-928f-f5902d567ce7 assets/upgrades/horloge.png
fetch 94d3e1dd-0fa1-4106-a47d-ac3b6ebcf329 assets/upgrades/loupe.png
fetch 9078d9ac-eb9f-4577-b6e5-6b6040dafb8e assets/upgrades/machette.png
fetch b8ad76d4-e230-4cc8-b79d-e4df1e0e62ac assets/upgrades/mixeur.png
fetch 3e0d7712-34d8-47e2-957c-007e363dc583 assets/upgrades/panier.png
fetch 0aae85ef-1ff7-4348-97e5-05c55187c20e assets/upgrades/parchemin.png
fetch 6610ff18-d384-4b8c-9b57-81a5d8df3de3 assets/upgrades/relique.png
fetch e3be1ebc-01b1-4e31-a02f-2f3e40c74bb2 assets/upgrades/robot.png
fetch 53ca6694-4170-45ad-91ae-d420b8dc8653 assets/upgrades/ruche.png
fetch 54a75e26-11dd-449b-a16c-7077fe7a747c assets/upgrades/trophee.png
fetch dd84523d-0432-4108-a770-226dab26a5d5 assets/upgrades/vitrine.png

printf "\r%-62s\r" ""
echo "Termine : $ok telecharges, $skip deja presents, $fail echecs"
if [ "$fail" -gt 0 ]; then
  echo "Fichiers manquants :"
  printf "%s" "$failed_list" | tr "%%" "\n" | sed "/^$/d;s/^/    /"
  echo "Relancez le script : seuls les manquants seront retentes."
  exit 1
fi
echo "Ouvrez index.html : le jeu utilisera desormais les images locales."
