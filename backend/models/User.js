const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["jobseeker", "employer", "recruiter"],
      required: true,
    },
    skills: {
      type: [String],
      default: [],
    },
    headline: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    resumeText: {
      type: String,
      default: "",
    },
    resumeFile: {
      type: String,
      default: "",
    },
    education: {
      type: String,
      default: "",
    },
    experience: {
      type: String,
      default: "",
    },
    resetPasswordToken: {
      type: String,
      default: "",
    },
    resetPasswordExpires: {
      type: Date,
      default: null,
    },
    companyName: {
      type: String,
      default: "",
    },
    companyDescription: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving so plain text passwords are never stored.
userSchema.pre("save", async function savePassword() {
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function comparePassword(password) {
  if (!this.password) {
    return false;
  }

  const normalizedPassword = typeof password === "string" ? password : "";
  const storedPassword = String(this.password);
  const isBcryptHash = /^\$2[aby]\$\d{2}\$/.test(storedPassword);

  if (isBcryptHash) {
    return bcrypt.compare(normalizedPassword, storedPassword);
  }

  return Promise.resolve(normalizedPassword === storedPassword);
};

module.exports = mongoose.model("User", userSchema);
