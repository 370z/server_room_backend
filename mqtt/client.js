const db = require("../app/models");
const User = db.userData;
const SensorData = db.sensorData;
const axios = require("axios");
const qs = require("querystring");
const BASE_URL = "https://notify-api.line.me";
const PATH = "/api/notify";
//mqtt client
var mqtt = require("mqtt");

// mqtt client
const options = {
  // Clean session
  clean: true,
  connectTimeout: 4000,
  // Auth
  clientId: "backend_server",
  username: "admin",
  password: "admin",
};
//Connect to the MQTT Server

var client = mqtt.connect("mqtt://itdev.cmtc.ac.th:2001", options);

//Define the array of data from the sensors
let deviceArray = [];
function writeToDatabase(data) {
  // Create a Tutorial
  const sensorData = {
    temp: data.hourtemp,
    humi: data.hourhumi,
  };

  // Save Tutorial in the database
  SensorData.create(sensorData)
    .then((data) => {
      console.log("Record added");
    })
    .catch((err) => {
      console.log(err);
    });
}

client.on("connect", function () {
  client.subscribe("temp");
  client.subscribe("humi");
  client.subscribe("hourtemp");
  client.subscribe("hourhumi");
  client.subscribe("hourcommit");
});

client.on("message", async function (topic, message, packet) {
  if (topic === "temp") {
    try {
      const user = await User.findByPk(1);
      if (user) {
        console.log(
          "message on query: ",
          message.toString(),
          user.notify_setting,
          message.toString() > user.notify_setting
        );
        if (message.toString() > user.notify_setting) {
          await axios
            .post(
              `${BASE_URL}${PATH}`,
              qs.stringify({
                message: `ตอนนี้อุณหภูมิห้อง Server สูงกว่า ${user.notify_setting} องศา`,
              }),
              {
                headers: {
                  "Content-Type": "application/x-www-form-urlencoded",
                  Authorization: `Bearer ${user.line_token}`,
                },
              }
            )
            .then(() => {
              console.log("send completed!");
            });
        }
      }
    } catch (error) {
      console.log(error);
    }
  }
  if (
    (topic && topic.match("hourtemp")) ||
    topic.match("hourhumi") ||
    topic.match("hourcommit")
  ) {
    device = deviceArray;
    // console.log(device);
    if (topic == "hourcommit") {
      if (
        deviceArray != [] &&
        device.hourtemp != undefined &&
        device.hourhumi != undefined
      ) {
        console.log(device);
        writeToDatabase(device);
      }
    } else {
      if (device == []) {
        console.log("Creating Object ");
        device = new Object();
        //Setup the object with the base data so it is easier to write the SQL.
        device.hourtemp = 0;
        device.hourhumi = 0;
        eval("device." + topic + "=" + message);
        deviceArray.push(device);
      } else {
        console.log("Adding value " + topic + "=" + message);
        eval("device." + topic + "=" + message);
      }
    }
  } else {
    console.log("message is " + message);
    console.log("topic is " + topic);
    // if (topic == "temp") {
    //   let realtimeObj = [];
    //   realtimeObj = new Object();
    //   realtimeObj.temp = 0;
    //   eval("realtimeObj." + topic + "=" + message);
    //   realtimeSensor.push(realtimeObj);
    // }
  }
});
module.export = client;
