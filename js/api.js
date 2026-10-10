// Servicio externo: TheMealDB (API pública y gratuita de recetas, sin registro).
// Documentación: https://www.themealdb.com/api.php
const URL_API = "https://www.themealdb.com/api/json/v1/1/search.php?s=";

export async function buscarEnLinea(texto) {
  const resp = await fetch(URL_API + encodeURIComponent(texto));
  if (!resp.ok) throw new Error("El servicio respondió con error " + resp.status);
  const datos = await resp.json();
  return (datos.meals || []).map(m => {
    const ing = [];
    for (let i = 1; i <= 20; i++) {
      const x = (m["strIngredient" + i] || "").trim();
      if (x) ing.push(x.toLowerCase());
    }
    return {
      nombre: m.strMeal,
      emoji: "🍽️",
      categoria: m.strCategory || "En línea",
      minutos: null,
      dificultad: m.strArea ? "Cocina " + m.strArea : "",
      ingredientes: ing.slice(0, 8).join(", "),
      imagen: m.strMealThumb || "",
      origen: "themealdb"
    };
  });
}
