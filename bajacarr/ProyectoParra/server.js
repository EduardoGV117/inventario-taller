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
// Ruta para obtener información del usuario autenticado
app.get('/user-info', ensureAuthenticated, (req, res) => {
  try {
    const { id_usuario: id, email, nombre } = req.user; // Asumiendo que estos campos están en `req.user`
    res.json({
      id,
      email,
      name: nombre, // Enviar el nombre completo
    });
  } catch (error) {
    console.error('Error al obtener información del usuario:', error);
    res.status(500).json({ error: 'Error al obtener información del usuario' });
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


// Iniciar servidor
app.listen(port, '0.0.0.0', () => {
  console.log(`Servidor escuchando en http://0.0.0.0:${port}`);
});