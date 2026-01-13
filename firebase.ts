import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, createUserWithEmailAndPassword, signOut } from "firebase/auth"; 

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Inicializar Firebase (Evita errores de doble inicialización)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app); 

// --- NUEVA FUNCIÓN PARA CREAR USUARIOS SECUNDARIOS ---
export const registerUser = async (email: string, pass: string) => {
  // 1. Crear una instancia secundaria temporal
  const secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
  const secondaryAuth = getAuth(secondaryApp);

  try {
    // 2. Crear el usuario en esa instancia
    const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, pass);
    // 3. Cerrar sesión inmediatamente para no interferir con el admin
    await signOut(secondaryAuth);
    return userCredential.user.uid; // Retorna el UID real
  } catch (error) {
    throw error;
  }
  // La instancia secundaria se limpia sola eventualmente
};

export { db, auth };
