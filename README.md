# Mi Recetario (con base de datos y API)

Aplicación web de recetas — Universidad Tecnológica de Puebla (Aplicaciones Web Progresivas).
Autor: Jahir Jaziel Serrano Arana

## Arquitectura
- **Frontend:** HTML, CSS y JavaScript (módulos ES). Se publica con GitHub Pages.
- **Base de datos:** Firebase Firestore (colecciones `recetas` y `sugerencias`).
- **Servicio externo (API REST):** TheMealDB, API pública de recetas.

```
index.html
css/styles.css
js/app.js               lógica de la interfaz
js/db.js                acceso a Firestore (o localStorage si no hay Firebase)
js/api.js               consumo de la API TheMealDB
js/firebase-config.js   <-- aquí pegas tu configuración de Firebase
firestore.rules         reglas de seguridad para pegar en Firebase
```

## Paso a paso
1. Entra a https://console.firebase.google.com con tu cuenta de Google.
2. "Crear un proyecto" -> ponle nombre (ej. mi-recetario) -> puedes desactivar Google Analytics -> Crear.
3. Menú izquierdo: Compilación -> **Firestore Database** -> Crear base de datos -> modo **producción** -> elige la ubicación más cercana -> Habilitar.
4. Pestaña **Reglas** de Firestore: borra lo que haya, pega el contenido de `firestore.rules` y pulsa **Publicar**.
5. Rueda de engrane -> **Configuración del proyecto** -> bajo "Tus apps" pulsa el icono **</>** (Web) -> nombre de la app -> Registrar. Copia el bloque `firebaseConfig`.
6. Abre `js/firebase-config.js` y reemplaza los valores "TU_..." con los tuyos (no borres la palabra `export`).
7. Probar en tu PC: los módulos JS no funcionan abriendo el archivo con doble clic. En VS Code instala la extensión **Live Server**, clic derecho en index.html -> "Open with Live Server".
   Arriba debe decir "Conectado a Firebase". Agrega una receta y revisa que aparezca en Firestore (colección `recetas`).
8. Subir a GitHub:
   ```
   git add .
   git commit -m "Mi Recetario con Firebase y API"
   git push
   ```
9. En GitHub: Settings -> Pages -> Branch: main, carpeta / (root) -> Save. Quedará en https://TU_USUARIO.github.io/NOMBRE_DEL_REPO/

## Notas
- Si `firebase-config.js` sigue con "TU_...", la app funciona en MODO LOCAL (guarda en el navegador) para que puedas probarla sin Firebase.
- La apiKey de Firebase en una app web NO es secreta; la protección real son las reglas de `firestore.rules`.
- Las reglas permiten que cualquiera lea, cree y borre recetas (proyecto escolar sin inicio de sesión). No las uses así en producción.
- TheMealDB busca mejor con palabras en inglés (chicken, pasta, beef).
