// ============================
//  Requires
// ============================
const express = require('express');
const fs = require('fs');
const path = require('path');
const {verificarTokenImage} = require('../middlewares/auth');
const app = express();

app.get('/image/:tipo/:img', verificarTokenImage, (req, res) => {
    let tipo = req.params.tipo;
    let img = req.params.img;
    
    /* ***Validar Tipos*** */
    const tiposValidos = ['usuarios', 'productos'];
    if(tiposValidos.indexOf(tipo) < 0){
        return res.status(400).json({
            ok: false,
            message: `Los tipos permitidos son ${tiposValidos.join(', ')}`,
            tipo
        })
    }
    
    /* ***Validar si imagen existe*** */
    let pathImage = path.resolve(__dirname, `../../uploads/${tipo}/${img}`);
    
    if(fs.existsSync(pathImage)){
        
        res.sendFile(pathImage);
        
    }else{
        
        let pathImageNotFound = path.resolve(__dirname, '../assets/no-image.jpg');
        res.sendFile(pathImageNotFound);
        
    }
    
});



module.exports = app;