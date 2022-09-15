const express = require('express');
const User = require('../models/Users');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt=require('bcryptjs');
var jwt=require('jsonwebtoken');
var fetchuser=require('../middleware/fetchuser'); 
const JWT_SECRET='ILOVEREACT@';

//Route:1 Creating a userusing POST"api/auth/createuser" i does not require authenticaiton
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
        res.status(500).send("Interval server error occured");
    }


})

//Route:2 authenticate a user userusing POST"api/auth/login" no login required
router.post('/login', [
    body('email', 'enter a valid email').isEmail(),
    body('password', 'password can not be blank').exists(),

], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const {email,password}=req.body;
    try{
        let user= await User.findOne({email});
        if(!user){
            return res.status(400).json({error:"Login with correct credentials"})
        }
        const passwordCompare= await bcrypt.compare(password,user.password);
        if(!passwordCompare){
            return res.status(400).json({error:"Login with correct credentials"})

        }
        const data={
            user:{
                id:user.id
            }
        }
    const authToken= jwt.sign(data,JWT_SECRET);
    res.json({authToken});
    }
    catch (error) {
        console.error(error.message);
        res.status(500).send("Interval server error occured");
    }
})
//Route:3 get logged in user details using : /api/auth/getuser
router.post('/getuser',fetchuser, async (req, res) => {
try {
userId=req.user.id;
    const user=await User.findById(userId).select("-password");   
    res.send(user);
}   catch (error) {
    console.error(error.message);
    res.status(500).send("Interval server error occured");
} 
})
module.exports = router
