const db = require("../models");
const UserData = db.userData;
const catchAsyncErrors = require("../../middlewares/catchAsyncErrors");
const axios = require("axios");
const qs = require("querystring");
const BASE_URL = "https://notify-api.line.me";
const PATH = "/api/notify";

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
  try {
    const sendLine = await axios.post(
      `${BASE_URL}${PATH}`,
      qs.stringify({
        message: `เชื่อมต่อกับ Server Room Line Notify สำเร็จ`,
      }),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${req.body.line_token}`,
        },
      }
    );
    if (sendLine.status == 200) {
      return res.status(200).json({ success: true, updateToken });
    }
  } catch (error) {
    return res.status(401).json({ success: false, message:error.message });
    console.log(error)
  }
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

exports.getNotifySettingForGuest = catchAsyncErrors(async (req, res, next) => {
  try {
    let notifySetting = await UserData.findAll({
      attributes: ["notify_setting"],
    });
    res.json(notifySetting[0]);
  } catch (error) {
    res.json(error);
  }
});
