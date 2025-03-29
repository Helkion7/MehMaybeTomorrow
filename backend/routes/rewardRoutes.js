const express = require("express");
const router = express.Router();
const rewardController = require("../controllers/rewardController");
const verifyJWT = require("../middleware/verifyJWT");

// Protect all reward routes - require authentication
router.use(verifyJWT);

// Routes for key management
router.get("/keys", rewardController.getUserKeys);
router.post("/keys", rewardController.addUserKeys);

// Routes for loot boxes
router.get("/lootboxes", rewardController.getLootBoxes);
router.post("/lootboxes/:lootBoxId/open", rewardController.openLootBox);

// Routes for rewards
router.get("/user-rewards", rewardController.getUserRewards);
router.get("/active-rewards", rewardController.getActiveRewards);
router.put(
  "/user-rewards/:rewardId/activate",
  rewardController.setActiveReward
);

module.exports = router;
