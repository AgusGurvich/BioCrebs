const auth = {
    isLoggedIn(req, res, next) {
        if (req.isAuthenticated()) { // Este método defuelve un bool que devuelve true si la session del usuario existe
            return next();
        }
        return res.redirect('/login');
    },

    isNotLoggedIn(req, res, next) {
        if (!req.isAuthenticated()) {
            return next();
        }
        return res.redirect('/inicio');
    },

    isBecario(req, res, next) {
        console.log('ejecutando isbecario');
        if(req.user.licencia == 2){
            console.log('es Becario');
            return next();
        }
        console.log('no es becario');
        return res.redirect('/inicio');
    }, 

    isUser(req, res, next) {
        console.log('ejecutando isUser');
        if(req.user.licencia == 1){
            console.log('es usuario');
            return next();
        }
        console.log('no es usuario');
        return res.redirect('/login');
    },

    chooseIndex (req) {
        if(req.user.licencia == 2){
            console.log('es Becario');
            return true;
        }
        return false;
    }
}



export default auth;