const router = require('express').Router();
const auth = require('../../middlewares/auth');
const { contactSupportController } = require('../../controllers');

router.get('/get-list', auth(), contactSupportController.getAllContactSupport);

module.exports = router;
