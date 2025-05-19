const express = require('express');
const router = express.Router();
const planController = require('../../controllers/plan.controller');

router.post('/add-plan', planController.createPlan);
router.get('/all-plans', planController.getAllPlans);
router.get('/one-plan/:id', planController.getPlanById);
router.put('/update-plan/:id', planController.updatePlan);
router.delete('/delete-plan/:id', planController.deletePlan);

module.exports = router;
