const mongoose = require('mongoose');
let Schema = mongoose.Schema;

const uniqueValidator = require('mongoose-unique-validator');


let categoriaSchema = new Schema({
    descripcion: {
        type: String,
        unique: true,
        required: [true, 'La descripcion es necesaria']
    },
    usuario: {
        type: Schema.Types.ObjectID,
        ref: 'Usuario'
    }
});

categoriaSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser único' });


module.exports = mongoose.model('Categoria', categoriaSchema);