const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../Database/schema/adminSchema');
const md5 = require('md5');
require('dotenv').config();

// For Sign up
const createAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!(email && password)) {
            return res.status(400).send("Both email and password are required");
        }

        const admin_id = md5(email);

        const existingAdmin = await Admin.findById(admin_id);
        if (existingAdmin) {
            return res.status(400).send('User already exists with the email');
        }

        const encryptPassword = await bcrypt.hash(password, 8);

        const admin = new Admin({
            _id: admin_id,
            email,
            password: encryptPassword
        });

        await admin.save(); // Save the new admin

        const token = jwt.sign({ _id: admin._id}, process.env.JWT_SECRET, {
            expiresIn: '2h',
        });

        // Remove the password from the admin object before sending it in the response
        admin.password = undefined;

        // Set cookie options
        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true
        };

        // Set the token as a cookie and send a JSON response
        res.cookie('token', token, options).status(200).json({
            success: true,
            token,
            admin
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// For Login
const getAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!(email && password)) {
            return res.status(400).send({ error: 'Both email and password are required' });
        }

        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.status(400).send({ error: 'Invalid email' });
        }

        const passwordMatch = await bcrypt.compare(password, admin.password);

        if (!passwordMatch) {
            return res.status(400).send({ error: 'Invalid password' });
        }

        const token = jwt.sign({ _id: admin._id}, process.env.JWT_SECRET, {
            expiresIn: '2h'
        });

        admin.password = undefined;

        const options = {
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            httpOnly: true
        };

        res.cookie('token', token, options).status(200).json({
            success: true,
            token,
            admin
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// For Logout
const logoutAdmin = async (req, res) => {
    try {
        res.clearCookie('token');
        res.status(200).send('User logout');
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

// For Change Password
const passChange = async (req, res) => {
    try {
        const { newPassword, oldPassword, email } = req.body;

        if (!(newPassword && oldPassword && email)) {
            return res.status(400).send('All fields are required');
        }

        const emailcheck = await Admin.findOne({ email });

        if (!emailcheck) {
            return res.status(400).send('Email is not valid');
        }

        const checkPassword = await bcrypt.compare(oldPassword, emailcheck.password);

        if (!checkPassword) {
            return res.status(400).send('Password is incorrect');
        }

        const hashPassword = await bcrypt.hash(newPassword, 8);
        emailcheck.password = hashPassword;

        await emailcheck.save();

        res.status(200).send('Password changed successfully');
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
}

module.exports = {
    createAdmin,
    logoutAdmin,
    getAdmin,
    passChange
};
