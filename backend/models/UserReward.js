const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserRewardSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reward: {
      type: Schema.Types.ObjectId,
      ref: "Reward",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    acquiredAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure a user can only have a reward once
UserRewardSchema.index({ user: 1, reward: 1 }, { unique: true });

module.exports = mongoose.model("UserReward", UserRewardSchema);
