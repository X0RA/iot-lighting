const mqtt = require("mqtt");

const serverURL = "mqtt://52.55.136.20";

const user = {
  light: "xBJ2K6OcgUvJ4nIUs2eg",
  apikey: "afKAj6JL7QyScfLMmVksO4jtnEvDzxVu",
};

const options = {
  username: "null",
  password: user.apikey,
  clientId: "mqttjs_" + Math.random().toString(16).substr(2, 8),
};

const client = mqtt.connect(serverURL, options);

client.on("connect", () => {
  console.log("Connected to the MQTT server");

  client.subscribe(user.light, (err) => {
    if (err) {
      console.error("Failed to subscribe to topic", user.light, err);
    } else {
      console.log("Successfully subscribed to topic", user.light);
    }
  });
});

client.on("message", (topic, message) => {
  console.log("Received message on", topic, ":", message.toString());
});

client.on("error", (error) => {
  console.error("Error:", error);
});
