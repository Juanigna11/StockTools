// =====================================================
// productos.js — página de productos
// Los datos, la card y la grilla vienen de catalogo.js.
// Acá solo resolvemos lo propio de esta página: el buscador.
// =====================================================

const inputBusqueda = document.getElementById("busqueda")
const contador = document.getElementById("contadorResultados")
const renderGrilla = crearGrillaProductos(document.getElementById("grilla"))

// Pasa todo a minúsculas y le saca los acentos,
// así "medicion" encuentra "Medición".
const normalizar = (texto) =>
  texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")

function filtrar() {
  const texto = normalizar(inputBusqueda.value.trim())
  const filtrados = productos.filter(p =>
    normalizar(p.nombre).includes(texto) ||
    normalizar(p.categoria).includes(texto) ||
    normalizar(p.marca).includes(texto)
  )
  contador.textContent = `${filtrados.length} ${filtrados.length === 1 ? "producto" : "productos"}`
  renderGrilla(filtrados)
}

inputBusqueda.addEventListener("input", filtrar)

// ===== Arranque =====
// Si venimos del inicio (productos.html?q=taladro), cargamos ese texto en el buscador.
const busquedaInicial = new URLSearchParams(window.location.search).get("q")
if (busquedaInicial) inputBusqueda.value = busquedaInicial
filtrar()
