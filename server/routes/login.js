// ============================
//  Imports
// ============================
const express = require('express');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

const {OAuth2Client} = require('google-auth-library');

const client = new OAuth2Client(process.env.CLIENT_ID);

const Usuario = require('../models/usuario');



const app = express();


app.post('/login', (req, res) =>{
    const body = req.body;
    
    Usuario.findOne({ email: body.email}, (err, usuarioDB) => {
        
        //DB error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        
        //Not found user or not exist
        if(!usuarioDB){
            return res.status(400).json({
                ok: false,
                err: {
                    message: '(Usuario) o contraseña incorrectos'
                }
            });
        }
        
        //match the password
        if(!bcrypt.compareSync(body.password, usuarioDB.password)){
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario o (contraseña) incorrectos'
                }
            });
        }
        
        //make token
        let token = jwt.sign({
            usuario: usuarioDB
        },process.env.SEED_TOKEN,{expiresIn: process.env.CADUCIDAD_TOKEN})
        
        //login success
        res.json({
            ok: true,
            user: usuarioDB,
            token
        });
    })
})

//configuraciones de google-auth
async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: process.env.CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    
    return {
        nombre: payload.name,
        email: payload.email,
        img: payload.picture,
        google: true,
    }
}


//login con google
app.post('/google', async (req, res) =>{
    
    let token = req.body.idtoken;
    let googleUser = await verify(token)
        .catch(err => {
            return res.status(403).json({
                ok: false,
                err
            })
        })
    
    Usuario.findOne({email: googleUser.email},(err, usuarioDB) => {
        
        //DB error
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        //user exist
        if(usuarioDB){
            //usuario con autenticación normal
            if(usuarioDB.google === false){
                
                return res.status(400).json({
                    ok: false,
                    err: {
                        message: 'Inicia sesión con tus credenciales normales'
                    }
                });
                
            } else {
                //usuario existe con autenticación google
                //make token
                let token = jwt.sign({
                    usuario: usuarioDB
                },process.env.SEED_TOKEN,{expiresIn: process.env.CADUCIDAD_TOKEN})
                
                //login success
                res.json({
                    ok: true,
                    user: usuarioDB,
                    token
                });
            }
        } else {
            //usuario no existe y se registra por primera vez
            let usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';
            
            //guardar usuario en DB
            usuario.save((err, usuarioDB)=>{
                //error DB
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        err
                    });
                }
                
                //make token
                let token = jwt.sign({
                    usuario: usuarioDB
                },process.env.SEED_TOKEN,{expiresIn: process.env.CADUCIDAD_TOKEN})
                
                //login success
                res.json({
                    ok: true,
                    user: usuarioDB,
                    token
                }); 
            });
        }
        
    })
});

module.exports = app;