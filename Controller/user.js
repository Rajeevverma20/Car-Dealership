const router = require('express').Router();
const User = require('../Database/schema/userSchema');
const cookieParser= require('cookie-parser');
const jwt =require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const md5 = require('md5');
const Sold = require('../Database/schema/sold_vechilesSchema');
const Cars = require('../Database/schema/carsSchema');
const Dealership = require('../Database/schema/dealershipSchema');
const Deal = require('../Database/schema/dealSchema')



// For signUp


const registerUser = async(req,res)=>{

    try{

    const {email, location, info , password , vehicle_info} = req.body;

    if(!(email || location || info || password || vehicle_info)){
        res.status(400).send("All fields are required ");
        return;
    }

    const user_id = md5(email)

    const emailCheck = await User.findOne({_id:user_id});

    if(emailCheck){
        return res.status(400).send('email is already existing');
        
    }

    const checkVehicle = await Sold.findById({_id: vehicle_info})
    if(!checkVehicle){
        return res.status(400).send("vechile info is not correct")
    }


    const hashPass = await bcrypt.hash(password,8);

    const user = await User.create({
        _id: user_id,
        email,
        location,
        info,
        password: hashPass,
        vehicle_info: checkVehicle._id
    })


    const token = jwt.sign({_id: user._id.toString()},process.env.JWT_SECRET,{
        expiresIn:'2h'
    })
    user.password = undefined;
    return res.status(200).json({ success: true, token, user });
    }
    catch(err){
        console.log(err);
        return res.status(400).send(err)
    }
}

// For user login


const getUser = async(req,res)=>{
    try{

        const {email, password} = req.body;

        if(!(email || password)){
            return res.status(400).send('All fields are require');
        }

        const user = await User.findOne({email});

        if(!user){
           return res.status(400).send('Email not found ');
        }

        const checkPassword = await bcrypt.compare(password,  user.password);

        if(!checkPassword){
           return res.status(400).send('password is incorrect')
        }

        const token = jwt.sign({_id: user._id}, process.env.JWT_SECRET,{
            expiresIn: '2h'
        })

        user.password = undefined;

        const options = {
            expires: new Date(Date.now()+3*24*60*60*100),
            httpOnly: true
        }

        res.cookie('token',token, options).status(200).json({
            success: true,
            token,
            user
        });

    }catch(err){
        console.log(err);
        return res.status(400).send(err);
    }
}

// For user logout


const logoutUser = async(req,res)=>{
    try{
     res.clearCookie('token');
     return res.status(200).send('Logout')
       

    }
    catch(err){
        console.log(err);
        return res.status(400).send(err)
    }
}

// For changing user's password

const passUser = async(req,res)=>{

    try{
    const { newPassword, oldPassword, email} = req.body;

    if(!(newPassword || oldPassword || email)){
        return res.status(400).send('all fields are require')
    }

    const checkEmail = await User.findOne({email});

    if(!checkEmail){
        return res.status(400).send('email is not valid');

    }


    const checkPassword = await bcrypt.compare(oldPassword, checkEmail.password);
    if(!checkPassword){
        return res.status(400).send('your old passsword is incorrect')
    }

    const hashPass = await bcrypt.hash(newPassword,8);

    checkEmail.password = hashPass;

    await checkEmail.save();
    return res.status(200).send('Password changed successfully');
    }
    catch(err){
        console.log(err);
        return res.status(400).send(err)
    }


}





const getAllcars = async (req, res )=>{
    try{

    const car =await  Cars.find({});

    return res.status(200).json(car);

    }catch(err){
        console.log(err);
        return res.status(400).send(err)
    }
}



const  viewCarsInDealership = async (req, res)=>{
    
   
    try{
        const {dealershipId} = req.params;
        if(!dealershipId){
            return res.status(400).send('dealshipId is require')
        }

        const cars = await Dealership.findById({_id: dealershipId})

        if(!cars){
            return res.status(400).send('Dealer id not correct ')
        }

        return res.status(200).json(cars);


    }catch(err){
        console.log(err);
        return res.status(400).send(err);
    }
}

// View dealerships with a certain car

const viewDealershipsWithCar = async(req, res)=>{
    
   try{

        const { carId } = req.params;
        if(!carId){
            return res.status(400).send('carId is require')
        }
        const car = await Cars.findById({_id: carId});
    
        if(!car){
            return res.status(200).send('car id is not valid')
        }

        const dealerships = await Dealership.find({cars: car._id})

        return res.status(200).json(dealerships)
    }
    catch(err){
        console.log(err);
        return res.status(400).send('Internal error')
    }
}


// View all vehicles owned by user

const viewOwnedVehicles = async(req, res)=>{
    try{

        const userId = req.params.userId;

        // Find the user by their ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Retrieve the list of owned vehicles from the user's profile
        const ownedVehicles = user.vehicle_info;

        return res.status(200).json(ownedVehicles);
    }catch(err){
        console.log(err);
        return res.status(500).send('internal error')
    }
}


//View all deals on a certain car

const viewDealsOnCar = async(req, res)=>{

    try{

        const { carId} = req.params;

        if(!carId){
            return res.status(400).send(' car id is require')
        }
        const deals = await Deal.findOne({cars_id: carId})
        if(!deals){
            return res.status(400).send('car id is not correct')
        }
        res.status(200).json(deals)

    }catch(err){
        console.log(err);
        return res.status(400).send('internal server error')
    }
}

// View all deals from a certain dealership

const viewDealsFromDealership =async (req,res)=>{
    try{

        const {dealershipId } = req.params;

        if(!dealershipId){
            return res.status(400).send('dealship Id is require');
        }

        const deals = await Dealership.find({_id: dealershipId}).populate('deals')
        if(!deals ){
            return  req.status(400).send(' dealership id is not correct')
        }

        return res.status(200).json(deals.deals)
    }catch(err){
        console.log(err)
        return req.status(500).send('internal server error')
    }
}



module.exports = {
    registerUser,
    getUser,
    logoutUser,
    passUser,
    getAllcars,
    viewDealershipsWithCar,
    viewCarsInDealership,   
    viewOwnedVehicles,
    viewDealsOnCar,
    viewDealsFromDealership,
}