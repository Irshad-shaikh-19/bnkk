const router = require('express').Router();
const auth = require('../../middlewares/auth');
const { dashboardController } = require('../../controllers');

router.get(
  '/get-transaction-count',
  auth(),
  dashboardController.getTransactionCount
);

router.get(
  '/get-transaction-type-count',
  auth(),
  dashboardController.getTransactionTypeCount
);

module.exports = router;
