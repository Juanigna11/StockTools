// =====================================================
// inicio.js — página de inicio
// Usa los datos y la card de catalogo.js para armar:
//   1. La oferta de la semana (portada)
//   2. Las categorías con su cantidad de productos
//   3. La grilla de destacados
// =====================================================

// ===== 1. Oferta de la semana =====
// Elegimos el producto con mayor % de descuento.
// sort() ordena de mayor a menor descuento y nos quedamos con el primero.
const conDescuento = productos.filter(p => p.precioAnterior)
const oferta = [...conDescuento].sort((a, b) => porcentajeDescuento(b) - porcentajeDescuento(a))[0]

if (oferta) {
  document.getElementById("ofertaSemana").innerHTML = `
    <span class="oferta-etiqueta">Oferta de la semana</span>
    <img src="${oferta.imagen}" alt="${oferta.nombre}">
    <p class="oferta-nombre">${oferta.nombre}</p>
    <div class="oferta-precios">
      <s>${formatearPrecio(oferta.precioAnterior)}</s>
      <span class="off">${porcentajeDescuento(oferta)}% OFF</span>
    </div>
    <p class="oferta-precio">${formatearPrecio(oferta.precio)}</p>
    <button class="btn btn-accent" id="agregarOferta">Agregar al carrito</button>
  `
  document.getElementById("agregarOferta").addEventListener("click", () => agregarAlCarrito(oferta, 1))
}

// ===== 2. Categorías =====
// Una imagen representativa por categoría.
const imagenesCategorias = {
  Taladros:      "assets/taladro bosch.png",
  Amoladoras:    "assets/images (4).jpeg",
  Llaves:        "assets/images (7).jpeg",
  Sets:          "assets/images (5).jpeg",
  Accesorios:    "assets/taladro-bosch-3.png",
  Organizadores: "assets/images (2).jpeg",
}

// Contamos cuántos productos hay en cada categoría (así el número
// se actualiza solo cuando sumás productos al catálogo).
const contarPorCategoria = (categoria) => productos.filter(p => p.categoria === categoria).length

document.getElementById("categorias").innerHTML = Object.entries(imagenesCategorias)
  .map(([categoria, imagen]) => {
    const cantidad = contarPorCategoria(categoria)
    return `
      <a class="ini-categoria" href="productos.html?q=${encodeURIComponent(categoria)}">
        <img src="${imagen}" alt="" loading="lazy">
        <strong>${categoria}</strong>
        <span>${cantidad} ${cantidad === 1 ? "producto" : "productos"}</span>
      </a>`
  })
  .join("")

// ===== 3. Destacados =====
// Misma grilla y misma card que en Productos: solo cambia la lista.
const renderDestacados = crearGrillaProductos(document.getElementById("destacados"))
renderDestacados(productos.filter(p => p.destacado))
