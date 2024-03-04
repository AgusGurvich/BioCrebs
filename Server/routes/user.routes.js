import { Router } from "express";
import { pool } from "../db.js";
import multer from 'multer';
import fs from 'fs';
import { v4 } from "uuid";
import auth from "../lib/auth.js"; 

import tma from "timeago.js";
import { ResultWithContextImpl } from "express-validator/src/chain/context-runner-impl.js";
const {timeago} = tma;
import session from "express-session";
import { log } from "console";

const router = Router();


router.get("/inicio", auth.isLoggedIn , auth.isUser ,async (req,res)=>{ // Primero Voy a hacer la consulta a la sesion de que usuario se trata y luego voy a pedir que devuelva ese nombre.
    if(auth.chooseIndex(req)) {
        res.redirect('/dashboard');
    }
    res.render('index');
});

router.get("/Como_funciona", auth.isLoggedIn, auth.isUser ,(req,res)=> { 
    res.render('Como_funciona');
})

router.get("/pedido",  auth.isLoggedIn, auth.isUser , (req,res)=> {
    res.render('pedido');
})


const upload = multer({ dest: 'uploads/' });

router.post("/pedido", auth.isUser, upload.single('archivo'), async (req, res) => {
    const archivo = req.file;
    const user = req.user;
    console.log(req.user.id);
    const id = req.user.id;
    const ahora = new Date();
    const fechaHora = ahora.toISOString().slice(0, 19).replace('T', ' '); // Convierte a formato  
    console.log(fechaHora);

    if(archivo) {
        console.log('archivo positivo');
        const { originalname, mimetype, size } = archivo;
        const { select, copias, Descripcion, selectFaz, precio, Tipo, Anillado, Fotocopiadora } = req.body;
        let {Link} = req.body;
        const nombreArchivo = v4(); // Generar un nombre único para el archivo
        // Mover el archivo cargado a una ubicación permanente
        fs.renameSync(archivo.path, `uploads/${nombreArchivo}`);
    
        if(!Link) {
            Link = "No hay Link disponible";
        }
        
        // Insertar metadatos del archivo en la base de datos
        const insertQuery = 'INSERT INTO pedidos (tipo, precio, descripción, copias, tipo_impresion, user_id, nombre, nombre_archivo, tamaño, formato, anillado, link, fotocopiadora, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
        await pool.query(insertQuery, [mimetype, precio, Descripcion, copias, selectFaz, id, originalname , nombreArchivo, size, Tipo, Anillado, Link, Fotocopiadora, fechaHora], (err, result) => {
          if (err) { 
            console.error('Error al insertar datos en la base de datos:', err);
            res.status(500).send('Error interno del servidor'); 
            return;
          }
          console.log('Archivo subido correctamente.');
        });
    }
    else {
        console.log('archivo negativo');
        const nombre = "Archivo en Link";
        
        const { select, copias, Descripcion, selectFaz, precio, Tipo, Link, Anillado, Fotocopiadora } = req.body;
        const insertQuery = 'INSERT INTO pedidos (precio, descripción, copias, tipo_impresion, user_id, formato, anillado, link, nombre, fotocopiadora, fecha) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';
        await pool.query(insertQuery, [precio, Descripcion, copias, selectFaz, id, Tipo, Anillado, Link, nombre, Fotocopiadora, fechaHora], (err, result) => {
          if (err) { 
            console.error('Error al insertar datos en la base de datos:', err);
            res.status(500).send('Error interno del servidor'); 
            return;
          }
          console.log('Archivo subido correctamente.');
        });
    }
   
    req.flash('success', 'Pedido enviado correctamente');
    res.redirect("/inicio");
})

router.get('/download/:nombreArchivo', auth.isLoggedIn, auth.isUser ,  async (req, res)  => {
    const nombreArchivo = req.params.nombreArchivo;
  
    // Buscar el nombre del archivo en la base de datos
    const selectQuery = 'SELECT nombre, tipo FROM pedidos WHERE nombre_archivo = ?';

    const results = await pool.query(selectQuery, [nombreArchivo]);
      const { nombre, tipo } = results[0][0];
      const path = `uploads/${nombreArchivo}`;
      // Envía el archivo como respuesta
      res.setHeader('Content-disposition', `attachment; filename=${nombre}`);
      res.setHeader('Content-type', tipo);
      fs.createReadStream(path).pipe(res);
    });



router.get("/cargar_saldo", auth.isLoggedIn, auth.isUser , (req,res)=> {
    res.render('cargar_saldo');
})

router.get("/historial", async (req,res)=> {
    const id = req.user.id;
    const pedidosQuery = 'SELECT * FROM pedidos WHERE user_id = ?';
    const result = await pool.query(pedidosQuery, [id]);


    let pedidos = result[0];

    res.render('historial', {
        pedidos : pedidos
    });
}) 


router.get("/pedido/:id", auth.isLoggedIn, auth.isUser , async (req, res)=> {
    const {id} = req.params;

    const selectQuery = 'SELECT * FROM pedidos WHERE id = ?';
    const result = await pool.query(selectQuery, [id]);

    const pedido = result[0][0];
    const user_id = result[0][0].user_id;
    console.log(user_id);
    const userQuery = 'SELECT nombre, saldo FROM users WHERE id = ?';
    const user = await pool.query(userQuery, [user_id]);
    const UserInformation = user[0][0];

    res.render('userHistorialUnidad', {
        pedido : pedido,
        user : UserInformation
    })
}); 

router.get("/pedidoInformation/:id", auth.isLoggedIn , async (req, res)=> {
    const pedidoID = req.params.id;
    const precioQuery = 'SELECT precio, estadoPago, user_id FROM pedidos WHERE id = ?';
    const pedidoResult = await pool.query(precioQuery, [pedidoID]);
    const userID = pedidoResult[0][0].user_id;

    const saldoQuery = 'SELECT saldo FROM users Where id = ?';
    const userResult = await pool.query(saldoQuery, [userID]);
     
    const information = {
        precio : pedidoResult[0][0].precio,
        estadoPago: pedidoResult[0][0].estadoPago,
        saldo : userResult[0][0].saldo
    }
    res.send(information);
});


router.put('/senarPedido/:id', auth.isLoggedIn , async (req, res) => {
    const { id } = req.params;
    const redirecTURL =  `/pedido/${id}`;
    console.log(id);
    console.log('PETICION LLEGANDO A DASH');
   
    const precioQuery = 'SELECT precio, user_id FROM pedidos WHERE id = ?';
    const pedidoResult = await pool.query(precioQuery, [id]);
    const userID = pedidoResult[0][0].user_id;
    const precio = pedidoResult[0][0].precio;
    const saldoQuery = 'SELECT saldo FROM users Where id = ?';
    const userResult = await pool.query(saldoQuery, [userID]);
    const saldo = userResult[0][0].saldo;
    
    if(saldo > precio) {
        const sena = precio/2;
        const nuevoSaldo = saldo - sena;
        const changeQuery = `UPDATE pedidos SET precio = ? WHERE id = ${id}`;
        const result = await pool.query(changeQuery, [sena]);
        const changeStateQuery = `UPDATE pedidos SET estadoPago = 'Señado'  WHERE id = ${id}`;
        const resultState = await pool.query(changeStateQuery);
        console.log('correctamente señado');
        const changePriceQuery = `UPDATE users SET saldo = ? WHERE id = ${userID}`;
        const resultPrice = await pool.query(changePriceQuery, [nuevoSaldo]);
        console.log('saldo correctamente actualizado');
    } 

    const redirectURL = `/pedido/${id}`;
    res.redirect(redirecTURL);
});

router.put('/pagarPedido/:id', auth.isLoggedIn , async (req, res) => {
    const { id } = req.params;
    const redirecTURL =  `/pedido/${id}`;
    console.log(id);
    console.log('PETICION LLEGANDO A user');

   
    const precioQuery = 'SELECT precio, user_id FROM pedidos WHERE id = ?';
    const pedidoResult = await pool.query(precioQuery, [id]);
    const userID = pedidoResult[0][0].user_id;
    const precio = pedidoResult[0][0].precio;
    const saldoQuery = 'SELECT saldo FROM users Where id = ?';
    const userResult = await pool.query(saldoQuery, [userID]);
    const saldo = userResult[0][0].saldo;

    if(saldo > precio) {
        const newPrice = 0;
        const nuevoSaldo = saldo - precio;
        const changeQuery = `UPDATE pedidos SET precio = ? WHERE id = ${id}`;
        const result = await pool.query(changeQuery, [newPrice]);
        const changeStateQuery = `UPDATE pedidos SET estadoPago = 'Abonado'  WHERE id = ${id}`;
        const resultState = await pool.query(changeStateQuery);
        console.log('precio actualizado');
        const changePriceQuery = `UPDATE users SET saldo = ? WHERE id = ${userID}`;
        const resultPrice = await pool.query(changePriceQuery, [nuevoSaldo]);
        console.log('saldo correctamente actualizado');
    }
 

    const redirectURL = `/pedido/${id}`;
    res.redirect(redirecTURL);
});

router.get("/cuenta", (req,res) => {
    res.render('cuenta');
});




export default router;