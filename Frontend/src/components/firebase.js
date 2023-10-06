import { initializeApp } from "firebase/app";
import {
  signOut,
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";

import {
  getFirestore,
  doc,
  collection,
  addDoc,
  setDoc,
  getDocs,
  query,
  updateDoc,
  getDoc,
  deleteDoc,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA23GOEaCPGAC55vLJXw-97NdzsHsydk8M",
  authDomain: "luminable-c65a4.firebaseapp.com",
  databaseURL: "https://luminable-c65a4-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "luminable-c65a4",
  storageBucket: "luminable-c65a4.appspot.com",
  messagingSenderId: "797096710601",
  appId: "1:797096710601:web:1abb5cb2bbb4053a76d818",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const user = auth.currentUser;

const db = getFirestore(app);

export async function login(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    console.log("Logged in as:", email);
    return { success: true, error: null };
  } catch (error) {
    console.error("Failed to log in:", error.code, error.message);
    return { success: false, error: error.message };
  }
}

export function signup(email, password) {
  createUserWithEmailAndPassword(auth, email, password)
    .then(async (userCredential) => {
      const user = userCredential.user;
      console.log("Signed up as:", user.email);
      // Call createUserDocument with user as a parameter
      await createUserDocument(user);
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorCode, errorMessage);
    });
}

export function isLoggedIn() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      if (user) {
        resolve({ isLoggedIn: true, email: user.email });
      } else {
        resolve({ isLoggedIn: false });
      }
    });
  });
}

export const logout = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    return false;
  }
};

export async function createUserDocument(user) {
  try {
    if (!user) throw new Error("No user is authenticated.");
    const userRef = doc(db, "users", user.uid);
    const userData = {
      email: user.email,
      username: user.email, // username is set as email here, modify as needed
      name: user.displayName, // user.displayName may be null if not set during account creation
    };

    await setDoc(userRef, userData);
    console.log("User document created:", userRef);
  } catch (error) {
    console.error("Error creating user document:", error);
  }
}

export async function createLight(lightData) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is authenticated.");
    if (!lightData) throw new Error("No light data provided.");

    const lightsRef = collection(db, "users", user.uid, "lights");
    const newLightRef = await addDoc(lightsRef, {
      name: lightData.name,
      status: lightData.status,
      type: lightData.type,
      location: lightData.location,
    });

    console.log("New light created at:", newLightRef.id);
    return newLightRef.id;
  } catch (error) {
    console.error("Error creating light document:", error);
    return null;
  }
}

export async function getLights() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      unsubscribe(); // Unsubscribe from the onAuthStateChanged listener once the user is obtained

      if (user) {
        try {
          const lightsRef = collection(db, "users", user.uid, "lights");
          const lightsSnapshot = await getDocs(query(lightsRef));

          if (lightsSnapshot.empty) {
            console.log("No lights found.");
            resolve([]);
            return;
          }

          const lights = [];
          lightsSnapshot.forEach((doc) => {
            lights.push({ id: doc.id, ...doc.data() });
          });

          console.log("Lights retrieved:", lights);
          resolve(lights);
        } catch (error) {
          console.error("Error retrieving lights:", error);
          reject(error);
        }
      } else {
        console.error("No user is authenticated.");
        reject(new Error("No user is authenticated."));
      }
    });
  });
}

export async function updateLight(id, updates) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is authenticated.");
    if (!id) throw new Error("No ID provided.");
    if (!updates || Object.keys(updates).length === 0) throw new Error("No updates provided.");

    const lightRef = doc(db, "users", user.uid, "lights", id);
    await updateDoc(lightRef, updates);

    console.log(`Light with ID ${id} updated successfully.`);
  } catch (error) {
    console.error("Error updating light document:", error);
  }
}

function generateRandomApiKey() {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const apiKeyLength = 32; // Customize the key length as needed
  let apiKey = "";

  for (let i = 0; i < apiKeyLength; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    apiKey += characters.charAt(randomIndex);
  }

  return apiKey;
}

export async function generateNewAPIKey() {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is authenticated.");

    const apiKey = generateRandomApiKey();
    const userRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      await setDoc(userRef, { api: apiKey }, { merge: true });
    } else {
      await setDoc(userRef, { api: apiKey });
    }

    console.log("API key generated and stored successfully:", apiKey);
    return apiKey;
  } catch (error) {
    console.error("Error generating and storing API key:", error);
    throw error;
  }
}

export async function getAPIKey() {
  return new Promise(async (resolve, reject) => {
    try {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (!user) {
          unsubscribe();
          resolve(null);
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          if (userData && userData.api) {
            unsubscribe();
            resolve(userData.api);
          } else {
            unsubscribe();
            resolve(null);
          }
        } else {
          unsubscribe();
          resolve(null);
        }
      });
    } catch (error) {
      console.error("Error retrieving API key:", error);
      reject(error);
    }
  });
}

export async function deleteLight(lightId) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("No user is authenticated.");
    if (!lightId) throw new Error("No light ID provided.");

    const docPath = `users/${user.uid}/lights/${lightId}`;
    await deleteDoc(doc(db, docPath));

    console.log(`Light with ID ${lightId} deleted successfully.`);
    return true;
  } catch (error) {
    console.error("Error deleting light document:", error);
    return false;
  }
}
