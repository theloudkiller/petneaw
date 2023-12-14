const createPatientModel = require('../models/createPatientModel');

const addPatientController = async (req, res) => {
  try {
    const { clinicEmail, patientData } = req.body;
    const Patient = createPatientModel(clinicEmail);
    const newPatient = new Patient(patientData);
    await newPatient.save();

    res.status(200).json({ success: true, data: newPatient });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

const searchPatientController = async (req, res) => {
  try {
    const { clinicEmail, searchTerm } = req.query;
    const Patient = createPatientModel(clinicEmail);
    const patients = await Patient.find({
      name: { $regex: searchTerm, $options: 'i' },
    });

    res.status(200).json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { addPatientController, searchPatientController };
