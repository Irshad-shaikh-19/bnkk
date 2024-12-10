const router = require('express').Router();
const auth = require('../../middlewares/auth');
const { transactionController } = require('../../controllers');

router.get('/get-list', auth(), transactionController.getAllTransactionDetails);

router.get(
  '/get-by-id/:id',
  auth(),
  transactionController.getTransactionDetailsById
);
router.get(
  '/get-by-institution-and-user',
  auth(),
  transactionController.GetTransactionsByInstitutionAndUser
);
router.put(
  '/update-b4nkd-category/:id',
  auth(),
  transactionController.updateTransactionDetails
);
module.exports = router;
