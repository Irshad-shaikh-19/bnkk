const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const {
  authService,
  userService,
  tokenService,
  emailService,
} = require('../services');
const { getDeviceInfo } = require('./userAndIp');
const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);
  const tokens = await tokenService.generateAuthTokens(user);
  res.status(httpStatus.CREATED).send({ user, tokens });
});

const login = catchAsync(async (req, res) => {
  console.log('first')
  const info = getDeviceInfo(req.socket.remoteAddress, req.headers['user-agent'])
  const { email, password } = req.body;
  const { status, message, user, otpCode } =
    await authService.loginUserWithEmailAndPassword(email, password, info);
  if (user && status === 200) {
    const tokens = await tokenService.generateAuthTokens(user);
    // Extract user's first name and last name
    const { firstName, lastName } = user;
    await emailService.sendOtpVerificationEmail(
      email,
      firstName,
      lastName,
      otpCode
    );
    return res.status(status).send({ user, tokens, status, otpCode });
  } else {
    return res.status(status).send({ status, message });
  }
});

const logout = catchAsync(async (req, res) => {
  await authService.logout(req.body.refreshToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const changePassword = catchAsync(async (req, res) => {
  const { status, message } = await authService.changePassword(
    req.params.userId,
    req.body.password,
    req.body.oldPassword
  );
  return res.status(status).send({ status, message });
});

const refreshTokens = catchAsync(async (req, res) => {
  const { message, status, tokens, user } = await authService.refreshAuth(
    req.body.refreshToken
  );
  if (tokens && status === 200) {
    return res.status(status).send({ tokens, status, user });
  } else {
    return res.status(status).send({ status, message });
  }
});

const forgotPassword = catchAsync(async (req, res) => {
  const resetPasswordToken = await tokenService.generateResetPasswordToken(
    req.body.email
  );
  await emailService.sendResetPasswordEmail(req.body.email, resetPasswordToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(req.query.token, req.body.password);
  res.status(httpStatus.NO_CONTENT).send();
});

const sendVerificationEmail = catchAsync(async (req, res) => {
  const verifyEmailToken = await tokenService.generateVerifyEmailToken(
    req.user
  );
  await emailService.sendVerificationEmail(req.user.email, verifyEmailToken);
  res.status(httpStatus.NO_CONTENT).send();
});

const verifyEmail = catchAsync(async (req, res) => {
  await authService.verifyEmail(req.query.token);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  register,
  login,
  logout,
  refreshTokens,
  forgotPassword,
  changePassword,
  resetPassword,
  sendVerificationEmail,
  verifyEmail,
};
