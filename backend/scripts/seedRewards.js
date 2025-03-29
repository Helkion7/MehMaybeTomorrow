require("dotenv").config();
const mongoose = require("mongoose");
const Reward = require("../models/Reward");
const LootBox = require("../models/LootBox");

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

// Define rewards
const rewards = [
  {
    name: "Midnight Theme",
    type: "theme",
    description: "An ultra-dark theme with minimal blue accents",
    rarity: "common",
    value: {
      background: "oklch(0.02 0.01 250)",
      textPrimary: "oklch(0.95 0.02 250)",
      textSecondary: "oklch(0.65 0.01 250)",
      accent: "oklch(0.75 0.06 280)",
      border: "oklch(0.23 0.01 250)",
    },
  },
  {
    name: "Ember Theme",
    type: "theme",
    description: "Dark theme with warm red accents",
    rarity: "uncommon",
    value: {
      background: "oklch(0.03 0.01 250)",
      textPrimary: "oklch(0.95 0.02 30)",
      textSecondary: "oklch(0.65 0.01 30)",
      accent: "oklch(0.75 0.18 30)",
      border: "oklch(0.23 0.05 30)",
    },
  },
  {
    name: "Emerald Theme",
    type: "theme",
    description: "Dark theme with vibrant green accents",
    rarity: "rare",
    value: {
      background: "oklch(0.03 0.01 250)",
      textPrimary: "oklch(0.95 0.02 145)",
      textSecondary: "oklch(0.65 0.01 145)",
      accent: "oklch(0.75 0.18 145)",
      border: "oklch(0.23 0.05 145)",
    },
  },
  {
    name: "Amethyst Theme",
    type: "theme",
    description: "Dark theme with vibrant purple accents",
    rarity: "epic",
    value: {
      background: "oklch(0.03 0.01 250)",
      textPrimary: "oklch(0.95 0.02 300)",
      textSecondary: "oklch(0.65 0.01 300)",
      accent: "oklch(0.75 0.18 300)",
      border: "oklch(0.23 0.05 300)",
    },
  },
  {
    name: "Gold Theme",
    type: "theme",
    description: "Luxurious dark theme with gold accents",
    rarity: "legendary",
    value: {
      background: "oklch(0.03 0.01 250)",
      textPrimary: "oklch(0.95 0.02 85)",
      textSecondary: "oklch(0.65 0.01 85)",
      accent: "oklch(0.75 0.18 85)",
      border: "oklch(0.23 0.05 85)",
    },
  },
  {
    name: "Early Bird Badge",
    type: "badge",
    description: "Complete 5 tasks before 9AM",
    rarity: "common",
    value: {
      icon: "sunrise",
      color: "oklch(0.75 0.06 60)",
    },
  },
  {
    name: "Night Owl Badge",
    type: "badge",
    description: "Complete 5 tasks after 10PM",
    rarity: "common",
    value: {
      icon: "moon",
      color: "oklch(0.75 0.06 250)",
    },
  },
  {
    name: "Fade In Animation",
    type: "animation",
    description: "Tasks fade in smoothly when loaded",
    rarity: "uncommon",
    value: {
      name: "fadeIn",
      duration: "0.5s",
      timing: "ease-in",
    },
  },
  {
    name: "Slide In Animation",
    type: "animation",
    description: "Tasks slide in from the side when loaded",
    rarity: "rare",
    value: {
      name: "slideIn",
      duration: "0.3s",
      timing: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },
  {
    name: "Task Prioritizer",
    type: "feature",
    description: "AI-powered task prioritization suggestions",
    rarity: "epic",
    value: {
      feature: "taskPrioritizer",
      enabled: true,
    },
  },
  {
    name: "Time Tracker",
    type: "feature",
    description: "Track time spent on each task",
    rarity: "legendary",
    value: {
      feature: "timeTracker",
      enabled: true,
    },
  },
];

// Define loot boxes
const lootBoxes = [
  {
    name: "Basic Loot Box",
    description: "Contains common and uncommon rewards",
    cost: 1,
    rarity: "common",
    items: [], // Will be filled with reward IDs
  },
  {
    name: "Premium Loot Box",
    description: "Higher chance of rare and epic rewards",
    cost: 3,
    rarity: "rare",
    items: [], // Will be filled with reward IDs
  },
  {
    name: "Legendary Loot Box",
    description: "Guaranteed epic or legendary reward",
    cost: 5,
    rarity: "legendary",
    items: [], // Will be filled with reward IDs
  },
];

// Seed function
async function seedDatabase() {
  try {
    // Clear existing data
    await Reward.deleteMany({});
    await LootBox.deleteMany({});

    console.log("Existing rewards and loot boxes cleared");

    // Insert rewards
    const createdRewards = await Reward.insertMany(rewards);
    console.log(`${createdRewards.length} rewards created`);

    // Group rewards by rarity
    const rewardsByRarity = {};
    createdRewards.forEach((reward) => {
      if (!rewardsByRarity[reward.rarity]) {
        rewardsByRarity[reward.rarity] = [];
      }
      rewardsByRarity[reward.rarity].push(reward);
    });

    // Configure loot box items with probabilities
    const basicBox = lootBoxes[0];
    basicBox.items = [
      ...rewardsByRarity.common.map((reward) => ({
        reward: reward._id,
        probability: 70 / rewardsByRarity.common.length,
      })),
      ...rewardsByRarity.uncommon.map((reward) => ({
        reward: reward._id,
        probability: 30 / rewardsByRarity.uncommon.length,
      })),
    ];

    const premiumBox = lootBoxes[1];
    premiumBox.items = [
      ...rewardsByRarity.common.map((reward) => ({
        reward: reward._id,
        probability: 25 / rewardsByRarity.common.length,
      })),
      ...rewardsByRarity.uncommon.map((reward) => ({
        reward: reward._id,
        probability: 40 / rewardsByRarity.uncommon.length,
      })),
      ...rewardsByRarity.rare.map((reward) => ({
        reward: reward._id,
        probability: 30 / rewardsByRarity.rare.length,
      })),
      ...rewardsByRarity.epic.map((reward) => ({
        reward: reward._id,
        probability: 5 / rewardsByRarity.epic.length,
      })),
    ];

    const legendaryBox = lootBoxes[2];
    legendaryBox.items = [
      ...rewardsByRarity.uncommon.map((reward) => ({
        reward: reward._id,
        probability: 10 / rewardsByRarity.uncommon.length,
      })),
      ...rewardsByRarity.rare.map((reward) => ({
        reward: reward._id,
        probability: 30 / rewardsByRarity.rare.length,
      })),
      ...rewardsByRarity.epic.map((reward) => ({
        reward: reward._id,
        probability: 45 / rewardsByRarity.epic.length,
      })),
      ...rewardsByRarity.legendary.map((reward) => ({
        reward: reward._id,
        probability: 15 / rewardsByRarity.legendary.length,
      })),
    ];

    // Insert loot boxes
    const createdLootBoxes = await LootBox.insertMany(lootBoxes);
    console.log(`${createdLootBoxes.length} loot boxes created`);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    mongoose.disconnect();
    console.log("MongoDB disconnected");
  }
}

// Run the seed function
seedDatabase();
