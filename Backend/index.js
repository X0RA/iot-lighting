const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
const aedes = require("aedes")();
const server = require("net").createServer(aedes.handle);
const port = 1883;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

let users = [];

// MQTT Authentication
aedes.authenticate = async (client, username, password, callback) => {
  // we are only using the password which is the API token
  const apiKeyProvided = password && password.toString();
  const user = users.find((u) => u.data.api === apiKeyProvided);

  if (user) {
    authenticateUser(client, user, callback);
  } else {
    callback(new Error("Unauthorized: Invalid API token"), false);
  }
};

// Start the MQTT server
server.listen(port, () => {
  console.log(`MQTT server started and listening on port ${port}`);
});

// MQTT logic to handle user auth
const authenticateUser = (client, user, callback) => {
  // they are only allowed to subscribe to their lights, at this stage they have already given the correct api token
  const allowedTopics = user.lights.map((light) => `${light.id}`);

  // check the topic with the allowed topics
  for (const topic of Object.keys(client.subscriptions)) {
    if (!allowedTopics.some((allowedTopic) => topic.startsWith(allowedTopic))) {
      callback(new Error("Unauthorized: You are not allowed to subscribe to this topic."), false);
      return;
    }
  }

  callback(null, true);
};

// MQTT logic to handle publishing updates to lights
const publishLightUpdate = (light) => {
  const topic = `${light.id}`;
  const message = JSON.stringify(light.data);
  aedes.publish({ topic, payload: message, qos: 0, retain: false });
  console.log(`Published update to topic ${topic}`);
};

// Firestore logic to handle changes to users and lights
function onNewUser(doc) {
  const user = {
    id: doc.id,
    data: doc.data(),
    lights: [],
  };

  users.push(user);
  console.log("New user added:", user);

  listenForLightChanges(user);
}

// Firestore logic to handle new lights
function onNewLight(user, doc) {
  const light = {
    id: doc.id,
    data: doc.data(),
  };

  user.lights.push(light);
  publishLightUpdate(light);
  //   console.log("New light added for user", user.id, ":", light);
}

// Firestore logic to handle updates to lights and mqtt publish updates
function onUpdateLight(user, doc) {
  const light = user.lights.find((light) => light.id === doc.id);
  publishLightUpdate(light);
  if (light) {
    light.data = doc.data();
    console.log("Light updated for user", user.id, ":", light);
  }
}

// Firestore logic to handle removal of lights
function onRemoveLight(user, doc) {
  user.lights = user.lights.filter((light) => light.id !== doc.id);
  //   console.log("Light removed for user", user.id, ":", doc.id);
}

// Firestore logic to handle changes to lights via event listeners
function listenForLightChanges(user) {
  db.collection("users")
    .doc(user.id)
    .collection("lights")
    .onSnapshot((snapshot) => {
      snapshot.docChanges().forEach((change) => {
        switch (change.type) {
          case "added":
            onNewLight(user, change.doc);
            break;
          case "modified":
            onUpdateLight(user, change.doc);
            break;
          case "removed":
            onRemoveLight(user, change.doc);
            break;
        }
      });
    });
}

// Firestore logic to handle changes to users via event listeners
function listenForUserChanges() {
  db.collection("users").onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        onNewUser(change.doc);
      }
    });
  });
}

function main() {
  listenForUserChanges();
}

main();
