const db = require("../models");
const User = db.userData;
const ErrorHandler = require("../../utils/errorHandler");
const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const sendToken = require("../../utils/jwtToken");
// Register a user => /api/v1/register
// exports.registerUser = catchAsyncErrors(async (req, res, next) => {

//   const { username, email, password } = req.body;
//   const user = await User.create({
//     username,
//     email,
//     password,
//   });
//   sendToken(user, 200, res);
// });

// Login User => /api/v1/login
exports.loginUser = catchAsyncErrors(async (req, res, next) => {
  const { username, password } = req.body;
  //check email and password
  if (!username || !password) {
    return next(new ErrorHandler("Please enter email & password", 400));
  }
  // Fining user in database
  const user = await User.findOne({
    where: { username: username },
  })

  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }
  // check if password is correct or not
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Password", 401));
  }
  sendToken(user, 200, res);
});

exports.getUserProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findByPk(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});


exports.logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, { expires: new Date(Date.now()), httpOnly: true });
  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});