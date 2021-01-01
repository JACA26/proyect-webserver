const jwt = require('jsonwebtoken');


// ============================
//  Verificar Token
// ============================

const verificarToken = (req, res, next) => {
    //obtener el header llamado token
    let token = req.get('token')
    
    jwt.verify(token, process.env.SEED_TOKEN, (err, decoded) => {
        
        if (err) {
            return res.status(401).json({
                ok: false,
                err
            });
        }
        
        req.usuario = decoded.usuario
        next();
    })
}



// ============================
//  Verificar Admin_Role
// ============================

const verificarAdmin_Role = (req, res, next) => {
    
    let usuario = req.usuario;
    if (usuario.role === 'ADMIN_ROLE'){
        next();
    }else{
        return res.status(401).json({
            ok: false,
            err:{
                message:'El usuario no posee derechos de administrador'
            }
        });
    }
}


// ============================
//  Verificar token imagen
// ============================

const verificarTokenImage= (req, res, next) => {
    let token = req.query.token;
    
    jwt.verify(token, process.env.SEED_TOKEN, (err, decoded) => {
        
        if (err) {
            return res.status(401).json({
                ok: false,
                err:{
                    message: 'Token no válido'
                }
            });
        }
        
        req.usuario = decoded.usuario
        next();
    })
}

module.exports = {
    verificarToken,
    verificarAdmin_Role,
    verificarTokenImage
}