const express = require('express');
const router = express.Router();

const newModel = require('../models/doctorModels');

// Route to add a new item
router.post('/add', async (req, res) => {
  try {
    const newItem = new newModel(req.body);
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Add more routes as needed

module.exports = router;
