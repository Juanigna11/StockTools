// =====================================================
// catalogo.js — StockTools
// Datos de los productos + la "plantilla" de la card + la grilla.
// Lo usan productos.html (catálogo completo) e index.html (destacados).
//
// 💡 Pensalo como el futuro componente <ProductCard /> de React:
//    recibe un producto y devuelve cómo se ve.
//
// Necesita que carrito.js esté cargado antes (usa formatearPrecio
// y agregarAlCarrito).
// =====================================================

// ===== Catálogo =====
// precioAnterior: si existe, se muestra tachado con el % de descuento
// cuotas:         cuotas sin interés (0 = no ofrece)
// etiqueta:       cartelito opcional sobre la imagen
// stock:          unidades disponibles (si quedan pocas, se avisa)
// destacado:      true = aparece en el inicio
const productos = [
  { id: 1,  nombre: "Taladro percutor 700w",                 marca: "Bosch",        precio:  85000, precioAnterior:  95000, cuotas: 6,  stock: 24, categoria: "Taladros",      imagen: "assets/taladro bosch.png", etiqueta: "Más vendido", destacado: true },
  { id: 2,  nombre: 'Amoladora angular 9" 2000w',            marca: "Bosch",        precio:  72000, precioAnterior:  84000, cuotas: 6,  stock: 15, categoria: "Amoladoras",    imagen: "assets/7863051-1-amoladora-angular-bosch-9-pulgadas-gws-20-230-2000w-02f5c21ff429ed893715955344651538-640-0.jpg", destacado: true },
  { id: 3,  nombre: "Llave de impacto inalámbrica 380Nm con valija", marca: "Barovo", precio:  91000,                          cuotas: 12, stock: 4,  categoria: "Llaves",        imagen: "assets/60765545_tmpmcrssycc.jpg.1600x0_q85_crop-smart.jpg", etiqueta: "Nuevo", destacado: true },
  { id: 4,  nombre: "Carro de herramientas 198 piezas",      marca: "Barovo",       precio:  64000, precioAnterior:  72000, cuotas: 12, stock: 9,  categoria: "Sets",          imagen: "assets/dgpi-167p-11-49a292b5a152198ecf16845835143387-480-0.webp" },
  { id: 5,  nombre: "Set de puntas y mechas X-Line 33 piezas", marca: "Bosch",      precio:  18000,                          cuotas: 3,  stock: 60, categoria: "Accesorios",    imagen: "assets/taladro-bosch-3.png" },
  { id: 6,  nombre: "Sierra circular 1400w",                 marca: "Makita",       precio:  97000,                          cuotas: 12, stock: 7,  categoria: "Sierras",       imagen: "assets/taladro bosch.png" },
  { id: 7,  nombre: "Nivel láser autonivelante",             marca: "Bosch",        precio:  43000,                          cuotas: 6,  stock: 12, categoria: "Medición",      imagen: "assets/taladro bosch.png" },
  { id: 8,  nombre: "Lijadora orbital 300w",                 marca: "Black+Decker", precio:  38000, precioAnterior:  42000, cuotas: 3,  stock: 18, categoria: "Lijadoras",     imagen: "assets/taladro bosch.png" },
  { id: 9,  nombre: "Cutter profesional 18mm",               marca: "Total",        precio:   9500,                          cuotas: 0,  stock: 80, categoria: "Accesorios",    imagen: "assets/taladro bosch.png" },
  { id: 10, nombre: "Compresor 50L 2HP",                     marca: "Ronix",        precio: 130000, precioAnterior: 149000, cuotas: 12, stock: 3,  categoria: "Compresores",   imagen: "assets/taladro bosch.png" },
  { id: 11, nombre: "Martillo demoledor 1500w",              marca: "DeWalt",       precio: 115000,                          cuotas: 12, stock: 5,  categoria: "Demolición",    imagen: "assets/taladro bosch.png" },
  { id: 12, nombre: "Cinta métrica 8m",                      marca: "Stanley",      precio:   7200,                          cuotas: 0,  stock: 95, categoria: "Medición",      imagen: "assets/taladro bosch.png" },
  { id: 13, nombre: "Taladro atornillador inalámbrico con valija", marca: "Total",  precio:  79000, precioAnterior:  89000, cuotas: 6,  stock: 11, categoria: "Taladros",      imagen: "assets/images (6).jpeg", destacado: true },
  { id: 14, nombre: "Maletín de herramientas 120 piezas",    marca: "Total",        precio:  56000,                          cuotas: 6,  stock: 14, categoria: "Sets",          imagen: "assets/images (5).jpeg" },
  { id: 15, nombre: "Juego de llaves combinadas 8 piezas",   marca: "Total",        precio:  21000,                          cuotas: 3,  stock: 40, categoria: "Llaves",        imagen: "assets/images (7).jpeg" },
  { id: 16, nombre: "Amoladora inalámbrica M18 Fuel",        marca: "Milwaukee",    precio: 189000,                          cuotas: 12, stock: 2,  categoria: "Amoladoras",    imagen: "assets/images (4).jpeg", etiqueta: "Profesional" },
  { id: 17, nombre: "Organizador Packout con ruedas",        marca: "Milwaukee",    precio: 145000,                          cuotas: 12, stock: 6,  categoria: "Organizadores", imagen: "assets/images (2).jpeg" },
]

// ===== Reglas de negocio (cambialas acá y se actualiza todo el sitio) =====
const ENVIO_GRATIS_DESDE = 50000   // compras desde este precio llegan gratis
const POCAS_UNIDADES = 5           // desde cuántas unidades mostramos "¡Últimas!"
const IVA = 0.21

// ===== Cálculos =====
// Precio sin impuestos nacionales: en Argentina las tiendas lo muestran
// por la normativa de transparencia fiscal. Acá simplificamos usando solo el IVA.
const precioSinImpuestos = (precio) => Math.round(precio / (1 + IVA))

const porcentajeDescuento = (producto) =>
  Math.round((1 - producto.precio / producto.precioAnterior) * 100)

// ===== Plantilla de la card =====
// Cada bloque opcional se arma con un ternario: si no hay dato, queda "".
function crearCard(producto, { esFavorito = false, cantidad = 1 } = {}) {
  const tieneDescuento = Boolean(producto.precioAnterior)
  const envioGratis = producto.precio >= ENVIO_GRATIS_DESDE
  const quedanPocas = producto.stock <= POCAS_UNIDADES

  return `
    <article class="card" data-id="${producto.id}">

      <div class="card-media">
        ${producto.cuotas > 0 ? `
          <span class="badge-cuotas">
            <small>Hasta</small>
            <strong>${producto.cuotas}</strong>
            <small>cuotas<br>sin interés</small>
          </span>` : ""}

        <button class="btn-favorito ${esFavorito ? "activo" : ""}" data-accion="favorito"
          aria-label="${esFavorito ? "Quitar de favoritos" : "Agregar a favoritos"}">
          ${esFavorito ? "♥" : "♡"}
        </button>

        <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">

        ${producto.etiqueta ? `<span class="badge-etiqueta">${producto.etiqueta}</span>` : ""}
      </div>

      <div class="card-info">
        <span class="categoria">${producto.categoria}</span>
        <p class="nombre">${producto.nombre}</p>
        <p class="marca">Marca <strong>${producto.marca}</strong></p>

        <div class="precio-anterior">
          ${tieneDescuento ? `
            <s>${formatearPrecio(producto.precioAnterior)}</s>
            <span class="off">${porcentajeDescuento(producto)}% OFF</span>` : ""}
        </div>
        <p class="precio">${formatearPrecio(producto.precio)}</p>
        <p class="precio-sin-imp">Precio s/imp. nac. ${formatearPrecio(precioSinImpuestos(producto.precio))}</p>

        <div class="card-chips">
          <span class="chip">¡Retiralo hoy!</span>
          ${envioGratis
            ? `<span class="chip chip-fuerte">Envío GRATIS</span>`
            : `<span class="chip">Envío en 48hs</span>`}
          ${quedanPocas ? `<span class="chip chip-alerta">¡Últimas ${producto.stock}!</span>` : ""}
        </div>
      </div>

      <div class="card-acciones">
        <div class="selector-cantidad">
          <button data-accion="restar" aria-label="Restar cantidad">−</button>
          <span class="cantidad">${cantidad}</span>
          <button data-accion="sumar" aria-label="Sumar cantidad">+</button>
        </div>
        <button class="btn-carrito" data-accion="agregar">Agregar al carrito</button>
      </div>

    </article>
  `
}

// ===== Grilla reutilizable =====
// Recibe el contenedor donde dibujar y devuelve una función render(lista).
// El estado (favoritos y cantidades) queda "encerrado" adentro de esta
// función: eso se llama CLOSURE. Así cada grilla tiene su propio estado
// y no necesitamos variables globales.
function crearGrillaProductos(contenedor) {
  const estado = {
    favoritos: new Set(),   // IDs marcados como favorito
    cantidades: {},         // { id: cantidad elegida en la card }
  }
  let listaActual = []

  const getCantidad = (id) => estado.cantidades[id] || 1

  function render(lista = listaActual) {
    listaActual = lista
    if (lista.length === 0) {
      contenedor.innerHTML = `<p class="sin-resultados">No se encontraron productos.</p>`
      return
    }
    contenedor.innerHTML = lista
      .map(p => crearCard(p, { esFavorito: estado.favoritos.has(p.id), cantidad: getCantidad(p.id) }))
      .join("")
  }

  // Delegación de eventos: un solo listener para todas las cards
  contenedor.addEventListener("click", (evento) => {
    const boton = evento.target.closest("[data-accion]")
    if (!boton) return

    const id = Number(boton.closest(".card").dataset.id)
    const accion = boton.dataset.accion
    const producto = productos.find(p => p.id === id)

    if (accion === "favorito") {
      estado.favoritos.has(id) ? estado.favoritos.delete(id) : estado.favoritos.add(id)
    }
    if (accion === "sumar") {
      // no dejamos pedir más de lo que hay en stock
      estado.cantidades[id] = Math.min(producto.stock, getCantidad(id) + 1)
    }
    if (accion === "restar") {
      estado.cantidades[id] = Math.max(1, getCantidad(id) - 1)
    }
    if (accion === "agregar") {
      agregarAlCarrito(producto, getCantidad(id))   // función de carrito.js
      delete estado.cantidades[id]                   // la card vuelve a 1
    }

    render()   // re-dibuja la misma lista que se estaba mostrando
  })

  return render
}
