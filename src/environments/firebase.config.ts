// src/environments/firebase.config.ts
// export const firebaseConfig = {
//   apiKey: "AIzaSy...",
//   authDomain: "bigluxx.firebaseapp.com",
//   projectId: "bigluxx",
//   storageBucket: "bigluxx.appspot.com",
//   messagingSenderId: "123456789",
//   appId: "1:123456789:web:abc123",
// };

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyDsRfhkyEHzHawjE2-DT4MuNnFIew_J3Og",
  authDomain: "big-lux.firebaseapp.com",
  projectId: "big-lux",
  storageBucket: "big-lux.firebasestorage.app",
  messagingSenderId: "494853091341",
  appId: "1:494853091341:web:6abe15334c065d5f0f2544"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);