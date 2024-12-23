const express = require('express');
const authRoute = require('./auth.route');
const userRoute = require('./user.route');
const userProfileRoute = require('./user-profile.route')
const roleRoute = require('./role.route');
const sectionsRoute = require('./sections.route');
const transactionRoute = require('./transaction.route');
const generalSettingRoute = require('./general-setting.route');
const systemLogRoute = require('./system-log.route');
const contactSupportRoute = require('./contact-support.route');
const supportRoute = require('./support.route');
const dashboardRoute = require('./dashboard.route');
const notificationRoute = require('./notification.route');
const faqRoute = require('./faq.route');
const userAccountsRoutes = require('./useraccount.route');
const institutionsRoutes = require('./institution.route');
const couponRoutes = require('./coupons.route');
const recommendationsRoutes = require('./recommendations.route')
const notificationTableRoute = require('./notification_table.route')
const fcmtokenRoute = require('./fcmtoken.route')
const router = express.Router();

const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/users',
    route: userRoute,
  },
  {
    path: '/userprofiles',
    route: userProfileRoute,
  },
  {
    path: '/useraccounts',
    route: userAccountsRoutes,
  },
  {
    path: '/role',
    route: roleRoute,
  },
  {
    path: '/sections',
    route: sectionsRoute,
  },
  {
    path: '/transaction',
    route: transactionRoute,
  },
  {
    path: '/general-setting',
    route: generalSettingRoute,
  },
  {
    path: '/system-log',
    route: systemLogRoute,
  },
  {
    path: '/contact-request',
    route: contactSupportRoute,
  },
  {
    path: '/support',
    route: supportRoute,
  },
  {
    path: '/dashboard',
    route: dashboardRoute,
  },
  {
    path: '/notification',
    route: notificationRoute,
  },
  {
    path: '/faq',
    route: faqRoute,
  },
  {
    path: '/institutions',
    route: institutionsRoutes,
  },
  {
    path: '/recommendations',
    route: recommendationsRoutes,
  },
  {
    path: '/coupons',
    route: couponRoutes,
  },
  {
    path: '/notifications-table',
    route: notificationTableRoute,
  },
  {
    path: '/fcmtoken',
    route: fcmtokenRoute,
  },

];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
