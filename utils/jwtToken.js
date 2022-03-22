// create token and send token and save in the cookie
const sendToken = (user, statusCode, res) => {
  //create jwt token
  const token = user.getJwtToken();
  // option for cookie
  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    id: user.id,
    user
  });
};

module.exports = sendToken;
