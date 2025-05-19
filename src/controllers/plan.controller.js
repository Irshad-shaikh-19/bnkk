const planService = require('../services/plan.service');

// Create plan
exports.createPlan = async (req, res) => {
  try {
    const plan = await planService.createPlan(req.body);
    res.status(201).json(plan);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all plans
exports.getAllPlans = async (req, res) => {
  try {
    const plans = await planService.getAllPlans();
    res.json(plans);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get plan by ID
exports.getPlanById = async (req, res) => {
  try {
    const plan = await planService.getPlanById(req.params.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update plan
exports.updatePlan = async (req, res) => {
  try {
    const updated = await planService.updatePlan(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete plan
exports.deletePlan = async (req, res) => {
  try {
    const deleted = await planService.deletePlan(req.params.id);
    res.json({ message: 'Plan deleted successfully', deleted });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
