const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide user name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide user email'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide password'],
      minlength: 6,
    },
    role: {
      type: String,
      enum: ['PARALEGAL', 'CASE_MANAGER', 'LEGAL_EXPERT', 'ADMIN', 'nyaaya_mitra', 'case_manager', 'legal_expert', 'admin'],
      default: 'PARALEGAL',
    },
    district: {
      type: String,
      default: 'Mandya',
    },
    language: {
      type: String,
      default: 'en',
    },
    phone: {
      type: String,
      default: '',
    },
    specialization: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    metrics: {
      casesHandled: { type: Number, default: 0 },
      fieldVisitsCount: { type: Number, default: 0 },
      resolvedCount: { type: Number, default: 0 },
      rating: { type: Number, default: 4.8 },
      pendingCases: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Compare password method (supports bcrypt and fallback plain-text for directly inserted MongoDB records)
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;

  // 1. Direct plaintext match (if inserted directly into MongoDB)
  if (this.password === enteredPassword) {
    try {
      // Auto-upgrade plaintext password to bcrypt hash
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(enteredPassword, salt);
      await this.save();
    } catch (err) {
      console.warn('Could not upgrade plaintext password to bcrypt:', err.message);
    }
    return true;
  }

  // 2. Standard bcrypt comparison
  try {
    return await bcrypt.compare(enteredPassword, this.password);
  } catch (err) {
    return false;
  }
};

module.exports = mongoose.model('User', userSchema);
