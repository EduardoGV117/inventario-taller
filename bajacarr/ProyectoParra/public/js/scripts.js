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

    // Mostrar u ocultar campos de "Actualizar Stock" cuando se navega a "Actualizar Stock"
    if (targetSectionId === 'updateStockForm') {
        document.getElementById('searchStockContainer').classList.remove('hidden');
        document.getElementById('updateFields').classList.remove('hidden');
    } else {
        document.getElementById('searchStockContainer').classList.add('hidden');
        document.getElementById('updateFields').classList.add('hidden');
    }
  });
});


document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('/user-info');
    if (!response.ok) throw new Error('Error al obtener información del usuario');
    const user = await response.json();

    // Obtén los elementos del DOM
    const userButton = document.getElementById('user-button');
    const dropdown = document.getElementById('user-dropdown');

    // Verifica que los elementos existan
    if (!userButton || !dropdown) {
      console.error('Elementos necesarios no encontrados en el DOM.');
      return;
    }

    // Configura la inicial del usuario
    const initial = user.name.charAt(0).toUpperCase();
    userButton.textContent = initial;
    userButton.style.backgroundColor = '#6A0DAD'; // Color morado

    // Configura el contenido desplegable
    dropdown.innerHTML = `
      <p><strong>${user.name}</strong></p>
      <p>${user.email}</p>
      <button id="logout-button">Cerrar sesión</button>
    `;

    // Muestra/oculta el dropdown al hacer clic en el botón
    userButton.addEventListener('click', () => {
      dropdown.classList.toggle('show');
    });

    // Configura el botón de cerrar sesión
    document.getElementById('logout-button').addEventListener('click', () => {
      window.location.href = '/logout';
    });
  } catch (error) {
    console.error('Error al cargar los datos del usuario:', error);
  }
});


// Busca productos en el servidor
async function searchProducts(searchTerm) {
  const response = await fetch(`/productos/buscar?nombre_producto=${searchTerm}`);
  const data = await response.json();
  return data;
}

document.getElementById("searchButton").addEventListener("click", async () => {
    const searchTerm = document.getElementById("productSearch").value;
    const products = await searchProducts(searchTerm);
    renderProductTable(products); // Cambia renderProductList por renderProductTable
});
// Busca productos en el servidor
async function searchProducts(searchTerm) {
  const response = await fetch(`/productos/buscar?nombre_producto=${searchTerm}`);
  const data = await response.json();
  return data;
}

// Renderiza la tabla de productos con checkboxes
function renderProductTable(products) {
  const tableBody = document.getElementById("productTable").querySelector("tbody");
  tableBody.innerHTML = ''; // Limpiar tabla antes de agregar nuevos resultados

  if (products.length === 0) {
      tableBody.innerHTML = '<tr><td colspan="6">No se encontraron productos.</td></tr>';
      return;
  }

  products.forEach(product => {
      const row = document.createElement("tr");
      row.innerHTML = `
          <td><input type="checkbox" class="productCheckbox" data-id="${product.id_producto}" /></td>
          <td>${product.nombre_producto}</td>
          <td>${product.categoria}</td>
          <td>${product.precio_compra}</td>
          <td>${product.precio_venta}</td>
          <td>${product.stock_actual}</td>
      `;
      tableBody.appendChild(row);
  });

  // Event listeners para los checkboxes
  document.querySelectorAll('.productCheckbox').forEach(checkbox => {
      checkbox.addEventListener('change', (event) => {
          const selectedCheckbox = event.target;
          if (selectedCheckbox.checked) {
              const productId = selectedCheckbox.getAttribute("data-id");
              showUpdateFields(productId);
          }
      });
  });
}

// Muestra los campos para actualizar el stock cuando un producto es seleccionado
function showUpdateFields(productId) {
  document.getElementById("updateFields").style.display = "block";
  document.getElementById("submitStockUpdate").setAttribute("data-product-id", productId);
}
document.getElementById("submitStockUpdate").addEventListener("click", async () => {
  const productId = document.getElementById("submitStockUpdate").getAttribute("data-product-id");
  const quantity = document.getElementById("stockQuantity").value;
  
  // Enviar la actualización de stock al servidor
  const response = await fetch('/productos/actualizar-stock', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ id_producto: productId, cantidad: quantity })
  });

  const result = await response.json();
  if (result.success) {
      alert('Stock actualizado correctamente');
  } else {
      alert('Error al actualizar stock');
  }
});
document.addEventListener('DOMContentLoaded', () => {
  const cargarProductos = async () => {
    try {
      const response = await fetch('/productos'); // Ajusta la URL según tu endpoint
      if (!response.ok) throw new Error('Error al cargar productos');
      
      const productos = await response.json();
      mostrarProductosEnTabla(productos);

      // Evento para el filtro en tiempo real
      const searchBox = document.getElementById('search-box');
      searchBox.addEventListener('input', () => {
        const filtro = searchBox.value.toLowerCase();
        const productosFiltrados = productos.filter(producto => 
          producto.nombre_producto.toLowerCase().includes(filtro)
        );
        mostrarProductosEnTabla(productosFiltrados);
      });

    } catch (error) {
      console.error(error.message);
    }
  };

  const mostrarProductosEnTabla = (productos) => {
    const tabla = document.getElementById('inventory-table').querySelector('tbody');
    tabla.innerHTML = ''; // Limpia el contenido anterior

    productos.forEach(producto => {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${producto.id_producto}</td>
        <td>${producto.nombre_producto}</td>
        <td>${producto.categoria}</td>
        <td>${producto.precio_compra}</td>
        <td>${producto.precio_venta}</td>
        <td>${producto.stock_actual}</td>
        <td>${producto.descripcion}</td>
        <td>${producto.fecha_creacion}</td>
        <td>${producto.fecha_actualizacion}</td>
      `;
      tabla.appendChild(fila);
    });
  };

  cargarProductos();
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

  const response = await fetch('/productos/insertar-producto', {
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