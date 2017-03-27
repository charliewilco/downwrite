import firebase from 'firebase'

firebase.initializeApp({
  apiKey: 'AIzaSyBWZzi6eoNBSWW1UOg1e40Pop-4mnYwpAE',
  authDomain: 'redownwrite.firebaseapp.com',
  databaseURL: 'https://redownwrite.firebaseio.com'
})

export const ref = firebase.database().ref()
export const firebaseAuth = firebase.auth
