const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

module.exports = (sequelize, Sequelize) => {
  const UserData = sequelize.define("userdata", {
    username: {
      type: Sequelize.STRING,
    },
    password: {
      type: Sequelize.STRING,
    },
    line_token: {
      type: Sequelize.STRING,
    },
    notify_setting: {
      type: Sequelize.FLOAT,
      defaultValue: "30.0",
    },
  });
  //Encrypting password before saving user
  UserData.beforeSave(async (user) => {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    user.password = hashedPassword;
  });

  UserData.prototype.getJwtToken = function () {
    return jwt.sign({ id: this.id }, "zsdvgbsdafgwesry542w34t324ggDCwserv34", {
      expiresIn: "7d",
    });
  };
  UserData.prototype.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
  return UserData;
};
