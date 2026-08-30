import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyD4z8ltE0u5hkJ2A9yVyZ8PnPQdpx1etAU",
  authDomain: "wedding-khamim-nisa.firebaseapp.com",
  projectId: "wedding-khamim-nisa",
  storageBucket: "wedding-khamim-nisa.firebasestorage.app",
  messagingSenderId: "396231984836",
  appId: "1:396231984836:web:1efb49ace5510e4270ab91"
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)