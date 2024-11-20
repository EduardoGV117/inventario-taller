const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetSectionId = btn.dataset.target;
    const targetSection = document.getElementById(targetSectionId);

    // Remove the active class from all sections
    sections.forEach(section => {
      section.classList.remove('active-section');
    });

    // Add the active class to the target section
    targetSection.classList.add('active-section');
  });
});

document.addEventListener('DOMContentLoaded', () => {
  // Función para cargar productos
  async function cargarProductos() {
    const response = await fetch('/productos');
    const productos = await response.json();
    const listaProductos = document.getElementById('productos-lista'); // Aquí es donde se mostrarán los productos

    productos.forEach(producto => {
      const item = document.createElement('li');
      item.textContent = `${producto.nombre_producto} - $${producto.precio_venta}`;
      listaProductos.appendChild(item);
    });
  }

  cargarProductos(); // Cargar los productos cuando la página se cargue
});

document.querySelector('#add-product-section form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const nombre = document.getElementById('product-name').value;
  const categoria = document.getElementById('category').value;
  const precioCompra = parseFloat(document.getElementById('purchase-price').value);
  const precioVenta = parseFloat(document.getElementById('sale-price').value);
  const stock = parseInt(document.getElementById('initial-stock').value);

  const producto = {
    nombre_producto: nombre,
    categoria: categoria,
    precio_compra: precioCompra,
    precio_venta: precioVenta,
    stock_actual: stock,
    descripcion: 'Descripción del producto',
  };

  const response = await fetch('/productos', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(producto),
  });

  if (response.ok) {
    const nuevoProducto = await response.json();
    alert('Producto agregado con éxito');
    // Podrías actualizar la lista de productos aquí
  } else {
    alert('Error al agregar producto');
  }
});

document.querySelector('#sales-section form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const idProducto = document.getElementById('product-to-sell').value;
  const cantidad = parseInt(document.getElementById('sell-quantity').value);
  const total = cantidad * precioVenta; // Precio de venta debe obtenerse de la base de datos o un campo oculto
  const idUsuario = 1; // Suponiendo que el usuario tiene ID 1 (esto debería ser dinámico)

  const venta = {
    id_producto: idProducto,
    cantidad: cantidad,
    total: total,
    id_usuario: idUsuario,
  };

  const response = await fetch('/ventas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(venta),
  });

  if (response.ok) {
    const ventaRegistrada = await response.json();
    alert('Venta registrada con éxito');
  } else {
    alert('Error al registrar la venta');
  }
});

