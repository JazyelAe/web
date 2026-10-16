// Registra el Service Worker (necesario para que Chrome ofrezca "Instalar aplicación").
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("./service-worker.js")
      .then(reg => console.log("Service Worker registrado. Alcance:", reg.scope))
      .catch(err => console.error("No se pudo registrar el Service Worker:", err));
  });
}
