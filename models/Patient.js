const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  // Additional fields like medical history, age, etc.
});
const Patient = mongoose.model("patient", patientSchema);
module.exports = patientSchema;
