const express = require('express');
const router = express.Router();
const fetchuser = require('../middleware/fetchuser');
const Note = require('../models/Note');
const { body, validationResult } = require('express-validator');

// ROUTE 1: Get All the Notes using GET "/api/notes/fetchallnotes". Login required.
router.get('/fetchallnotes', fetchuser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id });
        res.json(notes);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('INTERNAL SERVER ERROR');
    }
});

// ROUTE 2: Add a Note using POST "/api/notes/addnote". Login required.
router.post('/addnote', [
    body('title', 'Please enter a title').isLength({ min: 1 }),
    body('description', 'Please enter a description').isLength({ min: 1 })
], fetchuser, async (req, res) => {
    try {
        // If there are errors send 400 Bad request with errors.
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, description, tag } = req.body;

        const note = new Note({
            title, description, tag, user: req.user.id
        });
        const savedNote = await note.save();
        res.json(savedNote);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('INTERNAL SERVER ERROR');
    }
});

// ROUTE 3: Update an existing Note using PUT "/api/notes/updatenote". Login required.
router.put('/updatenote/:id', fetchuser, async (req, res) => {
    const { title, description, tag } = req.body;

    try {
        // Create a newNote object
        const newNote = {}
        if (title) {
            newNote.title = title;
        }
        if (description) {
            newNote.description = description;
        }
        if (tag) {
            newNote.tag = tag;
        }

        //Find the note to be updated and update it.
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found!");
        }

        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Access denied");
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });

        res.json(note);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('INTERNAL SERVER ERROR');
    }

});

// ROUTE 4: Delete an existing Note using DELETE "/api/notes/deletenote". Login required.
router.delete('/deletenote/:id', fetchuser, async (req, res) => {
    try {
        //Find the note to be deleted and delete it.
        let note = await Note.findById(req.params.id);
        if (!note) {
            return res.status(404).send("Not Found!");
        }

        // Do not delete if the note doesn't belongs to the current user.
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Access denied");
        }

        note = await Note.findByIdAndDelete(req.params.id);

        res.send("Successfully deleted" + "\n" + note);
    } catch (error) {
        console.error(error.message);
        res.status(500).send('INTERNAL SERVER ERROR');
    }

});
module.exports = router;