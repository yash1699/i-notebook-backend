const dotenv = require('dotenv');
dotenv.config({path: 'C:\\Users\\Yash\\Desktop\\ReactJS\\inotebook\\backend\\.env'});
const express = require('express');
const User = require('../models/User');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchuser = require('../middleware/fetchuser');

const JWT_SECRET = process.env.JWT_SECRET;

const { body, validationResult } = require('express-validator');

// ROUTE 1: Create a User using: POST "/api/auth/createUser". Doesn't require login.
router.post('/createUser', [
    body('name', 'Enter a valid name').isLength({ min: 3 }),
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {
    // If there are errors send 400 Bad request with errors.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        // Check whether the user with this email exists already.
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: 'A user with this email already exists.' });
        }

        // Hashing password using bcryptjs module.
        const salt = await bcrypt.genSalt(10);
        const securePassword = await bcrypt.hash(req.body.password, salt);

        // If a user with this email doe not exists then create a user.
        user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: securePassword,
        });

        const data = {
            user: {
                id: user.id
            }
        }

        const authToken = jwt.sign(data, JWT_SECRET);

        res.json({ authToken });

    } catch (error) {
        console.error(error.message);
        res.status(500).send('INTERNAL SERVER ERROR');
    }
});

// ROUTE 2: Authencticate a User using: POST "/api/auth/login". Doesn't require login.
router.post('/login', [
    body('email', 'Enter a valid email').isEmail(),
    body('password', 'Password must be atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {
    // If there are errors send 400 Bad request with errors.
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {email,password} = req.body;

    try {
        let user = await User.findOne({email});
        if(!user){
            return res.status(401).json({error: 'Please try to login with correct credentials.'});
        }

        const passwordCompare = await bcrypt.compare(password, user.password);
        if(!passwordCompare) {
            return res.status(400).json({error: 'Please try to login with correct credentials.'});
        }

        const data = {
            user: {
              id: user.id
            }
          }

        const authToken = jwt.sign(data, JWT_SECRET);
        res.json({authToken});

    } catch (error) {
        console.error(error.message);
        res.status(500).send('INTERNAL SERVER ERROR');
    }
});

// ROUTE 3: Get loggedin User details using POST "/api/auth/getuser". Login required.
router.post('/getuser', fetchuser, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select("-password");
        res.send(user);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('INTERNAL SERVER ERROR');
    }
});

module.exports = router;