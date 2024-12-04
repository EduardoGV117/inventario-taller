const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
// Asegúrate de que los modales están ocultos al principio


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
  const searchForm = document.getElementById('search-form');
  const searchInput = document.getElementById('search-input');
  const productsTableBody = document.querySelector('#products-table tbody');
  const selectAllCheckbox = document.getElementById('select-all');
  const updateStockButton = document.getElementById('update-stock');
  const deleteProductsButton = document.getElementById('delete-products');

  // Cargar productos desde la API
  const loadProducts = async (query = '') => {
    const response = await fetch(`/productos/buscar?nombre_producto=${query}`);
    const products = await response.json();
    renderProducts(products);
  };

  // Renderizar productos en la tabla
  const renderProducts = (products) => {
    productsTableBody.innerHTML = '';
    products.forEach((product) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><input type="checkbox" data-id="${product.id_producto}" /></td>
        <td>${product.nombre_producto}</td>
        <td>${product.categoria}</td>
        <td>${product.precio_compra}</td>
        <td>${product.precio_venta}</td>
        <td>${product.stock_actual}</td>
        <td>
          <button class="update-stock-btn" data-id="${product.id_producto}">Actualizar Stock</button>
        </td>
      `;
      productsTableBody.appendChild(row);
    });
  };

  // Manejar búsqueda
  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = searchInput.value.trim();
    loadProducts(query);
  });

  // Manejar actualización de stock
  updateStockButton.addEventListener('click', async () => {
    const selected = [...document.querySelectorAll('#products-table tbody input[type="checkbox"]:checked')];
    const updates = selected.map((checkbox) => {
      const id = checkbox.dataset.id;
      const amount = prompt(`¿Cuánto deseas agregar al stock del producto ${id}?`);
      return { id, amount: parseInt(amount, 10) };
    });

    for (const update of updates) {
      await fetch('/productos/actualizar-stock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_producto: update.id, cantidad: update.amount }),
      });
    }

    loadProducts();
  });

  // Manejar eliminación de productos
  deleteProductsButton.addEventListener('click', async () => {
    const selected = [...document.querySelectorAll('#products-table tbody input[type="checkbox"]:checked')];
    const ids = selected.map((checkbox) => checkbox.dataset.id);

    for (const id of ids) {
      await fetch('/productos/eliminar', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_producto: id }),
      });
    }
    loadProducts();
  });

  // Seleccionar/deseleccionar todos los checkboxes
  selectAllCheckbox.addEventListener('change', (e) => {
    const checkboxes = document.querySelectorAll('#products-table tbody input[type="checkbox"]');
    checkboxes.forEach((checkbox) => (checkbox.checked = e.target.checked));
  });

  // Inicializar con todos los productos
  loadProducts();
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

  const formatearFechaConHora = (fechaISO) => {
    const opciones = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit' 
    }; // Incluye formato de hora
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString('es-MX', opciones); // Ejemplo: "3 de diciembre de 2024, 12:34:56"
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
        <td>${formatearFechaConHora(producto.fecha_creacion)}</td>
        <td>${formatearFechaConHora(producto.fecha_actualizacion)}</td>
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


const cargarProductosPorMes = async (mes) => {
  try {
    const response = await fetch(`/productos?mes=${mes}`);
    if (!response.ok) throw new Error('Error al cargar productos');
    const productos = await response.json();
    console.log('Productos recibidos:', productos);  // Agrega este log para verificar los productos

    // Categorizar productos
    const insertados = productos.filter((p) => p.tipo_cambio === 'insertado');
    const actualizados = productos.filter((p) => p.tipo_cambio === 'actualizado');

    return { insertados, actualizados };
  } catch (error) {
    console.error(error.message);
    return { insertados: [], actualizados: [] };
  }
};
const mostrarProductosEnTablas = (insertados, actualizados) => {
  const tablaInsertados = document.getElementById('tabla-insertados').querySelector('tbody');
  const tablaActualizados = document.getElementById('tabla-actualizados').querySelector('tbody');

  // Limpiar las tablas antes de llenarlas
  tablaInsertados.innerHTML = '';
  tablaActualizados.innerHTML = '';

  // Insertar productos en la tabla de insertados
  insertados.forEach((p) => {
    const fila = `<tr>
      <td>${p.id_producto}</td>
      <td>${p.nombre_producto}</td>
      <td>${p.categoria}</td>
      <td>$${p.precio_compra.toFixed(2)}</td>
      <td>$${p.precio_venta.toFixed(2)}</td>
      <td>${p.stock_actual}</td>
    </tr>`;
    tablaInsertados.innerHTML += fila;
  });

  // Insertar productos en la tabla de actualizados
  actualizados.forEach((p) => {
    const fila = `<tr>
      <td>${p.id_producto}</td>
      <td>${p.nombre_producto}</td>
      <td>${p.categoria}</td>
      <td>$${p.precio_compra.toFixed(2)}</td>
      <td>$${p.precio_venta.toFixed(2)}</td>
      <td>${p.stock_actual}</td>
    </tr>`;
    tablaActualizados.innerHTML += fila;
  });
};
document.getElementById('generate-pdf').addEventListener('click', async () => {
  const mesSeleccionado = document.getElementById('report-month').value;
  const { insertados, actualizados } = await cargarProductosPorMes(mesSeleccionado); // Obtener productos filtrados

  console.log('Insertados:', insertados); // Verifica los productos insertados
  console.log('Actualizados:', actualizados); // Verifica los productos actualizados

  // Crear PDF
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let yOffset = 20;

  doc.setFontSize(16);
  doc.text('Reporte Mensual de Inventario - Bajacar', 10, yOffset);
  doc.setFontSize(12);
  doc.text(`Mes: ${mesSeleccionado} - Generado el: ${new Date().toLocaleDateString()}`, 10, yOffset + 10);
  yOffset += 20;

  // Si hay productos insertados, agregarlos a la tabla
  if (insertados.length > 0) {
    doc.setFontSize(14);
    doc.text('Productos Insertados:', 10, yOffset);
    yOffset += 10;

    const headers = ['ID', 'Nombre', 'Categoría', 'Precio Compra', 'Precio Venta', 'Stock', 'Descripción'];
    const rowsInsertados = insertados.map((p) => [
      p.id_producto,
      p.nombre_producto,
      p.categoria,
      `$${parseFloat(p.precio_compra).toFixed(2)}`, // Asegúrate de que sean números
      `$${parseFloat(p.precio_venta).toFixed(2)}`,
      p.stock_actual,
      p.descripcion,
    ]);

    console.log('Rows Insertados:', rowsInsertados); // Verifica cómo se ven los datos antes de pasarlos a autoTable

    doc.autoTable({
      head: [headers],
      body: rowsInsertados,
      startY: yOffset,
    });

    yOffset = doc.lastAutoTable.finalY + 10;
  } else {
    console.log('No hay productos insertados para este mes.');
  }

  // Si hay productos actualizados, agregarlos a la tabla
  if (actualizados.length > 0) {
    doc.setFontSize(14);
    doc.text('Productos Actualizados:', 10, yOffset);
    yOffset += 10;

    const rowsActualizados = actualizados.map((p) => [
      p.id_producto,
      p.nombre_producto,
      p.categoria,
      `$${parseFloat(p.precio_compra).toFixed(2)}`,
      `$${parseFloat(p.precio_venta).toFixed(2)}`,
      p.stock_actual,
      p.descripcion,
    ]);

    console.log('Rows Actualizados:', rowsActualizados); // Verifica cómo se ven los datos antes de pasarlos a autoTable

    doc.autoTable({
      head: [headers],
      body: rowsActualizados,
      startY: yOffset,
    });

    yOffset = doc.lastAutoTable.finalY + 10;
  } else {
    console.log('No hay productos actualizados para este mes.');
  }

  // Guardar el PDF
  doc.save(`Reporte_Mensual_Inventario_Mes_${mesSeleccionado}.pdf`);
});