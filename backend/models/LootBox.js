const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const LootBoxItemSchema = new Schema({
  reward: {
    type: Schema.Types.ObjectId,
    ref: "Reward",
    required: true,
  },
  probability: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
});

const LootBoxSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: String,
      required: true,
    },
    cost: {
      type: Number,
      required: true,
      default: 1,
    },
    rarity: {
      type: String,
      required: true,
      enum: ["common", "uncommon", "rare", "epic", "legendary"],
    },
    imageUrl: {
      type: String,
    },
    items: [LootBoxItemSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LootBox", LootBoxSchema);
