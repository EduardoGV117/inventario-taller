const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const path = require('path');  // Asegúrate de requerir 'path'

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

// Ruta para servir la página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'pagina.html'));
});

// API para obtener productos
app.get('/productos', async (req, res) => {
  try {
    const result = await client.query('SELECT * FROM Productos');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener productos');
  }
});

// API para agregar producto
app.post('/productos', async (req, res) => {
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

// API para registrar venta
app.post('/ventas', async (req, res) => {
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
