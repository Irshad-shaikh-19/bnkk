const router = require('express').Router();
const auth = require('../../middlewares/auth');
const { systemLogController } = require('../../controllers');

router.get('/get-list',
    auth(),
    systemLogController.getAllSystemLog);
router.post('/add-log/:id', systemLogController.SignOutLog);
module.exports = router;
