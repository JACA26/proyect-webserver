// ============================
//  Requires
// ============================
const express = require('express');

const {verificarToken, verificarAdmin_Role} = require('../middlewares/auth');

const Categoria = require('../models/categoria');

const app = express();

app.get('/categoria', verificarToken, (req, res)=> {
    
    Categoria.find({})
        .sort('descripcion')
        .populate('usuario', 'nombre email')
        .exec((err, categorias) => {
            
            if (err) {
                return res.status(400).json({
                    ok: false,
                    err
                });
            }
            
            Categoria.countDocuments({}, (err, conteo) => {
                
                res.json({
                    ok: true,
                    categorias,
                    cuantos: conteo
                });
                
            });
            
        });
});

app.get('/categoria/:id', verificarToken, (req, res)=> {
    
    Categoria.findById(req.params.id, (err, categoriaDB) => {
        
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        
        res.json({
            ok: true,
            categoriaDB
        })
    })
});

app.post('/categoria', [verificarToken, verificarAdmin_Role], (req, res)=> {
    
    const id = req.usuario._id;
    const body = req.body;
    
    const categoria = new Categoria({
        descripcion: body.descripcion,
        usuario: id
    })
    
    categoria.save((err, categoriaDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        
        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                err
            });
        }
        
        res.json({
            ok: true,
            categoria: categoriaDB
        });
    })
});

app.put('/categoria/:id', [verificarToken, verificarAdmin_Role], (req, res)=> {
    
    const id = req.params.id;
    const body = req.body;
    const catUpdate = {
        descripcion: body.descripcion
    }
    
    Categoria.findByIdAndUpdate(id, catUpdate,
        { new: true, runValidators: true, useFindAndModify: false, context: 'query' },
        (err, categoriaDB) => {
        
        if (err) {
            return res.status(500).json({
                ok: false,
                err
            });
        }
        
        if(!categoriaDB){
            return res.status(400).json({
                ok: false,
                message: 'Categoria no encontrada',
                err
            })
        }
        
        res.json({
            ok: true,
            categoria: categoriaDB
        });
        
    })

});

app.delete('/categoria/:id', [verificarToken, verificarAdmin_Role], (req, res) => {
    
    const id = req.params.id;
    
    Categoria.findByIdAndRemove(id, {useFindAndModify: false}, (err, categoriaDelete) => {
        
        if (err) {
            return res.status(400).json({
                ok: false,
                err
            });
        }
        
        if (!categoriaDelete) {
            return res.status(400).json({
                ok: false,
                err: {
                    message: 'Categoria no encontrada'
                }
            });
        }
        
        res.json({
            ok: true,
            Delete: categoriaDelete
        });
    })
});

module.exports = app;