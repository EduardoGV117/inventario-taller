const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const { Pool } = require('pg'); // Para manejar PostgreSQL

const app = express();
const port = 3000;

// Configurar body-parser para procesar datos del formulario
app.use(bodyParser.urlencoded({ extended: true }));

// Configurar carpeta de archivos estáticos (CSS, JS, imágenes)
app.use(express.static(path.join(__dirname, 'public')));


// Configuración de la conexión a PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'bajacardb',
  password: 'elcompar5',
  port: 5432, // Puerto por defecto de PostgreSQL
});

// Ruta para servir el HTML de login
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'login.html')); // Cambia a la ruta donde está tu login.html
});

// Ruta para manejar el POST del login
app.post('/login', (req, res) => {
  const { username, password } = req.body;

  pool.query(
    'SELECT id, nombre_usuario, nombre_completo, rol FROM usuarios WHERE nombre_usuario = $1 AND contrasena = $2',
    [username, password],
    (error, results) => {
      if (error) {
        throw error;
      }

      if (results.rows.length > 0) {
        const usuario = results.rows[0];
        // Respuesta JSON para indicar éxito
        res.json({ success: true, message: 'Inicio de sesión exitoso', nombre: usuario.nombre_completo });
      } else {
        // Si las credenciales son incorrectas, enviar respuesta JSON con error
        res.json({ success: false, message: 'Usuario o contraseña incorrectos' });
      }
    }
  );
});

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor corriendo en http://localhost:${port}`);
});
