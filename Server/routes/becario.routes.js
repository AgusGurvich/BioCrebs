import { Router } from "express";
import { pool } from "../db.js";
import tma from "timeago.js";
const {timeago} = tma;
import auth from "../lib/auth.js"; 
import multer from 'multer';
import fs from 'fs';
import { v4 } from "uuid";
const router = Router();



router.get("/seleccion", (req,res)=> {
    res.render('seleccion');
});

router.get("/dashboard",  auth.isLoggedIn, auth.isBecario , async (req,res)=> {
    
    res.render('dashboard');
});


router.get("/historial_pendientes", auth.isLoggedIn, auth.isBecario , async (req,res)=> {
    const result = await pool.query('SELECT * FROM pedidos WHERE Estado = "Pendiente"');
    console.log(result[0][0]);

    let pedidos = result[0];
    console.log(pedidos);
    res.render('dashHistorial', {
        pedidos : pedidos
    });
}) 

router.get("/usuario/historial/:id", auth.isLoggedIn, auth.isBecario , async (req,res)=> {
    const { id } = req.params;
    console.log(id);
    const result = await pool.query('SELECT * FROM pedidos WHERE user_id = ?', [id]);
    console.log(result[0]);

    let pedidos = result[0];
    console.log(pedidos);
    res.render('dashHistorial', {
        pedidos : pedidos
    });
}) 


router.get("/cargar_cuenta",  auth.isLoggedIn, auth.isBecario , (req,res)=> {
    res.render("dashboard_cargarSaldo");
})

router.get("/historial_general", async (req,res)=> {

    const result = await pool.query('SELECT  * FROM pedidos');
    let pedidos = result[0];
    res.render('dashHistorial', {
        pedidos:pedidos
    });
})

router.get("/usuarios", auth.isLoggedIn, auth.isBecario , async (req,res)=> {
    

    const result = await pool.query('SELECT * FROM users WHERE licencia = 1');
    let usuarios = result[0];
    console.log(usuarios);
    res.render("dashboard_Usuarios", {
        usuarios : usuarios
    });
})

router.get("/usuariosFetch", auth.isBecario, auth.isLoggedIn , async (req,res)=> {
    console.log("hola");
    const result = await pool.query('SELECT * FROM users');
    let usuarios = result[0];
    console.log(usuarios);
    res.send(usuarios);

});


router.get("/usuario/:DNI", auth.isLoggedIn, auth.isBecario ,  async (req, res) => {
    const DNI = req.params.DNI;
    const selectQuery = 'SELECT * FROM users WHERE DNI = ?'
    const results = await pool.query(selectQuery, [DNI]);

    const usuario = results[0][0];
    
    res.render("usuario", {
        usuario : usuario
    });
})

router.get("/IngresarPedido", auth.isLoggedIn, auth.isBecario , (req,res)=> {
    res.render("dashIngresarPedido");
})

const upload = multer({ dest: 'uploads/' });

router.post("/pedidoFromDash", auth.isBecario, upload.single('archivo'), async (req, res) => {
    const archivo = req.file;
    const DNI = req.body.DNI;

    //Obtener el id from USERDNI
    const userIDQuery = 'SELECT id FROM users WHERE DNI = ?';
    const resultUserID = await pool.query(userIDQuery, [DNI])
    const id = resultUserID[0][0].id;
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
    res.redirect("/dashboard");
})



router.put("/nuevaCarga", auth.isBecario , async (req,res)=> {
    // Definiciones
    const nuevaCarga = req.body.valor;
    const userID = req.body.id;
    const { DNI } = req.body;

    //Consultar Saldo
    const selectQuery = 'SELECT saldo FROM users WHERE id = ? '
    const saldoActual = await pool.query(selectQuery, [userID]);
    const nuevoSaldo = saldoActual[0][0].saldo + parseInt(nuevaCarga);
   
    // Actualizar saldo
    const updateQuery = 'UPDATE users SET saldo = ' + nuevoSaldo + ' WHERE id = ' + userID;  
    await pool.query(updateQuery);

    // Obtener DNI
    const redirectURL = `/usuario/${DNI}`;
    res.redirect(redirectURL);
})
  

router.get("/Dashpedido/:id", auth.isLoggedIn, auth.isBecario , async (req, res)=> {
    const {id} = req.params;

    const selectQuery = 'SELECT * FROM pedidos WHERE id = ?';
    const result = await pool.query(selectQuery, [id]);

    const pedido = result[0][0];
    const user_id = result[0][0].user_id;
    console.log(user_id);
    const userQuery = 'SELECT * FROM users WHERE id = ?';
    const user = await pool.query(userQuery, [user_id]);
    const UserInformation = user[0][0];
 
    res.render('dashHistorialUnidad', {
        pedido : pedido,
        user : UserInformation
    })

});

router.put('/pedido/changeEstado/:id', async (req,res) => {
    const { id } = req.params;
    const estadoQuery = 'SELECT estado FROM pedidos WHERE id = ?';
    const result = await pool.query(estadoQuery, [id]);
    const estado = result[0][0].estado;

    if(estado == 'Pendiente') {
        const changeQuery = "UPDATE pedidos SET estado = 'Listo' WHERE id = ?";
        const changeResult = await pool.query(changeQuery, [id]);
        
    }
    if (estado == 'Listo') {
        const changeQuery = "UPDATE pedidos SET estado = 'Pendiente' WHERE id = ?";
        const changeResult = await pool.query(changeQuery, [id]);
        
    }

    const redirectURL = `/Dashpedido/${id}`;
    res.redirect(redirectURL);
});

router.put('/pedido/changePrecio/:id/:newPrice', async (req,res) => {
    const { id , newPrice } = req.params;

    console.log('llego el pedido');
    console.log(id);
    console.log(newPrice);

    const changeQuery = `UPDATE pedidos SET precio = ? WHERE id = ${id}`;
    const result = await pool.query(changeQuery, [newPrice]);

    console.log(result);
    const redirectURL = `/Dashpedido/${id}`;
    res.redirect(redirectURL);
});

router.put('/Dashpedido/dash/senarPedido/:id', auth.isLoggedIn , async (req, res) => {
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

    const redirectURL = `/Dashpedido/${id}`;
    res.redirect(redirecTURL);
});

router.put('/Dashpedido/dash/pagarPedido/:id', auth.isLoggedIn , async (req, res) => {
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
 

    const redirectURL = `/Dashpedido/${id}`;
    res.redirect(redirecTURL);
});


export default router;