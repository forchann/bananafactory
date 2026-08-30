/* Banana Factory - résolution des sprites
 *
 * Fichier généré par tools/gen-assets-js.mjs — ne pas éditer à la main.
 *
 * Les sprites sont générés avec PixelLab. Deux situations :
 *   - les PNG sont présents dans assets/ (voir tools/download-assets.sh) : on les
 *     utilise directement, le jeu fonctionne hors-ligne dès le premier lancement ;
 *   - ils sont absents : on les charge depuis PixelLab, puis on les met en cache
 *     dans IndexedDB pour que les lancements suivants n'aient plus besoin du réseau.
 * Si les deux échouent, l'interface bascule sur un repli graphique.
 */
(function (global) {
  'use strict';

  var BASE = 'https://api.pixellab.ai/mcp/images/';
  var DB_NAME = 'bananafactory-assets';
  var STORE = 'sprites';
  var PROBE = 'assets/misc/banana_hero.png';

  /* chemin logique -> identifiant du job PixelLab */
  var JOBS = {
    'assets/casino/carte_dos.png': 'd9c6a4d6-b5bf-4b29-9edb-158f4eb83125',
    'assets/casino/carte_face.png': '16dfed87-c347-40ed-9a08-9b2be5a4bc4e',
    'assets/casino/cartes.png': '787d97b5-d2e9-4f9c-94cb-bdde4775da81',
    'assets/casino/cochon.png': 'db7aee8e-002a-4bd8-bdb0-6a9c577064b8',
    'assets/casino/pig1.png': 'd38e311b-011d-475c-ac8d-e3da91168bca',
    'assets/casino/pig2.png': 'f36484d3-1f18-4151-8fd6-438c20856c5e',
    'assets/casino/pig3.png': '50e99225-902e-47a1-a939-b422536324fd',
    'assets/casino/pig4.png': 'bdd8cf37-d52f-427e-a467-db9e09cd2a1d',
    'assets/casino/pig5.png': 'ffd96070-a462-45e3-9f89-7f5c9047f2a7',
    'assets/casino/pig6.png': '3a7d187e-ccd3-4fa0-9b75-6d2e52a1c2e4',
    'assets/casino/piste.png': 'dc73d10a-d46b-4708-ab8f-295cb8f4c42f',
    'assets/casino/roue.png': 'e8dd033b-19fa-45ca-800d-1eb07a95ef04',
    'assets/casino/roulette.png': '317b702e-5a5f-4591-99a1-cff7f5b04a8c',
    'assets/casino/slot.png': 'a78e30f4-4e46-4133-90d9-7b2613ac678a',
    'assets/casino/suit_banane.png': 'fe5d0586-1c97-4a78-bcc6-3189895556fa',
    'assets/casino/suit_coeur.png': 'f8937a1f-1541-4cd3-b60f-a018b9d9237f',
    'assets/casino/suit_pique.png': '36ea98da-65e8-4aa5-af19-e7295e74c7c7',
    'assets/casino/suit_trefle.png': 'f63b6b60-64e1-4dc8-8eaf-843c0268c322',
    'assets/casino/sym_banane.png': 'f57a12e4-ee95-494a-a39d-4c509e2a6b80',
    'assets/casino/sym_cerise.png': '6ea2c9d5-4849-4c35-aefa-23b911e6eee4',
    'assets/casino/sym_cloche.png': '3a7cfe5f-f40f-4217-920a-8d14f0dc58e5',
    'assets/casino/sym_coco.png': '3060d9e4-280b-4532-95ed-099d4634d213',
    'assets/casino/sym_diamant.png': 'a79b4bff-3dbb-4052-984d-d051b28e24d6',
    'assets/casino/sym_etoile.png': '21255478-fdb2-4004-9a35-f7d9fb0166ab',
    'assets/casino/tapis.png': '9243e0c8-4c33-4af9-a68b-eea8a75810e5',
    'assets/generators/chronos.png': 'c5a23cbf-1fc0-487a-8b52-e8cb9c3f84d1',
    'assets/generators/conscience.png': '225b42ef-fb1f-4c13-b9af-577270a5eed9',
    'assets/generators/dyson.png': 'bd958e12-8503-4c6a-8712-c269ee8aeb80',
    'assets/generators/labo.png': '5f6842df-8bf5-4eff-8f8e-9d7faf5717db',
    'assets/generators/multivers.png': 'f9ee7fc3-9a94-4be4-a91a-d45bad55ef8e',
    'assets/generators/nebuleuse.png': '7995f942-8349-4042-b3d5-7f79764e13ea',
    'assets/generators/orbitale.png': '0116fc98-5234-4136-ab80-7d29413c034d',
    'assets/generators/origine.png': 'de8cfb31-b7dc-4fe5-9d51-27a785e4d385',
    'assets/generators/plantation.png': '7e41f7a4-c7ce-451a-adf5-c853da2f8beb',
    'assets/generators/portail.png': '32eba6d5-5cd2-4551-a664-aba1cf99e93e',
    'assets/generators/presse.png': 'c25b51ba-5fa4-4d8e-afae-c776c56b2650',
    'assets/generators/quasar.png': '129fc690-cc39-4cad-8ac6-0776a805717d',
    'assets/generators/reacteur.png': '17d22a55-b474-40e2-86a7-4c771c86e683',
    'assets/generators/robot.png': '18ee3e02-d584-4f3d-947a-b867f7e36902',
    'assets/generators/serre.png': '0a16a032-ef9c-4f2d-bad8-ab7c9e0b00c1',
    'assets/generators/simulation.png': '3e7fb692-0317-49a6-a90c-8704be260cd5',
    'assets/generators/singe.png': '6db394a3-d469-402c-bc2a-3752055140a6',
    'assets/generators/tapis.png': '752cdce8-5ac2-4a6d-8fb5-7005ebff1ba2',
    'assets/generators/temple.png': '71699829-78d3-42b1-9ede-8d52ca3f47f2',
    'assets/generators/trounoir.png': '03779999-4c44-4409-bba2-c6e11bf21234',
    'assets/generators/usine.png': '90089deb-216d-4e6f-ad98-99846d895b3e',
    'assets/minigames/b_mure.png': 'd7a81b5b-d762-48f3-b0af-95c7db59866a',
    'assets/minigames/b_or.png': '27877f51-1b3e-415e-9d34-56a0f783cf9a',
    'assets/minigames/b_pourrie.png': '84ec634c-b3bb-49a8-b50b-3ee094c9b69d',
    'assets/minigames/b_verte.png': '170838b8-09a8-4ecb-8df2-720ae0098dc9',
    'assets/minigames/bombe.png': '0409843c-4a9a-46a9-9073-2788b33c546d',
    'assets/minigames/cageot_bleu.png': 'd0796e57-f927-43b2-bf7b-32a991ed27f0',
    'assets/minigames/cageot_cyan.png': 'd5f131b8-9ef5-4926-a5ff-940b0de147c5',
    'assets/minigames/cageot_jaune.png': '169cafa7-0095-49c5-856d-51b3e05b9a6f',
    'assets/minigames/cageot_orange.png': 'e60084d5-8db7-418a-a039-7ac760e76bc9',
    'assets/minigames/cageot_rouge.png': '9ef70fbe-5fb7-4703-9260-923a09b756d3',
    'assets/minigames/cageot_vert.png': '85234bf6-f3ff-4316-a109-3deb9b1ce572',
    'assets/minigames/cageot_violet.png': '481709d6-e1a1-428c-8eee-b5446855ae86',
    'assets/minigames/coffre.png': '56fc826d-772e-4c5e-9b14-2860ada9c8eb',
    'assets/minigames/comptoir.png': 'b39c2ab4-5f1f-46be-99ba-b812e2b92854',
    'assets/minigames/f_ananas.png': 'b20deade-2f4b-4f76-9d28-3c1bf30304fc',
    'assets/minigames/f_banane.png': '04c820ac-e01e-4153-b3ba-44e0e439f086',
    'assets/minigames/f_cerise.png': '34a98dbf-7b1c-4fa4-9a6b-cb43b3d2c195',
    'assets/minigames/f_coco.png': '6d01faf4-7c86-4ba1-9e18-b21d156eec39',
    'assets/minigames/f_fraise.png': '7643475d-ded4-4275-bc32-97e8375c944e',
    'assets/minigames/f_kiwi.png': 'ff55ded6-aecf-46cd-9ea3-719d9d093d66',
    'assets/minigames/herbe.png': '4c086005-54d6-43e5-8157-9c3915e913ef',
    'assets/minigames/liane.png': 'cac37e5e-9622-4297-9538-7af9c2e4c280',
    'assets/minigames/mg_cocktail.png': '052b62e4-ffb5-4f7e-a422-f14cafc913d6',
    'assets/minigames/mg_course.png': '58ff742f-9c99-4a15-bf7a-a09def546349',
    'assets/minigames/mg_match.png': '2d7ca0de-6eb6-49e8-8db3-5198d2676094',
    'assets/minigames/mg_memoire.png': 'baec597d-7f9e-40c8-b593-0bb1914daa0d',
    'assets/minigames/mg_ninja.png': 'fac4a669-07c6-4078-93b7-18c865f285f8',
    'assets/minigames/mg_peel.png': 'b47cc3ca-61b3-4062-8f3c-969d70c3fb99',
    'assets/minigames/mg_pile.png': '635a873b-cb10-40f5-b1c4-72ed49ee1bb3',
    'assets/minigames/mg_roue.png': '46ed2f94-d9c6-47b8-bf7c-229c054da4bf',
    'assets/minigames/mg_serpent.png': '5ae5e02e-de5d-424e-8201-a5f205f3e802',
    'assets/minigames/mg_taupe.png': '0c850a2f-2ee8-4dc8-843d-62dedde71a3f',
    'assets/minigames/mg_tresor.png': '436c4b69-75d5-424d-9920-f3edd47e0edf',
    'assets/minigames/mg_tri.png': 'cc385479-ccc0-4d7d-a6cf-d5806f7a5032',
    'assets/minigames/raton.png': '2f3c4168-0539-45db-b899-11eb3a5e02ee',
    'assets/minigames/rocher.png': '13fb5c2c-2c21-4a5d-bc01-7c71baf8192d',
    'assets/minigames/serpent_corps.png': 'fb7a5d01-d793-463b-8c72-466422d1b81d',
    'assets/minigames/serpent_queue.png': 'd215b045-101b-4746-b0ae-dbc2483b5fb2',
    'assets/minigames/serpent_tete.png': 'c9d49c28-3532-4b86-b0b4-6e33e8a9e998',
    'assets/minigames/singe_court.png': '4bfc4c7c-a35e-4464-9608-06bdbc4cc542',
    'assets/minigames/trou.png': '9acd01a8-31b6-4774-ba77-b4bc8c1fdc12',
    'assets/minigames/verre.png': 'a445f165-daee-4d52-a5a5-9b36a461c01f',
    'assets/misc/banana_gold.png': '0448f110-c740-4d22-8889-f348529cc6f2',
    'assets/misc/banana_hero.png': '913f3fda-5142-4919-9282-94e27311ee7c',
    'assets/misc/bg_canopee.png': '3577fa8a-570e-44ed-96f2-e66ecf6f862a',
    'assets/misc/bg_plantation.png': '9a0efffe-41ae-4021-a90f-a65375220bd4',
    'assets/misc/book.png': '8ee476e5-5e2e-45a6-bdfe-257fa882159d',
    'assets/misc/seed_gold.png': '1adc2b72-1321-423c-81d2-205bd16b43c6',
    'assets/misc/token.png': 'd8176fd0-3330-4c6a-b538-ebdd6e19edd2',
    'assets/misc/trophy.png': 'ee4a8545-44d9-4dbd-8452-96eb71e7ef17',
    'assets/pets/aigle.png': '1af14d08-bbd2-4514-939c-288aa5d9bc92',
    'assets/pets/amaterasu.png': '7e511bfc-fcbd-4505-8fb4-523fdaf380f3',
    'assets/pets/axolotl.png': 'e9b35fbc-ae4d-47f0-9add-ac9832008631',
    'assets/pets/basilic.png': '7db22edb-b011-49c4-8cb0-b03ca0d94cb3',
    'assets/pets/behemoth.png': '826955d2-d087-4ae1-a760-9729fa78bb3b',
    'assets/pets/cameleon.png': '1001dd0d-4b5a-4dd3-97e9-e3b33f570114',
    'assets/pets/capybara.png': '47f7300c-aa29-43b1-bf11-976ef37988c9',
    'assets/pets/casoar.png': '16001414-9c99-4e08-a116-c3ff737bdc61',
    'assets/pets/cerbere.png': '47ff3fbd-6dfb-4226-b35e-51d557916c42',
    'assets/pets/chauvesouris.png': '08a6db38-287a-4da9-a703-68e7c36b5ef5',
    'assets/pets/chimere.png': '95a3ce4f-0cd7-49c5-a215-e979ab2b9d67',
    'assets/pets/colibri.png': 'a41c87a1-051f-4123-8028-699ec63c1e35',
    'assets/pets/crabe.png': '6d9e7494-3340-464d-8c00-5281d1dc115d',
    'assets/pets/crocodile.png': '89a30f07-1560-4b2a-b289-560aa0a0e076',
    'assets/pets/dragon.png': '67b65ce8-f7b3-4d48-88a3-36332b5c40c2',
    'assets/pets/ecureuil.png': '6d4eae57-d21f-49a7-b900-b6dd18ea75d1',
    'assets/pets/escargot.png': '351477be-ffc2-4e75-8044-a1c1030569ed',
    'assets/pets/fenrir.png': '86e1ba18-1391-498c-9b84-3711ece2f24f',
    'assets/pets/fourmilier.png': '6a03a53d-9df1-40cd-b1c1-470cc8e08ce0',
    'assets/pets/ganesha.png': 'c8dabfc7-97f1-43c3-9144-a722be59713a',
    'assets/pets/gorille.png': 'df3d7784-a48e-4d8a-9228-2e3f6ea13d89',
    'assets/pets/grenouille.png': '166f72e7-7322-4764-a1e8-a6bb3bfb57b1',
    'assets/pets/griffon.png': 'be4d2581-d996-44a8-9ff4-cded6fa81979',
    'assets/pets/herisson.png': '2f3f5ab7-9560-4c82-bfaa-e705441dac99',
    'assets/pets/hydre.png': '635ad0ae-466c-43a9-ad1d-ce65e6780d27',
    'assets/pets/jaguar.png': '113a50cb-d19c-4ed7-ba9c-e71b74de2a64',
    'assets/pets/kirin.png': '39621698-b4bd-4360-9413-2ab206ff5e07',
    'assets/pets/lemurien.png': 'e1b6d930-938b-45c2-9cad-ef868448d3af',
    'assets/pets/leviathan.png': 'cd1b2f9f-fa3a-4522-ad29-0429529787d6',
    'assets/pets/lezard.png': 'be685e70-084c-4e43-83e5-a75af36e9281',
    'assets/pets/licorne.png': '35c6c9e8-3290-4af7-9fb4-0d125b7b9e09',
    'assets/pets/okapi.png': '291b994f-3648-461c-9cf1-6dd208408d4f',
    'assets/pets/ouistiti.png': 'f424595f-2ca4-4e24-8969-1efd3bc4b6f1',
    'assets/pets/ouroboros.png': 'c9e82323-f61e-41ba-9018-db13561e3a2e',
    'assets/pets/pangolin.png': '0bc3215b-711e-4b6b-9e2f-f9773d308c12',
    'assets/pets/panthere.png': 'f2e95e7f-aaaa-434b-953e-c01097005995',
    'assets/pets/papillon.png': '5de69587-0aa9-4ccd-b63f-5250bf16ba56',
    'assets/pets/paresseux.png': 'd6e8d5a2-0f82-44b3-bc68-c849faf87836',
    'assets/pets/perroquet.png': '58d6736a-1fb6-4518-890e-9985d2a000a1',
    'assets/pets/phenix.png': '0a2891ec-b08c-48dd-941a-8b0b2716677e',
    'assets/pets/piranha.png': 'fb1647da-1dc6-4685-a72f-38bea47b4603',
    'assets/pets/poisson.png': '7ef0583b-4aaf-4423-a2ef-89c1f0609bf7',
    'assets/pets/poussin.png': '73684a33-1c72-4096-a087-2717adf7f387',
    'assets/pets/python.png': '0b871ee5-85c5-4bd3-bbd4-242d84b3a63a',
    'assets/pets/quetzalcoatl.png': '9b49af11-f295-402a-9307-a05a885f882f',
    'assets/pets/raie.png': '348e3da4-f015-4830-a8c6-05c1614f962d',
    'assets/pets/rat.png': '453f43b9-b9d1-4ff3-b01f-c17add12266b',
    'assets/pets/scorpion.png': '4be6c672-2333-4cdc-862f-337dede98fe3',
    'assets/pets/singe.png': 'cdf2c9fc-8db1-4cad-b269-8dfb969a5392',
    'assets/pets/sphinx.png': 'b0c2a3bc-1aa3-4566-8029-aee6af8a1b90',
    'assets/pets/tatou.png': 'e9bcc3c9-4636-4c19-a99d-01de5cecc6e5',
    'assets/pets/tigreblanc.png': '575c61ab-0716-4b98-afef-6139a58e77e6',
    'assets/pets/tortue.png': '711dd786-61d5-446a-8f1c-a58e9b8903ee',
    'assets/pets/toucan.png': 'd43ad2a7-6990-4854-b424-0ede85dcddce',
    'assets/pets/yggdrasil.png': '89716908-81e8-47ca-b33d-5c86d4b54760',
    'assets/pets/ziz.png': '22875022-bfee-44d2-a54c-0b8ca6695623',
    'assets/rares/abysse.png': 'c0a809fb-258c-4039-8194-f8eb5c83edc6',
    'assets/rares/alchimique.png': 'd7a3f55d-ebfc-4d65-b92b-5955bc729860',
    'assets/rares/alphaomega.png': 'b57df838-a849-4a89-95f0-e12b69b6d1a7',
    'assets/rares/arcenciel.png': '6db8ade1-e2ec-40e6-b8a1-a460b0e6d15a',
    'assets/rares/archetype.png': 'd9f7907c-497f-47ea-9dbf-1a0b2ba6b2b9',
    'assets/rares/astronaute.png': '06e2a447-c0a1-49e3-8146-a82208e4d653',
    'assets/rares/aurore.png': '175c2e25-fa16-4c7a-9e51-d595f8ad5551',
    'assets/rares/bigbang.png': '2a1003df-4da0-4105-b07e-c6f63ebf2d24',
    'assets/rares/bleue.png': '46a91d30-a80f-4ec6-9443-0f4db5b45012',
    'assets/rares/bonbon.png': '8f927295-1ec4-4955-917c-3aa637ebd365',
    'assets/rares/boomerang.png': 'da3311f2-bd43-4a67-81f2-6c5a4cdf1d0b',
    'assets/rares/bulle.png': '58db2b80-b889-460b-9681-fcd083907067',
    'assets/rares/cactus.png': 'e07420a7-e352-4be5-9aab-c6a4b7100b40',
    'assets/rares/carree.png': 'b70e6377-be48-4973-b4ec-05e6617efc66',
    'assets/rares/celeste.png': 'eb7e2400-afcb-475b-a3cd-88d33d0481c2',
    'assets/rares/champignon.png': '8376c240-c237-4047-b54f-c5be922dc1cf',
    'assets/rares/chaos.png': 'b46980c7-81be-43a6-8a83-342e336c103c',
    'assets/rares/chapeau.png': '63702c4e-f4c2-4c2a-b926-94b60c446f1f',
    'assets/rares/chef.png': '4f256cbc-8ff8-4272-bffd-ca8b0f9abe38',
    'assets/rares/chevalier.png': '11d8dc42-8b40-4baf-9c34-4934f5b9882a',
    'assets/rares/confite.png': 'd28d76e1-ed56-49b5-8b6b-5a3f0b5b8916',
    'assets/rares/cowboy.png': 'cdba8988-f4f7-46d6-a376-fb659d98a67a',
    'assets/rares/cristal.png': '1737b9a2-3c0f-451f-bd84-d47ac80a542f',
    'assets/rares/cyber.png': 'fdfb1b19-2939-4747-9b77-22eab072d058',
    'assets/rares/demon.png': 'c2726452-95b2-4cd5-9a85-5eb554b1b8d2',
    'assets/rares/detective.png': 'e3e3b019-878e-4a7e-9975-8270caa8ddab',
    'assets/rares/diamant.png': 'e6ba3a70-2a60-438a-b601-5194fd861f03',
    'assets/rares/dinosaure.png': 'bf3beaa5-3c56-48a7-a04a-6569310a7f91',
    'assets/rares/divine.png': '25386239-fef1-45f7-9f14-c7b512201c31',
    'assets/rares/docteur.png': '5ad5b104-eaa9-4c18-bcc6-057acc44092b',
    'assets/rares/doree.png': 'f1174eab-d341-421f-ab24-6f08fa0e43c1',
    'assets/rares/dragon.png': '15ad4531-d123-4024-aac9-9c49e98f3be4',
    'assets/rares/electrique.png': '6bd1e82c-053e-4fef-9f1c-c90592637dfe',
    'assets/rares/endormie.png': '5f7d7c86-8c2f-426d-a122-cdcb82c3b120',
    'assets/rares/entropie.png': '0b217bed-2dd4-439f-ad86-9bc28e6409cb',
    'assets/rares/eternelle.png': '8b16a9eb-c0d2-425b-8907-da4461643c62',
    'assets/rares/fantome.png': '31c71af6-acb2-4e19-92b6-44e6d06e008b',
    'assets/rares/galactique.png': 'edb8dcd0-fe72-4888-8f88-b38256f73432',
    'assets/rares/geisha.png': '2c77ced4-5ecc-4e78-b0bf-ddf0f47035ef',
    'assets/rares/genese.png': '7841d2d0-7f2a-4cbd-8dfa-d0d860d18d11',
    'assets/rares/givree.png': '8f70d2ce-8945-4fd7-a8d8-da0f8129cc04',
    'assets/rares/grillee.png': '80ab2672-bc5c-44d4-abef-4e6b862a8bbd',
    'assets/rares/grimoire.png': '1a88cfa5-5137-4290-a6dd-77cec4ad32a3',
    'assets/rares/horloger.png': '00294742-41d3-4a59-9526-373e21e77a77',
    'assets/rares/infinie.png': '09e2aedd-2dee-47e9-b90e-66689ef3cfc2',
    'assets/rares/jumelle.png': '29a17395-108b-4844-a0c5-ed35143c5b98',
    'assets/rares/karma.png': '730d8a59-e8d9-4362-a9e7-db0b56be22b4',
    'assets/rares/kitsune.png': 'ecdb730b-5964-4ecd-b8b0-d3a7ead2ce8f',
    'assets/rares/kraken.png': '26abe2ff-e497-47ee-b2fe-bceac72af32a',
    'assets/rares/leviathan.png': '60c1c425-b4a5-4bcb-bd14-eb1b773324f7',
    'assets/rares/lunettes.png': 'f862a299-efc1-4c49-95cb-d1b149fd5dc0',
    'assets/rares/mage.png': 'e9ac7832-efb7-4b9d-8f09-819711175160',
    'assets/rares/magma.png': '805e05ed-c2a1-4d53-a04c-78829dc85a10',
    'assets/rares/mecha.png': '489dade7-0f3e-4e1e-89ca-6e562cd0c1f6',
    'assets/rares/meduse.png': '80c694b5-61a4-4cd3-a201-02081ec790da',
    'assets/rares/momie.png': 'f6b667f3-85d9-4379-92bc-b9184f1305e0',
    'assets/rares/moustache.png': 'ba8f33d2-cc74-48d5-95b2-03de834bd952',
    'assets/rares/multiversel.png': 'b5bf4040-567e-44ca-97e0-3d86bd8d3c5b',
    'assets/rares/naine.png': 'f6d33243-029f-40e8-bb8d-2296ddf6490d',
    'assets/rares/neant.png': '27fb80e4-0834-4ce0-8660-5af62ede6cfd',
    'assets/rares/neon.png': 'c53112f0-912d-4d83-9356-fca1bbefe8c3',
    'assets/rares/ninja.png': '8a53e990-fbbd-40c2-9c66-5970f396a133',
    'assets/rares/obsidienne.png': 'f4cd4afc-4778-4ea3-abe6-fac903e3e4db',
    'assets/rares/orage.png': 'fd4224b0-a44e-4907-8132-68672b93fb2e',
    'assets/rares/originelle.png': 'ebb3a855-7dbd-4dce-8ee1-d78cc2e4ab16',
    'assets/rares/ouroboros.png': 'b323b5b3-e650-4151-9e16-c3cfe4bdab4b',
    'assets/rares/papillon.png': '1615bb30-9f8e-47a0-9a29-527295a84476',
    'assets/rares/paradoxe.png': '5c3bbdeb-0a65-452d-aa4f-f9d2893ea20b',
    'assets/rares/pharaon.png': 'a4d175e2-1d59-40bb-b176-b0bc7aa9bb1c',
    'assets/rares/phenix.png': 'c245e60d-541b-4440-9855-c5707ed15c0d',
    'assets/rares/pirate.png': '23d4d4fe-1082-4973-ae87-c952c0e506fa',
    'assets/rares/pixel.png': '4cf2295c-9843-4e68-b840-600c31469777',
    'assets/rares/plantain.png': '4bb1f7fb-606f-4cc1-bdea-c08416ca2f1c',
    'assets/rares/poilue.png': '556bf276-8171-4431-b64c-06b20614b9f1',
    'assets/rares/pompier.png': '0fd62beb-a768-4ba1-963d-8c1274a72a0d',
    'assets/rares/porcelaine.png': 'efb13506-c14c-4555-851a-7b99b93f408e',
    'assets/rares/prismatique.png': '16fed6df-3541-48bc-9557-8ca15ffd8e94',
    'assets/rares/quantique.png': '1cde9d0a-7d54-4447-b914-6618ed2afafb',
    'assets/rares/radioactive.png': '576fdcf5-80c0-4ded-837e-04f77bd683a7',
    'assets/rares/ratatinee.png': '2480adf8-1a7d-4007-9bd2-29048d8dd24a',
    'assets/rares/ressort.png': 'b604d951-ecdb-46af-a49b-2b6d44b2dfa7',
    'assets/rares/robotique.png': 'e7485a23-c4f8-4afd-b081-5bbc20d60391',
    'assets/rares/rockeuse.png': 'fa851707-a533-4b28-a3ad-b86fed262baa',
    'assets/rares/rouge.png': '4567342c-399d-4991-9a46-e4e3009c928f',
    'assets/rares/royale.png': '2910c8cf-804f-4426-bba1-4589d4ed5901',
    'assets/rares/sable.png': '9613aad3-11b7-4ea4-b846-6b6c76de84b1',
    'assets/rares/salee.png': 'd87e0396-0e46-4257-9cdd-2ebc02cb1af8',
    'assets/rares/samourai.png': 'd52c3815-22d8-4d3d-a6ab-9c477e8af431',
    'assets/rares/seraphin.png': 'd4fce71e-56ee-4f12-85a8-a7acb855119b',
    'assets/rares/singularite.png': '25e0bcfc-55b1-4a8e-80a9-d45e9a61aaf9',
    'assets/rares/sirene.png': 'b5459949-02e5-430e-bceb-2de4ac4f0a36',
    'assets/rares/sorciere.png': '4e986df4-6026-4382-9887-b17d3424e16d',
    'assets/rares/souveraine.png': '287a4d40-2d00-4c07-bd8f-40e937b84e58',
    'assets/rares/sportive.png': '687cb4ff-ac75-4fb1-9d24-0b472e48f981',
    'assets/rares/surfeuse.png': 'b3428c72-4172-4612-bd7c-f9e8e6306970',
    'assets/rares/sylvestre.png': 'dd88333e-4924-4d5f-ad39-e8663f59652c',
    'assets/rares/tachetee.png': '2d9b87de-7d39-4c27-a664-cccd650d8535',
    'assets/rares/temporelle.png': '4240d8e2-f29c-46bf-9ff7-b7e664f68fa7',
    'assets/rares/titan.png': 'b8e948c0-5d72-41eb-b748-df8a1acc8e96',
    'assets/rares/tornade.png': 'bfeeb16d-043a-4b72-ab93-287949dbd4dd',
    'assets/rares/tricotee.png': 'e451c5c8-a81d-4c3b-b5c0-3f5d3267dc16',
    'assets/rares/vampire.png': '3ceefc87-8499-444c-99aa-483484dcaeb1',
    'assets/rares/verte.png': 'ddbbc016-24c5-4e48-821a-80cbd4dbb9ec',
    'assets/rares/vide.png': '88ef363b-0fba-4d69-9a8e-e478d2f56765',
    'assets/rares/viking.png': '7af94b97-e430-4f52-a982-5153ac8072a9',
    'assets/rares/volcanique.png': '12eee8e2-d2d0-48c2-b974-05de4f8f4147',
    'assets/rares/yeti.png': '32cf994e-6c63-4370-940e-eb51e2162ac7',
    'assets/rares/zombie.png': 'e3151f01-fe66-4575-8ba9-6068d75f6f6b',
    'assets/skins/arcenciel.png': '33e3c491-31f0-4cae-8358-0fec8daaa23d',
    'assets/skins/arlequin.png': '697c39c4-2337-4681-8117-fa89f9bd69ac',
    'assets/skins/bonbon.png': 'b6d501cf-9e67-4785-b512-2063c4a2346f',
    'assets/skins/cristal.png': '0775a46a-0079-43ce-a851-fe15f5a6256a',
    'assets/skins/doree.png': 'dc18abd3-32e8-4b27-946c-c531c9278a2f',
    'assets/skins/dragon.png': 'f225fd54-4832-462b-a9c7-468d96fef905',
    'assets/skins/fantome.png': 'a9cda2f4-9031-45ee-ac0e-8be6ffcf76b4',
    'assets/skins/galactique.png': 'b37b97c9-e410-4cbe-9f5b-fceeebfac01c',
    'assets/skins/glacee.png': '3c4483a2-9028-4393-b0d8-90cb3db58e59',
    'assets/skins/lave.png': 'c378012e-8ba4-4218-9d14-2d71b6c76bc1',
    'assets/skins/momie.png': 'b3285b22-27d5-4417-a1cf-9ef5d94be77e',
    'assets/skins/neon.png': 'ebe1b450-6a01-4b11-9cde-5ce568677bfb',
    'assets/skins/ninja.png': '0045b59d-68ab-4ae9-8c29-60ad1f86b995',
    'assets/skins/pixel.png': '2e349e97-ae72-43ca-81fc-535d4d04c1b9',
    'assets/skins/robot.png': '39c09223-dff0-4e74-aded-aef6db6bebd1',
    'assets/skins/royale.png': 'e2d7ac38-865e-457f-aade-785b39873f8f',
    'assets/skins/tigre.png': 'a0638106-2dfa-4f20-92aa-44b7cfac4825',
    'assets/skins/zombie.png': '0119b42d-66b5-4cd4-bf8e-346b8bb9cd40',
    'assets/upgrades/aimant.png': '15b80c23-63f8-41ec-9fa4-8fe6a9aca435',
    'assets/upgrades/arrosoir.png': '7f358de4-e0b2-47e5-b047-6bbc917b9a82',
    'assets/upgrades/autel.png': '8e196f57-fb84-4176-b857-6a86f95e1124',
    'assets/upgrades/banniere.png': '64a8a790-c838-4ae5-a826-353722d8b50d',
    'assets/upgrades/batterie.png': '189fbd64-65b0-432e-9993-d00714ca9c79',
    'assets/upgrades/boussole.png': 'de057b73-8859-49d8-bd5d-0bff87a3ab60',
    'assets/upgrades/cafe.png': '5864ba22-53a2-4b19-bac2-a60ebbd648c3',
    'assets/upgrades/camion.png': '31c30a2e-f874-4c81-9f07-60e8e864b6ff',
    'assets/upgrades/clepsydre.png': '8a36d137-8340-428d-b331-4f1bf876a6c1',
    'assets/upgrades/comptoir.png': '3a560f70-364e-4567-a55a-72e91a3e360b',
    'assets/upgrades/contremaitre.png': '7d4f777f-253d-4b42-a8d6-e7bc4f1de255',
    'assets/upgrades/couronne.png': 'e8b61b58-4a5d-4579-99d7-59dfcecb351a',
    'assets/upgrades/cristal.png': '595de815-db23-40a7-b130-600c5269f075',
    'assets/upgrades/des.png': 'e89bb7d2-92f8-456a-bc66-44749309bc07',
    'assets/upgrades/dna.png': '6ce159fe-1bc4-4554-91a0-f0ff0b0e3fb3',
    'assets/upgrades/echelle.png': '21700807-ea86-4824-85a2-8b11aca13dd5',
    'assets/upgrades/engrais.png': '7fef7e11-6bba-49bf-b65d-a13c36af7e87',
    'assets/upgrades/engrenage.png': 'a03b71f4-67a5-4657-92a0-fd432c4909ac',
    'assets/upgrades/filet.png': '221afd03-38b5-4d04-a4df-dda823f2c883',
    'assets/upgrades/fusee.png': '95ee2ff1-4157-47ac-b321-2bdf0663a263',
    'assets/upgrades/fusion.png': 'a10c2bd1-ee0f-4557-b54b-33ac7d5686fd',
    'assets/upgrades/gant.png': '528b87e4-3519-4e2a-b849-dec79924262e',
    'assets/upgrades/horloge.png': 'f9742202-4a67-48bd-928f-f5902d567ce7',
    'assets/upgrades/loupe.png': '94d3e1dd-0fa1-4106-a47d-ac3b6ebcf329',
    'assets/upgrades/machette.png': '9078d9ac-eb9f-4577-b6e5-6b6040dafb8e',
    'assets/upgrades/mixeur.png': 'b8ad76d4-e230-4cc8-b79d-e4df1e0e62ac',
    'assets/upgrades/nurserie.png': '7dd5cbd4-d988-4389-8b6e-ff1afb500de7',
    'assets/upgrades/oeuf.png': '3bbfac0d-124d-4cea-820e-bf28ebaafdf6',
    'assets/upgrades/panier.png': '3e0d7712-34d8-47e2-957c-007e363dc583',
    'assets/upgrades/parchemin.png': '0aae85ef-1ff7-4348-97e5-05c55187c20e',
    'assets/upgrades/relique.png': '6610ff18-d384-4b8c-9b57-81a5d8df3de3',
    'assets/upgrades/robot.png': 'e3be1ebc-01b1-4e31-a02f-2f3e40c74bb2',
    'assets/upgrades/ruche.png': '53ca6694-4170-45ad-91ae-d420b8dc8653',
    'assets/upgrades/trophee.png': '54a75e26-11dd-449b-a16c-7077fe7a747c',
    'assets/upgrades/vitrine.png': 'dd84523d-0432-4108-a770-226dab26a5d5'
  };

  var mode = 'local';   // 'local' tant qu'on n'a pas prouvé le contraire
  var cache = {};       // chemin -> URL d'objet issue d'IndexedDB
  var db = null;

  function remoteUrl(path) {
    var job = JOBS[path];
    return job ? BASE + job + '/download' : path;
  }

  /* URL à utiliser maintenant pour ce sprite */
  function resolve(path) {
    if (cache[path]) return cache[path];
    return mode === 'local' ? path : remoteUrl(path);
  }

  /* ------------------------------------------------------------ IndexedDB */

  function openDb(cb) {
    if (!global.indexedDB) { cb(null); return; }
    var req, settled = false;
    function done(v) { if (!settled) { settled = true; cb(v); } }
    try { req = global.indexedDB.open(DB_NAME, 1); } catch (e) { done(null); return; }
    req.onupgradeneeded = function () {
      var d = req.result;
      if (!d.objectStoreNames.contains(STORE)) d.createObjectStore(STORE);
    };
    req.onsuccess = function () { done(req.result); };
    req.onerror = function () { done(null); };
    /* Une suppression de base en attente laisse l'ouverture bloquée sans jamais
       déclencher d'événement : on n'attend pas indéfiniment. */
    req.onblocked = function () { done(null); };
    setTimeout(function () { done(null); }, 2500);
  }

  function readAll(cb) {
    if (!db) { cb(0); return; }
    var tx, store, req;
    try {
      tx = db.transaction(STORE, 'readonly');
      store = tx.objectStore(STORE);
      req = store.openCursor();
    } catch (e) { cb(0); return; }
    var n = 0, settled = false;
    function done() { if (!settled) { settled = true; cb(n); } }
    req.onsuccess = function () {
      var cur = req.result;
      if (!cur) { done(); return; }
      if (cur.value instanceof Blob) {
        try { cache[cur.key] = URL.createObjectURL(cur.value); n++; } catch (e) { /* ignoré */ }
      }
      cur.continue();
    };
    req.onerror = function () { done(); };
    setTimeout(done, 2500);
  }

  function put(path, blob) {
    if (!db) return;
    try {
      db.transaction(STORE, 'readwrite').objectStore(STORE).put(blob, path);
    } catch (e) { /* quota atteint ou base fermée : sans conséquence */ }
  }

  /* ------------------------------------------------- détection du mode */

  function probe(cb) {
    var img = new Image();
    var done = false;
    function finish(m) {
      if (done) return;
      done = true;
      mode = m;
      cb(m);
    }
    img.onload = function () { finish('local'); };
    img.onerror = function () { finish('remote'); };
    setTimeout(function () { finish('remote'); }, 4000);
    img.src = PROBE + '?probe=' + Date.now();
  }

  /* Récupère en tâche de fond tout ce qui n'est pas encore en cache. */
  function prefetch(onProgress) {
    if (mode !== 'remote' || !db || !global.fetch) return;
    var paths = Object.keys(JOBS).filter(function (p) { return !cache[p]; });
    var i = 0, active = 0, done = 0, total = paths.length;
    if (!total) return;

    function next() {
      while (active < 5 && i < paths.length) {
        (function (path) {
          active++;
          i++;
          global.fetch(remoteUrl(path), { mode: 'cors', cache: 'force-cache' })
            .then(function (r) { return r.ok ? r.blob() : null; })
            .then(function (blob) {
              if (blob && blob.size > 0) {
                put(path, blob);
                try { cache[path] = URL.createObjectURL(blob); } catch (e) { /* ignoré */ }
              }
            })
            .catch(function () { /* hors-ligne ou CORS : on garde l'URL distante */ })
            .then(function () {
              active--;
              done++;
              if (onProgress) onProgress(done, total);
              next();
            });
        })(paths[i]);
      }
    }
    next();
  }

  /* Prépare le cache puis rend la main. Le jeu démarre quoi qu'il arrive :
     un IndexedDB indisponible ou bloqué ne doit jamais empêcher le lancement. */
  function init(cb) {
    var settled = false;
    function finish(info) {
      if (settled) return;
      settled = true;
      cb(info);
    }
    setTimeout(function () { finish({ mode: mode, cached: 0, timedOut: true }); }, 7000);

    openDb(function (d) {
      db = d;
      readAll(function (cached) {
        if (cached >= Object.keys(JOBS).length) {
          /* tout est déjà en cache : inutile de sonder le disque */
          mode = 'remote';
          finish({ mode: mode, cached: cached });
          return;
        }
        probe(function (m) { finish({ mode: m, cached: cached }); });
      });
    });
  }

  global.ASSETS = {
    init: init,
    prefetch: prefetch,
    resolve: resolve,
    remoteUrl: remoteUrl,
    jobs: JOBS,
    get mode() { return mode; },
    get cachedCount() { return Object.keys(cache).length; },
    get total() { return Object.keys(JOBS).length; }
  };
})(window);
