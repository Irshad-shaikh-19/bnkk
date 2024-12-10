const nodemailer = require('nodemailer');
const config = require('../config/config');
const logger = require('../config/logger');

const transport = nodemailer.createTransport(config.email.smtp);
/* istanbul ignore next */
if (config.env !== 'test') {
  transport
    .verify()
    .then(() => logger.info('Connected to email server'))
    .catch(() =>
      logger.warn(
        'Unable to connect to email server. Make sure you have configured the SMTP options in .env'
      )
    );
}

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @returns {Promise}
 */
const sendEmail = async (to, subject, text) => {
  const msg = { from: config.email.from, to, subject, text };
  await transport.sendMail(msg);
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `${config.site_url}/reset-password?token=${token}`;
  const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `http://link-to-app/verify-email?token=${token}`;
  const text = `Dear user,
To verify your email, click on this link: ${verificationEmailUrl}
If you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Send OTP verification email
 * @param {string} to
 * @param {string} otpCode
 * @returns {Promise}
 */
const sendOtpVerificationEmail = async (to, firstName, lastName, otpCode) => {
  const subject = 'One-Time Password (OTP) Verification';
  const text = `Dear ${firstName} ${lastName},
  
Your OTP (One-Time Password) for verification is: ${otpCode}

If you didn't request this code, you can safely ignore this email. Someone else might have typed your email address by mistake.`;
  await sendEmail(to, subject, text);
};

const sendLoginEmail = async (firstName, lastName) => {
  const to = 'prince@ctasis.com';
  const additionalContent = `${firstName} ${lastName}, logged in our application.`;
  const subject = 'Logged In';
  const text = `Dear Admin,\n\n${additionalContent}`; // Concatenate additional content
  // const text = `Dear ${firstName} ${lastName},\n\n${additionalContent}`; // Concatenate additional content
  await sendEmail(to, subject, text);
};

const sendUpdatePasswordEmail = async (firstName, lastName) => {
  const to = 'prince@ctasis.com';
  const additionalContent = `${firstName} ${lastName}, changed their password.`;
  const subject = 'Password Changed';
  const text = `Dear Admin,\n\n${additionalContent}`;
  await sendEmail(to, subject, text);
}

const sendUpdateProfileEmail = async (firstName, lastName) => {
  const to = 'prince@ctasis.com';
  const additionalContent = `${firstName} ${lastName}, updated their profile.`;
  const subject = 'Profile Updated';
  const text = `Dear Admin,\n\n${additionalContent}`;
  await sendEmail(to, subject, text);
}


module.exports = {
  transport,
  sendEmail,
  sendResetPasswordEmail,
  sendVerificationEmail,
  sendOtpVerificationEmail,
  sendLoginEmail,
  sendUpdatePasswordEmail,
  sendUpdateProfileEmail
};
