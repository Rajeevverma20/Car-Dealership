const express = require('express');
const mongoConnection = require('./Database/connection');
const port = process.env.PORT||3000;
const cookieParser = require('cookie-parser');

const userRoutes = require('./routes/userRouter');
const adminRoutes = require('./routes/adminRouter');
const dealershipRoutes = require('./routes/dealershipRouter');

const app= express();

app.use(express.json());
app.use(cookieParser());

app.use('/user',userRoutes);
app.use('/admin', adminRoutes);
app.use('/dealership',dealershipRoutes);

app.listen(port,()=>{
    console.log('server listening on port '+ port)
})