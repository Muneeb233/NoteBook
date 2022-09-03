const express = require('express');
const User = require('../models/Users');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt=require('bcryptjs');
var jwt=require('jsonwebtoken');
const JWT_SECRET='ILOVEREACT@';

//Creating a userusing POST"api/auth/createuser" i does not require authenticaiton
router.post('/createuser', [
    body('name', 'enter a valid name').isLength({ min: 3 }),
    body('email', 'enter a valid email').isEmail(),
    body('password', 'enter a valid password').isLength({ min: 5 }),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    //check whether the user exists already with the same email
    try {
        let user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(400).json({ error: "Sorry the user alreadu exists" })
        }

        const salt= await bcrypt.genSalt(10);
        const secPass= await bcrypt.hash(req.body.password,salt);
        //creating a new user
        user = await User.create({
            name: req.body.name,
            password: secPass,
            email: req.body.email,
        })

        const data={
            user:{
                id:user.id
            }
        }
       const authToken= jwt.sign(data,JWT_SECRET);


        // res.json(user)
        res.json({authToken});
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Some error occured");
    }


})


module.exports = router
