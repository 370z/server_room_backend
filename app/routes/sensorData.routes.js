const express = require("express");
const router = express.Router();

const {
  // newProduct,
  getSensorData,
} = require("../controllers/sensorData.controller");
// const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
router.route("/sensorData").get(getSensorData);



module.exports = router;
