const router = require('express').Router();
const auth = require('../../middlewares/auth');
const { faqController } = require('../../controllers');

router.post('/add/:userId', auth(), faqController.addFaq);
router.get('/get-by-id/:id', auth(), faqController.getFaById);
router.get('/get-list', auth(), faqController.getFaqList);
router.put('/update-faq/:id/:userId', auth(), faqController.updateFaq);
router.put('/update-by-id/:id/:userId', auth(), faqController.updateFaqById);

module.exports = router;
