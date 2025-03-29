require("dotenv").config();
const mongoose = require("mongoose");
const Key = require("../models/Key");
const User = require("../models/User");
const UserReward = require("../models/UserReward");
const Reward = require("../models/Reward");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => {
    console.error("MongoDB Connection Error:", err);
    process.exit(1);
  });

async function findUser() {
  return new Promise((resolve) => {
    rl.question(
      "Enter the email of the user to initialize with keys and rewards: ",
      async (email) => {
        try {
          const user = await User.findOne({ email });
          if (!user) {
            console.log("User not found with that email.");
            resolve(null);
          } else {
            console.log(`Found user: ${user.username} (${user._id})`);
            resolve(user);
          }
        } catch (error) {
          console.error("Error finding user:", error);
          resolve(null);
        }
      }
    );
  });
}

async function addKeysToUser(user) {
  return new Promise((resolve) => {
    rl.question("How many keys to add to this user? ", async (keysStr) => {
      try {
        const keys = parseInt(keysStr);
        if (isNaN(keys) || keys < 0) {
          console.log("Invalid number of keys.");
          resolve(false);
          return;
        }

        let userKeys = await Key.findOne({ user: user._id });
        if (!userKeys) {
          userKeys = await Key.create({
            user: user._id,
            count: keys,
          });
        } else {
          userKeys.count += keys;
          await userKeys.save();
        }

        console.log(
          `Successfully added ${keys} keys to user. Total keys: ${userKeys.count}`
        );
        resolve(true);
      } catch (error) {
        console.error("Error adding keys:", error);
        resolve(false);
      }
    });
  });
}

async function addDefaultTheme(user) {
  return new Promise(async (resolve) => {
    try {
      // Check if a theme is already set
      const existingActiveTheme = await UserReward.findOne({
        user: user._id,
        isActive: true,
        "reward.type": "theme",
      }).populate("reward");

      if (existingActiveTheme) {
        console.log(
          `User already has an active theme: ${existingActiveTheme.reward.name}`
        );
        resolve(true);
        return;
      }

      // Get a default theme (e.g., common rarity)
      const defaultTheme = await Reward.findOne({
        type: "theme",
        rarity: "common",
      });

      if (!defaultTheme) {
        console.log(
          "No default theme found in database. Run seedRewards.js first."
        );
        resolve(false);
        return;
      }

      // Add the theme to user and set as active
      const userReward = await UserReward.create({
        user: user._id,
        reward: defaultTheme._id,
        isActive: true,
      });

      console.log(
        `Added default theme "${defaultTheme.name}" to user and set as active.`
      );
      resolve(true);
    } catch (error) {
      console.error("Error adding default theme:", error);
      resolve(false);
    }
  });
}

async function main() {
  try {
    // Find the user
    const user = await findUser();
    if (!user) {
      rl.close();
      return;
    }

    // Add keys
    const keysAdded = await addKeysToUser(user);
    if (!keysAdded) {
      rl.close();
      return;
    }

    // Add default theme if needed
    await addDefaultTheme(user);

    console.log("User initialization complete!");
    rl.close();
  } catch (error) {
    console.error("Initialization error:", error);
  } finally {
    rl.close();
    mongoose.disconnect();
  }
}

main();
