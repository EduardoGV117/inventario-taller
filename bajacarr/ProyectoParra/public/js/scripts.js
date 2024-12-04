const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');

// Asegúrate de que los modales están ocultos al principio
document.getElementById('custom-modal').classList.add('hidden');
document.getElementById('stock-modal').classList.add('hidden');

// Gestión de la navegación de secciones
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const targetSectionId = btn.dataset.target;
    const targetSection = document.getElementById(targetSectionId);

    // Remover la clase activa de todas las secciones
    sections.forEach(section => {
      section.classList.remove('active-section');
    });

    // Agregar la clase activa a la sección seleccionada
    targetSection.classList.add('active-section');
  });
});

// Cargar productos
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
      showStockModal(id); // Mostrar el modal de stock con el ID del producto
      return { id, amount: parseInt(amount, 10) }; // Asumimos que 'amount' es el valor ingresado en el modal
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

// Mostrar y cerrar modales
function showModal(message) {
  const modal = document.getElementById('custom-modal');
  const messageElement = document.getElementById('custom-modal-message');
  messageElement.textContent = message;
  modal.classList.remove('hidden'); // Mostrar el modal
}

function closeModal() {
  document.getElementById('custom-modal').classList.add('hidden');
}

// Mostrar modal de stock
let productIdToUpdate = null;
function showStockModal(productId) {
  const modal = document.getElementById('stock-modal');
  const messageElement = document.getElementById('stock-modal-message');
  const inputField = document.getElementById('stock-input');
  
  productIdToUpdate = productId;
  messageElement.textContent = `¿Cuánto deseas agregar al stock del producto ${productId}?`;
  inputField.value = ''; // Limpiar el campo de entrada
  modal.classList.remove('hidden'); // Mostrar el modal
}

// Cerrar el modal de stock
function closeStockModal() {
  document.getElementById('stock-modal').classList.add('hidden');
}

// Agregar evento para aceptar la actualización del stock
document.getElementById('modal-accept').addEventListener('click', async () => {
  const quantity = parseInt(document.getElementById('stock-input').value, 10);

  if (!quantity || quantity <= 0) {
    showStockModal("Por favor ingresa una cantidad válida.");
    return;
  }

  const response = await fetch('/productos/actualizar-stock', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id_producto: productIdToUpdate, cantidad: quantity })
  });

  const result = await response.json();
  
  if (result.success) {
    showModal('Stock actualizado correctamente');
  } else {
    showModal('Error al actualizar stock');
  }

  closeStockModal(); // Cerrar el modal después de la acción
});

// Cerrar modales al hacer clic fuera de ellos
document.getElementById('custom-modal').addEventListener('click', (event) => {
  if (event.target === event.currentTarget) closeModal();
});
document.getElementById('stock-modal').addEventListener('click', (event) => {
  if (event.target === event.currentTarget) closeStockModal();
});
