const Joi = require('joi');

const objectId = (value, helpers) => {
  if (!/^[0-9a-fA-F]{24}$/.test(value)) {
    return helpers.message('"{{#label}}" must be a valid ObjectId');
  }
  return value;
};

const getUserProfile = {
  params: Joi.object().keys({
    profileId: Joi.string().custom(objectId),
  }),
};

const updateUserProfile = {
  params: Joi.object().keys({
    profileId: Joi.string().custom(objectId),
  }),
  body: Joi.object().keys({
    firstName: Joi.string(),
    lastName: Joi.string(),
    preferredName: Joi.string(),
    goals: Joi.array().items(Joi.string()),
    reference_medium: Joi.array().items(Joi.string()),
    incomeRangeStart: Joi.number(),
    incomeRangeEnd: Joi.number(),
    address: Joi.object().keys({
      house: Joi.string(),
      street: Joi.string(),
      city: Joi.string(),
      pincode: Joi.string(),
      country: Joi.string(),
    }),
    isKycDone: Joi.boolean(),
    hasAcceptedTandC: Joi.boolean(),
    budgeting_familiarity: Joi.string(),
    nationality: Joi.string(),
    contact_no: Joi.string(),
    dob: Joi.object().keys({
      day: Joi.string(),
      month: Joi.string(),
      year: Joi.string(),
    }),
  }).unknown(true), // This allows unknown keys like _id, __v, user, etc. to pass through without validation errors
};

const deleteUserProfile = {
  params: Joi.object().keys({
    profileId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  getUserProfile,
  updateUserProfile,
  deleteUserProfile,
};
