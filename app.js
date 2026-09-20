(function () {
  "use strict";

  const STORAGE_PRODUCTOS = "inventario.productos";
  const STORAGE_VENTAS = "inventario.ventas";

  let productos = cargar(STORAGE_PRODUCTOS, []);
  let ventas = cargar(STORAGE_VENTAS, []);
  let editandoId = null;

  const $ = (id) => document.getElementById(id);

  const formProducto = $("formProducto");
  const btnCancelar = $("btnCancelar");
  const tituloFormulario = $("tituloFormulario");

  const PALETA = ["#2563eb", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#6366f1", "#14b8a6", "#84cc16", "#f97316", "#3b82f6"];

  iniciar();

  function iniciar() {
    bindEventos();
    renderTodo();
  }

  function bindEventos() {
    formProducto.addEventListener("submit", guardarProducto);
    btnCancelar.addEventListener("click", cancelarEdicion);
    $("buscador").addEventListener("input", renderInventario);

    $("tablaVentas").addEventListener("click", onTablaVentasClick);
    $("tablaInventario").addEventListener("click", onTablaInventarioClick);

    $("buscadorVentas").addEventListener("input", renderVentas);
    $("btnNuevaVenta").addEventListener("click", abrirModalNuevaVenta);

    document.querySelectorAll(".tab").forEach((btn) =>
      btn.addEventListener("click", () => cambiarVista(btn.dataset.tab))
    );

    $("modalVenta").addEventListener("click", (e) => {
      if (e.target === $("modalVenta")) cerrarModalVenta();
    });
    $("btnCerrarVentana").addEventListener("click", cerrarModalVenta);
    $("formVenta").addEventListener("submit", confirmarVenta);
    $("ventaCantidad").addEventListener("input", actualizarTotalVenta);
    $("ventaSelector").addEventListener("change", () => {
      cargarDatosProductoSeleccionado();
      actualizarTotalVenta();
    });
    window.addEventListener("resize", redibujarGrafico);
  }

  function cambiarVista(nombre) {
    document.querySelectorAll(".tab").forEach((b) =>
      b.classList.toggle("active", b.dataset.tab === nombre)
    );
    document.querySelectorAll(".vista").forEach((v) =>
      v.classList.toggle("active", v.id === "vista" + nombre.charAt(0).toUpperCase() + nombre.slice(1))
    );
    if (nombre === "ventas") {
      dibujarGraficoDona();
      renderVentas();
    }
  }

  function redibujarGrafico() {
    const vistaVentas = $("vistaVentas");
    if (vistaVentas.classList.contains("active")) dibujarGraficoDona();
  }

  function cargar(clave, fallback) {
    try {
      const raw = localStorage.getItem(clave);
      return raw ? JSON.parse(raw) : fallback;
    } catch (e) {
      return fallback;
    }
  }

  function guardar(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
  }

  function guardarDatos() {
    guardar(STORAGE_PRODUCTOS, productos);
    guardar(STORAGE_VENTAS, ventas);
  }

  function uid() {
    return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }

  function formatMoneda(valor) {
    return Number(valor).toLocaleString("es", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }

  // ---------- CRUD de productos ----------

  function guardarProducto(e) {
    e.preventDefault();

    const nombre = $("nombre").value.trim();
    const cantidad = Number($("cantidad").value);
    const precio = Number($("precio").value);
    const stockMinimo = Number($("stockMinimo").value) || 5;

    if (!nombre || cantidad < 0 || precio < 0) {
      mostrarToast("Verifica los datos del producto.", "error");
      return;
    }

    if (existeNombre(nombre, editandoId)) {
      mostrarToast("Ya existe un producto con ese nombre.", "error");
      return;
    }

    if (editandoId) {
      const indice = productos.findIndex((p) => p.id === editandoId);
      if (indice !== -1) {
        productos[indice] = {
          ...productos[indice],
          nombre,
          cantidad: Math.floor(cantidad),
          precio,
          stockMinimo
        };
      }
      mostrarToast("Producto actualizado.");
    } else {
      productos.push({
        id: uid(),
        nombre,
        cantidad: Math.floor(cantidad),
        precio,
        stockMinimo
      });
      mostrarToast("Producto registrado.");
    }

    guardarDatos();
    formProducto.reset();
    $("stockMinimo").value = 5;
    editandoId = null;
    tituloFormulario.textContent = "Registrar Producto";
    btnCancelar.hidden = true;
    $("btnGuardar").textContent = "Guardar";
    renderTodo();
  }

  function existeNombre(nombre, excluirId) {
    return productos.some(
      (p) => p.nombre.toLowerCase() === nombre.toLowerCase() && p.id !== excluirId
    );
  }

  function editarProducto(id) {
    const p = productos.find((x) => x.id === id);
    if (!p) return;

    editandoId = id;
    $("productoId").value = id;
    $("nombre").value = p.nombre;
    $("cantidad").value = p.cantidad;
    $("precio").value = p.precio;
    $("stockMinimo").value = p.stockMinimo;
    tituloFormulario.textContent = "Editar Producto";
    btnCancelar.hidden = false;
    $("btnGuardar").textContent = "Actualizar";
    window.scrollTo({ top: 0, behavior: "smooth" });
    $("nombre").focus();
  }

  function cancelarEdicion() {
    editandoId = null;
    formProducto.reset();
    $("stockMinimo").value = 5;
    tituloFormulario.textContent = "Registrar Producto";
    btnCancelar.hidden = true;
    $("btnGuardar").textContent = "Guardar";
  }

  function eliminarProducto(id) {
    const p = productos.find((x) => x.id === id);
    if (!p) return;
    if (!confirm(`¿Eliminar el producto "${p.nombre}"?`)) return;

    productos = productos.filter((x) => x.id !== id);
    guardarDatos();
    mostrarToast("Producto eliminado.");
    renderTodo();
  }

  function onTablaInventarioClick(e) {
    const btn = e.target.closest("button[data-accion]");
    if (!btn) return;
    const id = btn.dataset.id;
    const accion = btn.dataset.accion;
    if (accion === "editar") editarProducto(id);
    if (accion === "eliminar") eliminarProducto(id);
  }

  // ---------- Ventas ----------

  function abrirModalNuevaVenta() {
    llenarSelectorProductos();
    $("ventaSelector").value = "";
    $("ventaPrecio").value = "";
    $("ventaStock").value = "";
    $("ventaCantidad").value = "";
    $("ventaTotal").value = "0.00";
    $("ventaCantidad").removeAttribute("max");
    $("modalVenta").hidden = false;
    $("ventaSelector").focus();
  }

  function llenarSelectorProductos() {
    const sel = $("ventaSelector");
    const actual = sel.value;
    sel.innerHTML =
      '<option value="">Selecciona un producto...</option>' +
      productos
        .map((p) => `<option value="${p.id}">${esc(p.nombre)} (${p.cantidad} disp.)</option>`)
        .join("");
    if (productos.some((p) => p.id === actual)) sel.value = actual;
  }

  function cargarDatosProductoSeleccionado() {
    const p = productos.find((x) => x.id === $("ventaSelector").value);
    if (!p) {
      $("ventaPrecio").value = "";
      $("ventaStock").value = "";
      $("ventaCantidad").removeAttribute("max");
      return;
    }
    $("ventaPrecio").value = formatMoneda(p.precio);
    $("ventaStock").value = p.cantidad;
    $("ventaCantidad").max = p.cantidad;
  }

  function cerrarModalVenta() {
    $("modalVenta").hidden = true;
  }

  function actualizarTotalVenta() {
    const p = productos.find((x) => x.id === $("ventaSelector").value);
    const cant = Number($("ventaCantidad").value) || 0;
    const precio = p ? p.precio : 0;
    $("ventaTotal").value = formatMoneda(cant * precio);
  }

  function confirmarVenta(e) {
    e.preventDefault();

    const id = $("ventaSelector").value;
    const p = productos.find((x) => x.id === id);
    if (!p) {
      mostrarToast("Selecciona un producto.", "error");
      return;
    }

    const cant = Math.floor(Number($("ventaCantidad").value));

    if (!Number.isFinite(cant) || cant <= 0) {
      mostrarToast("Indica una cantidad válida.", "error");
      return;
    }
    if (cant > p.cantidad) {
      mostrarToast(`Stock insuficiente. Disponible: ${p.cantidad}.`, "error");
      return;
    }

    const total = cant * p.precio;

    p.cantidad -= cant;
    ventas.unshift({
      id: uid(),
      productoNombre: p.nombre,
      cantidad: cant,
      precioUnitario: p.precio,
      total,
      fecha: new Date().toISOString()
    });

    guardarDatos();
    cerrarModalVenta();
    mostrarToast(`Venta registrada: ${cant} x ${p.nombre} = $${formatMoneda(total)}`, "success");
    renderTodo();
  }

  function eliminarVenta(id) {
    const v = ventas.find((x) => x.id === id);
    if (!v) return;
    if (!confirm("¿Eliminar esta venta del historial? (No devuelve stock)")) return;

    ventas = ventas.filter((x) => x.id !== id);
    guardarDatos();
    mostrarToast("Venta eliminada del historial.");
    renderTodo();
  }

  function onTablaVentasClick(e) {
    const btn = e.target.closest("button[data-accion]");
    if (!btn) return;
    if (btn.dataset.accion === "eliminar") eliminarVenta(btn.dataset.id);
  }

  // ---------- Render ----------

  function renderTodo() {
    renderEstadisticas();
    renderAlertas();
    renderInventario();
    renderVentas();
  }

  function renderEstadisticas() {
    $("statProductos").textContent = productos.length;
    $("statValor").textContent = "$" + formatMoneda(
      productos.reduce((acc, p) => acc + p.cantidad * p.precio, 0)
    );
    $("statBajo").textContent = productos.filter(isStockBajo).length;
    $("statVentas").textContent = "$" + formatMoneda(
      ventas.reduce((acc, v) => acc + v.total, 0)
    );
  }

  function renderAlertas() {
    const contenedor = $("alertasBajoStock");
    const bajo = productos.filter(isStockBajo);

    if (bajo.length === 0) {
      contenedor.innerHTML = "";
      return;
    }

    contenedor.innerHTML = bajo
      .map((p) => `<div class="alert">El producto <strong>"${p.nombre}"</strong> tiene poco inventario (${p.cantidad} unidades).</div>`)
      .join("");
  }

  function isStockBajo(p) {
    return p.cantidad <= p.stockMinimo;
  }

  function renderInventario() {
    const tbody = $("tablaInventario");
    const filtro = $("buscador").value.trim().toLowerCase();

    const lista = productos.filter((p) => p.nombre.toLowerCase().includes(filtro));
    lista.sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));

    $("contadorProductos").textContent = `${productos.length} producto(s)`;

    if (productos.length === 0) {
      tbody.innerHTML = "";
      $("vacioInvisible").hidden = false;
      return;
    }
    $("vacioInvisible").hidden = true;

    tbody.innerHTML = lista
      .map((p) => {
        const estado = isStockBajo(p)
          ? p.cantidad === 0
            ? '<span class="badge badge-danger">Agotado</span>'
            : '<span class="badge badge-warn">Bajo stock</span>'
          : '<span class="badge badge-ok">Disponible</span>';
        return `<tr>
          <td><strong>${esc(p.nombre)}</strong></td>
          <td>${p.cantidad}</td>
          <td>$${formatMoneda(p.precio)}</td>
          <td>$${formatMoneda(p.cantidad * p.precio)}</td>
          <td>${estado}</td>
          <td>
            <div class="acciones">
              <button class="btn-edit" data-accion="editar" data-id="${p.id}">Editar</button>
              <button class="btn-delete" data-accion="eliminar" data-id="${p.id}">Eliminar</button>
            </div>
          </td>
        </tr>`;
      })
      .join("");
  }

  function renderVentas() {
    renderEstadisticasVentas();
    renderTablaVentas();
    dibujarGraficoDona();
  }

  function renderEstadisticasVentas() {
    const total = ventas.reduce((acc, v) => acc + v.total, 0);
    const unidades = ventas.reduce((acc, v) => acc + v.cantidad, 0);
    const promedio = ventas.length ? total / ventas.length : 0;

    $("statTotalVentas").textContent = "$" + formatMoneda(total);
    $("statUnidades").textContent = unidades;
    $("statNumVentas").textContent = ventas.length;
    $("statPromedio").textContent = "$" + formatMoneda(promedio);
  }

  function renderTablaVentas() {
    const tbody = $("tablaVentas");
    const filtro = $("buscadorVentas").value.trim().toLowerCase();

    const lista = ventas.filter((v) => v.productoNombre.toLowerCase().includes(filtro));

    if (ventas.length === 0) {
      tbody.innerHTML = "";
      $("vacioVentas").hidden = false;
      $("totalVentas").textContent = formatMoneda(0);
      dibujarGraficoDona();
      return;
    }
    $("vacioVentas").hidden = true;

    tbody.innerHTML = lista
      .map((v) => `<tr>
        <td><strong>${esc(v.productoNombre)}</strong></td>
        <td>${v.cantidad}</td>
        <td>$${formatMoneda(v.precioUnitario)}</td>
        <td><strong>$${formatMoneda(v.total)}</strong></td>
        <td>${formatearFecha(v.fecha)}</td>
        <td>
          <div class="acciones">
            <button class="btn-delete" data-accion="eliminar" data-id="${v.id}">Eliminar</button>
          </div>
        </td>
      </tr>`)
      .join("");

    const total = ventas.reduce((acc, v) => acc + v.total, 0);
    $("totalVentas").textContent = formatMoneda(total);
  }

  // ---------- Diagrama circular (donut) ----------

  function datosParaGrafico() {
    const mapa = new Map();
    ventas.forEach((v) => {
      mapa.set(v.productoNombre, (mapa.get(v.productoNombre) || 0) + v.cantidad);
    });
    return Array.from(mapa.entries())
      .map(([nombre, cantidad]) => ({ nombre, cantidad }))
      .sort((a, b) => b.cantidad - a.cantidad);
  }

  function dibujarGraficoDona() {
    const canvas = $("graficoDona");
    const datos = datosParaGrafico();
    const total = datos.reduce((a, d) => a + d.cantidad, 0);

    $("graficoTotal").textContent = total;

    if (datos.length === 0) {
      $("vacioGrafico").hidden = false;
      canvas.style.display = "none";
      $("leyendaDona").innerHTML = "";
      return;
    }
    $("vacioGrafico").hidden = true;
    canvas.style.display = "block";

    $("leyendaDona").innerHTML = datos
      .map((d, i) => {
        const pct = total ? Math.round((d.cantidad / total) * 100) : 0;
        return `<div class="leyenda-item">
          <span class="leyenda-dot" style="background:${PALETA[i % PALETA.length]}"></span>
          <span class="leyenda-nombre">${esc(d.nombre)}</span>
          <span class="leyenda-valor">${d.cantidad} (${pct}%)</span>
        </div>`;
      })
      .join("");

    const size = 240;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = size + "px";
    canvas.style.height = size + "px";

    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.scale(dpr, dpr);

    const cx = size / 2;
    const cy = size / 2;
    const radioExterno = size / 2 - 12;
    const grosor = 34;
    const radioInterno = radioExterno - grosor;

    let anguloInicio = -Math.PI / 2;
    const anguloTotal = 2 * Math.PI;

    // animación
    let progreso = 0;
    cancelAnimationFrame(dibujarGraficoDona._animacion);

    const animar = () => {
      progreso += 0.025;
      if (progreso > 1) progreso = 1;

      ctx.clearRect(0, 0, size, size);

      let suma = 0;
      datos.forEach((d, i) => {
        const porcion = total ? d.cantidad / total : 0;
        const ang = porcion * anguloTotal * progreso;
        const ini = anguloInicio + suma;
        const fin = ini + ang;
        ctx.beginPath();
        ctx.arc(cx, cy, radioExterno, ini, fin);
        ctx.arc(cx, cy, radioInterno, fin, ini, true);
        ctx.closePath();
        ctx.fillStyle = PALETA[i % PALETA.length];
        ctx.fill();
        suma += porcion * anguloTotal;
      });

      if (progreso < 1) {
        dibujarGraficoDona._animacion = requestAnimationFrame(animar);
      }
    };

    animar();
  }

  function formatearFecha(iso) {
    const d = new Date(iso);
    return d.toLocaleString("es", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function esc(texto) {
    const div = document.createElement("div");
    div.textContent = texto;
    return div.innerHTML;
  }

  function mostrarToast(mensaje, tipo) {
    const t = $("toast");
    t.textContent = mensaje;
    t.className = "toast" + (tipo ? ` ${tipo}` : "");
    t.hidden = false;

    clearTimeout(mostrarToast._timer);
    mostrarToast._timer = setTimeout(() => {
      t.hidden = true;
    }, 3000);
  }
})();