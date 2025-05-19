const express = require('express');
const router = express.Router();
const controller = require('../../controllers/discountCode.controller');

router.post('/d-code', controller.create);
router.get('/d-code', controller.getAll);
router.get('/d-code/:id', controller.getById);
router.put('/d-code/:id', controller.update);
router.delete('/d-code/:id', controller.remove);

module.exports = router;
