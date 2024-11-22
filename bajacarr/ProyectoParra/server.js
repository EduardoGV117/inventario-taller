const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const path = require('path');  // Asegúrate de requerir 'path'
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');

const app = express();
const port = 3000;

// Configurar el cliente PostgreSQL
const client = new Client({
  user: 'postgres',
  host: '35.208.24.98',
  database: 'gestion_inventario',
  password: 'bajacar',
  port: 5432,
});

client.connect();

app.use(bodyParser.json());  // Para leer datos JSON desde el frontend
app.use(express.static('public'));  // Servir archivos estáticos (HTML, CSS, JS)

// Configurar sesiones para manejar el estado del usuario
app.use(session({
  secret: 'tu_secreto_seguro', // Cambia esto por algo más seguro
  resave: false,
  saveUninitialized: true,
}));

// Inicializar Passport para autenticación
app.use(passport.initialize());
app.use(passport.session());

// Configurar Google OAuth 2.0
passport.use(new GoogleStrategy({
  clientID: '757116200337-9n45nj3gdjvkiappi401g9pphsr6j975.apps.googleusercontent.com', // Reemplaza con tu Client ID
  clientSecret: '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', // Reemplaza con tu Client Secret
  callbackURL: 'http://35.202.169.169:3000//auth/callback', // Ruta de redirección
}, (accessToken, refreshToken, profile, done) => {
  done(null, profile); // Puedes personalizar cómo manejar el perfil del usuario aquí
}));

// Serialización y deserialización de usuario
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

// Middleware para proteger rutas
const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/google'); // Redirige a la autenticación si no está autenticado
};

// Ruta para iniciar sesión con Google
app.get('/auth/google', passport.authenticate('google', {
  scope: ['profile', 'email'],
}));

// Callback después de la autenticación
app.get('/auth/callback', passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/'); // Redirige al inicio después de autenticarse
  });

// Ruta para cerrar sesión
app.get('/logout', (req, res) => {
  req.logout(() => res.redirect('/')); // Cierra sesión y redirige
});

// Ruta para servir la página principal (protegida)
app.get('/', ensureAuthenticated, (req, res) => {
  res.sendFile(path.join(__dirname, 'pagina.html'));
});

// API para obtener productos (protegida)
app.get('/productos', ensureAuthenticated, async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM Productos');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener productos');
  }
});

// API para agregar producto (protegida)
app.post('/productos', ensureAuthenticated, async (req, res) => {
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

// API para registrar venta (protegida)
app.post('/ventas', ensureAuthenticated, async (req, res) => {
  const { id_producto, cantidad, total, id_usuario } = req.body;
  try {
    const result = await client.query(
      'INSERT INTO Ventas (id_producto, cantidad, total, id_usuario) VALUES ($1, $2, $3, $4) RETURNING *',
      [id_producto, cantidad, total, id_usuario]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al registrar la venta');
  }
});

// Iniciar servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${port}`);
});
