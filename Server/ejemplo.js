const express = require('express');
const bodyParser = require('body-parser');
const multer = require('multer');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const mysql = require('mysql');
import timeago from 'timeago.js';

const timeagoInstance = timeago();

// Configuración de la base de datos
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'usuario',
  password: 'contraseña',
  database: 'basededatos'
});

connection.connect(err => {
  if (err) {
    console.error('Error al conectar a la base de datos:', err);
    return;
  }
  console.log('Conexión a la base de datos establecida.');
});

// Configuración de multer para manejar la carga de archivos
const upload = multer({ dest: 'uploads/' });

// Configuración de Express
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Ruta para la carga de archivos
app.post('/upload', upload.single('archivo'), (req, res) => {
  const archivo = req.file;
  const { originalname, mimetype, size } = archivo;
  const nombreArchivo = uuidv4(); // Generar un nombre único para el archivo

  // Mover el archivo cargado a una ubicación permanente
  fs.renameSync(archivo.path, `uploads/${nombreArchivo}`);

  // Insertar metadatos del archivo en la base de datos
  const insertQuery = 'INSERT INTO archivos (nombre, tipo, tamaño, nombre_archivo) VALUES (?, ?, ?, ?)';
  connection.query(insertQuery, [originalname, mimetype, size, nombreArchivo], (err, result) => {
    if (err) {
      console.error('Error al insertar datos en la base de datos:', err);
      res.status(500).send('Error interno del servidor');
      return;
    }
    console.log('Archivo subido correctamente.');
    res.send('Archivo subido correctamente');
  });
});

// Ruta para la descarga de archivos
app.get('/download/:nombreArchivo', (req, res) => {
  const nombreArchivo = req.params.nombreArchivo;

  // Buscar el nombre del archivo en la base de datos
  const selectQuery = 'SELECT nombre, tipo FROM archivos WHERE nombre_archivo = ?';
  connection.query(selectQuery, [nombreArchivo], (err, results) => {
    if (err) {
      console.error('Error al buscar datos en la base de datos:', err);
      res.status(500).send('Error interno del servidor');
      return;
    }

    if (results.length === 0) {
      res.status(404).send('Archivo no encontrado');
      return;
    }

    const { nombre, tipo } = results[0];
    const path = `uploads/${nombreArchivo}`;

    // Envía el archivo como respuesta
    res.setHeader('Content-disposition', `attachment; filename=${nombre}`);
    res.setHeader('Content-type', tipo);
    fs.createReadStream(path).pipe(res);
  });
});

// Iniciar el servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${PORT}`);
});

 


// pasar del timestamp mysql a milisegundos 
const fechaString = '2024-03-07 15:30:00';
const partesFecha = fechaString.split(' ');
const partesFechaNum = partesFecha[0].split('-').map(Number);
const partesHoraNum = partesFecha[1].split(':').map(Number);

const fecha = new Date(partesFechaNum[0], partesFechaNum[1] - 1, partesFechaNum[2], partesHoraNum[0], partesHoraNum[1], partesHoraNum[2]);
const timestampEnSegundos = fecha.getTime() / 1000; // Convertir a segundos dividiendo por 1000
console.log(timestampEnSegundos);
