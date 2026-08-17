import firebase from 'firebase'

const firebaseConfig = firebase.initializeApp({
    apiKey: "AIzaSyArXIk6XQuRZn7piAlPvfbsGA83IgmCBPQ",
    authDomain: "mind-booster-298706.firebaseapp.com",
    projectId: "mind-booster-298706",
    storageBucket: "mind-booster-298706.appspot.com",
    messagingSenderId: "109119166859",
    appId: "1:109119166859:web:ec852f674b51300b40778e",
    measurementId: "G-LGPMTYFX51"
  }
)

// Export the database for components to use.
export const storage = firebaseConfig.storage()
firebase.analytics()