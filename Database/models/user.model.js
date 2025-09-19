import mongoose, { Schema, model } from "mongoose";
import bcryptjs from "bcryptjs";

const userSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    password: { type: String, required: true, select: false },
    passwordChangedAt: Date,
    role: { type: String, enum: ["user", "admin"], default: "user" },
    isActive: { type: Boolean, default: true },
    verified: { type: Boolean, default: false },
    blocked: { type: Boolean, default: false },
    wishlist: [{ type: Schema.ObjectId, ref: "product" }],
    addresses: [{ city: String, street: String, phone: String }],
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcryptjs.hash(this.password, 12);
  if (!this.isNew) {
    this.passwordChangedAt = Date.now() - 1000;
  }
  next();
});

// Hash password on updates
userSchema.pre("findOneAndUpdate", async function (next) {
  if (this._update.password) {
    this._update.password = await bcryptjs.hash(this._update.password, 12);
    this._update.passwordChangedAt = Date.now() - 1000;
  }
  next();
});

// Method for checking password
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcryptjs.compare(candidatePassword, userPassword);
};

export const userModel = model("User1", userSchema);
