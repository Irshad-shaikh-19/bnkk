const router = require('express').Router();
const auth = require('../../middlewares/auth');
const { roleController } = require('../../controllers');

router.post('/add/:userId', auth(), roleController.addRole);
router.get('/get-list', auth(), roleController.getRoleList);
router.get('/role-list', auth(), roleController.getRole);
router.get('/get-by-id/:id', roleController.getRoleById);
router.put('/update-by-id/:id/:userId', auth(), roleController.updateRole);
router.put(
  '/update-status/:id/:userId',
  auth(),
  roleController.updateRoleStatus
);

module.exports = router;
