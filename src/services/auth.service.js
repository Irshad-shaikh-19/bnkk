/* eslint-disable no-prototype-builtins */
const httpStatus = require('http-status');
const tokenService = require('./token.service');
const userService = require('./user.service');
const emailService = require('./email.service');
const Token = require('../models/token.model');
const ApiError = require('../utils/ApiError');
const { tokenTypes } = require('../config/tokens');
const generateOTP = require('../utils/generate-otp');
const { systemLog } = require('../utils/system-log');
const errorHandler = require('../utils/error.handler');
const mongoose = require('mongoose');
const { UserProfile, User, NotificationModel, GeneralSettingModel } = require('../models');
const bcrypt = require('bcryptjs');
/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */
const loginUserWithEmailAndPassword = async (email, password, info) => {
  let user = await userService.getUserByEmail(email);
  if (!user || !(await user.isPasswordMatch(password))) {
    errorHandler.errorM({
      action_type: 'user-login',
      error_data: { message: 'occures while user-login.' },
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Incorrect email or password',
      user: '',
    };
  } else if (!user.isSuperAdmin && user.status === 0) {
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'User is not active!',
      user: '',
    };
  } else if (user.status === 2) {
    errorHandler.errorM({
      action_type: 'user-login',
      error_data: { message: 'occures while user-login.' },
    });
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Incorrect email or password',
      user: '',
    };
  }
  const userProfileDetails = await UserProfile.findOne({
    user: mongoose.Types.ObjectId(user._id),
  });
  user = await User.findOne({ email }).lean();

  const { firstName, lastName } = userProfileDetails;
  user.displayName = `${firstName && firstName !== '' ? firstName + ' ' : ''}${lastName ? lastName : ''
    }`;
  user['preferredName'] = userProfileDetails.preferredName;
  user['firstName'] = userProfileDetails.firstName;
  user['lastName'] = userProfileDetails.lastName;
  user.address = {
    house: userProfileDetails.address.house,
    street: userProfileDetails.address.street,
    city: userProfileDetails.address.city,
    pincode: userProfileDetails.address.pincode,
    country: userProfileDetails.address.country,
  };
  user.dob = {
    day: userProfileDetails.dob.day,
    month: userProfileDetails.dob.month,
    year: userProfileDetails.dob.year,
  };
  user['contact_no'] = userProfileDetails.contact_no;
  user['nationality'] = userProfileDetails.nationality;
  // user['reference_medium'] = userProfileDetails.reference_medium;
  // Assuming user is an array of objects, you can assign the value like this:
  // user.reference_medium = userProfileDetails.reference_medium;

  // Generate a 6-digit OTP
  await systemLog('LOGIN', { email }, user._id, 'user-login', {}, info);
  const otpCode = generateOTP(6);

  if (!user.isSuperAdmin) {
    const resultData = await GeneralSettingModel.findOne();

    if (resultData) {
      const { notification_type } = resultData;

      if (notification_type.includes('email')) {
        // If email notification type is present
        await emailService.sendLoginEmail(user.firstName, user.lastName);
      }

      if (notification_type.includes('app')) {
        // If app notification type is present
        const obj = {
          user: user._id,
          action: 'login',
        };
        await NotificationModel.create(obj);
      }
    }
  }

  return {
    status: httpStatus.OK,
    user: user,
    message: '',
    otpCode: otpCode,
  };
};

/**
 * Logout
 * @param {string} refreshToken
 * @returns {Promise}
 */
const logout = async (refreshToken) => {
  const refreshTokenDoc = await Token.findOne({
    token: refreshToken,
    type: tokenTypes.REFRESH,
    blacklisted: false,
  });
  if (!refreshTokenDoc) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Not found');
  }
  await refreshTokenDoc.remove();
};

/**
 * Change password
 * @param {string} password
 * @param {string} oldPassword
 * @returns {Promise}
 */
const changePassword = async (userId, password, oldPassword) => {
  try {
    let user = await userService.getUserByID(userId);
    if (!user) {
      return {
        status: httpStatus.NOT_FOUND,
        message: 'User not found',
        user: '',
      };
    }

    // Check if the old password matches
    const isPasswordMatch = await bcrypt.compare(oldPassword, user.password);

    if (!(await user.isPasswordMatch(oldPassword))) {
      return {
        status: httpStatus.BAD_REQUEST,
        message: 'Current password invalid!',
        user: '',
      };
    }
    if (!isPasswordMatch) {
      return {
        status: httpStatus.BAD_REQUEST,
        message: 'Current password invalid!',
        user: '',
      };
    }
    await User.findByIdAndUpdate(user._id, { password: password });
    if (!user.isSuperAdmin) {
      const resultData = await GeneralSettingModel.findOne();
      const userProfileDetails = await UserProfile.findOne({
        user: mongoose.Types.ObjectId(userId),
      });

      if (resultData && userProfileDetails) {
        const { notification_type } = resultData;
        const { firstName, lastName } = userProfileDetails;

        if (notification_type.includes('email')) {
          // If email notification type is present
          await emailService.sendUpdatePasswordEmail(firstName, lastName);
        }

        if (notification_type.includes('app')) {
          // If app notification type is present
          const obj = {
            user: userId,
            action: 'update-password',
          };
          await NotificationModel.create(obj);
        }
      }
    }

    return {
      status: httpStatus.OK,
      message: 'Password updated successfully.',
    };
  } catch (error) {
    return {
      status: httpStatus.BAD_REQUEST,
      message: 'Password reset failed',
      user: '',
    };
  }
};

/**
 * Refresh auth tokens
 * @param {string} refreshToken
 * @returns {Promise<Object>}
 */
const refreshAuth = async (refreshToken) => {
  try {
    const refreshTokenDoc = await tokenService.verifyToken(
      refreshToken,
      tokenTypes.REFRESH
    );
    const user = await userService.getUserById(refreshTokenDoc.user);
    if (!user) {
      return {
        status: httpStatus.NON_AUTHORITATIVE_INFORMATION,
        message: 'Wrong Information',
      };
    }
    await refreshTokenDoc.remove();
    const tokens = await tokenService.generateAuthTokens(user);
    return {
      status: httpStatus.OK,
      message: '',
      tokens,
      user,
    };
  } catch (error) {
    return {
      status: httpStatus.UNAUTHORIZED,
      message: 'Please authenticate',
    };
  }
};

/**
 * Reset password
 * @param {string} resetPasswordToken
 * @param {string} newPassword
 * @returns {Promise}
 */
const resetPassword = async (resetPasswordToken, newPassword) => {
  try {
    const resetPasswordTokenDoc = await tokenService.verifyToken(
      resetPasswordToken,
      tokenTypes.RESET_PASSWORD
    );
    const user = await userService.getUserById(resetPasswordTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await userService.updatePasswordById(user.id, { password: newPassword });
    await Token.deleteMany({
      user: user.id,
      type: tokenTypes.RESET_PASSWORD,
    });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Password reset failed');
  }
};

/**
 * Verify email
 * @param {string} verifyEmailToken
 * @returns {Promise}
 */
const verifyEmail = async (verifyEmailToken) => {
  try {
    const verifyEmailTokenDoc = await tokenService.verifyToken(
      verifyEmailToken,
      tokenTypes.VERIFY_EMAIL
    );
    const user = await userService.getUserById(verifyEmailTokenDoc.user);
    if (!user) {
      throw new Error();
    }
    await Token.deleteMany({
      user: user.id,
      type: tokenTypes.VERIFY_EMAIL,
    });
    await userService.updateUserById(user.id, { isEmailVerified: true });
  } catch (error) {
    throw new ApiError(httpStatus.UNAUTHORIZED, 'Email verification failed');
  }
};

module.exports = {
  loginUserWithEmailAndPassword,
  logout,
  refreshAuth,
  changePassword,
  resetPassword,
  verifyEmail,
};
