const express = require('express');
const router = express.Router();
const { addPatientController, searchPatientController } = require('../controllers/patientController');

router.post('/add', addPatientController);
router.get('/search', searchPatientController);

module.exports = router;
