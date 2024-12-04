const { format } = require('date-fns');
const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const path = require('path');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

const app = express();
const port = 3000;

// Lista de correos permitidos
const allowedEmails = ['vejar001@gmail.com', 'l20212934@tectijuana.edu.mx', 'yahir.sanchez201@tectijuana.edu.mx', 'victor.millan19@tectijuana.edu.mx', 'l20212407@tectijuana.edu.mx'];

// Configurar el cliente PostgreSQL
const client = new Client({
  user: 'postgres',
  host: '35.208.24.98',
  database: 'gestion_inventario',
  password: 'bajacar',
  port: 5432,
});

client.connect();

app.use(bodyParser.json());
app.use(express.static('public'));

// Configurar sesiones para manejar el estado del usuario
app.use(
  session({
    secret: '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', // Cambia esto por algo más seguro
    resave: false,
    saveUninitialized: true,
  })
);

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

//AQUI VAN CAMBIOS.
// Configurar Google OAuth 2.0
passport.use(
  new GoogleStrategy(
    {
      clientID: '757116200337-9n45nj3gdjvkiappi401g9pphsr6j975.apps.googleusercontent.com',
      clientSecret: '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',
      callbackURL: 'https://bajacar.net/auth/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;
      const userId = profile.id;
      const name = profile.displayName || 'Usuario';

      if (allowedEmails.includes(email)) {
        // Verifica si el usuario ya existe en la base de datos (opcional)
        try {
          const userQuery = 'SELECT * FROM usuarios WHERE id_usuario = $1';
          const userResult = await client.query(userQuery, [userId]);

          if (userResult.rows.length === 0) {
            // Si no existe, inserta un nuevo usuario
            const insertQuery = `
              INSERT INTO usuarios (id_usuario, email, nombre)
              VALUES ($1, $2, $3)
            `;
            await client.query(insertQuery, [userId, email, name]);
          }
        } catch (err) {
          console.error('Error al gestionar usuario en la base de datos:', err);
        }

        return done(null, { id: userId, email, name }); // Devuelve datos relevantes
      } else {
        return done(null, false, { message: 'Correo no autorizado' });
      }
    }
  )
);

// Serialización y deserialización de usuario
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Middleware para proteger rutas
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/google');
};

// Ruta para iniciar sesión con Google
app.get(
  '/auth/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

// Callback después de la autenticación
app.get(
  '/auth/callback',
  passport.authenticate('google', { failureRedirect: '/unauthorized' }),
  (req, res) => {
    res.redirect('/'); // Redirige al inicio después de autenticarse
  }
);

// Página de error para usuarios no autorizados
app.get('/unauthorized', (req, res) => {
  res.status(403).send('Acceso denegado: tu correo no está autorizado.');
});

// Ruta principal protegida
app.get('/', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'pagina.html'));
});
app.get('/user-info', ensureAuthenticated, async (req, res) => {
  try {
    const userId = req.user.id; // Usamos el ID de Google proporcionado por Passport
    const query = 'SELECT id_usuario, email, nombre FROM usuarios WHERE id_usuario = $1';
    const result = await client.query(query, [userId]);

    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.json({
        id: user.id_usuario,
        email: user.email,
        name: user.nombre,
      });
    } else {
      res.status(404).json({ error: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    res.status(500).json({ error: 'Error al obtener información del usuario' });
  }
});

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      console.error('Error al cerrar sesión:', err);
      return res.status(500).send('Error al cerrar sesión');
    }
    res.redirect('/auth/google'); // Redirige al inicio de sesión
  });
});

// API para agregar producto
app.post('/productos/insertar-producto', async (req, res) => {
  const { nombre_producto, categoria, precio_compra, precio_venta, stock_actual, descripcion } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO Productos (nombre_producto, categoria, precio_compra, precio_venta, stock_actual, descripcion) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [nombre_producto, categoria, precio_compra, precio_venta, stock_actual, descripcion]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al agregar el producto');
  }
});

// Otras APIs (protegidas)
app.get('/productos', ensureAuthenticated, async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM productos');
    res.json(result.rows); // Devuelve los datos como JSON
  } catch (err) {
    console.error('Error al obtener los productos:', err);
    res.status(500).send('Error al obtener los productos');
  }
});

// Ruta para buscar productos
app.get('/productos/buscar', async (req, res) => {
  const { nombre_producto } = req.query;
  try {
    const result = await client.query('SELECT * FROM Productos WHERE nombre_producto ILIKE $1', [`%${nombre_producto}%`]);
    res.json(result.rows); // Devuelve los productos encontrados como JSON
  } catch (error) {
    console.error('Error al buscar productos:', error);
    res.status(500).json({ error: 'Error al buscar productos' });
  }
});
// Ruta para actualizar el stock de un producto
app.post('/productos/actualizar-stock', async (req, res) => {
  const { id_producto, cantidad } = req.body;
  try {
      await client.query('UPDATE Productos SET stock_actual = stock_actual + $1 WHERE id_producto = $2', [cantidad, id_producto]);
      res.json({ success: true });
  } catch (error) {
      res.json({ success: false, error: error.message });
  }
});

// Ruta para eliminar un producto
app.delete('/productos/eliminar', async (req, res) => {
  const { id_producto } = req.body;
  try {
      await pool.query('DELETE FROM Productos WHERE id_producto = $1', [id_producto]);
      res.json({ success: true });
  } catch (error) {
      res.json({ success: false, error: error.message });
  }
});

app.post('/api/ventas', ensureAuthenticated, async (req, res) => {
  const { invoiceNumber, products } = req.body;

  // Crear la factura
  const userId = req.user.id_usuario;
  const queryFactura = `INSERT INTO facturas (id_usuario) VALUES ($1) RETURNING id_factura`;
  try {
      const result = await db.query(queryFactura, [userId]);
      const facturaId = result.rows[0].id_factura;

      // Insertar los productos en el detalle de la factura
      const queryDetalle = `
          INSERT INTO detalle_factura (id_factura, id_producto, cantidad)
          VALUES ($1, $2, $3)
      `;
      for (const product of products) {
          await db.query(queryDetalle, [facturaId, product.productId, product.quantity]);

          // Restar stock del inventario
          const queryStock = `
              UPDATE productos
              SET stock_actual = stock_actual - $1
              WHERE id_producto = $2
          `;
          await db.query(queryStock, [product.quantity, product.productId]);
      }

      res.status(200).send("Venta registrada correctamente.");
  } catch (error) {
      console.error("Error al registrar la venta", error);
      res.status(500).send("Error al registrar la venta.");
  }
});


// Iniciar servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${port}`);
});