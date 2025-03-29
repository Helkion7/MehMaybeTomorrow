const Key = require("../models/Key");
const Reward = require("../models/Reward");
const LootBox = require("../models/LootBox");
const UserReward = require("../models/UserReward");

// Get user's keys
const getUserKeys = async (req, res) => {
  try {
    let userKeys = await Key.findOne({ user: req.user.userId });

    if (!userKeys) {
      // If no key record exists for user, create one
      userKeys = await Key.create({
        user: req.user.userId,
        count: 0,
      });
    }

    res.status(200).json({
      success: true,
      data: userKeys,
    });
  } catch (error) {
    console.error("Get user keys error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user keys",
    });
  }
};

// Add keys to user (called when tasks are completed)
const addUserKeys = async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount is required",
      });
    }

    let userKeys = await Key.findOne({ user: req.user.userId });

    if (!userKeys) {
      userKeys = await Key.create({
        user: req.user.userId,
        count: amount,
      });
    } else {
      userKeys.count += amount;
      await userKeys.save();
    }

    res.status(200).json({
      success: true,
      message: `${amount} keys added successfully`,
      data: userKeys,
    });
  } catch (error) {
    console.error("Add user keys error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while adding user keys",
    });
  }
};

// Get all available loot boxes
const getLootBoxes = async (req, res) => {
  try {
    const lootBoxes = await LootBox.find().sort({ cost: 1 });

    res.status(200).json({
      success: true,
      count: lootBoxes.length,
      data: lootBoxes,
    });
  } catch (error) {
    console.error("Get loot boxes error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching loot boxes",
    });
  }
};

// Open a loot box
const openLootBox = async (req, res) => {
  try {
    const { lootBoxId } = req.params;

    // Find the requested loot box
    const lootBox = await LootBox.findById(lootBoxId).populate("items.reward");
    if (!lootBox) {
      return res.status(404).json({
        success: false,
        message: "Loot box not found",
      });
    }

    // Check if user has enough keys
    const userKeys = await Key.findOne({ user: req.user.userId });
    if (!userKeys || userKeys.count < lootBox.cost) {
      return res.status(400).json({
        success: false,
        message: "Not enough keys to open this loot box",
      });
    }

    // Select a reward based on probabilities
    const reward = selectRewardFromLootBox(lootBox);
    if (!reward) {
      return res.status(500).json({
        success: false,
        message: "Failed to select a reward",
      });
    }

    // Deduct keys
    userKeys.count -= lootBox.cost;
    await userKeys.save();

    // Add reward to user's collection (or handle duplicates)
    let userReward = await UserReward.findOne({
      user: req.user.userId,
      reward: reward._id,
    });

    if (!userReward) {
      // New reward
      userReward = await UserReward.create({
        user: req.user.userId,
        reward: reward._id,
        isActive: false,
      });
      await userReward.populate("reward");
    }

    res.status(200).json({
      success: true,
      message: "Loot box opened successfully",
      data: {
        reward: userReward.reward,
        keyBalance: userKeys.count,
        isNew: !userReward._id,
      },
    });
  } catch (error) {
    console.error("Open loot box error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while opening loot box",
    });
  }
};

// Helper function to select a reward from loot box based on probabilities
const selectRewardFromLootBox = (lootBox) => {
  // Sum all probabilities to handle cases where they don't add up to 100
  const totalProbability = lootBox.items.reduce(
    (sum, item) => sum + item.probability,
    0
  );

  // Generate a random number between 0 and totalProbability
  const random = Math.random() * totalProbability;

  let cumulativeProbability = 0;
  for (const item of lootBox.items) {
    cumulativeProbability += item.probability;
    if (random <= cumulativeProbability) {
      return item.reward;
    }
  }

  // Fallback to the last item if something goes wrong with probability calculation
  return lootBox.items[lootBox.items.length - 1].reward;
};

// Get all user's rewards
const getUserRewards = async (req, res) => {
  try {
    const userRewards = await UserReward.find({ user: req.user.userId })
      .populate("reward")
      .sort({ acquiredAt: -1 });

    res.status(200).json({
      success: true,
      count: userRewards.length,
      data: userRewards,
    });
  } catch (error) {
    console.error("Get user rewards error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user rewards",
    });
  }
};

// Set a reward as active
const setActiveReward = async (req, res) => {
  try {
    const { rewardId } = req.params;

    // Find the specific reward to activate
    const rewardToActivate = await UserReward.findOne({
      user: req.user.userId,
      reward: rewardId,
    }).populate("reward");

    if (!rewardToActivate) {
      return res.status(404).json({
        success: false,
        message: "Reward not found or not owned by user",
      });
    }

    // Get the reward type first
    const rewardType = rewardToActivate.reward.type;

    // Find all user rewards of the same type
    const userRewards = await UserReward.find({
      user: req.user.userId,
    }).populate({
      path: "reward",
      match: { type: rewardType },
    });

    // Deactivate all matching rewards except the one being activated
    for (const userReward of userRewards) {
      // Check if the reward field exists and matches the type
      // This is necessary because populate with match returns null for non-matching items
      if (
        userReward.reward &&
        userReward._id.toString() !== rewardToActivate._id.toString()
      ) {
        userReward.isActive = false;
        await userReward.save();
      }
    }

    // Activate the selected reward
    rewardToActivate.isActive = true;
    await rewardToActivate.save();

    res.status(200).json({
      success: true,
      message: "Reward activated successfully",
      data: rewardToActivate,
    });
  } catch (error) {
    console.error("Set active reward error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while activating reward",
    });
  }
};

// Get active rewards for current user
const getActiveRewards = async (req, res) => {
  try {
    const activeRewards = await UserReward.find({
      user: req.user.userId,
      isActive: true,
    }).populate("reward");

    res.status(200).json({
      success: true,
      count: activeRewards.length,
      data: activeRewards,
    });
  } catch (error) {
    console.error("Get active rewards error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching active rewards",
    });
  }
};

module.exports = {
  getUserKeys,
  addUserKeys,
  getLootBoxes,
  openLootBox,
  getUserRewards,
  setActiveReward,
  getActiveRewards,
};
