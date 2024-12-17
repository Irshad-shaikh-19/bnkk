const express = require('express');
const auth = require('../../middlewares/auth');
const { institutionsController } = require('../../controllers');


const router = express.Router();

router.route('/:institutionId').get(auth(), institutionsController.getInstitutionsByPlaidIdController);
router.route('/').get(auth(), institutionsController.getAllInstitutionsController);


module.exports = router;
