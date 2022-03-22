const aedes = require("aedes")();
const server = require("net").createServer(aedes.handle);
const httpServer = require("http").createServer();
const ws = require("websocket-stream");

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



module.exports = {server,httpServer,ws};