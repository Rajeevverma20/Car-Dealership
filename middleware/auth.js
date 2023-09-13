const jwt = require('jsonwebtoken');
require("dotenv").config();

const User = require('../Database/schema/userSchema');
const Admin = require('../Database/schema/adminSchema');
const Dealership = require('../Database/schema/dealershipSchema');




const auth = async(req, res, next )=>{
    
    try{

      // const token = req.headers.authorization.split(' ')[1];

      const token = req.cookies.token;

        if (!token) {
            return res.status(401).send({ error: 'Token not found' });
          }
          
    
        const decode  = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decode);

        let user;
        user = await User.findById({ _id: decode._id });
        if (!user) {
            user = await Admin.findById({ _id: decode._id });
        }
        if (!user) {
            user = await Dealership.findById({ _id: decode._id });
        }
          if (!user) {
            return res.status(401).send({ error: 'User not found' });
          }
      
          req.user = decode;
          req.token= token;
        
        

        next();
    }
    catch(err){
        if(err.name === 'TokenExpiredError'){
            return res.status(401).send({error: 'Token expired'})
        }
        else if(err.name === 'JsonWebTokenError'){
            return res.status(401).send({error: 'Invalid Token'});
        }
        else{
            console.log(err);
            return res.status(401).send({err: 'Authentication required'})
        }
    }
}

module.exports = auth;