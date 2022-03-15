const express = require("express");
const router = express.Router();

const {
  getUserData,
  updateLineToken,
  updateNotify,
} = require("../controllers/userData.controller");
// const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");
router.route("/userData").get(getUserData);
router.route("/updateToken/:id").put(updateLineToken);
router.route("/updateNotify/:id").put(updateNotify);

module.exports = router;
