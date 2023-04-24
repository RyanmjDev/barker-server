const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  type: {
    type: String,
    enum: ["like", "reply", "rebark", "follow"],
    required: true,
  },
  fromUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  relatedBark: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bark",
  },
  relatedReply: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bark',
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
       engagements: {
        likes: {
          type: Number,
          default: 0,
        },
        replies: {
          type: Number,
          default: 0,
        },
        rebarks: {
          type: Number,
          default: 0,
        },
      },
});

module.exports = mongoose.model("Notification", NotificationSchema);