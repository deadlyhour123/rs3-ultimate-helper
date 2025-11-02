// RS3 Quest Database - Enhanced with Locations
const QUESTS = [
    {
        id: 1,
        name: "Cook's Assistant",
        difficulty: "novice",
        questPoints: 1,
        requirements: { skills: {}, quests: [] },
        length: "Short",
        description: "Help the cook in Lumbridge Castle prepare for a banquet.",
        rewards: ["300 Cooking XP", "Access to the Lumbridge Castle kitchen"],
        series: "None",
        location: "Lumbridge Castle"
    },
    {
        id: 2,
        name: "Demon Slayer",
        difficulty: "novice",
        questPoints: 3,
        requirements: { skills: {}, quests: [] },
        length: "Medium",
        description: "Defeat the powerful demon Delrith.",
        rewards: ["Silverlight sword", "2,812.5 Combat XP"],
        series: "Demon Slayer",
        location: "Varrock"
    },
    {
        id: 3,
        name: "Dragon Slayer",
        difficulty: "experienced",
        questPoints: 2,
        requirements: { 
            skills: { "Quest Points": 32 },
            quests: []
        },
        length: "Long",
        description: "Slay the dragon Elvarg and become a true hero.",
        rewards: ["18,650 Strength & Defence XP", "Access to Crandor", "Anti-dragon shield"],
        series: "Dragonkin",
        location: "Crandor / Karamja"
    },
    {
        id: 4,
        name: "The Restless Ghost",
        difficulty: "novice",
        questPoints: 1,
        requirements: { skills: {}, quests: [] },
        length: "Short",
        description: "Help lay a ghost's spirit to rest.",
        rewards: ["1,125 Prayer XP"],
        series: "None",
        location: "Lumbridge Church"
    },
    {
        id: 5,
        name: "Rune Mysteries",
        difficulty: "novice",
        questPoints: 1,
        requirements: { skills: {}, quests: [] },
        length: "Short",
        description: "Discover the secrets of rune stones.",
        rewards: ["Ability to craft runes", "250 Runecrafting XP"],
        series: "Rune Memories",
        location: "Wizards' Tower"
    },
    {
        id: 6,
        name: "Sheep Shearer",
        difficulty: "novice",
        questPoints: 1,
        requirements: { skills: {}, quests: [] },
        length: "Very Short",
        description: "Help a farmer gather wool.",
        rewards: ["150 Crafting XP", "60 coins"],
        series: "None",
        location: "Lumbridge Farm"
    },
    {
        id: 7,
        name: "Romeo & Juliet",
        difficulty: "novice",
        questPoints: 5,
        requirements: { skills: {}, quests: [] },
        length: "Short",
        description: "Help Romeo and Juliet get together.",
        rewards: ["No XP rewards"],
        series: "None",
        location: "Varrock"
    },
    {
        id: 8,
        name: "The Knight's Sword",
        difficulty: "intermediate",
        questPoints: 1,
        requirements: { 
            skills: { "Mining": 10 },
            quests: []
        },
        length: "Medium",
        description: "Help a squire recover a sword.",
        rewards: ["12,725 Smithing XP"],
        series: "None",
        location: "Falador"
    },
    {
        id: 9,
        name: "Rune Memories",
        difficulty: "novice",
        questPoints: 1,
        requirements: { 
            skills: {},
            quests: ["Rune Mysteries"]
        },
        length: "Short",
        description: "Investigate the new developments at the Wizards' Tower.",
        rewards: ["250 Runecrafting XP"],
        series: "Rune Memories",
        location: "Wizards' Tower"
    },
    {
        id: 10,
        name: "Shield of Arrav",
        difficulty: "novice",
        questPoints: 1,
        requirements: { skills: {}, quests: [] },
        length: "Medium",
        description: "Team up with a friend to find the Shield of Arrav.",
        rewards: ["600 coins", "1 Quest Point"],
        series: "Mahjarrat",
        location: "Varrock"
    },
    {
        id: 11,
        name: "Ernest the Chicken",
        difficulty: "novice",
        questPoints: 4,
        requirements: { skills: {}, quests: [] },
        length: "Short",
        description: "Help a witch's lab assistant who's been turned into a chicken.",
        rewards: ["300 coins"],
        series: "None",
        location: "Draynor Manor"
    },
    {
        id: 12,
        name: "Vampyre Slayer",
        difficulty: "novice",
        questPoints: 3,
        requirements: { skills: {}, quests: [] },
        length: "Short",
        description: "Slay the vampyre Count Draynor.",
        rewards: ["4,825 Attack XP"],
        series: "Myreque",
        location: "Draynor Manor"
    },
    {
        id: 13,
        name: "Imp Catcher",
        difficulty: "novice",
        questPoints: 1,
        requirements: { skills: {}, quests: [] },
        length: "Short",
        description: "Collect imp beads for a wizard.",
        rewards: ["875 Magic XP", "Amulet of accuracy"],
        series: "None",
        location: "Wizards' Tower"
    },
    {
        id: 14,
        name: "Prince Ali Rescue",
        difficulty: "novice",
        questPoints: 3,
        requirements: { skills: {}, quests: [] },
        length: "Medium",
        description: "Rescue Prince Ali from Lady Keli.",
        rewards: ["700 coins"],
        series: "Kharidian Desert",
        location: "Al Kharid"
    },
    {
        id: 15,
        name: "Doric's Quest",
        difficulty: "novice",
        questPoints: 1,
        requirements: { skills: {}, quests: [] },
        length: "Very Short",
        description: "Help dwarf Doric collect materials.",
        rewards: ["1,300 Mining XP", "180 coins"],
        series: "None",
        location: "North of Falador"
    },
    {
        id: 16,
        name: "Black Knights' Fortress",
        difficulty: "novice",
        questPoints: 3,
        requirements: { 
            skills: { "Quest Points": 12 },
            quests: []
        },
        length: "Short",
        description: "Sabotage the Black Knights.",
        rewards: ["2,500 coins"],
        series: "White Knight",
        location: "North of Falador"
    },
    {
        id: 17,
        name: "Witch's Potion",
        difficulty: "novice",
        questPoints: 1,
        requirements: { skills: {}, quests: [] },
        length: "Very Short",
        description: "Help a witch make a potion.",
        rewards: ["325 Magic XP"],
        series: "None",
        location: "Rimmington"
    },
    {
        id: 18,
        name: "The Blood Pact",
        difficulty: "novice",
        questPoints: 1,
        requirements: { skills: {}, quests: [] },
        length: "Short",
        description: "Explore Lumbridge catacombs.",
        rewards: ["Combat XP lamps", "Reborn equipment"],
        series: "None",
        location: "Lumbridge Catacombs"
    },
    {
        id: 19,
        name: "A Clockwork Syringe",
        difficulty: "novice",
        questPoints: 1,
        requirements: { skills: {}, quests: [] },
        length: "Short",
        description: "Help a doctor create a medicine machine.",
        rewards: ["2,000 Crafting XP"],
        series: "Penguin",
        location: "Ardougne"
    },
    {
        id: 20,
        name: "Pirate's Treasure",
        difficulty: "novice",
        questPoints: 2,
        requirements: { skills: {}, quests: [] },
        length: "Short",
        description: "Find One-Eyed Hector's treasure.",
        rewards: ["450 coins", "1 uncut sapphire"],
        series: "None",
        location: "Port Sarim"
    }
];

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = QUESTS;
}
