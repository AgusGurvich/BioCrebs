import { Router } from "express";
import { pool } from "../db.js";
import multer from 'multer';
import fs from 'fs';
import { v4 } from "uuid";
import passport from 'passport'
import router from "./index.routes.js";
import auth from "../lib/auth.js"; 


router.get("/login", auth.isNotLoggedIn ,(req,res)=> {
    res.render('login');
});

router.post("/login", (req, res, next)=> {
 passport.authenticate('local.signin', {
        successRedirect: '/inicio',
        failureRedirect: '/login',
        failureFlash: true
    })(req,res,next); 
}); 

router.post('/singup', passport.authenticate('local.signup', {
            successRedirect: '/inicio',
            failureRedirect: '/login',
            failureFlash: true
}));

router.post("/cancion/para/mi/muerte", (req, res, next)=> {
    passport.authenticate('local.signin', {
           successRedirect: '/control',
           failureRedirect: '/login',
           failureFlash: true
       })(req,res,next); 
   });

   router.post('/crearBecario', passport.authenticate('local.signupBecario', {
    successRedirect: '/inicio',
    failureRedirect: '/login',
    failureFlash: true
}));

router.get("/seleccion", (req,res)=> {
    res.render('seleccion');
});

router.get('/logout',  auth.isLoggedIn , (req,res, next)=> {
    req.logOut(function (err){
        if (err) { return next(err);}
    });
    res.redirect('/login');
});
 

export default router;