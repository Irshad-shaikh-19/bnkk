const fs = require('fs');
const multipart = require('connect-multiparty');
/**
 * Function to upload a file and return its filename.
 * @param {Object} file - The file object.
 * @param {string} subPath - The subdirectory path where the file will be stored.
 * @returns {string} The filename of the uploaded file.
 */
module.exports.uploadFile = (file, subPath) => {
  var filename = file.path.split('/').pop(); // Extracting filename from file path
  var picture = filename.replace(`src/uploads\\${subPath}\\`, ''); // Extracting picture name
  return picture;
};

/**
 * Function to delete a file.
 * @param {string} file - The filename to be deleted.
 * @param {string} subPath - The subdirectory path where the file is stored.
 * @returns {boolean} Returns true if file deletion is successful, otherwise false.
 */
module.exports.deleteFile = (file, subPath) => {
  fs.unlink(`./src/uploads/${subPath}/${file}`, (err) => {
    // Deleting the file
    if (err) {
      console.error(err);
    }
  });
  return true;
};

/**
 * Function to create multipart middleware with specified upload directory and max file size.
 * @param {string} uploadDir - The directory where uploaded files will be stored.
 * @param {number} maxFileSize - The maximum size limit for uploaded files.
 * @returns {function} The configured multipart middleware.
 */
module.exports.createMultipartMiddleware = (
  uploadDir,
  maxFileSize = 50 * 1024 * 1024
) => {
  return multipart({
    uploadDir: `${__dirname}/../../../uploads/${uploadDir}`, // Constructing absolute path to upload directory
    maxFilesSize: maxFileSize,
  });
};
