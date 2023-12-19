const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    // Add more fields as required
});

module.exports = mongoose.model('Patient', patientSchema);
