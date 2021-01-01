// ============================
//  Requires
// ============================
const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const fs = require('fs');
const path = require('path');

const Usuario = require('../models/usuario');
const Producto = require('../models/producto');

// default options
app.use(fileUpload({useTempFiles: true}));

app.put('/upload/:tipo/:id', (req, res) => {
    
    const tipo = req.params.tipo;
    const id = req.params.id;
    
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).json({
            ok: false,
            message: 'No hay archivos seleccionados'
        });
    }
    
    /* ***Validar extensiones*** */
    const extensionesValidas = ['jpg', 'png', 'gif', 'jpeg'];
    let archivo = req.files.archivo;
    let nombreSeparado = archivo.name.split('.');
    let extension = nombreSeparado[nombreSeparado.length - 1];
    
    // indexOf ---> si extension existe dentro del arreglo
    // < 0  ---> no existe
    // > 0 ---> si existe
    if(extensionesValidas.indexOf(extension) < 0){
        return res.status(400).json({
            ok: false,
            message: `Las extensiones permitidas son ${extensionesValidas.join(', ')}`,
            extension
        })
    }
    
    
    /* ***Validar Tipos*** */
    const tiposValidos = ['usuarios', 'productos'];
    if(tiposValidos.indexOf(tipo) < 0){
        return res.status(400).json({
            ok: false,
            message: `Los tipos permitidos son ${tiposValidos.join(', ')}`,
            tipo
        })
    }
    
    /* ***Cambiar nombre archivo*** */
    let nombreArchivo = `${id}-${new Date().getMilliseconds()}.${extension}`
    
    archivo.mv(`./uploads/${tipo}/${nombreArchivo}`, (err) => {
        
        if (err){
            return res.status(500).json({
                ok: false,
                err
            });
        }
        
        //Actualizar en la DB depende del tipo
        if (tipo === 'usuarios'){
            imagenUsuario(id, res, nombreArchivo);
        }else{
            imagenProducto(id, res, nombreArchivo);
        }
    });
})

function imagenUsuario(id, res, nombreArchivo){
    
    Usuario.findByIdAndUpdate(id, {img: nombreArchivo},
        {runValidators: true, useFindAndModify: false, context: 'query' },
        (err, usuarioNoActualizado) => {
        
        if (err) {
            borrarImagen('usuarios', nombreArchivo);
            return res.status(500).json({
                ok: false,
                err
            });
        }
        
        if(!usuarioNoActualizado){
            borrarImagen('usuarios', nombreArchivo);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Usuario no encontrado',
                }
            })
        }
        
        borrarImagen('usuarios', usuarioNoActualizado.img);
        res.json({
            ok: true,
            message: 'Imagen de usuario actualizada correctamente',
            img: nombreArchivo
        });
        
    })
}

function imagenProducto(id, res, nombreArchivo){
    
    Producto.findByIdAndUpdate(id, {img: nombreArchivo},
        {runValidators: true, useFindAndModify: false, context: 'query' },
        (err, productoNoActualizado) => {
        
        if (err) {
            borrarImagen('productos', nombreArchivo);
            return res.status(500).json({
                ok: false,
                err
            });
        }
        
        if(!productoNoActualizado){
            borrarImagen('productos', nombreArchivo);
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Producto no encontrado',
                }
            })
        }
        
        borrarImagen('productos',productoNoActualizado.img);
        res.json({
            ok: true,
            message: 'Imagen de producto actualizado correctamente',
            img: nombreArchivo
        });
        
    })
}

function borrarImagen(tipo, imagenAnterior){
    let pathImagen = path.resolve(__dirname,`../../uploads/${tipo}/${imagenAnterior}`);
    if(fs.existsSync(pathImagen)){
        fs.unlinkSync(pathImagen);
    }
}


module.exports = app;