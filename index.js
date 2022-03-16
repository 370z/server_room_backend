//REST API
const express = require("express");
const cors = require("cors");
const app = express();
const db = require("./app/models");
const Op = db.Sequelize.Op;
const User = db.userData;
const SensorData = db.sensorData;
var line_token = "none";
var notify_setting = null;

//mqtt client
var mqtt = require("mqtt");

db.sequelize.sync();
// db.sequelize.sync({ force: true }).then(async () => {
//   const user = {
//     username: `admin`,
//     password: "admin",
//   };
//   try {
//     await User.create(user);
//   } catch (error) {
//     console.log(error);
//   }
// });
const getLineToken = async () => {
  try {
    const user = await User.findOne({
      where: {
        username: "admin",
      },
    });

    if (user) {
      this.line_token = user.line_token;
      this.notify_setting = parseFloat(user.notify_setting);
    }
  } catch (error) {
    console.log(error);
  }
};

// LINE notify
const lineNotify = require("line-notify-nodejs")(line_token);

var corsOptions = {
  origin: ["http://localhost:3000", "http://itdev.cmtc.ac.th:2004"],
};
app.use(cors(corsOptions));
// parse requests of content-type - application/json
app.use(express.json());
// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

const aedes = require("aedes")();
const server = require("net").createServer(aedes.handle);
const httpServer = require("http").createServer();
const ws = require("websocket-stream");
const port = 1883;
const wsPort = 8888;

server.listen(port, function () {
  console.log(`MQTT Broker running on port: ${port}`);
});
ws.createServer(
  {
    server: httpServer,
  },
  aedes.handle
);
httpServer.listen(wsPort, function () {
  console.log("websocket server listening on port ", wsPort);
});
// authenticate the connecting client
aedes.authenticate = (client, username, password, callback) => {
  const error = new Error("Authentication Failed!! Invalid user credentials.");
  if (!password || password == undefined) {
    return callback(error, false);
  }
  password = Buffer.from(password, "base64").toString();
  if (username === "admin" && password === "admin") {
    return callback(null, true);
  }

  console.log("Error ! Authentication failed.");
  return callback(error, false);
};

// authorizing client to publish on a message topic
aedes.authorizePublish = (client, packet, callback) => {
  if (
    packet.topic === "outTopic" ||
    packet.topic === "inTopic" ||
    packet.topic === "temp" ||
    packet.topic === "humi" ||
    packet.topic === "commit" ||
    packet.topic === "hourtemp" ||
    packet.topic === "hourhumi" ||
    packet.topic === "hourcommit"
  ) {
    return callback(null);
  }
  console.log("Error ! Unauthorized publish to a topic.");
  return callback(
    new Error("You are not authorized to publish on this message topic.")
  );
};

// emitted when a client connects to the broker
aedes.on("client", function (client) {
  console.log(
    `[CLIENT_CONNECTED] Client ${
      client ? client.id : client
    } connected to broker ${aedes.id}`
  );
});

// emitted when a client disconnects from the broker
aedes.on("clientDisconnect", function (client) {
  console.log(
    `[CLIENT_DISCONNECTED] Client ${
      client ? client.id : client
    } disconnected from the broker ${aedes.id}`
  );
});

// emitted when a client subscribes to a message topic
aedes.on("subscribe", function (subscriptions, client) {
  console.log(
    `[TOPIC_SUBSCRIBED] Client ${
      client ? client.id : client
    } subscribed to topics: ${subscriptions
      .map((s) => s.topic)
      .join(",")} on broker ${aedes.id}`
  );
});

// emitted when a client unsubscribes from a message topic
aedes.on("unsubscribe", function (subscriptions, client) {
  console.log(
    `[TOPIC_UNSUBSCRIBED] Client ${
      client ? client.id : client
    } unsubscribed to topics: ${subscriptions.join(",")} from broker ${
      aedes.id
    }`
  );
});

// emitted when a client publishes a message packet on the topic
aedes.on("publish", async function (packet, client, message) {
  if (client) {
    console.log(
      `[MESSAGE_PUBLISHED] Client ${
        client ? client.id : "BROKER_" + aedes.id
      } has published message on ${packet.payload} to broker ${aedes.id}`
    );
  }
});

aedes.on("message", async function (topic, message) {
  console.log(`[MESSAGE_RECEIVED] Message received on topic ${topic}`);
});

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
var client = mqtt.connect("mqtt://localhost:1883", options);

//Define the array of data from the sensors
let realtimeSensor = [];
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
  client.subscribe("commit");
  console.log("Connected to MQTT Server");
});

client.on("message", async function (topic, message, packet) {
  await getLineToken();
  if (notify_setting != null) {
    if (realtimeSensor.temp > notify_setting) {
      await lineNotify
        .notify({
          message: `ตอนนี้อุณหภูมิห้อง Server สูงกว่า ${notify_setting} องศา`,
        })
        .then(() => {
          console.log("send completed!");
        });
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
    if (topic == "temp") {
      realtimeSensor = new Object();
      realtimeSensor.temp = 0;
      eval("realtimeSensor." + topic + "=" + message);
      realtimeSensor.push(realtimeSensor);
    }
  }
});
// const auth = require("./app/routes/auth.routes");
const sensorData = require("./app/routes/sensorData.routes");
const userData = require("./app/routes/userData.routes");

// app.use("/api/v1", auth);
app.use("/api/v1", sensorData);
app.use("/api/v1", userData);

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Nothing here :(" });
});

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
