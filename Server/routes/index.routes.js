import {Router} from 'express';
import { pool } from '../db.js';
const router = Router();

router.get("/cancion/para/mi/muerte", async (req, res) => {
    res.render('ingresoControl');
});

router.get('/control', (req, res) => {
    res.render('control');
});

router.get('/crearBecario', (req, res) => {
    res.render('crearBecario');
});



// Tambien podriamos usar
//[rows] paara devolver directamente las filas


export default router;