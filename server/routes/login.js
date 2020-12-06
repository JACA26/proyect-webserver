// ============================
//  Imports
// ============================
const express = require('express');

const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');

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


module.exports = app;