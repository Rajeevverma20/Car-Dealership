const mongoose = require('mongoose');

const  sold_vechilesSchema = new mongoose.Schema({

    _id: {type: String},

    car_id: {type: String, required: true},

    vechile_info: {type: Object }
})


const Sold_Vechiles = mongoose.model('Sold_vechiles',sold_vechilesSchema)

module.exports = Sold_Vechiles;
