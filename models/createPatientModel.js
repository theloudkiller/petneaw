const mongoose = require('mongoose');
const patientSchema = require('./Patient');

const createPatientModel = (clinicEmail) => {
  const modelName = `Patient_${clinicEmail.replace(/[^a-zA-Z0-9]/g, '_')}`;
  if (mongoose.models[modelName]) {
    return mongoose.model(modelName);
  }
  return mongoose.model(modelName, patientSchema);
};


module.exports = createPatientModel;
