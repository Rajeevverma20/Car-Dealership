const mongoose = require('mongoose');


const carsSchema = new mongoose.Schema({

    

    _id: {type: String, required: true},

   type: {type: String, required: true},

   name: {type: String, required: true},

    model: {type: String, required: true},

    vechile_info: { type: Object}
})

const Cars = mongoose.model('Cars', carsSchema);

module.exports = Cars