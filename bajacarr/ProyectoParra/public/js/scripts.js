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

// Cargar cliente de Google
function handleClientLoad() {
  gapi.load('auth2', function() {
      gapi.auth2.init({
          client_id: '757116200337-9n45nj3gdjvkiappi401g9pphsr6j975.apps.googleusercontent.com',
      }).then(function() {
          // Si el usuario ya está logueado, mostramos su información
          const authInstance = gapi.auth2.getAuthInstance();
          if (authInstance.isSignedIn.get()) {
              onSignIn(authInstance.currentUser.get());
          }
      });
  });
}

// Manejar el inicio de sesión
function onSignIn(googleUser) {
  const profile = googleUser.getBasicProfile();
  const userId = profile.getId();  // ID del usuario de Google
  const userEmail = profile.getEmail();  // Correo del usuario
  const userInitial = profile.getGivenName().charAt(0).toUpperCase();  // Inicial del usuario

  // Mostrar la inicial y el correo del usuario
  document.getElementById('user-initial').textContent = userInitial;
  document.getElementById('user-email').textContent = userEmail;
  document.getElementById('user-email').href = `mailto:${userEmail}`;
  document.getElementById('user-dropdown').style.display = 'block';

  // Enviar el ID del usuario a tu servidor para guardarlo en la base de datos
  fetch('/guardar-usuario', {
      method: 'POST',
      headers: {
          'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId: userId, email: userEmail })
  }).then(response => response.json())
    .then(data => console.log('Usuario guardado:', data))
    .catch(error => console.error('Error al guardar el usuario:', error));
}

// Manejar cierre de sesión
function signOut() {
  const authInstance = gapi.auth2.getAuthInstance();
  authInstance.signOut().then(function () {
      console.log('Usuario desconectado');
      document.getElementById('user-initial').textContent = '';
      document.getElementById('user-dropdown').style.display = 'none';
  });
}

// Asociar el evento de cierre de sesión al botón
document.getElementById('logout-btn').addEventListener('click', signOut);

// Inicializar cliente de Google
handleClientLoad();

