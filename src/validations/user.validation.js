const Joi = require('joi');
const { password, objectId } = require('./custom.validation');

const createUser = {
  body: Joi.object().keys({
    firstName: Joi.string().required(),
    /* `lastName` is being defined as a required string field in the `createUser` object schema. This
    means that when creating a user, the `lastName` field must be provided and it must be a string
    value. */
    lastName: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required().custom(password),
    address: Joi.object().keys({
      house: Joi.string(),
      street: Joi.string(),
      city: Joi.string(),
      pincode: Joi.string(),
      country: Joi.string(),
    }),
    contact_no: Joi.string().required(),
    isSuperAdmin: Joi.boolean(),
    isFirstLogin: Joi.boolean(),
    avatar: Joi.string(),
    incomeRangeStart: Joi.string().allow(''),
    incomeRangeEnd: Joi.string().allow(''),
    roles: Joi.array().allow(''),
    preferredName: Joi.string().allow(),
    dob: Joi.object().keys({
      day: Joi.string().allow(''),
      month: Joi.string().allow(''),
      year: Joi.string().allow(''),
    }),
  }),
};

const getUsers = {
  query: Joi.object().keys({
    role: Joi.string(),
    sortBy: Joi.string(),
    limit: Joi.number().integer(),
    page: Joi.number().integer(),
    search: Joi.string(),
  }),
};

const getUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

const updateUser = {
  params: Joi.object().keys({
    userId: Joi.required().custom(objectId),
  }),
  body: Joi.object()
    .keys({
      firstName: Joi.string().allow(),
      lastName: Joi.string().allow(),
      email: Joi.string().allow().email(),
      password: Joi.string().allow().custom(password),
      address: Joi.object().keys({
        house: Joi.string(),
        street: Joi.string(),
        city: Joi.string(),
        pincode: Joi.string(),
        country: Joi.string(),
      }),
      id: Joi.string().allow(),
      contact_no: Joi.string().allow(),
      isSuperAdmin: Joi.boolean(),
      isFirstLogin: Joi.boolean(),
      avatar: Joi.string().allow(''),
      incomeRangeStart: Joi.string().allow(''),
      incomeRangeEnd: Joi.string().allow(''),
      preferredName: Joi.string().allow(''),
      roles: Joi.array().allow(''),
      nationality: Joi.string().allow(''),
      dob: Joi.object().keys({
        day: Joi.string().allow(''),
        month: Joi.string().allow(''),
        year: Joi.string().allow(''),
      }),
      goals: Joi.array().allow(''),
      role: Joi.string().allow(''),
      user: Joi.string().custom(objectId),
    })
    .min(1),
};

const deleteUser = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId),
  }),
};

module.exports = {
  createUser,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
};
