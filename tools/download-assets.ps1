<#
    Banana Factory - telecharge les 121 sprites PixelLab dans assets\

      .\download-assets.ps1              # ecrit dans le dossier du jeu
      .\download-assets.ps1 -Force       # retelecharge meme si le fichier existe
      .\download-assets.ps1 -Out C:\jeu  # ecrit ailleurs

    Aucun compte ni cle d API : les URLs sont publiques.
    Si Windows refuse d executer le script :
      powershell -ExecutionPolicy Bypass -File .\download-assets.ps1

    Script genere par tools/gen-downloaders.mjs - ne pas editer a la main.
#>
param([switch]$Force, [string]$Out = "")

$ErrorActionPreference = "Stop"
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
$ProgressPreference = "SilentlyContinue"
$Base = "https://api.pixellab.ai/mcp/images/"

if (-not $Out) {
  $here = Split-Path -Parent $MyInvocation.MyCommand.Path
  if     (Test-Path (Join-Path $here "..\index.html")) { $Out = (Resolve-Path (Join-Path $here "..")).Path }
  elseif (Test-Path (Join-Path $here "index.html"))    { $Out = $here }
  else   { $Out = (Get-Location).Path }
}

$assets = @(
  @{ job = "5f6842df-8bf5-4eff-8f8e-9d7faf5717db"; dest = "assets\generators\labo.png" },
  @{ job = "0116fc98-5234-4136-ab80-7d29413c034d"; dest = "assets\generators\orbitale.png" },
  @{ job = "7e41f7a4-c7ce-451a-adf5-c853da2f8beb"; dest = "assets\generators\plantation.png" },
  @{ job = "32eba6d5-5cd2-4551-a664-aba1cf99e93e"; dest = "assets\generators\portail.png" },
  @{ job = "c25b51ba-5fa4-4d8e-afae-c776c56b2650"; dest = "assets\generators\presse.png" },
  @{ job = "18ee3e02-d584-4f3d-947a-b867f7e36902"; dest = "assets\generators\robot.png" },
  @{ job = "0a16a032-ef9c-4f2d-bad8-ab7c9e0b00c1"; dest = "assets\generators\serre.png" },
  @{ job = "6db394a3-d469-402c-bc2a-3752055140a6"; dest = "assets\generators\singe.png" },
  @{ job = "752cdce8-5ac2-4a6d-8fb5-7005ebff1ba2"; dest = "assets\generators\tapis.png" },
  @{ job = "71699829-78d3-42b1-9ede-8d52ca3f47f2"; dest = "assets\generators\temple.png" },
  @{ job = "03779999-4c44-4409-bba2-c6e11bf21234"; dest = "assets\generators\trounoir.png" },
  @{ job = "90089deb-216d-4e6f-ad98-99846d895b3e"; dest = "assets\generators\usine.png" },
  @{ job = "d7a81b5b-d762-48f3-b0af-95c7db59866a"; dest = "assets\minigames\b_mure.png" },
  @{ job = "27877f51-1b3e-415e-9d34-56a0f783cf9a"; dest = "assets\minigames\b_or.png" },
  @{ job = "84ec634c-b3bb-49a8-b50b-3ee094c9b69d"; dest = "assets\minigames\b_pourrie.png" },
  @{ job = "170838b8-09a8-4ecb-8df2-720ae0098dc9"; dest = "assets\minigames\b_verte.png" },
  @{ job = "56fc826d-772e-4c5e-9b14-2860ada9c8eb"; dest = "assets\minigames\coffre.png" },
  @{ job = "b20deade-2f4b-4f76-9d28-3c1bf30304fc"; dest = "assets\minigames\f_ananas.png" },
  @{ job = "04c820ac-e01e-4153-b3ba-44e0e439f086"; dest = "assets\minigames\f_banane.png" },
  @{ job = "34a98dbf-7b1c-4fa4-9a6b-cb43b3d2c195"; dest = "assets\minigames\f_cerise.png" },
  @{ job = "6d01faf4-7c86-4ba1-9e18-b21d156eec39"; dest = "assets\minigames\f_coco.png" },
  @{ job = "7643475d-ded4-4275-bc32-97e8375c944e"; dest = "assets\minigames\f_fraise.png" },
  @{ job = "ff55ded6-aecf-46cd-9ea3-719d9d093d66"; dest = "assets\minigames\f_kiwi.png" },
  @{ job = "cac37e5e-9622-4297-9538-7af9c2e4c280"; dest = "assets\minigames\liane.png" },
  @{ job = "58ff742f-9c99-4a15-bf7a-a09def546349"; dest = "assets\minigames\mg_course.png" },
  @{ job = "2d7ca0de-6eb6-49e8-8db3-5198d2676094"; dest = "assets\minigames\mg_match.png" },
  @{ job = "baec597d-7f9e-40c8-b593-0bb1914daa0d"; dest = "assets\minigames\mg_memoire.png" },
  @{ job = "b47cc3ca-61b3-4062-8f3c-969d70c3fb99"; dest = "assets\minigames\mg_peel.png" },
  @{ job = "46ed2f94-d9c6-47b8-bf7c-229c054da4bf"; dest = "assets\minigames\mg_roue.png" },
  @{ job = "436c4b69-75d5-424d-9920-f3edd47e0edf"; dest = "assets\minigames\mg_tresor.png" },
  @{ job = "cc385479-ccc0-4d7d-a6cf-d5806f7a5032"; dest = "assets\minigames\mg_tri.png" },
  @{ job = "13fb5c2c-2c21-4a5d-bc01-7c71baf8192d"; dest = "assets\minigames\rocher.png" },
  @{ job = "4bfc4c7c-a35e-4464-9608-06bdbc4cc542"; dest = "assets\minigames\singe_court.png" },
  @{ job = "0448f110-c740-4d22-8889-f348529cc6f2"; dest = "assets\misc\banana_gold.png" },
  @{ job = "913f3fda-5142-4919-9282-94e27311ee7c"; dest = "assets\misc\banana_hero.png" },
  @{ job = "9a0efffe-41ae-4021-a90f-a65375220bd4"; dest = "assets\misc\bg_plantation.png" },
  @{ job = "8ee476e5-5e2e-45a6-bdfe-257fa882159d"; dest = "assets\misc\book.png" },
  @{ job = "1adc2b72-1321-423c-81d2-205bd16b43c6"; dest = "assets\misc\seed_gold.png" },
  @{ job = "d8176fd0-3330-4c6a-b538-ebdd6e19edd2"; dest = "assets\misc\token.png" },
  @{ job = "ee4a8545-44d9-4dbd-8452-96eb71e7ef17"; dest = "assets\misc\trophy.png" },
  @{ job = "b57df838-a849-4a89-95f0-e12b69b6d1a7"; dest = "assets\rares\alphaomega.png" },
  @{ job = "6db8ade1-e2ec-40e6-b8a1-a460b0e6d15a"; dest = "assets\rares\arcenciel.png" },
  @{ job = "06e2a447-c0a1-49e3-8146-a82208e4d653"; dest = "assets\rares\astronaute.png" },
  @{ job = "46a91d30-a80f-4ec6-9443-0f4db5b45012"; dest = "assets\rares\bleue.png" },
  @{ job = "8f927295-1ec4-4955-917c-3aa637ebd365"; dest = "assets\rares\bonbon.png" },
  @{ job = "da3311f2-bd43-4a67-81f2-6c5a4cdf1d0b"; dest = "assets\rares\boomerang.png" },
  @{ job = "e07420a7-e352-4be5-9aab-c6a4b7100b40"; dest = "assets\rares\cactus.png" },
  @{ job = "b70e6377-be48-4973-b4ec-05e6617efc66"; dest = "assets\rares\carree.png" },
  @{ job = "eb7e2400-afcb-475b-a3cd-88d33d0481c2"; dest = "assets\rares\celeste.png" },
  @{ job = "8376c240-c237-4047-b54f-c5be922dc1cf"; dest = "assets\rares\champignon.png" },
  @{ job = "b46980c7-81be-43a6-8a83-342e336c103c"; dest = "assets\rares\chaos.png" },
  @{ job = "11d8dc42-8b40-4baf-9c34-4934f5b9882a"; dest = "assets\rares\chevalier.png" },
  @{ job = "1737b9a2-3c0f-451f-bd84-d47ac80a542f"; dest = "assets\rares\cristal.png" },
  @{ job = "e6ba3a70-2a60-438a-b601-5194fd861f03"; dest = "assets\rares\diamant.png" },
  @{ job = "25386239-fef1-45f7-9f14-c7b512201c31"; dest = "assets\rares\divine.png" },
  @{ job = "f1174eab-d341-421f-ab24-6f08fa0e43c1"; dest = "assets\rares\doree.png" },
  @{ job = "15ad4531-d123-4024-aac9-9c49e98f3be4"; dest = "assets\rares\dragon.png" },
  @{ job = "6bd1e82c-053e-4fef-9f1c-c90592637dfe"; dest = "assets\rares\electrique.png" },
  @{ job = "8b16a9eb-c0d2-425b-8907-da4461643c62"; dest = "assets\rares\eternelle.png" },
  @{ job = "31c71af6-acb2-4e19-92b6-44e6d06e008b"; dest = "assets\rares\fantome.png" },
  @{ job = "edb8dcd0-fe72-4888-8f88-b38256f73432"; dest = "assets\rares\galactique.png" },
  @{ job = "8f70d2ce-8945-4fd7-a8d8-da0f8129cc04"; dest = "assets\rares\givree.png" },
  @{ job = "09e2aedd-2dee-47e9-b90e-66689ef3cfc2"; dest = "assets\rares\infinie.png" },
  @{ job = "29a17395-108b-4844-a0c5-ed35143c5b98"; dest = "assets\rares\jumelle.png" },
  @{ job = "60c1c425-b4a5-4bcb-bd14-eb1b773324f7"; dest = "assets\rares\leviathan.png" },
  @{ job = "80c694b5-61a4-4cd3-a201-02081ec790da"; dest = "assets\rares\meduse.png" },
  @{ job = "f6b667f3-85d9-4379-92bc-b9184f1305e0"; dest = "assets\rares\momie.png" },
  @{ job = "f6d33243-029f-40e8-bb8d-2296ddf6490d"; dest = "assets\rares\naine.png" },
  @{ job = "8a53e990-fbbd-40c2-9c66-5970f396a133"; dest = "assets\rares\ninja.png" },
  @{ job = "ebb3a855-7dbd-4dce-8ee1-d78cc2e4ab16"; dest = "assets\rares\originelle.png" },
  @{ job = "c245e60d-541b-4440-9855-c5707ed15c0d"; dest = "assets\rares\phenix.png" },
  @{ job = "23d4d4fe-1082-4973-ae87-c952c0e506fa"; dest = "assets\rares\pirate.png" },
  @{ job = "4cf2295c-9843-4e68-b840-600c31469777"; dest = "assets\rares\pixel.png" },
  @{ job = "4bb1f7fb-606f-4cc1-bdea-c08416ca2f1c"; dest = "assets\rares\plantain.png" },
  @{ job = "556bf276-8171-4431-b64c-06b20614b9f1"; dest = "assets\rares\poilue.png" },
  @{ job = "16fed6df-3541-48bc-9557-8ca15ffd8e94"; dest = "assets\rares\prismatique.png" },
  @{ job = "1cde9d0a-7d54-4447-b914-6618ed2afafb"; dest = "assets\rares\quantique.png" },
  @{ job = "576fdcf5-80c0-4ded-837e-04f77bd683a7"; dest = "assets\rares\radioactive.png" },
  @{ job = "2480adf8-1a7d-4007-9bd2-29048d8dd24a"; dest = "assets\rares\ratatinee.png" },
  @{ job = "e7485a23-c4f8-4afd-b081-5bbc20d60391"; dest = "assets\rares\robotique.png" },
  @{ job = "4567342c-399d-4991-9a46-e4e3009c928f"; dest = "assets\rares\rouge.png" },
  @{ job = "2910c8cf-804f-4426-bba1-4589d4ed5901"; dest = "assets\rares\royale.png" },
  @{ job = "d87e0396-0e46-4257-9cdd-2ebc02cb1af8"; dest = "assets\rares\salee.png" },
  @{ job = "d52c3815-22d8-4d3d-a6ab-9c477e8af431"; dest = "assets\rares\samourai.png" },
  @{ job = "b5459949-02e5-430e-bceb-2de4ac4f0a36"; dest = "assets\rares\sirene.png" },
  @{ job = "4e986df4-6026-4382-9887-b17d3424e16d"; dest = "assets\rares\sorciere.png" },
  @{ job = "2d9b87de-7d39-4c27-a664-cccd650d8535"; dest = "assets\rares\tachetee.png" },
  @{ job = "4240d8e2-f29c-46bf-9ff7-b7e664f68fa7"; dest = "assets\rares\temporelle.png" },
  @{ job = "b8e948c0-5d72-41eb-b748-df8a1acc8e96"; dest = "assets\rares\titan.png" },
  @{ job = "3ceefc87-8499-444c-99aa-483484dcaeb1"; dest = "assets\rares\vampire.png" },
  @{ job = "ddbbc016-24c5-4e48-821a-80cbd4dbb9ec"; dest = "assets\rares\verte.png" },
  @{ job = "88ef363b-0fba-4d69-9a8e-e478d2f56765"; dest = "assets\rares\vide.png" },
  @{ job = "12eee8e2-d2d0-48c2-b974-05de4f8f4147"; dest = "assets\rares\volcanique.png" },
  @{ job = "e3151f01-fe66-4575-8ba9-6068d75f6f6b"; dest = "assets\rares\zombie.png" },
  @{ job = "15b80c23-63f8-41ec-9fa4-8fe6a9aca435"; dest = "assets\upgrades\aimant.png" },
  @{ job = "7f358de4-e0b2-47e5-b047-6bbc917b9a82"; dest = "assets\upgrades\arrosoir.png" },
  @{ job = "8e196f57-fb84-4176-b857-6a86f95e1124"; dest = "assets\upgrades\autel.png" },
  @{ job = "189fbd64-65b0-432e-9993-d00714ca9c79"; dest = "assets\upgrades\batterie.png" },
  @{ job = "5864ba22-53a2-4b19-bac2-a60ebbd648c3"; dest = "assets\upgrades\cafe.png" },
  @{ job = "31c30a2e-f874-4c81-9f07-60e8e864b6ff"; dest = "assets\upgrades\camion.png" },
  @{ job = "3a560f70-364e-4567-a55a-72e91a3e360b"; dest = "assets\upgrades\comptoir.png" },
  @{ job = "7d4f777f-253d-4b42-a8d6-e7bc4f1de255"; dest = "assets\upgrades\contremaitre.png" },
  @{ job = "595de815-db23-40a7-b130-600c5269f075"; dest = "assets\upgrades\cristal.png" },
  @{ job = "6ce159fe-1bc4-4554-91a0-f0ff0b0e3fb3"; dest = "assets\upgrades\dna.png" },
  @{ job = "21700807-ea86-4824-85a2-8b11aca13dd5"; dest = "assets\upgrades\echelle.png" },
  @{ job = "7fef7e11-6bba-49bf-b65d-a13c36af7e87"; dest = "assets\upgrades\engrais.png" },
  @{ job = "a03b71f4-67a5-4657-92a0-fd432c4909ac"; dest = "assets\upgrades\engrenage.png" },
  @{ job = "221afd03-38b5-4d04-a4df-dda823f2c883"; dest = "assets\upgrades\filet.png" },
  @{ job = "95ee2ff1-4157-47ac-b321-2bdf0663a263"; dest = "assets\upgrades\fusee.png" },
  @{ job = "528b87e4-3519-4e2a-b849-dec79924262e"; dest = "assets\upgrades\gant.png" },
  @{ job = "f9742202-4a67-48bd-928f-f5902d567ce7"; dest = "assets\upgrades\horloge.png" },
  @{ job = "94d3e1dd-0fa1-4106-a47d-ac3b6ebcf329"; dest = "assets\upgrades\loupe.png" },
  @{ job = "9078d9ac-eb9f-4577-b6e5-6b6040dafb8e"; dest = "assets\upgrades\machette.png" },
  @{ job = "b8ad76d4-e230-4cc8-b79d-e4df1e0e62ac"; dest = "assets\upgrades\mixeur.png" },
  @{ job = "3e0d7712-34d8-47e2-957c-007e363dc583"; dest = "assets\upgrades\panier.png" },
  @{ job = "0aae85ef-1ff7-4348-97e5-05c55187c20e"; dest = "assets\upgrades\parchemin.png" },
  @{ job = "6610ff18-d384-4b8c-9b57-81a5d8df3de3"; dest = "assets\upgrades\relique.png" },
  @{ job = "e3be1ebc-01b1-4e31-a02f-2f3e40c74bb2"; dest = "assets\upgrades\robot.png" },
  @{ job = "53ca6694-4170-45ad-91ae-d420b8dc8653"; dest = "assets\upgrades\ruche.png" },
  @{ job = "54a75e26-11dd-449b-a16c-7077fe7a747c"; dest = "assets\upgrades\trophee.png" },
  @{ job = "dd84523d-0432-4108-a770-226dab26a5d5"; dest = "assets\upgrades\vitrine.png" }
)

Write-Host "Banana Factory - $($assets.Count) sprites"
Write-Host "Destination : $Out\assets"
Write-Host ""

$ok = 0; $skip = 0; $failed = @(); $i = 0
foreach ($a in $assets) {
  $i++
  $path = Join-Path $Out $a.dest
  Write-Host -NoNewline ("`r  [{0,3}/{1}] {2,-42}" -f $i, $assets.Count, $a.dest)
  if ((Test-Path $path) -and -not $Force -and (Get-Item $path).Length -gt 0) { $skip++; continue }
  New-Item -ItemType Directory -Force -Path (Split-Path -Parent $path) | Out-Null
  $done = $false
  foreach ($attempt in 1..3) {
    try {
      Invoke-WebRequest -Uri "$Base$($a.job)/download" -OutFile $path -TimeoutSec 60 -UseBasicParsing
      if ((Get-Item $path).Length -gt 0) { $ok++; $done = $true; break }
    } catch { Start-Sleep -Seconds $attempt }
  }
  if (-not $done) { $failed += $a.dest; if (Test-Path $path) { Remove-Item $path -Force } }
}
Write-Host ""

Write-Host "Termine : $ok telecharges, $skip deja presents, $($failed.Count) echecs"
if ($failed.Count -gt 0) {
  Write-Host "Fichiers manquants :"
  $failed | ForEach-Object { Write-Host "    $_" }
  Write-Host "Relancez le script : seuls les manquants seront retentes."
  exit 1
}
Write-Host "Ouvrez index.html : le jeu utilisera desormais les images locales."
