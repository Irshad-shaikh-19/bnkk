const Joi = require('joi');
const { objectId } = require('./custom.validation');

const getUserAccountsByUserId = {
  params: Joi.object().keys({
    userId: Joi.string().custom(objectId).required(),
  }),
};

module.exports = {
  getUserAccountsByUserId
};
