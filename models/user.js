const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const passportLocalMongoose = require("passport-local-mongoose");
const notification = require("./notification");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: { 
    type: String, 
    required: true, 
    unique: true 
  },
  email:  { 
    type: String, 
    required: true, 
    unique: true 
  },
  password: {
     type: String, 
     required: true 
    },
  profile: {
    type: String
  },
  barks: [
    {
      type: Schema.Types.ObjectId,
      ref: "Bark",
    },
  ],
  followers: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  likedBarks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bark",
    },
  ],
  notifications: [
    {
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
      read: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

});

UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

UserSchema.methods.comparePassword = function (password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", UserSchema);
