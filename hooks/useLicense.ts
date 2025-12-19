import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { licenseDb } from '../services/licenseService';

export const useLicense = () => {
  const [isLocked, setIsLocked] = useState(false);
  const [loading, setLoading] = useState(true);

  // ID específico de este gimnasio en tu panel
  const LICENSE_ID = import.meta.env.VITE_LICENSE_CLIENT_ID;

  useEffect(() => {
    if (!LICENSE_ID) {
      console.error("⚠️ ERROR: Falta VITE_LICENSE_CLIENT_ID en variables de entorno.");
      setLoading(false);
      return;
    }

    const clientRef = doc(licenseDb, "clients", LICENSE_ID);

    const unsubscribe = onSnapshot(clientRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        // Si isActive es false, bloqueamos
        setIsLocked(docSnapshot.data().isActive === false); 
      } else {
        // Si no existe la licencia, bloqueo de seguridad
        setIsLocked(true);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error verificando licencia:", error);
      // En caso de error de red, permitimos acceso (Fail Safe)
      setIsLocked(false); 
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { isLocked, loading };
};
