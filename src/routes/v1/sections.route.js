const router = require('express').Router();
const auth = require('../../middlewares/auth');
const { sectionsController } = require('../../controllers');

router.post('/add/:userId', auth(), sectionsController.addSection);
router.get('/get-list', auth(), sectionsController.getSectionList);
router.get('/section-list', auth(), sectionsController.getSection);
router.put(
  '/update-by-id/:id/:userId',
  auth(),
  sectionsController.updateSection
);
router.put(
  '/update-status/:id/:userId',
  auth(),
  sectionsController.updateSectionStatus
);
router.put('/delete/:id/:userId', auth(), sectionsController.deleteSection);

module.exports = router;
