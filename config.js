import firebase from "firebase/app";
import 'firebase/auth';
import 'firebase/firestore';

var firebaseConfig = {

    apiKey: "AIzaSyBD1JxBFV0ABu4R4XRXDQOFy0aEgeBmCMI",
  
    authDomain: "biblioteca-7805c.firebaseapp.com",
  
    projectId: "biblioteca-7805c",
  
    storageBucket: "biblioteca-7805c.appspot.com",
  
    messagingSenderId: "639760130535",
  
    appId: "1:639760130535:web:5a117b145dcba58dc0dd42"
  
  };
  
  firebase.initializeApp(firebaseConfig);

   export default firebase.firestore(); 