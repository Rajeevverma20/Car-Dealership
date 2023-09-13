const mongoose = require('mongoose');
const { modelName } = require('./adminSchema');

const dealershipSchema = new mongoose.Schema({

     _id: {type: String},

    email: {type:String, required: true, unique: true},

    
    name: {type: String, required: true},

    location: {type: String, required: true},

    password: {type:String},

    info: {type:Object},

    cars: [{type: String, required: true}],

    deals: [{type:String, required: true}],

    sold_vechiles: [{type:String , required: true}],

    
})


const DealerShip = mongoose.model('Dealership',dealershipSchema);

module.exports= DealerShip;
