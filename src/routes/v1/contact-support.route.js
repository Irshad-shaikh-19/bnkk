const router = require('express').Router();
const { contactSupportController } = require('../../controllers');

router.get('/get-list', contactSupportController.getAllContactSupport);
router.post('/create', contactSupportController.createContactSupport);
router.get('/one-support/:id', contactSupportController.getContactSupport);
router.put('/update-support/:id', contactSupportController.updateContactSupport);
router.delete('/delete-support/:id', contactSupportController.deleteContactSupport);

module.exports = router;