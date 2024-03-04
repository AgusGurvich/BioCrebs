import express from 'express';
import { PORT } from './config.js';
import path from 'path';
import { fileURLToPath } from 'url';
import indexRoutes from './routes/index.routes.js';
import becarioRoutes from './routes/becario.routes.js';
import userRoutes from './routes/user.routes.js';
import authenticationRoutes from './routes/authentication.routes.js';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import flash from 'connect-flash';
import session  from 'express-session';
import MySQLStoreFactory from 'express-mysql-session';
import database from './config.js';
import passport from 'passport';

//Initializations
const app = express();
app.set('PORT', process.env.PORT || PORT)
import './lib/passport.js';
import { time } from 'console';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('views', path.join(__dirname, "views"));
app.set('view engine', 'ejs');



//next()......
// Middlewares 
const MySQLStore = MySQLStoreFactory(session);
const sessionStore = new MySQLStore(database);
app.use(session({
    secret: 'FotocopySession',
    resave: false,
    saveUninitialized: false,
    store: sessionStore
}));
app.use(flash());
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false})); //Para aceptar desde los formularios, los datos que me envíen los usuarios. False es para datos sencillos.
app.use(passport.initialize());
app.use(passport.session());


//Global Variables
app.use((req,res,next) => {
    app.locals.user = req.user;

   app.locals.success = req.flash('success'); // Una vez almacenado un mensaje, voy a agarrar ese mensaje y hacerlo disponible en todas mis vistas. Luego tengo que preguntar por ese mensaje en todas las vistas.
   app.locals.failure = req.flash('failure');
   
  
   next();
});


app.use(express.static(__dirname + '/public'));
app.use(becarioRoutes);
app.use(indexRoutes);
app.use(userRoutes);
app.use(authenticationRoutes);

// Añadir Datos a la base de datos; HECHO
// Becario: Eliminar Cargar Saldo a cuenta; Ingresar Nuevo Pedido == Ingresar Pedido normal + ID;
// User: Botones de Pagar; 


app.listen(PORT); 

console.log("Server Listening on port " + PORT);