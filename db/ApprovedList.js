/**
 * Tower Approval Lists
 * This file contains the lists of towers that are verified or featured
 * 
 * approvedTowers: Towers that have passed verification and don't show the "unverified" tag
 * featuredTowers: Towers that are highlighted as featured content
 * 
 * Add or remove entries as needed
 */

// List of verified towers that won't have the unverified tag
const approvedTowers = [
    "Bman Shadow/Harvester 2.0",
    "Gabonnie/Anubis Tower",
    "Gabonnie/Accelerator",
    "ImAllOutOfNames/LIBERATOR TOWER CONCEPT",
    "Phidoductom1/Jesus the Navereth",
    "Vessel Of Infinite Destruction/Golden Crook Boss",
    "Vessel Of Infinite Destruction/Ranger",
    "Vessel Of Infinite Destruction/Golden Cowboy",
];

// List of featured towers
const featuredTowers = [
    "Vessel Of Infinite Destruction/Ranger",
];

// Make these arrays available to other scripts
window.approvedTowers = approvedTowers;
window.featuredTowers = featuredTowers;