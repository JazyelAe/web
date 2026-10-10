// Capa de datos: usa Firebase Firestore si está configurado; si no, guarda en localStorage.
import { firebaseConfig, configurado } from "./firebase-config.js";

const V = "10.12.2";
let fs = null;
let base = null;
export let modo = "local";

const escuchas = [];
const LS = "recetario.recetas";
const leerLocal = () => JSON.parse(localStorage.getItem(LS) || "[]");
const guardarLocal = l => { localStorage.setItem(LS, JSON.stringify(l)); escuchas.forEach(cb => cb(l)); };

export async function iniciar() {
  if (!configurado) return modo;
  try {
    const { initializeApp } = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-app.js`);
    fs = await import(`https://www.gstatic.com/firebasejs/${V}/firebase-firestore.js`);
    base = fs.getFirestore(initializeApp(firebaseConfig));
    modo = "firebase";
  } catch (e) {
    console.error("No se pudo cargar Firebase, se usa el modo local:", e);
  }
  return modo;
}

export function suscribirRecetas(cb, onError) {
  if (modo === "firebase") {
    const q = fs.query(fs.collection(base, "recetas"), fs.orderBy("creada", "desc"));
    return fs.onSnapshot(q,
      snap => cb(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => onError && onError(err));
  }
  escuchas.push(cb); cb(leerLocal());
}

export async function agregarReceta(r) {
  if (modo === "firebase") {
    return fs.addDoc(fs.collection(base, "recetas"), { ...r, creada: fs.serverTimestamp() });
  }
  guardarLocal([{ ...r, id: String(Date.now() + Math.random()) }, ...leerLocal()]);
}

export async function borrarReceta(id) {
  if (modo === "firebase") return fs.deleteDoc(fs.doc(base, "recetas", id));
  guardarLocal(leerLocal().filter(r => r.id !== id));
}

export async function agregarSugerencia(s) {
  if (modo === "firebase") {
    return fs.addDoc(fs.collection(base, "sugerencias"), { ...s, creada: fs.serverTimestamp() });
  }
  const l = JSON.parse(localStorage.getItem("recetario.sugerencias") || "[]");
  l.push({ ...s, creada: new Date().toISOString() });
  localStorage.setItem("recetario.sugerencias", JSON.stringify(l));
}
