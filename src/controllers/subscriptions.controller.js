const subscriptionService = require('../services/subscriptions.service');

// Create subscription
exports.createSubscription = async (req, res) => {
  try {
    const result = await subscriptionService.createSubscription(req.body);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get all subscriptions
exports.getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await subscriptionService.getAllSubscriptions();
    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get subscription by ID
exports.getSubscriptionById = async (req, res) => {
  try {
    const subscription = await subscriptionService.getSubscriptionById(req.params.id);
    if (!subscription) return res.status(404).json({ error: 'Subscription not found' });
    res.json(subscription);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Update subscription
exports.updateSubscription = async (req, res) => {
  try {
    const updated = await subscriptionService.updateSubscription(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete subscription
exports.deleteSubscription = async (req, res) => {
  try {
    const deleted = await subscriptionService.deleteSubscription(req.params.id);
    res.json({ message: 'Subscription deleted successfully', deleted });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



exports.getARPUPerUser = async (req, res) => {
  try {
    // Extract query parameters
    const { 
      search = '', 
      sortBy = 'totalRevenue:desc', 
      page = 1, 
      limit = 10 
    } = req.query;

    // Prepare parameters for service layer
    const params = {
      search,
      sortBy,
      page: parseInt(page, 10),
      limit: parseInt(limit, 10)
    };

    // Call service with parameters
    const result = await subscriptionService.getARPUPerUser(params);
    
    // Return standardized response
    res.json({
      success: true,
      data: result.data,
      pagination: result.pagination
    });
  } catch (err) {
    console.error('Error in getARPUPerUser:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch revenue data',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
};
