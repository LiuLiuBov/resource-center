const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  phone: { type: String, default: "" },
  profilePicture: { type: String, default: "" },
  location: { type: String, default: "" },
  bio: { type: String, default: "" },
  emailVerified: { type: Boolean, default: false },
  verificationToken: { type: String }
});

// Хешування пароля перед збереженням
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model("User", UserSchema);
