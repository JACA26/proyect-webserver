// ============================
//  Requires
// ============================
const express = require('express');

let {verificarToken, verificarAdmin_Role} = require('../middlewares/auth');

const Producto = require('../models/producto');

const app = express();

app.get('/producto', verificarToken, (req, res) => {
    
    let desde = req.query.desde || 0;
    desde = Number(desde);
    
    let limite = req.query.limite || 5;
    limite = Number(limite);
    
    
    Producto.find({disponible: true})
        .skip(desde)
        .limit(limite)
        .sort('categoria')
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre')
        .exec((err, productos) => {
            
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            
            Producto.countDocuments({}, (err, conteo) => {
                
                res.json({
                    ok: true,
                    productos,
                    cuantos: conteo
                });
                
            });
        })
    
})

app.get('/producto/:id', verificarToken, (req, res) => {
    
    const id = req.params.id;
    
    Producto.findById(id)
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre')
        .exec((err, productoDB) => {
            
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            
            if(!productoDB){
                return res.status(400).json({
                    ok: false,
                    message: 'Producto no encontrado',
                    err
                })
            }
            
            res.json({
                ok: true,
                producto: productoDB
            })
            
        })
    
    
})


app.get('/producto/buscar/:query', verificarToken, (req, res) => {
    
    let query = req.params.query;
    let regex = new RegExp(query, 'i');
    
    Producto.find({nombre: regex})
        .populate('categoria', 'descripcion')
        .populate('usuario', 'nombre')
        .exec((err, productos) => {
            
            if (err) {
                return res.status(500).json({
                    ok: false,
                    err
                });
            }
            
            if(!productos){
                return res.status(400).json({
                    ok: false,
                    message: 'Producto no encontrado',
                    err
                })
            }
            
            res.json({
                ok: true,
                producto: productos
            })
            
            
        })
    
})



app.post('/producto', [verificarToken, verificarAdmin_Role], (req, res) => {
    
    const body = req.body;
    
    /* const producto = new Producto({
        
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria,
        usuario: req.usuario._id
        
    }); */
    
    const producto = new Producto(body);
    
    producto.save((err, productoDB) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        
        if(!productoDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        
        res.json({
            ok: true,
            message: 'Producto agregado',
            producto: productoDB
        });
    })
    
    
})

app.put('/producto/:id', [verificarToken, verificarAdmin_Role], (req, res) => {
    
    const id = req.params.id;
    
    const body = req.body;
    
    /* const prodUpdate = {
        nombre: body.nombre,
        precioUni: body.precioUni,
        descripcion: body.descripcion,
        disponible: body.disponible,
        categoria: body.categoria
    } */
    
    Producto.findByIdAndUpdate(id, body,
        { new: true, runValidators: true, useFindAndModify: false, context: 'query' },
        (err, productoActualizado) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        
        if(!productoActualizado){
            return res.status(400).json({
                ok: false,
                message: 'Producto no encontrado',
                err
            })
        }
        
        res.json({
            ok: true,
            message: 'Producto actualizado correctamente',
            producto: productoActualizado
        });
        
    })
    
})

//eliminar un producto: "quitarlo de stock"
app.delete('/producto/:id', [verificarToken, verificarAdmin_Role], (req, res) => {
    
    const id = req.params.id;
    
    Producto.findByIdAndUpdate(id, {disponible: false},
        { new: true, runValidators: true, useFindAndModify: false, context: 'query' },
        (err, productoEliminado) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        
        if(!productoEliminado){
            return res.status(400).json({
                ok: false,
                message: 'Producto no encontrado',
                err
            })
        }
        
        res.json({
            ok: true,
            message: 'Producto eliminado correctamente',
            producto: productoEliminado
        });
        
    })
    
    
    
})

module.exports = app;