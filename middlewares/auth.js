
const db = require("../app/models");
const User = db.userData;

const jwt = require("jsonwebtoken");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");

// Check if user is authenticated or not
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const bearerHeader = req.header("authorization") || req.header("Authorization") ;
  // const { token } = req.cookies;
  if (!bearerHeader) {
    return next(new ErrorHandler("Login first to access this resource.", 401));
  }
  const bearer = bearerHeader.split(" ");
  const token = bearer[1];
  const decoded = jwt.verify(token, "zsdvgbsdafgwesry542w34t324ggDCwserv34");
  req.user = await User.findOne({
    where: {
      id:decoded.id
    }
  });
  next();
});

// Handling user roles
exports.authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.roles)) {
      return next(
        new ErrorHandler(
          `Role (${req.user.roles}) is not allowed to access this resource.`,
          403
        )
      );
    }
    next();
  };
};
