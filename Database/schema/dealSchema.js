const mongoose = require('mongoose');

const dealSchema = new mongoose.Schema({

    _id: {type: String, required:true},

   cars_id : {type:String, required: true},

   deals_info: {type: Object}
})


const Deals = mongoose.model('Deals', dealSchema);

module.exports = Deals;