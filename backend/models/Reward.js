const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RewardSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["theme", "badge", "animation", "feature"],
    },
    description: {
      type: String,
      required: true,
    },
    rarity: {
      type: String,
      required: true,
      enum: ["common", "uncommon", "rare", "epic", "legendary"],
    },
    value: {
      type: Object,
      required: true,
    },
    imageUrl: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Reward", RewardSchema);
