
const Subscription = require('../models/subscription.model');
const User = require("../models/user-profile.model")


// Create new subscription
exports.createSubscription = async (data) => {
  return await Subscription.create(data);
};

// Get all subscriptions
exports.getAllSubscriptions = async () => {
  return await Subscription.find()
    .populate('userId')
    .populate('planId');
};

// Get subscription by ID
exports.getSubscriptionById = async (id) => {
  return await Subscription.findById(id)
    .populate('userId')
    .populate('planId');
};

// Update subscription
exports.updateSubscription = async (id, data) => {
  const sub = await Subscription.findById(id);
  if (!sub) throw new Error('Subscription not found');
  Object.assign(sub, data, { updatedAt: new Date() });
  return await sub.save();
};

// Delete subscription
exports.deleteSubscription = async (id) => {
  const sub = await Subscription.findById(id);
  if (!sub) throw new Error('Subscription not found');
  return await Subscription.findByIdAndDelete(id);
};




exports.getARPUPerUser = async (queryParams = {}) => {
  try {
    const { search = '', sortBy = 'totalRevenue:desc', page = 1, limit = 10 } = queryParams;

    // Extract sort field and direction
    const [sortField, sortDirection] = sortBy.split(':');

    // First, find matching users if search term exists
    let userFilter = {};
    if (search) {
      const users = await User.find({
        $or: [
          { firstName: { $regex: search, $options: 'i' } },
          { lastName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ]
      });
      userFilter = { userId: { $in: users.map(u => u._id) } };
    }

    // Get all active subscriptions with filtering
    const subscriptions = await Subscription.find({ 
      ...userFilter 
    })
    .populate('userId')
    .populate('planId');

    // Calculate revenue per user
    const userRevenue = {};

    subscriptions.forEach(sub => {
      if (!sub.userId || !sub.planId || !sub.planId.price) return;

      const userId = sub.userId._id.toString();

      if (!userRevenue[userId]) {
        userRevenue[userId] = {
          user: sub.userId,
          total: 0,
          count: 0
        };
      }

      userRevenue[userId].total += sub.planId.price;
      userRevenue[userId].count++;
    });

    // Convert to array and calculate ARPU
    let results = Object.values(userRevenue).map(item => ({
      user: item.user,
      totalRevenue: item.total,
      subscriptionCount: item.count,
      arpu: item.total / item.count
    }));

    // Sorting
    results.sort((a, b) => {
      const aValue = sortField.includes('.') 
        ? sortField.split('.').reduce((o, i) => o[i], a)
        : a[sortField];
      const bValue = sortField.includes('.') 
        ? sortField.split('.').reduce((o, i) => o[i], b)
        : b[sortField];

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      }
      return aValue > bValue ? -1 : 1;
    });

    // Pagination
    const totalCount = results.length;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    results = results.slice(startIndex, endIndex);

    return {
      data: results,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      }
    };

  } catch (error) {
    console.error('ARPU calculation error:', error);
    throw error;
  }
};

