const express = require('express');
const auth = require('../../middlewares/auth');
const validate = require('../../middlewares/validate');
const { userAccountValidation } = require('../../validations');
const { userAccountController } = require('../../controllers');

const router = express.Router();

router.route('/:userId').get(auth(),
//  validate(userAccountValidation.getUserAccountsByUserId), 
 userAccountController.getUserAccountsController);

// Route to get all user accounts
router.route('/')
  .get(
    auth(),
    userAccountController.getAllUserAccountsController
  );
module.exports = router;
