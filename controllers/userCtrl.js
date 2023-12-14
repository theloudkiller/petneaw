const userModel = require("../models/userModels");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const doctorModel = require("../models/doctorModel");
const appointmentModel = require("../models/appointmentModel");
const moment = require("moment");
const State = require("../models/stateModel");
const clinicModel = require("../models/clinicModel");
//register callback
const registerController = async (req, res) => {
  try {
    const exisitingUser = await userModel.findOne({ email: req.body.email });
    if (exisitingUser) {
      return res
        .status(200)
        .send({ message: "User Already Exist", success: false });
    }
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    req.body.password = hashedPassword;
    const newUser = new userModel(req.body);
    await newUser.save();
    res.status(201).send({ message: "Register Sucessfully", success: true });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: `Register Controller ${error.message}`,
    });
  }
};


// Add this route to fetch states
const getStatesController = async (req, res) => {
  try {
    const states = await State.find();
    res.status(200).json({ success: true, data: states });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};




// login callback
const loginController = async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.body.email });
    if (!user) {
      return res
        .status(200)
        .send({ message: "user not found", success: false });
    }
    const isMatch = await bcrypt.compare(req.body.password, user.password);
    if (!isMatch) {
      return res
        .status(200)
        .send({ message: "Invlid EMail or Password", success: false });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    res.status(200).send({ message: "Login Success", success: true, token });
  } catch (error) {
    console.log(error);
    res.status(500).send({ message: `Error in Login CTRL ${error.message}` });
  }
};





const authController = async (req, res) => {
  try {
    const user = await userModel.findById({ _id: req.body.userId });
    user.password = undefined;
    if (!user) {
      return res.status(200).send({
        message: "user not found",
        success: false,
      });
    } else {
      res.status(200).send({
        success: true,
        data: user,
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "auth error",
      success: false,
      error,
    });
  }
};

// APpply DOctor CTRL
const applyDoctorController = async (req, res) => {
  try {
    const newDoctor = await doctorModel({ ...req.body, status: "pending" });
    await newDoctor.save();
    const adminUser = await userModel.findOne({ isAdmin: true });
    const notifcation = adminUser.notifcation;
    notifcation.push({
      type: "apply-doctor-request",
      message: `${newDoctor.firstName} ${newDoctor.lastName} Has Applied For A Doctor Account`,
      data: {
        doctorId: newDoctor._id,
        name: newDoctor.firstName + " " + newDoctor.lastName,
        onClickPath: "/admin/docotrs",
      },
    });
    await userModel.findByIdAndUpdate(adminUser._id, { notifcation });
    res.status(201).send({
      success: true,
      message: "Doctor Account Applied SUccessfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error WHile Applying For Doctotr",
    });
  }
};

//notification ctrl
const getAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    const seennotification = user.seennotification;
    const notifcation = user.notifcation;
    seennotification.push(...notifcation);
    user.notifcation = [];
    user.seennotification = notifcation;
    const updatedUser = await user.save();
    res.status(200).send({
      success: true,
      message: "all notification marked as read",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      message: "Error in notification",
      success: false,
      error,
    });
  }
};

// delete notifications
const deleteAllNotificationController = async (req, res) => {
  try {
    const user = await userModel.findOne({ _id: req.body.userId });
    user.notifcation = [];
    user.seennotification = [];
    const updatedUser = await user.save();
    updatedUser.password = undefined;
    res.status(200).send({
      success: true,
      message: "Notifications Deleted successfully",
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "unable to delete all notifications",
      error,
    });
  }
};

//GET ALL DOC
const getAllDocotrsController = async (req, res) => {
  try {
    const doctors = await doctorModel.find({ status: "approved" });
    res.status(200).send({
      success: true,
      message: "Docots Lists Fetched Successfully",
      data: doctors,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Errro WHile Fetching DOcotr",
    });
  }
};




const getAvailableTimeSlotsController = async (req, res) => {
  try {
    const { doctorId, date } = req.body;

    // Fetch the doctor's time slots
    const doctor = await doctorModel.findOne({ _id: doctorId });
    const allTimeSlots = doctor.timeSlots || [];

    // Fetch booked time slots for the specified date
    const appointments = await appointmentModel.find({
      doctorId,
      date: moment(date, "DD-MM-YYYY").toISOString(),
    });

    // Extract booked time slots
    const bookedTimeSlots = appointments.map((appointment) => appointment.timings);

    // Calculate available time slots
    const availableTimeSlots = allTimeSlots.filter(
      (timeSlot) => !bookedTimeSlots.includes(timeSlot)
    );

    res.status(200).json({
      success: true,
      message: "Available time slots fetched successfully",
      data: availableTimeSlots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching available time slots",
      error,
    });
  }
};




const getAllClinicController = async (req, res) => {
  try {
    const clinics = await clinicModel.find();
    res.status(200).send({
      success: true,
      message: "Clinic Lists Fetched Successfully",
      data: clinics,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Fetching Clinics",
    });
  }
};

//BOOK APPOINTMENT
const bookeAppointmnetController = async (req, res) => {
  try {
   
    req.body.status = "pending";
    const newAppointment = new appointmentModel(req.body);
    req.body.date = moment(req.body.date, "DD-MM-YYYY").toDate();
    req.body.bookingDate = moment(req.body.bookingDate, "DD-MM-YYYY").toDate(); 
    await newAppointment.save();
    const user = await userModel.findOne({ _id: req.body.doctorInfo.userId });
    user.notifcation.push({
      type: "New-appointment-request",
      message: `A new Appointment Request from ${req.body.userInfo.name}`,
      onCLickPath: "/user/appointments",
    });
    await user.save();
    res.status(200).send({
      success: true,
      message: "Appointment Book succesfully",
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error While Booking Appointment",
    });
  }
};


const checkAvailability = async (req, res) => {
  try {
    const { doctorId, date } = req.body;

    // Convert the date to MongoDB-compatible format
    const formattedDate = moment(date, "DD-MM-YYYY").toISOString();

    // Fetch all appointments for the specified doctor on the selected date
    const appointments = await appointmentModel.find({
      doctorId,
      date: formattedDate,
    });

    // Extract booked time slots
    const bookedTimeSlots = appointments.map((appointment) => appointment.timeSlot);

    // Assuming you have a predefined set of time slots for a day
    const allTimeSlots = ["09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", /* ... */];

    // Calculate available time slots
    const availableTimeSlots = allTimeSlots.filter(
      (timeSlot) => !bookedTimeSlots.includes(timeSlot)
    );

    res.status(200).json({
      success: true,
      message: "Availability checked successfully",
      availableTimeSlots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while checking availability",
      error,
    });
  }
};


// booking bookingAvailabilityController
const bookingAvailabilityController = async (req, res) => {
  try {
    
    const doctorId = req.body.doctorId;
    const appointments = await appointmentModel.find({
      doctorId,
      date,
      time: {
        $gte: fromTime,
        $lte: toTime,
      },
    });
    if (appointments.length > 0) {
      return res.status(200).send({
        message: "Appointments not Availibale at this time",
        success: true,
      });
    } else {
      return res.status(200).send({
        success: true,
        message: "Appointments available",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In Booking",
    });
  }
};

const userAppointmentsController = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({
      userId: req.body.userId,
    });
    res.status(200).send({
      success: true,
      message: "Users Appointments Fetch SUccessfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In User Appointments",
    });
  }
};

const getbookedappointment = async (req, res) => {
  try {
    const appointments = await appointmentModel.find({
      userId: req.body.userId,
   
    });
    res.status(200).send({
      success: true,
      message: "Users Appointments Fetch SUccessfully",
      data: appointments,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      error,
      message: "Error In User Appointments",
    });
  }
};

const fetchAvailability = async (req, res) => {
  try {
    const { doctorId, date } = req.body;

    // Fetch all appointments for the specified doctor on the selected date
    const appointments = await appointmentModel.find({
      doctorId,
      date: moment(date, "DD-MM-YYYY").toISOString(),
    });

    // Extract booked time slots
    const bookedTimeSlots = appointments.map((appointment) => appointment.timeSlot);

    // Assuming you have a predefined set of time slots for a day
    const allTimeSlots = ["09:00 AM - 10:00 AM", "10:00 AM - 11:00 AM", /* ... */];

    // Calculate available time slots
    const availableTimeSlots = allTimeSlots.filter(
      (timeSlot) => !bookedTimeSlots.includes(timeSlot)
    );

    res.status(200).json({
      success: true,
      message: "Availability checked successfully",
      availableTimeSlots,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Error while fetching availability",
      error,
    });
  }
};






module.exports = {
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
  fetchAvailability,
  getbookedappointment ,
  getAvailableTimeSlotsController,
};