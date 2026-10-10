// ============================================================
//  PEGA AQUÍ LA CONFIGURACIÓN DE TU PROYECTO DE FIREBASE
//  (Firebase Console > Configuración del proyecto > Tus apps > Web)
//  Mientras digan "TU_..." la app funciona en MODO LOCAL
//  (guarda en el navegador) para que puedas probarla.
// ============================================================
export const firebaseConfig = {
  apiKey: "AIzaSyDiuklmKy5hiSmI_7Q6xbTAqdkLehitfCs",
  authDomain: "mi-recetario-61665.firebaseapp.com",
  projectId: "mi-recetario-61665",
  storageBucket: "mi-recetario-61665.firebasestorage.app",
  messagingSenderId: "457899579124",
  appId: "1:457899579124:web:9a3f821d4de8d5cb39f0a1"
};

export const configurado = !firebaseConfig.apiKey.startsWith("TU_");
