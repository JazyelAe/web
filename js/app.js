import * as db from "./db.js";
import { buscarEnLinea } from "./api.js";

const $ = s => document.querySelector(s);
const esc = t => String(t ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const EJEMPLOS = [
  { nombre: "Tacos de papa", emoji: "🌮", categoria: "Antojitos", minutos: 25, dificultad: "Fácil", ingredientes: "papa, tortilla, queso, salsa" },
  { nombre: "Sopa de lentejas", emoji: "🥣", categoria: "Sopas", minutos: 40, dificultad: "Fácil", ingredientes: "lentejas, zanahoria, jitomate, ajo" },
  { nombre: "Guacamole clásico", emoji: "🥑", categoria: "Antojitos", minutos: 10, dificultad: "Muy fácil", ingredientes: "aguacate, cebolla, limón, cilantro" },
  { nombre: "Pollo al horno", emoji: "🍗", categoria: "Platos fuertes", minutos: 60, dificultad: "Media", ingredientes: "pollo, ajo, limón, especias" },
  { nombre: "Arroz rojo", emoji: "🍚", categoria: "Guarniciones", minutos: 30, dificultad: "Fácil", ingredientes: "arroz, jitomate, ajo, caldo" },
  { nombre: "Ensalada fresca", emoji: "🥗", categoria: "Ligeros", minutos: 15, dificultad: "Muy fácil", ingredientes: "lechuga, pepino, jitomate, limón" }
];

let recetas = [], cat = "Todas", texto = "";
let resultadosApi = [];

function categorias() { return ["Todas", ...new Set(recetas.map(r => r.categoria))]; }

function pintarFiltros() {
  $("#filters").innerHTML = categorias().map(c =>
    `<button class="chip ${c === cat ? "on" : ""}" data-c="${esc(c)}">${esc(c)}</button>`).join("");
  document.querySelectorAll(".chip").forEach(b => b.onclick = () => { cat = b.dataset.c; render(); });
}

function tarjeta(r, extra) {
  const meta = [r.minutos ? `<span>⏱ ${esc(r.minutos)} min</span>` : "", r.dificultad ? `<span>${esc(r.dificultad)}</span>` : ""].join("");
  return `<article class="card">
    ${r.imagen ? `<img class="foto" src="${esc(r.imagen)}/preview" alt="${esc(r.nombre)}" loading="lazy">` : `<div class="em">${esc(r.emoji || "🍽️")}</div>`}
    <h3>${esc(r.nombre)}</h3><p>${esc(r.ingredientes)}</p>
    <div class="meta">${meta}</div>${extra || ""}
  </article>`;
}

function render() {
  if (!categorias().includes(cat)) cat = "Todas";
  const lista = recetas.filter(r =>
    (cat === "Todas" || r.categoria === cat) &&
    (r.nombre + " " + r.ingredientes).toLowerCase().includes(texto.toLowerCase()));
  $("#grid").innerHTML = lista.map(r => tarjeta(r, `<button class="mini del" data-id="${esc(r.id)}">Borrar</button>`)).join("") ||
    "<p>No hay recetas todavía. Agrega una, guarda una desde la búsqueda en línea o carga los ejemplos.</p>";
  $("#count").textContent = lista.length + " receta(s) encontrada(s)";
  $("#seed").hidden = recetas.length > 0;
  pintarFiltros();
  document.querySelectorAll(".del").forEach(b => b.onclick = async () => {
    if (confirm("¿Borrar esta receta?")) {
      try { await db.borrarReceta(b.dataset.id); } catch (e) { avisar("No se pudo borrar: " + e.message, true); }
    }
  });
}

function avisar(msg, error = false) {
  const el = $("#aviso"); el.textContent = msg; el.className = "aviso " + (error ? "err" : "ok"); el.hidden = false;
  clearTimeout(avisar.t); avisar.t = setTimeout(() => el.hidden = true, 4000);
}

$("#q").addEventListener("input", e => { texto = e.target.value; render(); });

$("#seed").onclick = async () => {
  try { for (const r of EJEMPLOS) await db.agregarReceta({ ...r, origen: "ejemplo" }); avisar("Recetas de ejemplo cargadas."); }
  catch (e) { avisar("No se pudieron cargar: " + e.message, true); }
};

$("#formReceta").addEventListener("submit", async e => {
  e.preventDefault();
  const r = {
    nombre: $("#rNombre").value.trim(), emoji: "🍽️", categoria: $("#rCat").value.trim() || "Otras",
    minutos: Number($("#rMin").value) || null, dificultad: $("#rDif").value,
    ingredientes: $("#rIng").value.trim(), origen: "manual"
  };
  try { await db.agregarReceta(r); e.target.reset(); avisar("Receta guardada."); }
  catch (err) { avisar("No se pudo guardar: " + err.message, true); }
});

$("#formApi").addEventListener("submit", async e => {
  e.preventDefault();
  const q = $("#qApi").value.trim(); if (!q) return;
  $("#estadoApi").textContent = "Buscando en TheMealDB…"; $("#gridApi").innerHTML = "";
  try {
    resultadosApi = await buscarEnLinea(q);
    $("#estadoApi").textContent = resultadosApi.length ? resultadosApi.length + " resultado(s)." : "Sin resultados. Prueba con un nombre en inglés (chicken, pasta, beef…).";
    $("#gridApi").innerHTML = resultadosApi.map((r, i) => tarjeta(r, `<button class="mini add" data-i="${i}">Guardar en mi recetario</button>`)).join("");
    document.querySelectorAll(".add").forEach(b => b.onclick = async () => {
      try { await db.agregarReceta(resultadosApi[b.dataset.i]); b.textContent = "✓ Guardada"; b.disabled = true; }
      catch (err) { avisar("No se pudo guardar: " + err.message, true); }
    });
  } catch (err) {
    $("#estadoApi").textContent = "No se pudo consultar el servicio (revisa tu conexión). " + err.message;
  }
});

$("#form").addEventListener("submit", async e => {
  e.preventDefault();
  try {
    await db.agregarSugerencia({ nombre: $("#nombre").value.trim(), correo: $("#correo").value.trim(), mensaje: $("#msg").value.trim() });
    const ok = $("#ok"); ok.hidden = false; ok.textContent = "¡Gracias, " + $("#nombre").value + "! Tu sugerencia fue registrada.";
    e.target.reset();
  } catch (err) { avisar("No se pudo enviar: " + err.message, true); }
});

const modo = await db.iniciar();
$("#modo").textContent = modo === "firebase" ? "● Conectado a Firebase" : "● Modo local (Firebase sin configurar)";
$("#modo").className = "modo " + modo;
db.suscribirRecetas(l => { recetas = l; render(); }, err => avisar("Error de base de datos: " + err.message, true));
