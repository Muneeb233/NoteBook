const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

//route1 get all the notes
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id })
        res.json(notes)
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Interval server error occured");
    }

})


//route2  Add all notes with post request 
router.post('/addnote', fetchuser, [
    body('title ', 'enter a valid title'),
    body('description', 'enter a valid description').isLength({ min: 5 }),], async (req, res) => {
        try {
            const { title, description, tag } = req.body;
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const note = new Note({
                title, description, tag, user: req.user.id
            })
            const savedNote = await note.save()
            res.json(savedNote)
        } catch (error) {
            console.error(error.message);
            res.status(500).send("Interval server error occured");
        }

    })

//route3 update all existing notes with put request 

router.put('/updatenote/:id', fetchuser, async (req, res) => {

    const { title, description, tag } = req.body;
    try {
        //creta a new note object
        const newNote = {};
        if (title) { newNote.title = title };
        if (description) { newNote.description = description };
        if (tag) { newNote.tag = tag };
        //find note to update find and update
        let note = await Note.findById(req.params.id)
        if (!note) { return res.status(404).send("Not Found ") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed ");
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true })
        res.json({ note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Interval server error occured");
    }

})


//route4 Delete an existing Note using DELETE with a user id 
router.delete('/deletenote/:id', fetchuser, async (req, res) => {

    try {


        //find note to update and delete it 
        let note = await Note.findById(req.params.id)
        if (!note) { return res.status(404).send("Not Found ") }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not Allowed ");
        }

        note = await Note.findByIdAndDelete(req.params.id)
        res.json({ "Sucess": "Note has been deleted ", note: note });
    } catch (error) {
        console.error(error.message);
        res.status(500).send("Interval server error occured");
    }
})
module.exports = router
