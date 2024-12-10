const router = require('express').Router();
const auth = require('../../middlewares/auth');
const { supportController } = require('../../controllers');
const multipart = require('connect-multiparty');
const multipartMiddlewareSheet1 = multipart({
  uploadDir: `${__dirname}/../../uploads/support`,
  maxFilesSize: 50 * 1024 * 1024, // To Set the maximum file size limit (50mb)
});
router.post(
  '/upload-file',
  multipartMiddlewareSheet1,
  supportController.importSheet
);
router.get('/get-list', auth(), supportController.getAllSupport);

router.post(
  '/add/:userId',
  multipartMiddlewareSheet1,
  auth(),
  supportController.addSupport
);

router.post(
  '/update/:id/:userId',
  auth(),
  supportController.updateSupportStatus
);

router.post('/add-cateogry/:userId', auth(), supportController.addCategory);

router.get('/get-category-list', auth(), supportController.getCategory);

module.exports = router;
