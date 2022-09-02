const express = require('express');
const User = require('../models/Users');
const router = express.Router();
const { body, validationResult } = require('express-validator');

//Creating a userusing POST"api/auth/createuser" i does not require authenticaiton
router.post('/createuser', [
    body('name', 'enter a valid name').isLength({ min: 3 }),
    body('email', 'enter a valid email').isEmail(),
    body('password', 'enter a valid password').isLength({ min: 5 }),
],async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    //check whether the user exists already with the same email
    try{
    let  user=await User.findOne({email:req.body.email});
    if(user){
        return res.status(400).json({error:"Sorry the user alreadu exists"})
    }
    //creating a new user
    user=await  User.create({
        name: req.body.name,
        password: req.body.password,
        email: req.body.email,
    })
    
    res.json(user)
}catch(error){
    console.error(error.message);
    res.status(500).send("Some error occured");
}


})


module.exports = router
