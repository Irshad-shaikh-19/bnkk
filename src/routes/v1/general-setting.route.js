const router = require('express').Router();
const auth = require('../../middlewares/auth');
const { generalSettingController } = require('../../controllers');

router.put(
  '/update-general-setting/:id/:userId',
  auth(),
  generalSettingController.updateGeneralSetting
);

router.get('/find-one', auth(), generalSettingController.getGeneralSetting);

module.exports = router;
