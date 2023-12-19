const express = require("express");
const {
  getDoctorInfoController,
  updateProfileController, 
  getDoctorByIdController,
  doctorAppointmentsController,
  updateStatusController,
  updateProfileControllers,
  addPatient,
} = require("../controllers/doctorCtrl");


const authMiddleware = require("../middlewares/authMiddleware");
const router = express.Router();

//POST SINGLE DOC INFO
router.post("/getDoctorInfo", authMiddleware, getDoctorInfoController);

//POST UPDATE PROFILE
router.post("/updateProfile", authMiddleware, updateProfileController);
router.post("/updateProfiles", authMiddleware, updateProfileControllers);

//POST  GET SINGLE DOC INFO
router.post("/getDoctorById", authMiddleware, getDoctorByIdController);



// Add a new patient

//GET Appointments
router.get(
  "/doctor-appointments",
  authMiddleware,
  doctorAppointmentsController
);
//POST Update Status
router.post("/update-status", authMiddleware, updateStatusController);

router.post('/addPatient', addPatient);

module.exports = router;