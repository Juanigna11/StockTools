// =====================================================
// carrito.js — StockTools
// Se carga en TODAS las páginas. Maneja:
//   1. Guardar / leer el carrito en localStorage
//   2. El contador del header
//   3. El panel lateral del carrito (<dialog>)
//   4. Enviar el pedido por WhatsApp
//
// productos.js usa la función agregarAlCarrito() de este archivo,
// por eso carrito.js tiene que cargarse ANTES que productos.js.
// =====================================================

// ===== Configuración =====
const CLAVE_CARRITO = "stocktools-carrito"   // nombre con el que se guarda en localStorage
const TELEFONO_WHATSAPP = "+5493517704752"    // ⚠️ reemplazar por el número real (sin + ni espacios)

// ===== Utilidades =====
const formatearPrecio = (n) =>
  n.toLocaleString("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 })

// =====================================================
// 1. DATOS: leer y guardar en localStorage
// localStorage solo guarda TEXTO, por eso usamos:
//   JSON.stringify(array) → texto  (para guardar)
//   JSON.parse(texto)     → array  (para leer)
// =====================================================
function leerCarrito() {
  try {
    const guardado = localStorage.getItem(CLAVE_CARRITO)
    return guardado ? JSON.parse(guardado) : []
  } catch (error) {
    console.warn("No se pudo leer el carrito:", error)
    return []
  }
}

function guardarCarrito(carrito) {
  try {
    localStorage.setItem(CLAVE_CARRITO, JSON.stringify(carrito))
  } catch (error) {
    console.warn("No se pudo guardar el carrito:", error)
  }
  actualizarCarritoUI()
}

// ===== Operaciones del carrito =====
// Cada ítem guarda una "foto" del producto: { id, nombre, precio, imagen, cantidad }
// Así el panel puede mostrarlo en cualquier página, aunque ahí no exista el catálogo.

function agregarAlCarrito(producto, cantidad = 1) {
  const carrito = leerCarrito()
  const existente = carrito.find(item => item.id === producto.id)

  if (existente) {
    existente.cantidad += cantidad          // ya estaba: sumamos
  } else {
    carrito.push({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen: producto.imagen,
      cantidad,
    })
  }

  guardarCarrito(carrito)
  mostrarAviso(`${cantidad} × ${producto.nombre} agregado al carrito`)
}

function cambiarCantidadCarrito(id, diferencia) {
  const carrito = leerCarrito()
  const item = carrito.find(i => i.id === id)
  if (!item) return

  item.cantidad += diferencia
  if (item.cantidad < 1) {
    quitarDelCarrito(id)                    // si llega a 0, lo sacamos
    return
  }
  guardarCarrito(carrito)
}

function quitarDelCarrito(id) {
  const carrito = leerCarrito().filter(item => item.id !== id)
  guardarCarrito(carrito)
}

function vaciarCarrito() {
  guardarCarrito([])
}

// reduce() recorre el array acumulando un valor
const contarUnidades = (carrito) => carrito.reduce((total, item) => total + item.cantidad, 0)
const calcularTotal  = (carrito) => carrito.reduce((total, item) => total + item.precio * item.cantidad, 0)

// =====================================================
// 2. INTERFAZ: panel lateral + contador del header
// =====================================================

// El panel se crea desde JS para no repetir el mismo HTML en las 4 páginas.
// Usamos <dialog>: el navegador ya trae el fondo oscuro, cerrar con Esc
// y mantener el foco adentro mientras está abierto.
const panel = document.createElement("dialog")
panel.className = "carrito-panel"
panel.setAttribute("aria-labelledby", "carritoTitulo")
panel.innerHTML = `
  <div class="carrito-cabecera">
    <h2 id="carritoTitulo">Tu carrito</h2>
    <button class="carrito-cerrar" data-carrito="cerrar" aria-label="Cerrar carrito">✕</button>
  </div>
  <div class="carrito-lista" id="carritoLista"></div>
  <div class="carrito-pie" id="carritoPie">
    <div class="carrito-total">
      <span>Total</span>
      <strong id="carritoTotal"></strong>
    </div>
    <a class="carrito-whatsapp" id="carritoWhatsapp" target="_blank" rel="noopener">
      Enviar pedido por WhatsApp
    </a>
    <button class="carrito-vaciar" data-carrito="vaciar">Vaciar carrito</button>
  </div>
`
document.body.append(panel)

// Aviso flotante ("toast") que reemplaza al alert()
const aviso = document.createElement("div")
aviso.className = "carrito-aviso"
aviso.setAttribute("role", "status")         // los lectores de pantalla lo anuncian
document.body.append(aviso)

let temporizadorAviso
function mostrarAviso(texto) {
  aviso.textContent = `✓ ${texto}`
  aviso.classList.add("visible")
  clearTimeout(temporizadorAviso)
  temporizadorAviso = setTimeout(() => aviso.classList.remove("visible"), 2500)
}

function crearItemCarrito(item) {
  return `
    <article class="carrito-item" data-id="${item.id}">
      <img src="${item.imagen}" alt="">
      <div class="carrito-item-info">
        <p class="carrito-item-nombre">${item.nombre}</p>
        <p class="carrito-item-precio">${formatearPrecio(item.precio * item.cantidad)}</p>
        <div class="carrito-item-cantidad">
          <button data-carrito="restar" aria-label="Restar uno">−</button>
          <span>${item.cantidad}</span>
          <button data-carrito="sumar" aria-label="Sumar uno">+</button>
        </div>
      </div>
      <button class="carrito-item-quitar" data-carrito="quitar" aria-label="Quitar ${item.nombre}">Quitar</button>
    </article>
  `
}

// Arma el texto del pedido y lo convierte en un link de WhatsApp.
// encodeURIComponent() transforma espacios, saltos de línea y símbolos
// en un formato válido para una URL.
function crearLinkWhatsapp(carrito) {
  const lineas = carrito.map(i => `• ${i.cantidad} × ${i.nombre} — ${formatearPrecio(i.precio * i.cantidad)}`)
  const mensaje = [
    "Hola StockTools! Quiero hacer este pedido:",
    "",
    ...lineas,
    "",
    `Total: ${formatearPrecio(calcularTotal(carrito))}`,
  ].join("\n")
  return `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`
}

// Una sola función que redibuja todo lo que depende del carrito.
// Se llama cada vez que el carrito cambia (desde guardarCarrito).
function actualizarCarritoUI() {
  const carrito = leerCarrito()

  // Contador del header (puede no existir si una página no tiene el botón)
  const contador = document.getElementById("contadorCarrito")
  if (contador) {
    const unidades = contarUnidades(carrito)
    contador.textContent = unidades
    contador.hidden = unidades === 0
  }

  const lista = document.getElementById("carritoLista")
  const pie = document.getElementById("carritoPie")

  if (carrito.length === 0) {
    lista.innerHTML = `
      <div class="carrito-vacio">
        <p>Tu carrito está vacío.</p>
        <a href="./productos.html" class="btn btn-accent">Ver productos</a>
      </div>`
    pie.hidden = true
    return
  }

  lista.innerHTML = carrito.map(crearItemCarrito).join("")
  document.getElementById("carritoTotal").textContent = formatearPrecio(calcularTotal(carrito))
  document.getElementById("carritoWhatsapp").href = crearLinkWhatsapp(carrito)
  pie.hidden = false
}

// =====================================================
// 3. EVENTOS
// =====================================================

// Abrir desde el botón del header
document.getElementById("abrirCarrito")?.addEventListener("click", () => panel.showModal())

// Un solo listener para todos los botones del panel (delegación de eventos)
panel.addEventListener("click", (evento) => {
  // Clic en el fondo oscuro (fuera del contenido) → cerrar
  if (evento.target === panel) {
    panel.close()
    return
  }

  const boton = evento.target.closest("[data-carrito]")
  if (!boton) return

  const accion = boton.dataset.carrito
  const item = boton.closest(".carrito-item")
  const id = item ? Number(item.dataset.id) : null

  if (accion === "cerrar") panel.close()
  if (accion === "sumar")  cambiarCantidadCarrito(id, +1)
  if (accion === "restar") cambiarCantidadCarrito(id, -1)
  if (accion === "quitar") quitarDelCarrito(id)
  if (accion === "vaciar") vaciarCarrito()
})

// Si el carrito cambia en OTRA pestaña del sitio, el navegador dispara
// el evento "storage" en esta. Así las dos pestañas quedan sincronizadas.
window.addEventListener("storage", (evento) => {
  if (evento.key === CLAVE_CARRITO) actualizarCarritoUI()
})

// ===== Arranque =====
actualizarCarritoUI()
