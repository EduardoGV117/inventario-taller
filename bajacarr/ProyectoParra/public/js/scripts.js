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


const cargarProductosPorMes = async (mes) => {
  try {
    const response = await fetch(`/productos`); // Obtén toda la tabla sin filtrar
    if (!response.ok) throw new Error('Error al cargar productos');
    const productos = await response.json();

    console.log('Productos recibidos:', productos); // Verifica que la tabla completa se recibe correctamente

    // Filtrar productos insertados y actualizados
    const insertados = productos.filter((p) => {
      const fechaCreacion = new Date(p.fecha_creacion); // Convierte la fecha a objeto Date
      return fechaCreacion.getMonth() + 1 === parseInt(mes); // Compara el mes (getMonth es 0-indexado)
    });

    const actualizados = productos.filter((p) => {
      const fechaActualizacion = new Date(p.fecha_actualizacion); // Convierte la fecha a objeto Date
      return fechaActualizacion.getMonth() + 1 === parseInt(mes); // Compara el mes (getMonth es 0-indexado)
    });

    console.log('Insertados:', insertados); // Productos insertados en el mes seleccionado
    console.log('Actualizados:', actualizados); // Productos actualizados en el mes seleccionado

    return { insertados, actualizados };
  } catch (error) {
    console.error(error.message);
    return { insertados: [], actualizados: [] };
  }
};
const cargarVentasPorMes = async (mes) => {
  try {
    const response = await fetch(`/reporte-ventas?mes=${mes}`);
    if (!response.ok) throw new Error('Error al cargar ventas');
    const ventas = await response.json();

    console.log('Ventas recibidas:', ventas);

    return ventas;
  } catch (error) {
    console.error(error.message);
    return [];
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
  const mesSeleccionado = document.getElementById('report-month').value; // Obtener el mes seleccionado
  const { insertados, actualizados } = await cargarProductosPorMes(mesSeleccionado); // Filtrar en el frontend

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

    const headers = ['ID', 'Nombre', 'Categoría', 'Precio Compra', 'Precio Venta', 'Stock'];
    const rowsInsertados = insertados.map((p) => [
      p.id_producto,
      p.nombre_producto,
      p.categoria,
      `$${parseFloat(p.precio_compra).toFixed(2)}`,
      `$${parseFloat(p.precio_venta).toFixed(2)}`,
      p.stock_actual,
    ]);

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
    const headers = ['ID', 'Nombre', 'Categoría', 'Precio Compra', 'Precio Venta', 'Stock'];
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
    ]);

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

document.addEventListener('DOMContentLoaded', () => {
  const selectedProducts = []; // Productos seleccionados para la factura

  // Cargar productos del inventario en el selector
  const cargarProductos = async () => {
    try {
      const response = await fetch('/productos');
      if (!response.ok) throw new Error('Error al cargar productos');
      const productos = await response.json();
      const productSelect = document.getElementById('product-select');

      productos.forEach((producto) => {
        const option = document.createElement('option');
        option.value = producto.id_producto;
        option.textContent = `${producto.nombre_producto} (${producto.stock_actual} disponibles)`;
        productSelect.appendChild(option);
      });
    } catch (error) {
      console.error(error.message);
    }
  };

  // Agregar un producto a la lista de la factura
  document.getElementById('add-product').addEventListener('click', () => {
    const productSelect = document.getElementById('product-select');
    const quantity = parseInt(document.getElementById('quantity').value);
    const description = document.getElementById('description').value;

    if (!productSelect.value || !quantity || !description) {
      alert('Completa todos los campos antes de agregar un producto.');
      return;
    }

    const productId = productSelect.value;
    const productName = productSelect.options[productSelect.selectedIndex].textContent.split('(')[0].trim();

    // Agregar el producto a la lista
    selectedProducts.push({ id_producto: productId, nombre_producto: productName, cantidad: quantity, descripcion: description });

    // Mostrarlo en la tabla
    const tableBody = document.getElementById('selected-products-table').querySelector('tbody');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${productId}</td>
      <td>${productName}</td>
      <td>${quantity}</td>
      <td>${description}</td>
      <td><button class="remove-product">Eliminar</button></td>
    `;
    tableBody.appendChild(row);

    // Limpiar campos
    document.getElementById('quantity').value = '';
    document.getElementById('description').value = '';
  });

  // Finalizar la venta/baja
  document.getElementById('finalize-sale').addEventListener('click', async () => {
    const invoiceId = document.getElementById('invoice-id').value;

    if (!invoiceId || selectedProducts.length === 0) {
      alert('Debes agregar al menos un producto y proporcionar un ID de factura.');
      return;
    }

    try {
      const response = await fetch('/ventas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ invoiceId, productos: selectedProducts }),
      });

      if (!response.ok) throw new Error('Error al registrar la venta/baja.');

      alert('Venta/Baja registrada exitosamente.');
    } catch (error) {
      console.error(error.message);
      alert('Hubo un error al registrar la venta/baja.');
    }
  });

  cargarProductos();
});


// Lógica para generar el PDF del reporte de ventas
document.getElementById('sales-report-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const mes = document.getElementById('sales-report-month').value;
  const año = document.getElementById('sales-report-year').value;

  try {
    const response = await fetch(`/reporte-ventas?mes=${mes}&año=${año}`);
    if (!response.ok) throw new Error('Error al obtener el reporte de ventas.');

    const ventas = await response.json();
    const tableBody = document.getElementById('sales-report-table').querySelector('tbody');
    tableBody.innerHTML = ''; // Limpiar tabla

    ventas.forEach((venta) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${venta.id_factura_proveedor}</td>
        <td>${venta.fecha_factura}</td>
        <td>${venta.nombre_producto}</td>
        <td>${venta.cantidad}</td>
        <td>${venta.descripcion}</td>
        <td>$${parseFloat(venta.total_venta).toFixed(2)}</td>
      `;
      tableBody.appendChild(row);
    });

    // Mostrar el botón de generar PDF
    document.getElementById('generate-sales-pdf').classList.remove('hidden');
  } catch (error) {
    console.error(error.message);
    alert('Hubo un problema al generar el reporte de ventas.');
  }
});

// Lógica para generar el PDF del reporte de ventas
document.getElementById('generate-sales-pdf').addEventListener('click', () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let yOffset = 20;

  doc.setFontSize(16);
  doc.text('Reporte Mensual de Ventas/Bajas - Bajacar', 10, yOffset);
  doc.setFontSize(12);
  doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 10, yOffset + 10);
  yOffset += 20;

  // Obtener filas de la tabla
  const tableRows = document.querySelectorAll('#sales-report-table tbody tr');

  // Si hay ventas en la tabla, generamos el reporte
  if (tableRows.length > 0) {
    const headers = ['ID Factura', 'Fecha', 'Producto', 'Cantidad', 'Descripción', 'Total'];
    const rows = Array.from(tableRows).map((row) => {
      const cols = row.querySelectorAll('td');
      return [
        cols[0].innerText, // ID Factura
        cols[1].innerText, // Fecha
        cols[2].innerText, // Producto
        cols[3].innerText, // Cantidad
        cols[4].innerText, // Descripción
        cols[5].innerText, // Total
      ];
    });

    doc.autoTable({
      head: [headers],
      body: rows,
      startY: yOffset,
    });

    yOffset = doc.lastAutoTable.finalY + 10;
  } else {
    doc.text('No hay ventas registradas para este mes.', 10, yOffset);
  }

  // Guardar el PDF
  doc.save('Reporte_Ventas_Bajas.pdf');
});
