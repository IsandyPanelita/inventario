# Sistema de Inventario y Ventas — Tutorial paso a paso

Guía pensada para **principiantes**. Aquí aprenderás a entender (y a partir de aquí, modificar) el sistema de inventario y ventas que tiene 3 archivos:

| Archivo | ¿Qué es? | Se encarga de... |
|---------|----------|------------------|
| `index.html` | Estructura | Definir qué hay en la página (formularios, tablas, botones) |
| `styles.css` | Estilo | Decir cómo se ve (colores, tamaños, posiciones) |
| `app.js` | Comportamiento | Hacer que funcione (guardar datos, calcular, pintar) |

> **Analogía de la casa:** HTML es la estructura (paredes, puertas, habitaciones). CSS es la pintura y decoración. JavaScript es la electricidad y la fontanería: lo que hace que las cosas *funcionen*.

---

## 0. Cómo correr el proyecto

Solo necesitas abrir `index.html` en tu navegador (doble clic sobre el archivo). No hace falta servidor ni instalar nada. Todo el "servidor" y la "base de datos" viven dentro de tu navegador, en una memoria llamada `localStorage`.

---

## Paso 1 — El HTML (`index.html`)

El HTML es el esqueleto. Mira el esqueleto completo de la página:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Sistema de Inventario y Ventas</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  ... contenido ...
  <script src="app.js"></script>
</body>
</html>
```

- `<link ... href="styles.css">` **pegado** el estilo a la página.
- `<script src="app.js"></script>` **pegado** el comportamiento. Va al final para que el HTML ya esté cargado cuando el JavaScript empiece.
- `lang="es"` le dice al navegador que el contenido está en español.

### 1.1 Header y pestañas

```html
<header class="header">
  <div class="header-inner">
    <h1>Sistema de Inventario y Ventas</h1>
    <nav class="tabs" id="tabs">
      <button class="tab active" data-tab="inventario">Inventario</button>
      <button class="tab" data-tab="ventas">Ventas</button>
    </nav>
  </div>
</header>
```

- `class` sirve para que CSS "encuentre" y estilice el elemento.
- `data-tab="inventario"` es un **atributo personalizado**. JavaScript lo lee con `btn.dataset.tab` para saber qué pestaña se pulsó.
- `active` marca cuál pestaña/vista está visible al inicio.

### 1.2 El formulario de producto

```html
<form id="formProducto" class="form">
  <input type="hidden" id="productoId">
  <div class="form-group">
    <label for="nombre">Nombre del producto</label>
    <input type="text" id="nombre" required placeholder="Ej. Arroz">
  </div>
  ...
</form>
```

- `id` es como el **DNI** del elemento: JavaScript lo localiza con `document.getElementById("nombre")`.
- `required` hace que el navegador no deje enviar el formulario vacío. *Truco: pruébalo: intenta guardar sin escribir nada.*
- `type="number"` + `min="0"` + `step="0.01"` hacen que solo se puedan teclear números válidos.
- Para el precio, en JavaScript lo trabajamos como número decimal con **punto**, aunque para mostrarlo usamos formato con comas (se explora más adelante).

### 1.3 Las vistas (pestañas)

```html
<section class="vista active" id="vistaInventario"> ... </section>
<section class="vista" id="vistaVentas"> ... </section>
```

- Hay **dos secciones** grandes. La pestaña "Inventario" muestra una, y "Ventas" la otra.
- CSS oculta las vistas que no tienen la clase `active` (`display: none`). JavaScript mueve la clase `active` cuando cambias de pestaña.

### 1.4 Las tablas

```html
<table class="tabla">
  <thead>          <!-- encabezado que NO se repinta -->
    <tr>
      <th>Producto</th>
      <th>Cantidad</th>
      ...
    </tr>
  </thead>
  <tbody id="tablaInventario"></tbody>   <!-- se llena con JavaScript -->
</table>
```

- El `<tbody>` está **vacío en el HTML**: JavaScript lo llena con las filas según los productos guardados.
- **Regla de oro:** el HTML define *dónde* van las cosas; JavaScript *decide qué va ahí*.

### 1.5 El modal de venta

```html
<div class="modal-backdrop" id="modalVenta" hidden>
  <div class="modal">
    <h2>Registrar Venta</h2>
    <form id="formVenta"> ... </form>
  </div>
</div>
```

- Un modal es una "ventana que flota" encima de la página.
- `hidden` lo **oculta** al inicio. `cerrarModalVenta()` lo oculta y `abrirModalNuevaVenta()` lo muestra (quitando/poniendo la propiedad `hidden`).

### 1.6 El toast

```html
<div class="toast" id="toast" hidden></div>
```

Un mensajito que aparece abajo por 3 segundos ("Producto registrado", etc.). El texto lo pone JavaScript.

---

## Paso 2 — El CSS (`styles.css`)

Piensa en CSS como instrucciones de pintura. Ejemplo de regla:

```css
.stat-numero {
  font-size: 1.4rem;        /* tamaño de letra */
  font-weight: 700;         /* grosor de la letra */
  color: var(--primary-dark); /* color */
}
```

### 2.1 Las variables de color (el "panel de control")

Al inicio del archivo está esto:

```css
:root {
  --primary: #2563eb;
  --primary-dark: #1d4ed8;
  ...
}
```

`--primary`, `--primary-dark`... son **variables**: nombres para guardar un color. Las usas en cualquier parte con `var(--primary)`.

> **Ejercicio exprés:** cambia `#2563eb` por `#dc2626` (rojo) y recarga la página: **todo** lo azul se vuelve rojo. Así de fácil se controla el tema desde un solo lugar.

### 2.2 Dos "súper poderes": Flexbox y Grid

- **Flexbox** (`display: flex`) alinea elementos en línea. Fíjate en `.acciones` (los botones Editar/Eliminar de cada fila) y `.form-actions`.
- **Grid** (`display: grid`) organiza en plantillas. Ejemplo:

```css
.stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 columnas de igual ancho */
  gap: 16px;
}
```

- `@media (max-width: 480px)` es una **media query**: si la pantalla es muy angosta, las columnas pasan a 1 (una sola) para que no se rompa en el celular.

### 2.3 Cómo se oculta una vista

```css
.vista { display: none; }        /* oculta */
.vista.active { display: block; } /* muestra cuando tiene "active" */
```

La clase `active` en la pestaña y en la vista es lo que sincroniza qué ves.

---

## Paso 3 — El JavaScript (`app.js`)

Aquí está toda la "inteligencia" del sistema. Lo más importante: se lee **de arriba hacia abajo** como una receta.

### 3.1 Las dos estructuras de datos (la memoria)

Todo el sistema se apoya en **dos listas** (arrays). Así se ve un producto:

```js
{
  id: "lq3x9a2k1",
  nombre: "Arroz",
  cantidad: 50,
  precio: 2.50,
  stockMinimo: 5
}
```

Y así una venta:

```js
{
  id: "q8w2e7r5t",
  productoNombre: "Arroz",
  cantidad: 3,
  precioUnitario: 2.50,
  total: 7.50,
  fecha: "2026-09-18T03:12:00.000Z"
}
```

- `productos` = array de todos los productos.
- `ventas` = array de todas las ventas (las más nuevas van al inicio con `unshift`).

### 3.2 `localStorage`: guardar sin base de datos

El navegador guarda texto. JavaScript convierte las listas a texto con **JSON** para guardarlas y las vuelve a convertir cuando quiere leerlas.

```js
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
```

- `JSON.stringify(productos)` → convierte el array en texto.
- `JSON.parse(texto)` → convierte el texto de vuelta a array.
- Se guarda en dos "casillas": `"inventario.productos"` y `"inventario.ventas"` (por eso las constantes `STORAGE_PRODUCTOS` y `STORAGE_VENTAS`).

> Pruébalo: abre la página, registra unos productos, cierra el navegador y vuelve a abrirla: los datos siguen ahí.

### 3.3 El "arranque": `iniciar()`

```js
iniciar();

function iniciar() {
  bindEventos();   // 1. "conecta" botones y formularios con sus funciones
  renderTodo();    // 2. pinta toda la pantalla con los datos guardados
}
```

- **`bindEventos()`** — le dice a los elementos: "cuando pase X, ejecuta Y".
- **`renderTodo()`** — "pinta" la interfaz (tablas, estadísticas, alertas) con los datos que hay en ese momento.

### 3.4 Eventos: cómo "conecta" los botones

```js
formProducto.addEventListener("submit", guardarProducto);
$("buscador").addEventListener("input", renderInventario);
$("btnNuevaVenta").addEventListener("click", abrirModalNuevaVenta);
```

Traducción:
- "Cuando el formulario de producto se **envíe**, ejecuta `guardarProducto`."
- "Cuando escribas en el buscador (**input**), vuelve a pintar el inventario."
- "Cuando presiones **Nueva venta**, abre el modal."

Cada vez que algo cambia, se vuelve a pintar lo necesario. Ese es el "secreto" del sistema: **los datos están en memoria, y la pantalla es solo un espejo de esos datos.**

### 3.5 Registro de producto (`guardarProducto`)

```js
function guardarProducto(e) {
  e.preventDefault();          // 1. evita que la página se recargue

  const nombre = $("nombre").value.trim();  // 2. lee lo escrito + quita espacios
  const cantidad = Number($("cantidad").value);
  const precio = Number($("precio").value);

  if (!nombre || cantidad < 0 || precio < 0) {   // 3. valida
    mostrarToast("Verifica los datos del producto.", "error");
    return;                       // "detente aquí, no sigas"
  }
  ...
  productos.push({ id: uid(), nombre, cantidad, precio, stockMinimo }); // 4. agrega
  guardarDatos();                 // 5. guarda en localStorage
  renderTodo();                   // 6. repinta la pantalla
}
```

Pasos del "ritual" de cada operación: **leer → validar → modificar datos → guardar → repintar**.

- `e.preventDefault()` — sin esto, al enviar un formulario el navegador recarga la página y se perdería todo.
- `return;` termina la función ("no ejecutes lo de abajo").

### 3.6 Editar producto (el mismo formulario para dos cosas)

En vez de tener dos formularios, el sistema **reutiliza el mismo**:

```js
function editarProducto(id) {
  const p = productos.find((x) => x.id === id); // busca el producto por su id
  editandoId = id;                              // "marca" que estás editando
  $("nombre").value = p.nombre;                 // llena los campos con sus datos
  $("cantidad").value = p.cantidad;
  ...
}
```

- La variable `editandoId` es la "señal": si está `null`, es registro nuevo; si tiene un id, es edición.
- Fíjate en borrar dicha señal al cancelar o terminar (`editandoId = null`) y en cambiar el título del formulario y el texto del botón ("Guardar" ↔ "Actualizar").

### 3.7 Eliminar producto

```js
if (!confirm(`¿Eliminar el producto "${p.nombre}"?`)) return;
productos = productos.filter((x) => x.id !== id);
```

- `confirm(...)` muestra el cuadro del navegador Aceptar/Cancelar.
- `filter` crea una nueva lista **sin** el producto que tiene ese id. Este es el "truco" para eliminar de un array inmutable: no borrar, sino filtrar y quedarte con el resto.

### 3.8 La venta (`confirmarVenta`)

```js
const total = cant * p.precio;   // calcula el total
p.cantidad -= cant;              // DESCUENTA del stock del producto
ventas.unshift({ ... });         // agrega la venta al inicio del historial
```

Tres efectos por una venta:
1. Baja la cantidad disponible del producto (`-=`).
2. Agrega un registro al historial de ventas.
3. (Como se repinta todo) refrescan stock, estadísticas, gráfico y alertas.

Las validaciones importantes:
- `if (cant > p.cantidad)` → "no puedes vender más de lo que hay" (**Stock insuficiente**).

### 3.9 Delegación de eventos: por qué los botones de la tabla sí funcionan

Los botones de cada fila **no tienen** `addEventListener` (porque se crean y borran a cada momento). En su lugar, el `tbody` escucha todos los clics y descubre cuál botón fue pulsado:

```js
$("tablaInventario").addEventListener("click", onTablaInventarioClick);

function onTablaInventarioClick(e) {
  const btn = e.target.closest("button[data-accion]"); // ¿se pulsó un botón?
  if (!btn) return;
  const accion = btn.dataset.accion;   // "editar" o "eliminar"
  if (accion === "editar") editarProducto(btn.dataset.id);
  if (accion === "eliminar") eliminarProducto(btn.dataset.id);
}
```

Cuando el HTML se genera con JavaScript, el botón lleva **información escondida** en sus atributos:

```html
<button data-accion="eliminar" data-id="lq3x9a2k1">Eliminar</button>
```

Así el sistema sabe qué botón fue y a qué producto corresponde.

### 3.10 Repintar ("render") y el buscador

```js
function renderInventario() {
  const filtro = $("buscador").value.trim().toLowerCase(); // lo que escribiste
  const lista = productos.filter((p) =>
    p.nombre.toLowerCase().includes(filtro)                 // coincide con nombre
  );
  tbody.innerHTML = lista.map((p) => crearFila(p)).join("");
}
```

- `.filter(...)` deja solo los productos que contienen lo buscado.
- `.toLowerCase()` normaliza mayúsculas/minúsculas ("ARROZ" busca igual "arroz").
- `.map(...)` transforma cada producto en una **fila de HTML**.
- `.join("")` une todas las filas en un solo texto (con `,` por defecto; por eso el `""`).
- `.innerHTML = ...` "pega" ese HTML dentro de la tabla.

> Pruébalo: escribe "arroz" en el buscador y verás cómo se filtra en vivo, escribe nada y vuelve todo.

### 3.11 El diagrama circular (donut) con `<canvas>`

Un `<canvas>` es un **lienzo** en el que JavaScript dibuja con "pincel" (`ctx`):

```js
const ctx = canvas.getContext("2d");  // el pincel
```

Pasos:
1. **Agrupar las ventas por producto** (`datosParaGrafico`) — suma las cantidades vendidas de cada producto usando un `Map`.
2. **Calcular la porción de cada producto**: si el total vendido es 100 y un producto vendió 25, su porción es `25/100 = 0.25` (el 25% de 360°).
3. **Dibujar los arcos** con `ctx.arc(centroX, centroY, radio, ánguloInicio, ánguloFin)`. Dibujamos un arco hacia afuera y otro hacia adentro (radio interno) para que quede "agujereado" (donut).
4. **Animar** con `requestAnimationFrame`: en vez de dibujar el pastel completo de golpe, se dibuja poco a poco (~2.5% por cuadro) hasta completarlo.

El centro muestra el total con un `<div>` posicionado sobre el lienzo.

### 3.12 Utilitarios que se usan en todos lados

```js
function formatMoneda(valor) {
  return Number(valor).toLocaleString("es", {   // 2500.5 → "2.500,50"
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
}

function esc(texto) {   // Protección de seguridad
  const div = document.createElement("div");
  div.textContent = texto;   // el navegador interpreta "texto" como texto plano
  return div.innerHTML;      // y al pedir el HTML, ya quedó "escaped"
}
```

- `formatMoneda` — formato de dinero con separadores.
- `esc` — **importante**: si un producto se llama `<script>alert()</script>`, sin `esc` ese texto se ejecutaría como código (ataque XSS). Con `esc`, solo se ve como texto.
- `mostrarToast` — muestra un mensaje por 3 segundos usando `setTimeout`.

---

## Paso 4 — Flujo completo (un ejemplo real)

1. Abres la app → `iniciar()` carga los datos de `localStorage` y los pinta.
2. Registras "Arroz", 50 unidades, $2.50 → se agrega a `productos`, se guarda, se repinta. Aparece en la tabla con estado **Disponible**.
3. Pones otro con 3 unidades → aparece la alerta roja "poco inventario" y el badge dice **Bajo stock**.
4. Vas a la pestaña **Ventas** → haces "+ Nueva venta", eliges Arroz, cantidad 5 → total $12.50. Aceptas.
5. Resultado: stock de Arroz baja a 45, la venta entra al historial, las ventas acumuladas suben, y el **donut** de "unidades vendidas por producto" ahora muestra una porción para Arroz.
6. Buscas "arroz" en el buscador de ventas → aparece esa venta.

Todo eso sin recargar ni un solo servidor.

---

## Paso 5 — Ejercicios para practicar

Ordenados de fácil a difícil. Cada uno arranca abriendo el archivo correspondiente en un editor (Notepad++, VS Code, etc.).

1. **Cambiar el tema** (CSS): en `styles.css`, dentro de `:root`, cambia `--primary` a un color que te guste y agrega más arriba tu propio color turquesa.
2. **Umbral de bajo stock por defecto** (HTML+JS): en `index.html` el campo `stockMinimo` ya tiene `value="5"`. Cambia el 5 por 10 y mira cómo cambian las alertas.
3. **Nuevo campo "categoría"**: agrega un `<input id="categoria">` en el formulario, guárdalo en el objeto producto, muéstralo como columna en `renderInventario`.
4. **Eliminar venta devuelve stock**: en `eliminarVenta`, antes de `ventas = ventas.filter(...)`, encuentra el producto con `productos.find(p => p.nombre === v.productoNombre)` y haz `p.cantidad += v.cantidad`.
5. **Alertas también cuando se elimina**: haz que el toast de "Producto eliminado" use el tipo `"error"`.
6. **Reto (difícil):** que el total de ventas muestre la venta más cara del día usando `Math.max` sobre `ventas.map(v => v.total)`.

---

## Paso 6 — Glosario en un minuto

| Término | Qué significa en este proyecto |
|---------|-------------------------------|
| **HTML** | Estructura/etiquetas de la página. |
| **CSS** | Reglas de estilo (colores, tamaños, posiciones). |
| **JS (JavaScript)** | El lenguaje que hace "funcionar" todo. |
| **elemento/tag** | Una etiqueta HTML: `div`, `button`, `input`... |
| **atributo** | Ajuste de una etiqueta: `id`, `class`, `type`... |
| **id** | Identificador único de un elemento. |
| **función** | Bloque de código con nombre que se ejecuta cuando se le llama: `guardarProducto()`. |
| **evento** | Algo que ocurre: clic (`click`), escribir (`input`), enviar formulario (`submit`). |
| **addEventListener** | "Cuando pase el evento, ejecuta esta función." |
| **variable** | Caja con nombre donde guardas un valor: `let editandoId = null`. |
| **const** | Igual que variable pero no se puede reasignar. |
| **array** | Lista: `[producto1, producto2, ...]`. |
| **objeto** | "Ficha" con campos: `{ nombre: "Arroz", cantidad: 50 }`. |
| **función flecha** | Forma corta de función: `(p) => p.nombre`. |
| **`.map()`** | Transforma cada elemento de una lista en otro (producto → fila HTML). |
| **`.filter()`** | Deja solo los elementos que cumplen una condición. |
| **`.reduce()`** | Acumula los elementos en un solo valor (sumar totales). |
| **`.find()`** | Encuentra el primer elemento que cumple una condición. |
| **`localStorage`** | Memoria del navegador que sobrevive al cerrar. |
| **JSON** | Formato de texto para guardar datos: `{"nombre":"Arroz"}`. |
| **stringify/parse** | Convertir datos a texto / texto a datos. |
| **render** | Volver a pintar la pantalla según los datos. |
| **CRUD** | Crear, Leer, Actualizar, Eliminar (las 4 operaciones básicas). |
| **canvas** | Lienzo donde JS dibuja (aquí, el donut). |
| **requestAnimationFrame** | Pide al navegador redibujar en el siguiente "cuadro" (animación). |
| **XSS** | Ataque con código injertado; se evita "escapando" texto con `esc()`. |

---

## Consejos finales

- **Haz una sola cosa a la vez.** Cambias algo → recargas la página → ves qué pasa.
- **Usa la consola del navegador** (F12 → pestaña Console) para ver errores y experimentar con `productos` y `ventas`.
- El patrón **leer → validar → modificar → guardar → repintar** está en todo el código: si entiendes eso, entiendes el sistema.
- Si rompes algo, no pasa nada: los archivos no dependen entre sí más allá de los `id` que comparten.

¡Ahora sí, a experimentar!