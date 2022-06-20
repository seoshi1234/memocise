import firebase from "firebase/compat/app";
import "firebase/compat/auth";
import "firebase/compat/firestore";
import "firebase/compat/storage";
import firebaseConfig from './firebaseConfig';

firebase.initializeApp(firebaseConfig);

export const arrayUnion = firebase.firestore.FieldValue.arrayUnion;
export const arrayRemove = firebase.firestore.FieldValue.arrayRemove;
export const Timestamp = firebase.firestore.Timestamp;
export const auth = firebase.auth();
export const db = firebase.firestore();
export const storage = firebase.storage();