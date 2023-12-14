const express = require("express");
const {
  loginController,
  registerController,
  authController,
  applyDoctorController,
  getAllNotificationController,
  deleteAllNotificationController,
  getAllDocotrsController,
  bookeAppointmnetController,
  bookingAvailabilityController,
  userAppointmentsController,
  getStatesController,
  getAllClinicController,
  checkAvailability,
  getBookedTimeSlots,
  fetchAvailability,
  getbookedappointment,
  getAvailableTimeSlotsController

} = require("../controllers/userCtrl");
const authMiddleware = require("../middlewares/authMiddleware");
const State = require("../models/stateModel");
const Clinic = require("../models/clinicModel");
const appointmentModel = require("../models/appointmentModel");

//router onject
const router = express.Router();

//routes
//LOGIN || POST
router.post("/login", loginController);

//REGISTER || POST
router.post("/register", registerController);

router.post("/getAvailableTimeSlots", authMiddleware, getAvailableTimeSlotsController);

//Auth || POST
router.post("/getUserData", authMiddleware, authController);

//APply Doctor || POST
router.post("/apply-doctor", authMiddleware, applyDoctorController);

router.get("/getStates", authMiddleware, getStatesController);



//Notifiaction  Doctor || POST
router.post(
  "/get-all-notification",
  authMiddleware,
  getAllNotificationController
);
//Notifiaction  Doctor || POST
router.post(
  "/delete-all-notification",
  authMiddleware,
  deleteAllNotificationController
);

//GET ALL DOC
router.get("/getAllDoctors", authMiddleware, getAllDocotrsController);

router.get("/getAllClinic", authMiddleware, getAllClinicController);

//BOOK APPOINTMENT
router.post("/book-appointment", authMiddleware, bookeAppointmnetController);

//Booking Avliability
router.post(
  "/booking-availbility",
  authMiddleware,
  bookingAvailabilityController
);




router.post(
  "/check-availability",
  authMiddleware,
  checkAvailability
);

router.post(
  "/booking-availability",
  authMiddleware,
  fetchAvailability
);





router.get("/getDistricts/:stateName", async (req, res) => {
  try {
    const stateName = req.params.stateName;

    // Fetch the state document based on the selected state name
    const state = await State.findOne({ statename: stateName }).exec();

    if (!state) {
      return res.status(404).json({
        success: false,
        message: "State not found",
      });
    }

    // Extract districts from the state document
    const districts = state.districts;

    res.json({
      success: true,
      data: districts,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});


router.get("/getClinicsByDistrict/:district", authMiddleware, async (req, res) => {
  try {
    const district = req.params.district;
    const clinics = await Clinic.find({ district }).exec();

    res.status(200).json({
      success: true,
      data: clinics,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});


//Appointments List
router.get("/user-appointments", authMiddleware, userAppointmentsController);
router.get("/user-appointmentsss", authMiddleware,   getbookedappointment,);




router.post("/getBookedTimeSlots", authMiddleware, async (req, res) => {
  try {
    const { doctorId, selectedDate } = req.body;

    // Validate the input
    if (!doctorId || !selectedDate) {
      return res.status(400).json({
        success: false,
        message: "Doctor ID and selected date are required.",
      });
    }

    // Find appointments for the selected doctor and date
    const appointments = await appointmentModel.find({
      doctorId,
      date: selectedDate,
    }).exec();

    // Extract booked time slots from the appointments
    const bookedTimeSlots = appointments.map((appointment) => appointment.timings);

    res.json({
      success: true,
      data: bookedTimeSlots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
});

router.get('/api/v1/user/user-appointments-by-doctor-id', async (req, res) => {
  try {
    const { doctorId } = req.query;

    // Perform validation on doctorId if needed

    // Fetch appointments by doctor ID
    const appointments = await appointmentModel.find({ doctorId });

    // Send the appointments data in the response
    res.json({
      success: true,
      data: appointments,
      message: 'Appointments fetched successfully',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

router.get('/appointments', async (req, res) => {
  const { doctorId, bookingDate } = req.query;

  try {
    // Parse the date to consider only the date part
    const parsedDate = new Date(bookingDate);

    // Set hours, minutes, seconds, and milliseconds to 0 to get the start of the day
    parsedDate.setHours(0, 0, 0, 0);

    // Get the end of the day by setting hours to 23, minutes to 59, seconds to 59, and milliseconds to 999
    const endDate = new Date(parsedDate);
    endDate.setHours(23, 59, 59, 999);

    const appointments = await appointmentModel.find({
      doctorId,
      'bookingDate': {
        $gte: parsedDate,
        $lt: endDate,
      },
    });

    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



module.exports = router;