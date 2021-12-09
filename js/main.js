const productos = [];
let carrito = [];
let total = 0;
const DOMproductos = $("#items");
const DOMcarrito = $("#carrito");
let DOMTotal = $("#total");
const DOMbotonVaciar = $("#boton-vaciar");
const miLocalStorage = window.localStorage;
const buscar = $("#busqueda");
// Funciones

/**
 * Dibuja todos los productos a partir de la base de datos. No confundir con el carrito
 */

// Inicio

class Producto {
    constructor(id, nombre, precio, img) {
        (this.id = id),
        (this.nombre = nombre),
        (this.precio = precio),
        (this.img = img);
    }
}

$.get("../datos-productos.json", function(datos, estado) {
    //console.log(datos);
    //console.log(estado);
    if (estado == "success") {
        for (const k of datos) {
            productos.push(new Producto(k.id, k.nombre, k.precio, k.img));
        }
        cargarCarritoDeLocalStorage();
        renderizarProductos(productos);
        calcularTotal();
        renderizarCarrito();
        DOMbotonVaciar.on("click", vaciarCarrito);
    }
});

function renderizarProductos(prod) {
    DOMproductos.empty();
    prod.forEach((producto) => {
        // Estructura
        const div = document.createElement("div");
        div.classList.add("card", "col-sm-4");
        // Body
        const card = document.createElement("div");
        card.classList.add("card-body");
        // Titulo
        const tituloCard = document.createElement("h5");
        tituloCard.classList.add("card-title");
        tituloCard.textContent = producto.nombre;
        // Imagen
        const imgCard = document.createElement("img");
        imgCard.classList.add("img-fluid");
        imgCard.setAttribute("src", producto.img);
        // Precio
        const precioCard = document.createElement("p");
        precioCard.classList.add("card-text");
        precioCard.textContent = "$" + producto.precio;
        // Boton
        const botonCard = document.createElement("button");
        botonCard.classList.add("btn", "btn-primary");
        botonCard.textContent = "Comprar";
        botonCard.setAttribute("a", producto.id);
        botonCard.addEventListener("click", aniadirProductoAlCarrito);
        // Insertamos
        $(card).append(imgCard);
        $(card).append(tituloCard);
        $(card).append(precioCard);
        $(card).append(botonCard);
        $(div).append(card);
        $(DOMproductos).append(div);
    });
}

/**
 * Evento para añadir un producto al carrito de la compra
 */
function aniadirProductoAlCarrito(e) {
    // aniadir producto
    carrito.push(e.target.getAttribute("a"));
    // Calculo el total
    calcularTotal();
    // Actualizamos el carrito
    renderizarCarrito();
    // Actualizamos el LocalStorage
    guardarCarritoEnLocalStorage();
}

/**
 * Dibuja todos los productos guardados en el carrito
 */
function renderizarCarrito() {
    DOMcarrito.empty();
    const carritoNuevo = [...new Set(carrito)];
    carritoNuevo.forEach((item) => {
        const prod = productos.filter((p) => {
            return p.id === parseInt(item);
        });
        const numeroUnidadesProd = carrito.reduce((total, prodID) => {
            return prodID === item ? (total += 1) : total;
        }, 0);
        const li = document.createElement("li");
        li.classList.add("list-group-item", "text-right");
        li.textContent = `${numeroUnidadesProd} x ${prod[0].nombre} - $ ${prod[0].precio}`;
        // Boton de borrar
        const btnBorrar = document.createElement("button");
        btnBorrar.classList.add("btn", "btn-danger");
        btnBorrar.textContent = "X";
        btnBorrar.style.marginLeft = "1rem";
        btnBorrar.dataset.item = item;
        btnBorrar.addEventListener("click", borrarItemCarrito);
        // Mezclamos nodos
        $(li).append(btnBorrar);
        $(DOMcarrito).append(li);
    });
}

/**
 * Evento para borrar un elemento del carrito
 */
function borrarItemCarrito(e) {
    const id = e.target.dataset.item;
    carrito = carrito.filter((carritoId) => {
        return carritoId !== id;
    });
    // volvemos a renderizar
    renderizarCarrito();
    // Calculamos de nuevo el precio
    calcularTotal();
    // Actualizamos el LocalStorage
    guardarCarritoEnLocalStorage();
}

/**
 * Calcula el precio total teniendo en cuenta los productos repetidos
 */
function calcularTotal() {
    // Limpiamos precio anterior
    total = 0;
    DOMTotal.empty();
    // Recorremos el array del carrito
    carrito.forEach((p) => {
        // De cada elemento obtenemos su precio
        const producto = productos.filter((prod) => {
            return prod.id === parseInt(p);
        });
        total = total + parseInt(producto[0].precio);
    });
    // Renderizamos el precio en el HTML
    //console.log(total);

    DOMTotal.append(total);
}

function vaciarCarrito() {
    // Limpiamos los productos guardados
    carrito = [];
    // Renderizamos los cambios
    renderizarCarrito();
    calcularTotal();
    // Borra LocalStorage
    localStorage.clear();
}

function guardarCarritoEnLocalStorage() {
    miLocalStorage.setItem("carrito", JSON.stringify(carrito));
}

function cargarCarritoDeLocalStorage() {
    if (miLocalStorage.getItem("carrito") !== null) {
        carrito = JSON.parse(miLocalStorage.getItem("carrito"));
    }
}

function filtro(e) {
    renderizarProductos([]);
    // console.log(this.value);
    let palabra = this.value.toLowerCase();
    filtroProducto = productos.filter(function(p) {
        //  console.log(p.nombre);
        p = p.nombre.toLowerCase();
        return p.indexOf(palabra) > -1;
    });
    renderizarProductos(filtroProducto);
    filtroProducto = [];
}

buscar.on("keyup", filtro);

function finalizarCompra() {
    vaciarCarrito();
    const finaliza = document.createElement("li");
    finaliza.innerHTML = `<p> La compra finalizo con exito </p>`;
    DOMcarrito.append(finaliza);
}
$("#boton-comprar").on("click", finalizarCompra);