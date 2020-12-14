import firebase from "firebase/app";
import "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
  adminMail: process.env.ADMIN_MAIL || "",
  adminPw: process.env.ADMIN_PW || "",
};

// Initialize Firebase
export const connect = () => {
  firebase.initializeApp(firebaseConfig);
  firebase
    .auth()
    .signInWithEmailAndPassword(
      firebaseConfig.adminMail,
      firebaseConfig.adminPw
    )
    .catch(function (error) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error(errorCode, errorMessage);
    });
  firebase.auth().onAuthStateChanged(function (user) {
    if (user) {
      const isAnonymous = user.isAnonymous;
      const uid = user.uid;
      console.log("User signed in", uid, isAnonymous);
    } else {
      console.log("User signed out");
    }
  });
};
