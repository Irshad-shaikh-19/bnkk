const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { userProfileValidation } = require('../../validations');
const { userProfileController } = require('../../controllers');

const router = express.Router();

router
  .route('/')
  .get(auth(), userProfileController.getAllUserProfiles); // Get all user profiles with filtering, pagination, and search

router
  .route('/:profileId')
  .get(auth(), validate(userProfileValidation.getUserProfile), userProfileController.getUserProfileById) // Get user profile by ID
  .patch(auth(), validate(userProfileValidation.updateUserProfile), userProfileController.updateUserProfile) // Update user profile by ID
  .delete(auth(), validate(userProfileValidation.deleteUserProfile), userProfileController.deleteUserProfile); // Delete user profile by ID
module.exports = router;
