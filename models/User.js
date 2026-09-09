const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { USER_ROLES } = require('../utils/constants');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required'],
      select: false // Never return password hash in regular queries
    },
    role: {
      type: String,
      enum: {
        values: Object.values(USER_ROLES),
        message: 'Role `{VALUE}` is not supported'
      },
      default: USER_ROLES.GUEST
    },
    hotelId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Hotel',
      default: null,
      validate: {
        validator: function (value) {
          // If role is staff, hotelId should be provided
          if (this.role === USER_ROLES.STAFF && !value) {
            return false;
          }
          return true;
        },
        message: 'Staff members must be assigned to a specific hotelId'
      }
    },
    phone: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// Password comparison method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

// Static helper to hash password
userSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(plainPassword, salt);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
