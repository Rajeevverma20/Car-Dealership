const router = require('express').Router();
const md5 = require('md5');
const jwt = require('jsonwebtoken');
const Dealer = require('../Database/schema/dealershipSchema');
const bcrypt = require('bcryptjs');
const Sold = require('../Database/schema/sold_vechilesSchema');
const Car = require('../Database/schema/carsSchema');
const Deals = require('../Database/schema/dealSchema');



const createDealer= async (req, res) => {
    try {
        const { email, name, location, password, info, cars, deals, sold_vechiles } = req.body;

        // Check if any of the required fields are missing
        if (!email || !name || !location || !password || !info || !cars || !deals || !sold_vechiles) {
            return res.status(400).send('All fields are required');
        }

        // Generate a unique dealer_id using md5
        const dealer_id = md5(email);

        // Check if a user with the same email already exists in the database
        const checkUser = await Dealer.findOne({_id: dealer_id});
        if (checkUser) {
            return res.status(400).send('Email is already in use');
        }


        const soldCheck= await Sold.findById({_id:sold_vechiles});
        if(!soldCheck){
            return res.status(200).send('Sold id is not correct')
        }
        

        const carCheck = await Car.findById({_id: cars})
        if(!carCheck){
            return res.status(400).send('car id is not correct')
        }

        const dealsCheck = await Deals.findById({_id: deals});
        if(!dealsCheck){
            return res.status(200).send('Deal id is not correct')
        }
        

        // Hash the password using bcrypt
        const hashPass = await bcrypt.hash(password, 8);

        // Create a new Dealer document in the database
        const newUser = await Dealer.create({
            _id: dealer_id,
            email,
            name,
            location,
            password: hashPass,
            info,
            cars: carCheck._id,
            deals: dealsCheck._id,
            sold_vechiles: soldCheck._id
        });

        // Generate a JWT token for the user
        const token = jwt.sign({ _id: newUser._id.toString() }, process.env.JWT_SECRET, {
            expiresIn: '2h'
        });

        // Remove the password field from the user object before sending the response
        newUser.password = undefined;

        return res.status(200).json({ user: newUser, token });
    } catch (err) {
        console.error(err);
        return res.status(500).send('Internal Server Error');
    }
}

const login = async(req,res)=>{
    try{

        const {email, password} = req.body;

        if(!(email || password)){
            res.status(400).send('all fileds are required');
        }

        const checkEmail = await Dealer.findOne({email});

        if(!checkEmail){
            return res.status(400).send('Email is not register');
        }

        const checkPass =  bcrypt.compare(password, checkEmail.password);

        if(!checkPass){
            return res.status(400).send('password is not matched');
        }

        const token = jwt.sign({_id: checkEmail._id}, process.env.JWT_SECRET,{
            expiresIn: '2h'
        })

        const options ={
            expires: new Date(Date.now()+3*24*60*60*100),
            httpOnly: true
        }

        res.cookie('token', token, options).status(200).json({
            suceess:true,
            token,
            checkEmail
        })




    }catch(err){
        console.log(err);
        res.status(400).send(err)
    }
}


const logout = async(req,res)=>{
   
    try{
        
        res.clearCookie('token')
        
        res.status(200).json({ success: true, message: 'Logged out successfully' });
    }
    catch(err){
        console.log(err);
        res.status(400).send(err);
    }
}



const changePass = async(req,res)=>{
    try{

        const changePass = async (req, res) => {
            try {
                const { email, oldPass, newPass } = req.body;
        
                if (!(email && oldPass && newPass)) {
                    res.status(400).send('All fields are required');
                    return;
                }
        
                const dealer = await Dealer.findOne({ email: email });
        
                if (!dealer) {
                    res.status(400).send('Email is not registered');
                    return;
                }
        
                const checkPass = await bcrypt.compare(oldPass, dealer.password);
        
                if (!checkPass) {
                    return res.status(400).send('Old password is incorrect');
                }
        
                const hashPass = await bcrypt.hash(newPass, 8);
        
                // Update the password in the database
                await Dealer.updateOne({ email: email }, { $set: { password: hashPass } });
        
                res.status(200).send('Password changed successfully');
            } catch (err) {
                console.error(err);
                res.status(500).send('Internal server error');
            }
        };
        
    }
    catch(err){
        console.log(err);
        res.status(400).send(err)
    }
}

const getAllCarsByDealership = async(req, res)=>{

    try{
        const { dealershipId } = req.params;
        if(!dealershipId){
            return res.status(400).send('dealership id is required');
        }

        const cars = await Dealer.findById({_id: dealershipId});
        if(!cars){
            return res.status(400).send('DealershipId not found')
        }

      return res.status(200).json(cars.cars);

    }catch(err){
        console.log(err);
        return res.status(500).send("Internal error")
    }
}


const getSoldCarsByDealership  = async (req, res)=>{
    try{

        const { dealershipId } = req.params;
        if(!dealershipId){
            return res.status(400).send(' Dealership id is required');
        }
        const soldCars = await Dealer.findById({_id: dealershipId});

        if(!soldCars){
            return res.status(400).send(' DealershipId is not found');
        }
        return res.status(200).json(soldCars.sold_vechiles)
    }
    catch(err){
        console.log(err);
        return res.status(500).send('Internal error ')
    
    }
}


const createCars = async (req, res) => { 
    try {

        const { dealershipId } = req.params;
        const { type, name, model, vehicle_info } = req.body; // Correct 'vechile_info' to 'vehicle_info'

        if (!(type && name && model && vehicle_info && dealershipId)) { // Use && instead of || to check that all fields are provided
            return res.status(400).send('All fields are required '); // Correct the error message
        }

        const dealership = await Dealer.findById({_id: dealershipId});
        if(!dealership){
            return res.status(400).send('Dealership id not found')
        }

       

       const hashid = md5(vehicle_info+name);

       const checkCar = await Car.findById({_id: hashid})
       if(checkCar){
        return res.status(400).send('Car is already register')
       }

        const car = await Car.create({
            _id:  hashid,
            type,
            name,
            model,
            vehicle_info 
        });

        dealership.cars.push(car);
        await dealership.save();
    
        res.status(201).json(car);

    } catch (err) {
        console.error(err); // Use console.error for errors
        return res.status(500).send('Internal Server Error'); // Change the status code and error message
    }
}

const getDealsByDealership = async ( req, res) =>{
    try{

        const { dealershipId  }  = req.params;

        if(!dealershipId){
            return res.status(400).send('Dealership id is require');
        }

        const deals = await Dealer.findById({_id: dealershipId}).populate('deals');
        if(!deals ){
            return res.status(400).send('DealershipId is not found ');
        }

        return res.status(200).json(deals.deals);
    }catch(err){
        console.log(err);
        return res.status(500).send('Internal error ')
    }
}


const addDealToDealership = async( req, res) =>{
try{

    const { dealershipId } = req.params;
    if(!dealershipId){
        return res.status(400).send('DealershipId is require');
    }

    const dealership = await Dealer.findById({_id: dealershipId});
    if(!dealership){
        return res.status(400).send('DealershipId is not found')
    }

    const { cars_id, deals_info } = req.body;

        if (!deals_info|| !cars_id) {
            return res.status(400).send('Deals information is required');
        }

        const deals_id = md5(cars_id);

        const check_deals = await Deals.findOne({ _id: deals_id });
        if (check_deals) {
            return res.status(400).send('Deal  exists');
        }

        const car = await Car.findById({_id: cars_id});
        if (!car) {
            return res.status(400).send('Car is not available');
        }

        const deal = await Deals.create({
            _id: deals_id,
            cars_id: car._id, 
            deals_info,
        });

        dealership.deals.push(deal);
        await dealership.save();
    
        return res.status(201).json(deal); 
}catch(err){
    console.log(err);
    return res.status(500).send('Internal error ');
}
}

const getSoldVehiclesByDealership = async(req, res)=>{
    try{

        const { dealershipId } = req.params;
        if(!dealershipId){
            return res.status(400).send('DealershipId is require');

        }
        const soldVehicle = await Dealer.findById({_id: dealershipId}).populate('sold_vechiles');
        if(!soldVehicle){
            return res.status(400).send('DealershipId is not found');
        }

        return res.status(200).json(soldVehicle.sold_vechiles);
    }catch(err){
        console.log(err);
        return res.status(500).send('internal error ')
    }
}


const addSoldVehicle = async(req, res)=>{
     try{

        const { dealershipId } = req.params;
        if(!dealershipId){
            return res.status(400).send('DealershipId is require');
        }

        const dealership = await Dealer.findById({_id: dealershipId});
        if(!dealership){
            return res.status(400).send('DealershipId is not found')
        }
        const { car_id, vehicle_info} = req.body;

        if(!car_id || !vehicle_info){
            return res.status(200).send('All fileds are required')
        }

        const sold_id = md5(car_id);

        const checkCar = await Sold.findById({_id: sold_id});
        if(checkCar){
            return res.status(200).send('Sold id is available');
        }

        const car = await Car.findById({_id: car_id});
        if(!car){
            return res.status(200).send('Car is not avaiable');
        }

    

        const sold = await Sold.create({
            _id: sold_id,
            car_id:car._id,
            vehicle_info
        })
        dealership.sold_vechiles.push(sold);
        await dealership.save();
        res.status(200).json(sold);
     }catch(err){
        console.log(err);
        return res.status(500).send('Internal error')
     }
}



module.exports = {
    createDealer,
    login,
    logout,
    changePass,
    getAllCarsByDealership,
    getSoldCarsByDealership,
    createCars,
    getDealsByDealership,
    addDealToDealership,
    getSoldVehiclesByDealership,
    addSoldVehicle
}