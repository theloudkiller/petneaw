const patientSchema = require("../models/Patient");
const appointmentModel = require("../models/appointmentModel");
const createPatientModel = require("../models/createPatientModel");
const doctorModel = require("../models/doctorModel");
const userModel = require("../models/userModels");
const getDoctorInfoController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    res.status(200).send({
      success: true,
      message: "doctor data fetch success",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Fetching Doctor Details",
    });
  }
};

// update doc profile
const updateProfileControllers = async (req, res) => {
  try {
    const doctor = await doctorModel.findOneAndUpdate(
      { userId: req.body.userId },
      {timeSlots: req.body.timeSlots || []},
      req.body
      
    );
    res.status(201).send({
      success: true,
      message: "Doctor Profile Updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Doctor Profile Update issue",
      error,
    });
  }
};

const updateProfileController = async (req, res) => {
  try {
    const { userId, availableSlots, ...restData } = req.body;

    // Update the doctor's profile data excluding availableSlots
    const doctor = await doctorModel.findOneAndUpdate(
      { userId },
      restData,
      { new: true }
    );

    // Update or create time slots based on the selected interval
    if (availableSlots && Array.isArray(availableSlots)) {
      // Clear existing time slots
      doctor.slots = [];
    
      // Generate time slots based on the selected interval
      for (const slot of availableSlots) {
        const [startTime, endTime, interval] = slot;
    
        let currentSlot = moment(startTime, 'HH:mm'); // Assuming startTime is in "HH:mm" format
        const endSlot = moment(endTime, 'HH:mm'); // Assuming endTime is in "HH:mm" format
    
        while (currentSlot.isBefore(endSlot)) {
          doctor.slots.push({
            startTime: currentSlot.format('HH:mm'), // Format to "HH:mm"
            endTime: currentSlot.add(interval, 'minutes').format('HH:mm'), // Format to "HH:mm"
          });
        }
      }
    }

    // Save the updated doctor with time slots
    await doctor.save();

    res.status(201).json({
      success: true,
      message: "Doctor Profile Updated",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Doctor Profile Update issue",
      error,
    });
  }
};


// get single doctor


//get single docotor
const getDoctorByIdController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ _id: req.body.doctorId });
    res.status(200).send({
      success: true,
      message: "Sigle Doc Info Fetched",
      data: doctor,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Single doctor info",
    });
  }
};

const doctorAppointmentsController = async (req, res) => {
  try {
    const doctor = await doctorModel.findOne({ userId: req.body.userId });
    const appointments = await appointmentModel.find({
      doctorId: doctor._id,
    });
    res.status(200).send({
      success: true,
      message: "Doctor Appointments fetch Successfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error in Doc Appointments",
    });
  }
};

const updateStatusController = async (req, res) => {
  try {
    const { appointmentsId, status } = req.body;
    const appointments = await appointmentModel.findByIdAndUpdate(
      appointmentsId,
      { status }
    );
    const user = await userModel.findOne({ _id: appointments.userId });
    const notifcation = user.notifcation;
    notifcation.push({
      type: "status-updated",
      message: `your appointment has been updated ${status}`,
      onCLickPath: "/doctor-appointments",
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment Status Updated",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Update Status",
    });
  }
};

const addPatientController = async (req, res) => {
  try {
    const { clinicEmail, patientData } = req.body;
    const Patient = patientSchema(clinicEmail);
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
    const Patient = patientSchema(clinicEmail);
    const patients = await Patient.find({
      name: { $regex: searchTerm, $options: 'i' },
    });

    res.status(200).json({ success: true, data: patients });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  getDoctorInfoController,
  updateProfileController,
  getDoctorByIdController,
  doctorAppointmentsController,
  addPatientController,
  updateStatusController,
  searchPatientController,
};