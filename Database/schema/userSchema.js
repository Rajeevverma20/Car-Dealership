const mongoose = require('mongoose');


const userSchema = new mongoose.Schema({

    _id:  {type: String} ,

    email: {type: String, required: true},

    location: {type: String, required: true},

    info: {type: Object, required: true},

    password: {type: String, required: true},

    vehicle_info:[{type:String, required: true}]
})

const User = mongoose.model('User', userSchema);

module.exports = User;