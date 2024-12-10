const catchAsync = require('../utils/catchAsync');
const { userAccountService } = require('../services');

/**
 * Controller to get user accounts by user ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserAccountsController = catchAsync(async (req, res) => {
    const { userId } = req.body;  // Extracting userId from the request body
    console.log('Received request for user accounts:', req.body);

    // Calling the service method to get user accounts based on userId
    const accounts = await userAccountService.getUserAccountsByUserId(userId);

    // Sending the response with the status and the result
    res.status(accounts.status).send(accounts);
});

/**
 * Controller to get all user accounts
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllUserAccountsController = catchAsync(async (req, res) => {
    const result = await userAccountService.getAllUserAccounts();
    res.status(result.status).send(result);
});

module.exports = {
    getUserAccountsController,
    getAllUserAccountsController,
};
