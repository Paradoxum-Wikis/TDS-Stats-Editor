local p = {}

    -- keywords (and now categories) for wikinerds
local keywordMap = {
    -- starter towers!!
    ["Scout"] = { file = "DefaultScout3.png", category = "starter", "tower" },
    ["Sniper"] = { file = "DefaultSniperIcon1.png", category = "starter", "tower" },
    ["Paintballer"] = { file = "NewPaintballerIcon.png", category = "starter", "tower" },
    ["Demoman"] = { file = "DefaultDemomanIcon2.png", category = "starter", "tower" },
    ["Hunter"] = { file = "NewHunterIcon.png", category = "starter", "tower" },
    ["Soldier"] = { file = "KrampusRevengeSoldierIcon.png", category = "starter", "tower" },

    -- intermediate towers!!
    ["Militant"] = { file = "EasterMilitant_Icon.png", category = "intermediate", "tower" },
    ["Medic"] = { file = "DefaultMedicIconn.png", category = "intermediate", "tower" },
    ["Freezer"] = { file = "ReworkedFreezerIcon.png", category = "intermediate", "tower" },
    ["Farm"] = { file = "DefaultFarmIcon.png", category = "intermediate", "tower" },
    ["Shotgunner"] = { file = "EasterShotgunner_Icon.png", category = "intermediate", "tower" },
    ["Rocketeer"] = { file = "RocketeerIcon2025.png", category = "intermediate", "tower" },
    ["Trapper"] = { file = "TrapperIcon.png", category = "intermediate", "tower" },
    ["Ace Pilot"] = { file = "DefaultAcePilotIconIGJ24.png", category = "intermediate", "tower" },
    ["Pyromancer"] = { file = "DefaultPyromancerIcon.png", category = "intermediate", "tower" },
    ["Military Base"] = { file = "DefaultMilitaryBaseIconM29.png", category = "intermediate", "tower" },
    ["Crook Boss"] = { file = "CBRCBossIcon.png", category = "intermediate", "tower" },

    -- advanced towers!!
    ["Electroshocker"] = { file = "DefaultElectroshockerIcon2.png", category = "advanced", "tower" },
    ["Commander"] = { file = "Commandernew.png", category = "advanced", "tower" },
    ["Warden"] = { file = "Warden.png", category = "advanced", "tower" },
    ["Cowboy"] = { file = "WDDefaultCowboyIcon.png", category = "advanced", "tower" },
    ["DJ Booth"] = { file = "DefaultDJBoothIconAug2024.png", category = "advanced", "tower" },
    ["Minigunner"] = { file = "NewMinigunner.png", category = "advanced", "tower" },
    ["Ranger"] = { file = "Newranger.png", category = "advanced", "tower" },
    ["Pursuit"] = { file = "DefaultPursuitIconIGNov24.png", category = "advanced", "tower" },
    ["Gatling Gun"] = { file = "DefaultGatlingGunIconIG.png", category = "advanced", "tower" },
    ["Turret"] = { file = "DefaultTurretIcon.png", category = "advanced", "tower" },
    ["Mortar"] = { file = "MortarIcon.png", category = "advanced", "tower" },
    ["Mercenary Base"] = { file = "Mercenary_base_image.png", category = "advanced", "tower" },

    -- hardcore towers!!
    ["Brawler"] = { file = "BrawlerFromTDS.png", category = "hardcore", "tower" },
    ["Necromancer"] = { file = "NecromancerTowerIcon.png", category = "hardcore", "tower" },
    ["Accelerator"] = { file = "DefaultAcceleratorIcon2.png", category = "hardcore", "tower" },
    ["Engineer"] = { file = "EngineerIcon.png", category = "hardcore", "tower" },

    -- golden perks!!
    ["Golden Minigunner"] = { file = "Goldenminigunner.png", category = "golden" },
    ["Golden Pyromancer"] = { file = "DHGoldenPyroIcon.png", category = "golden" },
    ["Golden Crook Boss"] = { file = "NewGoldenCrookBoss.png", category = "golden" },
    ["Golden Scout"] = { file = "GoldenScout3.png", category = "golden" },
    ["Golden Cowboy"] = { file = "WDGoldenCowboyIcon.png", category = "golden" },
    ["Golden Soldier"] = { file = "KR_Golden_Soldier_Icon.png", category = "golden" },

    -- exclusive towers!!
    ["Gladiator"] = { file = "GladiatorIconn.png", category = "exclusive", "tower" },
    ["Commando"] = { file = "NewCommandoIcon.png", category = "exclusive", "tower" },
    ["Slasher"] = { file = "HexscapeSlasherIcon.png", category = "exclusive", "tower" },
    ["Frost Blaster"] = { file = "KRFrostBlasterIcon.png", category = "exclusive", "tower" },
    ["Archer"] = { file = "DHDefaultArcherIcon.png", category = "exclusive", "tower" },
    ["Swarmer"] = { file = "NewDefaultSwarmerIcon.png", category = "exclusive", "tower" },
    ["Toxic Gunner"] = { file = "ToxicGIcon.png", category = "exclusive", "tower" },
    ["Sledger"] = { file = "OICESledgerIcon.png", category = "exclusive", "tower" },
    ["Executioner"] = { file = "DefaultExecutioner2.png", category = "exclusive", "tower" },
    ["Elf Camp"] = { file = "Elf_Camp_Tower_Icon.png", category = "exclusive", "tower" },
    ["Jester"] = { file = "JesterIcon.png", category = "exclusive", "tower" },
    ["Cryomancer"] = { file = "OICECryomancerIcon.png", category = "exclusive", "tower" },
    ["Hallow Punk"] = { file = "HallowPunkIcon.png", category = "exclusive", "tower" },
    ["Harvester"] = { file = "DefaultHarvesterIconIG.png", category = "exclusive", "tower" },
    ["Snowballer"] = { file = "SnowballerIcon.png", category = "exclusive", "tower" },
    ["Elementalist"] = { file = "ElementalistIcon.png", category = "exclusive", "tower" },
    ["Firework Technician"] = { file = "FireworkTechnicianIcon.png", category = "exclusive", "tower" },
    ["Biologist"] = { file = "Biologisticon.png", category = "exclusive", "tower" },
    ["War Machine"] = { file = "WarMachineIcon.png", category = "exclusive", "tower" },
    ["Mecha Base"] = { file = "OUMechaBaseIcon.png", category = "exclusive", "tower" },
    ["Sentry"] = { file = "Sentry.png", category = "exclusive", "tower" },
    
    -- placeholder for testingg --
    ["Place"] = { file = "Place.png", category = "TEST"},
    ["PlaceC"] = { file = "PlaceC.png", category = "TEST"},
    
    -- skins below!! (sigh..) --
    
    -- scout skins --
    ["Red Scout"] = { file = "RedScout3.png", category = "starter" },
    ["Green Scout"] = { file = "GreenScout3.png", category = "starter" },
    ["Blue Scout"] = { file = "BlueScout3.png", category = "starter" },
    ["Survivor Scout"] = { file = "SurvivorScout3.png", category = "advanced" },
    ["Black Ops Scout"] = { file = "BlackOpsScout2.png", category = "starter" },
    ["Party Scout"] = { file = "PartyScout3.png", category = "exclusive" },
    ["Bunny Scout"] = { file = "BunnyScout5.png", category = "exclusive" },
    ["Eclipse Scout"] = { file = "EclipseScout2.png", category = "exclusive" },
    ["Valentines Scout"] = { file = "ValentinesScout2.png", category = "starter" },
    ["Beach Scout"] = { file = "BeachScout0.png", category = "exclusive" },
    ["Intern Scout"] = { file = "InternScoutImage.png", category = "advanced" },
    ["Prime Raven Scout"] = { file = "PR_Scout_LVL0.png", category = "hardcore" },
    ["Holiday Scout"] = { file = "HolidayScoutImage.png", category = "exclusive" },
    ["Cookie Scout"] = { file = "CookieScout0.png", category = "exclusive" },
    ["Frost Hunter Scout"] = { file = "FrostHunterScoutIcon2.png", category = "starter" },
    ["Plushie Scout"] = { file = "PlushScout_0.png", category = "exclusive" },
    ["Ducky Scout"] = { file = "DuckyScoutIcon.png", category = "starter" },
    ["Masquerade Scout"] = { file = "Masqueradescout.png", category = "exclusive" },
    ["Phantom Scout"] = { file = "PhantomScoutSkin.png", category = "intermediate" },
    ["Valhalla Scout"] = { file = "ValhallaScout.png", category = "exclusive" },
    ["Toilet Scout"] = { file = "Toiletscout.png", category = "hardcore" },
    ["Guest Scout"] = { file = "GuestScout.png", category = "exclusive" },
    ["Fallen Scout"] = { file = "FallenScoutIcon.png", category = "advanced" },
    ["King of Rock Scout"] = { file = "KingofRockScoutIconIG.png", category = "starter" },
    ["Haz3mn Scout"] = { file = "HazemScoutIconIG.png", category = "exclusive" },
    
    -- sniper skins --
    ["Blue Sniper"] = { file = "DHBlueSniperIcon.png", category = "starter" },
    ["Red Sniper"] = { file = "DHRedSniperIcon.png", category = "starter" },
    ["Ghillie Sniper"] = { file = "DHGhillieSniperIcon.png", category = "starter" },
    ["Valentines Sniper"] = { file = "DHValentinesSniperIcon.png", category = "starter" },
    ["Bunny Sniper"] = { file = "DHBunnySniperIcon.png", category = "exclusive" },
    ["Ducky Sniper"] = { file = "DuckySniperIcon.png", category = "starter" },
    ["Silent Sniper"] = { file = "SilentSniperIcon2.png", category = "starter" },
    ["Davinchi Sniper"] = { file = "Davinchisniper.png", category = "exclusive" },
    ["Redemption Sniper"] = { file = "RedemptionSniperNewIcon.png", category = "intermediate" },
    ["Frost Legion Sniper"] = { file = "FrostLegionSniperIconIG.png", category = "starter" },
    
    -- paintballer skins --
    ["Red Paintballer"] = { file = "DHRedPaintballerIcon.png", category = "starter" },
    ["Bunny Paintballer"] = { file = "DHBunnyPaintballerIcon.png", category = "exclusive" },
    ["Green Paintballer"] = { file = "GreenPaintballerIconJ24.png", category = "starter" },
    
    -- demoman skins --
    ["Green Demoman"] = { file = "GreenDemomanIcon2.png", category = "starter" },
    ["Blue Demoman"] = { file = "BlueDemomanIcon2.png", category = "starter" },
    ["Military Demoman"] = { file = "MilitaryDemomanIcon2.png", category = "intermediate" },
    ["Red Demoman"] = { file = "RedDemomanIcon.png", category = "starter" },
    ["Yellow Demoman"] = { file = "YellowDemomanIcon.png", category = "starter" },
    ["Fortress Demoman"] = { file = "FortressDemomanIcon.png", category = "intermediate" },
    ["Pirate Demoman"] = { file = "PirateDemomanIcon.png", category = "starter" },
    ["Pumpkin Demoman"] = { file = "PumpkinDemoman.png", category = "exclusive" },
    ["Ducky Demoman"] = { file = "DuckyDemomanIconIG.png", category = "intermediate" },
    
    -- hunter skins --
    ["Halloween Hunter"] = { file = "DHHalloweenHunterIcon.png", category = "exclusive" },
    ["Blue Hunter"] = { file = "TowerBlueHunter.png", category = "starter" },
    ["Vampire Slayer Hunter"] = { file = "TowerVampireSlayerHunter.png", category = "exclusive" },
    ["Ducky Hunter"] = { file = "DuckyHunterIconn.png", category = "starter" },
    ["Pirate Hunter"] = { file = "PirateHunterIcon.png", category = "intermediate" },
    
    -- soldier skins --
    ["Blue Soldier"] = { file = "KRBlueSoldier.png", category = "starter" },
    ["Red Soldier"] = { file = "KRRedSoldierIcon.png", category = "starter" },
    ["Cold Soldier Soldier"] = { file = "KRColdSoldierIcon.png", category = "intermediate" },
    ["Party Soldier"] = { file = "KRPartySoldierIcon.png", category = "exclusive" },
    ["Toy Soldier"] = { file = "KRToySoldierIcon.png", category = "starter" },
    ["Doughboy Soldier"] = { file = "KRDoughboySoldierIcon.png", category = "starter" },
    ["Valentines Soldier"] = { file = "KRValentinesSoldierIcon.png", category = "starter" },
    ["Ducky Soldier"] = { file = "KRDuckySoldierIcon.png", category = "starter" },
    ["Grand Theft Soldier"] = { file = "KRGrandTheftSoldierIcon.png", category = "starter" },
    ["Holiday Soldier"] = { file = "BRHolidaySoldierIcon.png", category = "exclusive" },
    ["Beast Slayer Soldier"] = { file = "BSlayerSoldier.png", category = "exclusive" },
    ["Liberator Soldier"] = { file = "LiberatorSoldierIcon.png", category = "advanced" },
    ["Toilet Soldier"] = { file = "ToiletSoldierIcon.png", category = "hardcore" },
    ["Stealth Ops Soldier"] = { file = "StealthOpsSoldierIcon.png", category = "advanced" },
    ["Aerobics Soldier"] = { file = "AerobicsSoldierIcon.png", category = "starter" },
    ["Dark Frost Soldier"] = { file = "DarkFrostSoldierIcon.png", category = "intermediate" },
    ["Korblox Soldier"] = { file = "KorbloxSoldierIconIG.png", category = "exclusive" },
    ["Bunny Soldier"] = { file = "BunnySoldierIconIG.png", category = "intermediate" },
    
    -- militant skins --
    ["Ace Pilot Militant"] = { file = "ESAcePilotMilitantIcon.png", category = "advanced" },
    ["Pumpkin Militant"] = { file = "ESPumpkinMilitantIcon.png", category = "exclusive" },
    ["Hazmat Militant"] = { file = "NewHazmatMilitantIcon.png", category = "starter" },
    ["Ghost Militant"] = { file = "GMilitantIcon.png", category = "exclusive" },
    ["Chocolatier Militant"] = { file = "ESChocolatierMilitantIcon.png", category = "intermediate" },
    ["Ducky Militant"] = { file = "DuckyMilitantIcon.png", category = "intermediate" },
    ["Beach Militant"] = { file = "BeachMilitantIcon.png", category = "exclusive" },
    ["John Militant"] = { file = "JohnMilitantIcon.png", category = "exclusive" },
    ["Lumberjack Militant"] = { file = "LumberjackMilitantIcon.png", category = "intermediate" },
    ["Davinchi Militant"] = { file = "Davinchimilitant.png", category = "exclusive" },
    ["Fallen Militant"] = { file = "FallenMilitantIconIG.png", category = "advanced" },
    ["Star Spartan Militant"] = { file = "StarSpartanMilitantIcon.png", category = "advanced" },
    ["Wasteland Militant"] = { file = "WastelandMilitantIconIG.png", category = "advanced" },
    ["Easter Militant"] = { file = "EasterMilitantIconIG.png", category = "advanced" },
    
    -- medic skins --
    ["Witch Medic"] = { file = "DHWitchMedicIcon.png", category = "exclusive" },
    ["Cyber Medic"] = { file = "CyberMedicIconn.png", category = "advanced" },
    ["Valentine Medic"] = { file = "DHValentinesMedicIcon.png", category = "exclusive" },
    ["Bunny Medic"] = { file = "DHBunnyMedicIcon.png", category = "exclusive" },
    ["Stranded Medic"] = { file = "StrandedMedicIcon2.png", category = "intermediate" },
    ["Masquerade Medic"] = { file = "LYMasqueradeMedicIcon.png", category = "exclusive" },
    ["Fallen Medic"] = { file = "FallenMedicIcon.png", category = "advanced" },
    
    -- freezer skins --
    ["Deep Freeze Freezer"] = { file = "KRDFFreezer.png", category = "starter" },
    ["Mint Choco Freezer"] = { file = "KRMCFreezer.png", category = "intermediate" },
    ["IcyTea Freezer"] = { file = "Icytea_skin_2.png", category = "intermediate" },
    ["Foam Freezer"] = { file = "FoamFreezer.png", category = "exclusive" },
    ["Cryptid Freezer"] = { file = "CFreezer.png", category = "exclusive" },
    ["Frost Legion Freezer"] = { file = "FrostLegionFreezerIconIG.png", category = "advanced" },
    
    -- farm skins --
    ["Arcade Farm"] = { file = "ArcadeFarmIcon.png", category = "advanced" },
    ["Xmas Farm"] = { file = "XmasFarmIcon.png", category = "exclusive" },
    ["Tycoon Farm"] = { file = "TycoonFarmIcon.png", category = "advanced" },
    ["Graveyard Farm"] = { file = "GraveyardFarmIcon.png", category = "exclusive" },
    ["Present Farm"] = { file = "PresentFarm.png", category = "exclusive" },
    ["Ducky Farm"] = { file = "DuckyFarm0.png", category = "hardcore" },
    ["Crypto Farm"] = { file = "CryptoFarmIcon.png", category = "hardcore" },
    ["Pirate Farm"] = { file = "PirateFarmIcon.png", category = "hardcore" },
    ["Wasteland Farm"] = { file = "WastelandFarmIconIG.png", category = "advanced" },
    ["Booth Farm"] = { file = "BoothFarmIconIG.png", category = "exclusive" },
    ["Cozy Camp Farm"] = { file = "CozyCampFarmIconIG.png", category = "intermediate" },
    ["Vendor Farm"] = { file = "LemonadeStandFarmIconIG.png", category = "advanced" },
    ["PNG Farm"] = { file = "PNGFarmIconIG.png", category = "intermediate" },
    
    -- shotgunner skins --
    ["Hallow Punk Shotgunner"] = { file = "DHHallowPunkShotgunnerIcon.png", category = "exclusive" },
    ["Slayer Shotgunner"] = { file = "Newslayeshotgunner.png", category = "hardcore" },
    ["Classic Shotgunner"] = { file = "DHClassicShotgunnerIcon.png", category = "starter" },
    ["Spooky Shotgunner"] = { file = "SpookyShotgunnerNew.png", category = "exclusive" },
    ["Ducky Shotgunner"] = { file = "DuckyShotgunnerIcon.png", category = "intermediate" },
    ["Holiday Shotgunner"] = { file = "HolidayShotgunnerIcon.png", category = "exclusive" },
    ["Vigilante Shotgunner"] = { file = "VigilanteShotgunnerIcon.png", category = "advanced" },
    ["Phantom Shotgunner"] = { file = "PhantomShotgunner.PNG", category = "intermediate" },
    ["Dance Fever Shotgunner"] = { file = "DanceFeverShotgunnerIconIG.png", category = "intermediate" },
    ["Gardener Shotgunner"] = { file = "GardenerShotgunnerIconIG.png", category = "advanced" },
    
    -- rocketeer skins --
    ["Dark Matter Rocketeer"] = { file = "DarkmatterRocketeerIcon2025.png", category = "advanced" },
    ["Pumpkin Rocketeer"] = { file = "PumpkinRocketeerIconIGJan25.png", category = "exclusive" },
    ["Bosanka Rocketeer"] = { file = "BosankaRockteerIcon2025.png", category = "starter" },
    ["Steampunk Rocketeer"] = { file = "SteampunkRocketeerIcon2025.png", category = "intermediate" },
    ["Xmas Rocketeer"] = { file = "XmasRocketeerIconIGJan25.png", category = "exclusive" },
    ["Toy Rocketeer"] = { file = "ToyRocketeerIcon2025.png", category = "starter" },
    ["Lunar Rocketeer"] = { file = "LunarRocketeerIcon.png", category = "advanced" },
    ["Fortress Rocketeer"] = { file = "FortressRocketeerIconIG.png", category = "advanced" },
    ["Lovestriker Rocketeer"] = { file = "LovestrikerRocketeerIconIG.png", category = "hardcore" },
    ["Ducky Rocketeer"] = { file = "DuckyRocketeerIconIG.png", category = "hardcore" },
    
    -- trapper skins --
    ["Plushie Trapper"] = { file = "PlushieTrapperIcon.png", category = "exclusive" },
    ["Dark Frost Trapper"] = { file = "DarkFrostTrapperIconIG.png", category = "advanced" },
    ["Mallard Duck Trapper"] = { file = "MallardDuckTrapperIconIG.png", category = "advanced" },
    
    -- ace pilot skins --
    ["Green Ace Pilot"] = { file = "GreenAcePilotIconIGJ24.png", category = "starter" },
    ["Red Ace Pilot"] = { file = "RedAcePilotIconIGJ24.png", category = "starter" },
    ["Yellow Ace Pilot"] = { file = "YellowAcePilotIconIGJ24.png", category = "starter" },
    ["Aerial Ace Ace Pilot"] = { file = "AerialAceAcePilotIconIGJ24.png", category = "starter" },
    ["Purple Ace Pilot"] = { file = "PurpleAcePilotIconIGJ24.png", category = "starter" },
    ["Navy Ace Pilot"] = { file = "BlueAcePilotIconIGJ24.png", category = "advanced" },
    ["Pumpkin Ace Pilot"] = { file = "PumpkinAcePilotIconIGJ24.png", category = "exclusive" },
    ["Easter Ace Pilot"] = { file = "EasterAcePilotIconIG.png", category = "hardcore" },
    
    -- pyromancer skins --
    ["Hazmat Pyromancer"] = { file = "DHHazmatPyroIcon.png", category = "starter" },
    ["Scarecrow Pyromancer"] = { file = "DHScarecrowPyroIcon.png", category = "exclusive" },
    ["Acidic Pyromancer"] = { file = "DHAcidicPyroIcon.png", category = "intermediate" },
    ["Blue Pyromancer"] = { file = "DHBluePyroIcon.png", category = "starter" },
    ["Valentines Pyromancer"] = { file = "DHValentinesPyroIcon.png", category = "exclusive" },
    ["Bunny Pyromancer"] = { file = "DHBunnyPyroIcon.png", category = "exclusive" },
    ["Ghost Pyromancer"] = { file = "DHGhostPyroIcon.png", category = "exclusive" },
    ["Frost Pyromancer"] = { file = "DHFrostPyroIcon.png", category = "exclusive" },
    ["Barbecue Pyromancer"] = { file = "BarbecuePyroIcon.png", category = "exclusive" },
    ["Mage Pyromancer"] = { file = "MagePyroIcon.png", category = "hardcore" },
    ["Vigilante Pyromancer"] = { file = "VigilantePyromancerIcon.png", category = "intermediate" },
    ["Dwarf Pyromancer"] = { file = "DwarfPyromancer.png", category = "exclusive" },
    ["Plushie Pyromancer"] = { file = "PlushiePyromancerIconIG.png", category = "exclusive" },
    
    -- military base skins --
    ["Classic Military Base"] = { file = "ClassicMilitaryBaseIconM29.png", category = "advanced" },
    ["Wasteland Military Base"] = { file = "WastelandMilitaryBaseIconIG.png", category = "advanced" },
    ["Cyber Military Base"] = { file = "CyberMilitaryBaseIconIG.png", category = "advanced" },
    
    -- crook boss skins --
    ["Demon Crook Boss"] = { file = "DemonCBIconFeb10.png", category = "exclusive" },
    ["Checker Crook Boss"] = { file = "NewCheckerCrookBossIcon.png", category = "starter" },
    ["Xmas Crook Boss"] = { file = "XmasCBIconFeb10.png", category = "exclusive" },
    ["Red Crook Boss"] = { file = "NewRedCrookBossIcon.png", category = "starter" },
    ["Blue Crook Boss"] = { file = "NewBlueCrookBossIcon.png", category = "starter" },
    ["Soviet Crook Boss"] = { file = "SovietCrookBossM24Icon.png", category = "hardcore" },
    ["Spooky Crook Boss"] = { file = "SpookyCBIconFeb10.png", category = "exclusive" },
    ["Cupid Crook Boss"] = { file = "NewCupidCrookBossIcon.png", category = "hardcore" },
    ["Holiday Crook Boss"] = { file = "NewHolidayCrookBossIcon.png", category = "exclusive" },
    ["Pirate Crook Boss"] = { file = "NewPirateCrookBossIcon.png", category = "advanced" },
    ["Necromancer Crook Boss"] = { file = "NewNecromancerCrookBoss.png", category = "exclusive" },
    ["Corso Crook Boss"] = { file = "Feb25CorsoCrookBossIcon.png", category = "advanced" },
    ["DRKSHDW Crook Boss"] = { file = "DSCBoss.png", category = "intermediate" },
    ["SteamPunk Crook Boss"] = { file = "SteamPunkCrookBoss.png", category = "advanced" },
    ["Cybernetic Crook Boss"] = { file = "CyberneticCrookBossIcon.png", category = "advanced" },
    ["Dark Frost Crook Boss"] = { file = "DarkFrostCrookBossIconIG.png", category = "starter" },
    ["Game Master Crook Boss"] = { file = "GameMasterCrookBossIconIG.png", category = "exclusive" }, -- ultimate skin
    ["Alien Focus Crook Boss"] = { file = "AlienFocusCrookBossIconIG.png", category = "advanced" },
    ["Easter Crook Boss"] = { file = "EasterCrookBossIconIG.png", category = "advanced" },
    
    -- electroshocker skins --
    ["Valentines Electroshocker"] = { file = "ValentinesElectroshockerIcon2.png", category = "exclusive" },
    ["Bunny Electroshocker"] = { file = "BunnyElectroshockerIcon2.png", category = "exclusive" },
    ["Hazmat Electroshocker"] = { file = "HazmatElectroshockerIcon2.png", category = "starter" },
    ["Ghost Electroshocker"] = { file = "GhostElectroshockerIcon2.png", category = "exclusive" },
    ["Ducky Electroshocker"] = { file = "DuckyElectroshockerIcon.png", category = "advanced" },
    ["Vigilante Electroshocker"] = { file = "VigilanteElectroshockerIcon.png", category = "intermediate" },
    ["Frankenstein Electroshocker"] = { file = "FrankensteinElectroshocker.png", category = "exclusive" },
    ["TeeVee Electroshocker"] = { file = "TeeVeeElectroshockerIcon.png", category = "hardcore" },
    ["Classic Electroshocker"] = { file = "ClassicElectroIcon.png", category = "advanced" },
    ["Dark Frost Electroshocker"] = { file = "DarkFrostElectroshockerIconIG.png", category = "advanced" },
    ["Korblox Electroshocker"] = { file = "KorbloxElectroshockerIconIG.png", category = "exclusive" },
    
    -- commander skins --
    ["Gargoyle Commander"] = { file = "May17GargoyleCommander.png", category = "exclusive" },
    ["Red Commander"] = { file = "Newredcommander.png", category = "starter" },
    ["Green Commander"] = { file = "Newgreencommander.png", category = "starter" },
    ["Victorian Commander"] = { file = "May17VictorianCommander.png", category = "starter" },
    ["Galactic Commander"] = { file = "May17GalacticCommander.png", category = "intermediate" },
    ["General Commander"] = { file = "May17GeneralCommander.png", category = "starter" },
    ["Bunny Commander"] = { file = "May17BunnyCommander.png", category = "exclusive" },
    ["Spring Time Commander"] = { file = "16MaySpringTimeCommanderIcon.png", category = "exclusive" },
    ["Maid Commander"] = { file = "Newmaidcommander.png", category = "hardcore" },
    ["Neko Commander"] = { file = "Newnekocommander.png", category = "advanced" },
    ["Ghost Commander"] = { file = "May17GhostCommander.png", category = "exclusive" },
    ["Frost Commander"] = { file = "May17FrostCommander.png", category = "exclusive" },
    ["Bloxy Commander"] = { file = "BloxyCommanderIcon.png", category = "exclusive" },
    ["Eclipse Commander"] = { file = "Eclipsecomm.png", category = "exclusive" },
    ["Ducky Commander"] = { file = "Newduckycommander.png", category = "advanced" },
    ["Plushie Commander"] = { file = "PlCommanderIcon.png", category = "exclusive" },
    ["Lifeguard Commander"] = { file = "May17LifeguardCommander.png", category = "exclusive" },
    ["Holiday Commander"] = { file = "May17ElfCommander.png", category = "exclusive" },
    ["Brisk Commander"] = { file = "Newbriskcommander.png", category = "advanced" },
    ["Valentines Commander"] = { file = "May17ValentinesCommander.png", category = "advanced" },
    ["Pirate Commander"] = { file = "PirateCommanderIcon.png", category = "advanced" },
    ["Umbra Commander"] = { file = "UmbraCommanderIcon.png", category = "exclusive" },
    ["Phantom Commander"] = { file = "PhantomCommanderSkin.png", category = "hardcore" },
    ["Eggrypted Commander"] = { file = "May17EggryptedCommander.png", category = "advanced" },
    ["Pattern Commander"] = { file = "PatternCommanderIcon.png", category = "intermediate" },
    ["Vigilante Commander"] = { file = "VigilanteCommanderIcon.png", category = "advanced" },
    ["Patriotic Commander"] = { file = "PatriotCommanderIcon2.png", category = "hardcore" },
    ["Fallen Commander"] = { file = "FallenCommanderIconIG.png", category = "advanced" },
    ["Wasteland Commander"] = { file = "WastelandCommanderIconIG.png", category = "hardcore" },
    ["Santa Commander"] = { file = "SantaCommanderIconIG.png", category = "advanced" },
    
    -- warden skins --
    ["Slaughter Warden"] = { file = "SlaughterWardenIcon.png", category = "exclusive" },
    ["Baseball Warden"] = { file = "BaseballWardenIcon.png", category = "advanced" },
    ["Ducky Warden"] = { file = "DuckyWardenIcon.png", category = "intermediate" },
    ["Pirate Warden"] = { file = "PirateWardenIcon.png", category = "advanced" },
    ["Galactic Warden"] = { file = "GalacticWardenIcon.png", category = "advanced" },
    ["Masquerade Warden"] = { file = "MasqueradeWarden.png", category = "exclusive" },
    ["Isaac Warden"] = { file = "IsaacWardenIcon.png", category = "hardcore" },
    ["Korblox Warden"] = { file = "KorbloxWardenIcon.png", category = "exclusive" },
    ["Fallen Warden"] = { file = "FallenWardenIconIG.png", category = "advanced" },
    ["Freddy Warden"] = { file = "FreddyWardenIconIG.png", category = "intermediate" },
    ["Dark Frost Warden"] = { file = "DarkFrostWardenIconIG.png", category = "intermediate" },
    
    -- cowboy skins --
    ["Pumpkin Cowboy"] = { file = "WDPumpkinCowboyIcon.png", category = "exclusive" },
    ["Redemption Cowboy"] = { file = "WDRedemptionCowboyIcon.png", category = "advanced" },
    ["Bandit Cowboy"] = { file = "WDBanditCowboyIcon.png", category = "advanced" },
    ["Kasodus Cowboy"] = { file = "NewKasodusCowboyIcon.png", category = "intermediate" },
    ["Valentines Cowboy"] = { file = "WDValentinesCowboyIcon.png", category = "advanced" },
    ["Cop Cowboy"] = { file = "CopCowboyIcon.png", category = "starter" },
    ["Noir Cowboy"] = { file = "NoirCowboyIcon.png", category = "intermediate" },
    ["Cyberpunk Cowboy"] = { file = "CyberpunkCowboy.png", category = "hardcore" },
    ["Retired Cowboy"] = { file = "RetiredCowboyIcon.png", category = "hardcore" },
    ["Badlands Cowboy"] = { file = "BadlandsCowboyIcon.png", category = "exclusive" },
    ["Agent Cowboy"] = { file = "AgentCowboyIcon.png", category = "advanced" },
    ["Holiday Cowboy"] = { file = "HolidayCowboyIcon.png", category = "exclusive" },
    ["Ducky Cowboy"] = { file = "DuckyCowboyIcon.png", category = "advanced" },
    ["Bounty Hunter Cowboy"] = { file = "BountyHunterCowboyIcon.png", category = "hardcore" },
    ["Masquerade Cowboy"] = { file = "MasqCowboyIcon.png", category = "exclusive" },
    ["Fallen Cowboy"] = { file = "FallenCowboyIconIG.png", category = "advanced" },
    ["Plushie Cowboy"] = { file = "PlushieCowboyIconIG.png", category = "exclusive" },
    ["Megalodon Cowboy"] = { file = "MegalodonCowboy.png", category = "advanced" },
    ["Dark Frost Cowboy"] = { file = "DarkFrostCowboyIconIG.png", category = "advanced" },
    ["Spring Time Cowboy"] = { file = "SpringTimeCowboyIconIG.png", category = "hardcore" },
    ["Mecha Bunny Cowboy"] = { file = "MechaBunnyCowboyIconIG.png", category = "exclusive" },
    
    -- dj booth skins --
    ["Neon Rave DJ Booth"] = { file = "NeonRaveDJBoothIconAug2024.png", category = "advanced" },
    ["Neko DJ Booth"] = { file = "NekoDJBoothIconAug2024.png", category = "hardcore" },
    ["Ghost DJ Booth"] = { file = "GhostDJBoothIconIGAug2024.png", category = "exclusive" },
    ["Plushie DJ Booth"] = { file = "PlushieDJ.png", category = "exclusive" },
    ["Masquerade DJ Booth"] = { file = "MasqueradeDJBooth.png", category = "exclusive" },
    ["Mako DJ Booth"] = { file = "MakoDJBoothIcon.png", category = "exclusive" }, -- ultimate skin
    ["Garage Band DJ Booth"] = { file = "GarageBandDJBoothIconIG.png", category = "hardcore" },
    ["Ducky DJ Booth"] = { file = "DuckyDJIconIG.png", category = "hardcore" },
    
    -- minigunner skins --
    ["Blue Minigunner"] = { file = "BlueMinigunner.png", category = "starter" },
    ["Green Minigunner"] = { file = "GreenMinigunner.png", category = "starter" },
    ["Black Ops Minigunner"] = { file = "BlackOpsMinigunner.png", category = "starter" },
    ["Pumpkin Minigunner"] = { file = "H23PumpkinMinigunnerIcon.png", category = "exclusive" },
    ["Heavy Minigunner"] = { file = "HeavyMinigunner.png", category = "starter" },
    ["Wraith Minigunner"] = { file = "WraithMinigunner.png", category = "advanced" },
    ["Xmas Minigunner"] = { file = "Xmasminigunner2019rework.png", category = "exclusive" },
    ["Party Minigunner"] = { file = "Partyminigunnerrework.png", category = "exclusive" },
    ["Twitter Minigunner"] = { file = "MiniTwitter.png", category = "hardcore" },
    ["Toy Minigunner"] = { file = "Toyminigunnerrework.png", category = "intermediate" },
    ["Bunny Minigunner"] = { file = "Bunnyminigunnernew.png", category = "exclusive" },
    ["Hazmat Minigunner"] = { file = "HazmatMinigunner.png", category = "starter" },
    ["Ghost Minigunner"] = { file = "Ghostminigunnernew.png", category = "exclusive" },
    ["Frost Minigunner"] = { file = "Frostminigunnerrework.png", category = "exclusive" },
    ["Community Minigunner"] = { file = "Communityminigunnerrework.png", category = "exclusive" },
    ["Crusader Minigunner"] = { file = "Crusaderminigunnerrework.png", category = "exclusive" },
    ["Ducky Minigunner"] = { file = "Duckyminigunnerrework.png", category = "advanced" },
    ["Beach Minigunner"] = { file = "Beachminigunnernew.png", category = "exclusive" },
    ["Plushie Minigunner"] = { file = "PlushieMinigunnerSkin.png", category = "exclusive" },
    ["Holiday Minigunner"] = { file = "HolidayMinigunner.png", category = "exclusive" },
    ["Space Elite Minigunner"] = { file = "SpaceEliteMinigunner.png", category = "intermediate" },
    ["Phantom Minigunner"] = { file = "PhantomMinigunnerSkin.png", category = "advanced" },
    ["Warlord Minigunner"] = { file = "WarlordMinigunnerSkin.PNG", category = "exclusive" },
    ["Sweaking Minigunner"] = { file = "SweakingMinigunnerIcon.png", category = "advanced" },
    ["Trucker Minigunner"] = { file = "VroomVroomMinigunner.png", category = "hardcore" },
    ["Chad Minigunner"] = { file = "ChadMinigunner.png", category = "hardcore" },
    ["Golden Plushie Minigunner"] = { file = "GoldenPlushieMinigunnerIconIG.png", category = "exclusive" },
    ["Fallen Minigunner"] = { file = "FallenMinigunnerIcon.png", category = "advanced" },
    ["Roadrage Minigunner"] = { file = "RoadRageMinigunnerIconIG.png", category = "advanced" },
    ["Nutcracker Minigunner"] = { file = "NutcrackerMinigunnerIconIG.png", category = "intermediate" },
    ["Gardener Minigunner"] = { file = "GardenerMinigunnerIconIG.png", category = "intermediate" },
    
    -- ranger skins --
    ["Railgunner Ranger"] = { file = "RailgunnerRangerMissionIcon.png", category = "hardcore" },
    ["Wraith Ranger"] = { file = "Wraithrangernew.png", category = "advanced" },
    ["Green Ranger"] = { file = "Greenrangernew.png", category = "starter" },
    ["Blue Ranger"] = { file = "Newblueranger.png", category = "starter" },
    ["Black Ops Ranger"] = { file = "Blackopsrangernew.png", category = "starter" },
    ["Partisan Ranger"] = { file = "Partisanrangernew.png", category = "intermediate" },
    ["Valentines Ranger"] = { file = "LOValentinesRanger.png", category = "exclusive" },
    ["Bunny Ranger"] = { file = "Bunnyrangernew.png", category = "exclusive" },
    ["Gun Gale Ranger"] = { file = "KR_Gun_Gale_Ranger_Icon.png", category = "hardcore" },
    ["Dark Matter Ranger"] = { file = "Darkmatterrangernew.png", category = "advanced" },
    ["Frost Ranger"] = { file = "Frostrangernew.png", category = "exclusive" },
    ["Eclipse Ranger"] = { file = "Eclipserangernew.png", category = "exclusive" },
    ["Classic Ranger"] = { file = "Classicrangernew.png", category = "advanced" },
    ["Pumpkin Ranger"] = { file = "PumpkinRanger.png", category = "exclusive" },
    ["Phantom Ranger"] = { file = "PhantomRangerSkin.png", category = "advanced" },
    ["Beast Slayer Ranger"] = { file = "BeastSlayerRangerSkin.PNG", category = "exclusive" },
    ["Propellars Ranger"] = { file = "PropellarsRangerIcon.png", category = "hardcore" },
    ["Badlands Ranger"] = { file = "Badlands_Ranger.png", category = "advanced" },
    ["Steampunk Ranger"] = { file = "SteampunkRangerIcon.png", category = "intermediate" },
    ["5ouls Ranger"] = { file = "5oulsRangerIconIG.png", category = "advanced" },
    ["Frankenstein Ranger"] = { file = "FrankensteinRangerIconIG.png", category = "intermediate" },
    ["Mecha Ducky Ranger"] = { file = "MechaDuckyRangerIconIG.png", category = "advanced" },
    
    -- pursuit skins --
    ["Eggy Pursuit"] = { file = "EggyPursuitIconIG.png", category = "intermediate" },
    
    -- gatling gun skins --
    ["Easter Gatling Gun"] = { file = "EasterGatlingGunnerIconIG.png", category = "intermediate" },
    
    -- turret skins --
    ["XR500 Turret"] = { file = "XR500TurretIcon.png", category = "hardcore" },
    ["XR300 Turret"] = { file = "XR300TurretIcon.png", category = "advanced" },
    ["Crossbow Turret"] = { file = "CrossbowTurret.png", category = "exclusive" },
    
    -- mortar skins --
    ["Bunny Mortar"] = { file = "DHBunnyMortarIcon.png", category = "exclusive" },
    ["Eclipse Mortar"] = { file = "EclipseMortar.png", category = "exclusive" },
    ["Ducky Mortar"] = { file = "DuckyMortarIcon.png", category = "advanced" },
    ["Vigilante Mortar"] = { file = "VigilanteMortarIcon.png", category = "advanced" },
    ["Pirate Mortar"] = { file = "PirateMortarIcon.png", category = "advanced" },
    ["Defender Mortar"] = { file = "DefenderMortarSkin.png", category = "exclusive" },
    ["Baseball Mortar"] = { file = "BaseballMortarIcon.png", category = "advanced" },
    ["Fallen Mortar"] = { file = "FallenMortarIconIG.png", category = "hardcore" },
    ["Dark Frost Mortar"] = { file = "DarkFrostMortarIconIG.png", category = "advanced" },
    ["Frost Mortar"] = { file = "FrostMortarIconIG.png", category = "hardcore" },
    ["Mecha Ducky Mortar"] = { file = "MechaDuckyMortarIconIG.png", category = "hardcore" },
    
    -- mercenary base skins --
    ["Liberator Mercenary Base"] = { file = "LiberatorMercenaryBase.png", category = "hardcore" },
    ["Frost Legion Mercenary Base"] = { file = "FrostLegionMercenaryBaseIconIG.png", category = "hardcore" },
    
    -- brawler skins --
    ["Blazing Brawler"] = { file = "BlazingBrawlerIcon.png", category = "hardcore" },
    ["Fallen Brawler"] = { file = "FallenBrawlerIconIG.png", category = "hardcore" },
    ["Loader Brawler"] = { file = "LoaderBrawlerIconIG.png", category = "hardcore" },
    ["Rudolph Brawler"] = { file = "RudolphBrawlerIconIG.png", category = "hardcore" },
    ["Jordan Brawler"] = { file = "JordanBrawlerIconIG.png", category = "advanced" },
    ["Lovestriker Brawler"] = { file = "LovestrikerBrawlerIconIG.png", category = "hardcore" },
    
    -- necromancer skins --
    ["Mage Necromancer"] = { file = "Magenecromancer.png", category = "hardcore" },
    ["Fallen Necromancer"] = { file = "FallenNecromancerIconIG.png", category = "hardcore" },
    ["Duck Necromancer"] = { file = "DuckNecromancerIconIG.png", category = "hardcore" },
    
    -- accelerator skins --
    ["Mage Accelerator"] = { file = "MageAcceleratorIcon2.png", category = "advanced" },
    ["Eclipse Accelerator"] = { file = "EclipseAcceleratorIcon.png", category = "exclusive" },
    ["Cupid Accelerator"] = { file = "CupidAcceleratorIcon.png", category = "hardcore" },
    ["Ice Witch Accelerator"] = { file = "IceWitchAcceleratorIcon2.png", category = "hardcore" },
    ["Navy Accelerator"] = { file = "NavyAcceleratorIcon.png", category = "advanced" },
    ["Red Accelerator"] = { file = "RedAcceleratorIcon.png", category = "advanced" },
    ["Ducky Accelerator"] = { file = "DuckyAcceleratorIcon.png", category = "hardcore" },
    ["Vigilante Accelerator"] = { file = "VigilanteAcceleratorIcon.png", category = "hardcore" },
    ["Plushie Accelerator"] = { file = "PlushieAccelIcon.png", category = "exclusive" },
    ["Ghost Buster Accelerator"] = { file = "GhostBusterAcceleratorIcon.png", category = "exclusive" },
    ["Legend Accelerator"] = { file = "LegendAcceleratorSkin.png", category = "exclusive" },
    ["Elite Accelerator"] = { file = "YTAccelIcon.png", category = "hardcore" },
    ["Speaker Titan Accelerator"] = { file = "Speakeraccel.png", category = "hardcore" },
    ["Nuclear Accelerator"] = { file = "NuclearAccelIcon.png", category = "advanced" },
    ["Senator Accelerator"] = { file = "SenatorAccelIcon.png", category = "hardcore" },
    ["Dank Accelerator"] = { file = "DanksAcceleratorIconIG.png", category = "hardcore" },
    ["Fallen Accelerator"] = { file = "FallenAcceleratorIconIG.png", category = "hardcore" },
    ["Patient Zero Accelerator"] = { file = "PatientZeroAcceleratorIcon.png", category = "exclusive" },
    ["Disco Accelerator"] = { file = "DiscoAcceleratorIconIG.png", category = "hardcore" },
    
    -- engineer skins --
    ["Ducky Engineer"] = { file = "DuckyEngineerIcon.png", category = "hardcore" },
    ["Mechanic Engineer"] = { file = "MechanicEngineerIcon.png", category = "hardcore" },
    ["Holiday Zero Engineer"] = { file = "HolidayEngineerIcon.png", category = "exclusive" },
    ["Heartbreak Engineer"] = { file = "HeartbreakEngineerIcon.png", category = "hardcore" },
    ["Grave Digger Engineer"] = { file = "GravediggerEngineer.png", category = "exclusive" },
    ["Plushie Engineer"] = { file = "Plushie_Engineer_Icon.png", category = "exclusive" },
    ["Phantom Engineer"] = { file = "PhantomEngineerSkin.png", category = "hardcore" },
    ["Wikia Engineer"] = { file = "YTEngiIcon.png", category = "advanced" },
    ["CrazRex Engineer"] = { file = "CrazRexEngineerIcon.png", category = "advanced" },
    ["Fallen Engineer"] = { file = "FallenEngineerIcon.png", category = "hardcore" },
    ["Dark Frost Engineer"] = { file = "DarkFrostEngineerIconIG.png", category = "hardcore" },
    
    -- gladiator skins --
    ["Slugger Gladiator"] = { file = "DHSluggerGladiatorIcon.png", category = "hardcore" },
    ["Pumpkin Gladiator"] = { file = "PumpkinGladiatorIcon.png", category = "exclusive" },
    ["Demon Gladiator"] = { file = "DHDemonGladiatorIcon.png", category = "exclusive" },
    ["Beach Gladiator"] = { file = "BeachGladiatorIcon.png", category = "exclusive" },
    ["Vigilante Gladiator"] = { file = "VigilanteGladiatorIcon.png", category = "hardcore" },
    ["Pirate Gladiator"] = { file = "PirateGladiatorIcon.png", category = "hardcore" },
    ["Galactic Gladiator"] = { file = "GalacticGladiatorIcon.png", category = "advanced" },
    ["Phantom Gladiator"] = { file = "PhantomGladiatorSkin.png", category = "hardcore" },
    ["Cameraman Gladiator"] = { file = "CameramanGladiatorIcon.png", category = "hardcore" },
    
    -- commando skins --
    ["Pirate Commando"] = { file = "PirateCommandoIconIGNov24.png", category = "advanced" },
    ["Trooper Commando"] = { file = "TrooperCommandoIconIG.png", category = "advanced" },
    
    -- slasher skins --
    ["Spring Time Slasher"] = { file = "HW24SpringTimeSlasherIconIG.png", category = "exclusive" },
    ["Spooky Slasher"] = { file = "HW24SpookySlasherIconIG.png", category = "exclusive" },
    ["Jason Slasher"] = { file = "JasonSlasherIconIG.png", category = "exclusive" },
    
    -- archer skins --
    ["Huntsman Archer"] = { file = "DHHuntsmanArcherIcon.png", category = "starter" },
    ["Valentines Archer"] = { file = "DHValentinesArcherIcon.png", category = "exclusive" },
    ["Spooky Archer"] = { file = "DHSpookyArcherIcon.png", category = "exclusive" },
    
    -- toxic gunner skins --
    ["Phantom Toxic Gunner"] = { file = "PhantomToxicGunnerSkin.PNG", category = "hardcore" },
    
    -- sledger skins --
    ["Brave Soul Sledger"] = { file = "OICEBraveSoulSledgerIcon.png", category = "hardcore" },
    ["Phantom Sledger"] = { file = "PhantomSledgIcon.png", category = "hardcore" },
    ["Fallen Sledger"] = { file = "OICEFallenSledgerIcon.png", category = "hardcore" },
    ["Chocalatier Sledger"] = { file = "ChocolatierSledgerIconIG.png", category = "advanced" },
    
    -- executioner skins --
    ["Eclipse Executioner"] = { file = "EclipseExecutioner.png", category = "exclusive" },
    ["Vanquisher Executioner"] = { file = "VanquisherExecutionerIcon.png", category = "advanced" },
    ["Heartbreak Executioner"] = { file = "HeartbreakExecutionerIconIG.png", category = "advanced" },
    
    -- jester skins --
    ["Clown Jester"] = { file = "ClownJesterIcon.png", category = "hardcore" },
    ["Heartbreak Jester"] = { file = "HeartbreakJesterIconIG.png", category = "advanced" },
    ["The Beast Jester"] = { file = "TheBeastJesterIconIG.png", category = "hardcore" },
    ["The Flea Jester"] = { file = "TheFleaJesterIconIG.png", category = "hardcore" },
    
     -- cryomancer skins --
    ["Krampus Slayer Cryomancer"] = { file = "Krampus_Slayer_Cryomancer_Icon.png", category = "exclusive" },
    
    -- hallow punk skins --
    ["Lunar Hallow Punk"] = { file = "LunarHallowPunkIconIG.png", category = "advanced" },
    
    -- harvester skins --
    ["Wasteland Harvester"] = { file = "WastelandHarvesterIconIG.png", category = "exclusive" },
    ["Lunar Harvester"] = { file = "LunarHarvesterIconIG.png", category = "hardcore" },
    
    -- biologist skins --
    ["Grim Biologist"] = { file = "GrimmBiologist.png", category = "advanced" },
}

local keywordAlias = {
	-- abbreviated names (for ppl who r lazy)
    ["Demo"] = "Demoman",
    ["Sol"] = "Soldier",
    ["Mil"] = "Militant",
    ["Med"] = "Medic",
    ["Shotty"] = "Shotgunner",
    ["Rocket"] = "Rocketeer",
    ["Trap"] = "Trapper",
    ["Ace"] = "Ace Pilot",
    ["Pyro"] = "Pyromancer",
    ["Mil Base"] = "Military Base",
    ["Crook"] = "Crook Boss",
    ["Electro"] = "Electroshocker",
    ["Comm"] = "Commander",
    ["Cow"] = "Cowboy",
    ["DJ"] = "DJ Booth",
    ["Mini"] = "Minigunner",
    ["Gatling"] = "Gatling Gun",
    ["Merc Base"] = "Mercenary Base",
    ["Necro"] = "Necromancer",
    ["Accel"] = "Accelerator",
    ["Engi"] = "Engineer",
    ["Gmini"] = "Golden Minigunner",
    ["Gpyro"] = "Golden Pyromancer",
    ["Gcb"] = "Golden Crook Boss",
    ["Gs"] = "Golden Scout",
    ["Gcow"] = "Golden Cowboy",
    ["Gsol"] = "Golden Soldier",
    ["Glad"] = "Gladiator",
    ["Fb"] = "Frost Blaster",
    ["Tg"] = "Toxic Gunner",
    ["Sled"] = "Sledger",
    ["Exec"] = "Executioner",
    ["Elf"] = "Elf Camp",
    ["Cryo"] = "Cryomancer",
    ["Hallow"] = "Hallow Punk",
    ["Snow"] = "Snowballer",
    ["Elem"] = "Elementalist",
    ["Bio"] = "Biologist",
    ["Ft"] = "Firework Technician",
    ["Wm"] = "War Machine",
    ["Mecha"] = "Mecha Base",
    
    ["Pl"] = "Place",
    ["Plc"] = "PlaceC"
}

function p.generate(frame)
    local args = frame:getParent().args
    local tiers = {"S", "A", "B", "C", "D", "E", "F"}
    local html = mw.html.create("div"):addClass("tier-list")

    for _, tier in ipairs(tiers) do
        local images = args[tier] or ""
        local imageList = mw.text.split(images, ",")

        local row = mw.html.create("div")
            :addClass("tier-row " .. tier:lower() .. "-tier")

        row:tag("div")
            :addClass("tier-label")
            :wikitext(tier)

        local content = row:tag("div")
            :addClass("tier-content")

        for _, img in ipairs(imageList) do
            img = mw.text.trim(img)

            if img ~= "" then
				local mainKey = keywordAlias[img] or img
				local data = keywordMap[mainKey]
                local imageName = data and data.file or img
                local categoryClass = data and data.category or ""
				local tooltipName = mainKey ~= "" and mainKey or "Placement"
                local span = content:tag("span")
                    :addClass("tier-item" .. (categoryClass ~= "" and (" category-" .. categoryClass) or ""))
                    :attr("data-tooltip", tooltipName .. " - " .. tier .. " tier")
                    :wikitext("[[File:" .. imageName .. "|55px]]")
            end
        end

        html:node(row)
    end

    return tostring(html)
end

return p
