const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { toJSON, paginate } = require('./plugins');

const userSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      // unique: true,
      trim: true,
      lowercase: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error('Invalid email');
        }
      },
    },
    password: {
      type: String,
      trim: true,
      minlength: 8,
      validate(value) {
        if (!value.match(/\d/) || !value.match(/[a-zA-Z]/)) {
          throw new Error(
            'Password must contain at least one letter and one number'
          );
        }
      },
      private: true, // used by the toJSON plugin
    },
    contact_no: {
      type: String,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isMobileVerified: {
      type: Boolean,
      default: false,
    },
    isFirstLogin: {
      type: Boolean,
      default: false,
    },
    refreshToken: {
      type: String,
    },
    roles: {
      type: [mongoose.Types.ObjectId],
    },
    created: {
      type: Date,
      default: new Date(),
    },
    updated: {
      type: Date,
      default: new Date(),
    },
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    status: {
      type: Number,
      default: 1, // 0- In-active, 1- active, 2-deleted
    },
    role: {
      type: String,
      default: 'admin', //For theme purpose
    },
  },
  {
    timestamps: true,
  }
);

// add plugin that converts mongoose to json
userSchema.plugin(toJSON);
userSchema.plugin(paginate);

/**
 * Check if email is taken
 * @param {string} email - The user's email
 * @param {ObjectId} [excludeUserId] - The id of the user to be excluded
 * @returns {Promise<boolean>}
 */
userSchema.statics.isEmailTaken = async function (email, excludeUserId) {
  // _id: { $ne: excludeUserId },
  const user = await this.findOne({ email, status: { $ne: 2 } });
  return !!user;
};

/**
 * Check if password matches the user's password
 * @param {string} password
 * @returns {Promise<boolean>}
 */
userSchema.methods.isPasswordMatch = async function (password) {
  const user = this;
  return bcrypt.compare(password, user.password);
};

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    user.password = await bcrypt.hash(user.password, 8);
  }
  next();
});

userSchema.pre('findOneAndUpdate', async function (next) {
  const user = this.getUpdate();
  if (user && user.password) {
    this.getUpdate().password = await bcrypt.hash(user.password, 8);
  }
  next();
});
/**
 * @typedef User
 */
const User = mongoose.model('users', userSchema);

module.exports = User;
