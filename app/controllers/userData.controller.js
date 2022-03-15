const db = require("../models");
const UserData = db.userData;
const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");

// Get all userdata => /api/v1/userData
exports.getUserData = catchAsyncErrors(async (req, res, next) => {
  try {
    let userDatas = await UserData.findAll({
      attributes: { exclude: ["username", "password"] },
    });
    res.json(userDatas);
  } catch (error) {
    res.json(error);
  }
});

exports.updateLineToken = catchAsyncErrors(async (req, res, next) => {
  let user = await UserData.findByPk(req.params.id);

  if (!user) {
    return res.json({ status: 404, message: "User not found" });
  }
  if (!req.body.line_token) {
    return res.json({ status: 404, message: "Line token not define" });
  }
  //update token
  const updateToken = await UserData.update(
    { line_token: req.body.line_token },
    { where: { id: req.params.id } }
  );
  return res.status(200).json({ success: true, updateToken });
});

exports.updateNotify = catchAsyncErrors(async (req, res, next) => {
  let user = await UserData.findByPk(req.params.id);

  if (!user) {
    return res.json({ status: 404, message: "User not found" });
  }
  if (!req.body.notify_setting) {
    return res.json({ status: 404, message: "Line notify setting not define" });
  }
  //update notify setting
  const updateNotify = await UserData.update(
    { notify_setting: parseFloat(req.body.notify_setting) },
    { where: { id: req.params.id } }
  );
  return res.status(200).json({ success: true, updateNotify });
});
