const Plan = require('../models/plan.model');

// Create a new plan
exports.createPlan = async (data) => {
  const existing = await Plan.findOne({ slug: data.slug });
  if (existing) throw new Error('Plan slug must be unique');
  return await Plan.create(data);
};

// Get all plans
exports.getAllPlans = async () => {
  return await Plan.find().sort({ createdAt: -1 });
};

// Get a single plan by ID
exports.getPlanById = async (id) => {
  return await Plan.findById(id);
};

// Update a plan by ID
exports.updatePlan = async (id, data) => {
  const plan = await Plan.findById(id);
  if (!plan) throw new Error('Plan not found');
  Object.assign(plan, data, { updatedAt: new Date() });
  return await plan.save();
};

// Delete a plan by ID
exports.deletePlan = async (id) => {
  const plan = await Plan.findById(id);
  if (!plan) throw new Error('Plan not found');
  return await Plan.findByIdAndDelete(id);
};
